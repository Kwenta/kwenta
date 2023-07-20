import { BigNumber } from '@ethersproject/bignumber'
import { formatBytes32String } from '@ethersproject/strings'
// @ts-ignore TODO: remove once types are added
import getFormattedSwapData from '@kwenta/synthswap'
import Wei, { wei } from '@synthetixio/wei'
import axios from 'axios'
import { Contract as EthCallContract } from 'ethcall'
import { ethers } from 'ethers'
import { get, keyBy } from 'lodash'

import KwentaSDK from '..'
import * as sdkErrors from '../common/errors'
import { getEthGasPrice } from '../common/gas'
import {
	ATOMIC_EXCHANGES_L1,
	CRYPTO_CURRENCY_MAP,
	ETH_ADDRESS,
	ETH_COINGECKO_ADDRESS,
	ADDITIONAL_MARKETS,
	ATOMIC_EXCHANGE_SLIPPAGE,
	CG_BASE_API_URL,
	DEFAULT_BUFFER,
	FILTERED_TOKENS,
	PROTOCOLS,
	DEFAULT_1INCH_SLIPPAGE,
	KWENTA_REFERRAL_ADDRESS,
	SYNTH_SWAP_OPTIMISM_ADDRESS,
} from '../constants/exchange'
import { KWENTA_TRACKING_CODE } from '../constants/futures'
import { UNIT_BIG_NUM, ZERO_WEI } from '../constants/number'
import erc20Abi from '../contracts/abis/ERC20.json'
import { getSynthsForNetwork, SynthSymbol } from '../data/synths'
import {
	OneInchApproveSpenderResponse,
	OneInchQuoteResponse,
	OneInchSwapResponse,
	OneInchTokenListResponse,
} from '../types/1inch'
import { CurrencyKey, NetworkId } from '../types/common'
import { PriceResponse, Rates } from '../types/exchange'
import { FuturesMarketKey, SynthSuspensionReason } from '../types/futures'
import { DeprecatedSynthBalance } from '../types/synths'
import { Token, TokenBalances } from '../types/tokens'
import { synthToAsset } from '../utils/exchange'
import { getProxySynthSymbol, getReasonFromCode } from '../utils/synths'
import { getTransactionPrice, normalizeGasLimit } from '../utils/transactions'
import { getMainEndpoint } from '../utils/futures'
import { queryWalletTrades } from '../queries/exchange'

export default class ExchangeService {
	private tokensMap: any = {}
	private tokenList: Token[] = []
	private allTokensMap: any
	private sdk: KwentaSDK

	constructor(sdk: KwentaSDK) {
		this.sdk = sdk
	}

	get exchangeRates() {
		return this.sdk.prices.currentPrices.onChain
	}

	public getTxProvider(baseCurrencyKey: string, quoteCurrencyKey: string) {
		if (!baseCurrencyKey || !quoteCurrencyKey) return undefined
		if (
			this.synthsMap?.[baseCurrencyKey as SynthSymbol] &&
			this.synthsMap?.[quoteCurrencyKey as SynthSymbol]
		)
			return 'synthetix'
		if (this.tokensMap[baseCurrencyKey] && this.tokensMap[quoteCurrencyKey]) return '1inch'

		return 'synthswap'
	}

	public async getTradePrices(
		txProvider: ReturnType<ExchangeService['getTxProvider']>,
		quoteCurrencyKey: string,
		baseCurrencyKey: string,
		quoteAmountWei: Wei,
		baseAmountWei: Wei
	) {
		const coinGeckoPrices = await this.getCoingeckoPrices(quoteCurrencyKey, baseCurrencyKey)

		const [quotePriceRate, basePriceRate] = await Promise.all(
			[quoteCurrencyKey, baseCurrencyKey].map((currencyKey) =>
				this.getPriceRate(currencyKey, txProvider, coinGeckoPrices)
			)
		)

		let quoteTradePrice = quoteAmountWei.mul(quotePriceRate || 0)
		let baseTradePrice = baseAmountWei.mul(basePriceRate || 0)

		if (this.sUSDRate) {
			quoteTradePrice = quoteTradePrice.div(this.sUSDRate)
			baseTradePrice = baseTradePrice.div(this.sUSDRate)
		}

		return { quoteTradePrice, baseTradePrice }
	}

	public async getSlippagePercent(
		quoteCurrencyKey: string,
		baseCurrencyKey: string,
		quoteAmountWei: Wei,
		baseAmountWei: Wei
	) {
		const txProvider = this.getTxProvider(baseCurrencyKey, quoteCurrencyKey)

		if (txProvider === '1inch') {
			const { quoteTradePrice: totalTradePrice, baseTradePrice: estimatedBaseTradePrice } =
				await this.getTradePrices(
					txProvider,
					quoteCurrencyKey,
					baseCurrencyKey,
					quoteAmountWei,
					baseAmountWei
				)

			if (totalTradePrice.gt(0) && estimatedBaseTradePrice.gt(0)) {
				return totalTradePrice.sub(estimatedBaseTradePrice).div(totalTradePrice).neg()
			}
		}

		return undefined
	}

	public async getBaseFeeRate(baseCurrencyKey: string, quoteCurrencyKey: string) {
		if (!this.sdk.context.contracts.SystemSettings) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		const [sourceCurrencyFeeRate, destinationCurrencyFeeRate] = await Promise.all([
			this.sdk.context.contracts.SystemSettings.exchangeFeeRate(
				ethers.utils.formatBytes32String(baseCurrencyKey)
			),
			this.sdk.context.contracts.SystemSettings.exchangeFeeRate(
				ethers.utils.formatBytes32String(quoteCurrencyKey)
			),
		])

		return sourceCurrencyFeeRate && destinationCurrencyFeeRate
			? wei(sourceCurrencyFeeRate.add(destinationCurrencyFeeRate))
			: wei(0)
	}

	public async getExchangeFeeRate(quoteCurrencyKey: string, baseCurrencyKey: string) {
		if (!this.sdk.context.contracts.Exchanger) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		const exchangeFeeRate = await this.sdk.context.contracts.Exchanger.feeRateForExchange(
			ethers.utils.formatBytes32String(quoteCurrencyKey),
			ethers.utils.formatBytes32String(baseCurrencyKey)
		)

		return wei(exchangeFeeRate)
	}

	public async getRate(baseCurrencyKey: string, quoteCurrencyKey: string) {
		const baseCurrencyTokenAddress = this.getTokenAddress(baseCurrencyKey)
		const quoteCurrencyTokenAddress = this.getTokenAddress(quoteCurrencyKey)

		const [[quoteRate, baseRate], coinGeckoPrices] = await Promise.all([
			this.getPairRates(quoteCurrencyKey, baseCurrencyKey),
			this.getCoingeckoPrices(quoteCurrencyKey, baseCurrencyKey),
		])

		const base = baseRate.lte(0)
			? this.getCoingeckoPricesForCurrencies(coinGeckoPrices, baseCurrencyTokenAddress)
			: baseRate

		const quote = quoteRate.lte(0)
			? this.getCoingeckoPricesForCurrencies(coinGeckoPrices, quoteCurrencyTokenAddress)
			: quoteRate

		return base.gt(0) && quote.gt(0) ? quote.div(base) : wei(0)
	}

	public async getOneInchTokenList() {
		const response = await axios.get<OneInchTokenListResponse>(this.oneInchApiUrl + 'tokens')

		const tokensMap = response.data.tokens || {}
		const chainId: NetworkId = this.sdk.context.isL2 ? 10 : 1
		const tokens = Object.values(tokensMap).map((t) => ({ ...t, chainId, tags: [] }))

		return {
			tokens,
			tokensMap: keyBy(tokens, 'symbol'),
			symbols: tokens.map((token) => token.symbol),
		}
	}

	public async getFeeReclaimPeriod(currencyKey: string) {
		if (!this.sdk.context.contracts.Exchanger) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		const maxSecsLeftInWaitingPeriod =
			(await this.sdk.context.contracts.Exchanger.maxSecsLeftInWaitingPeriod(
				this.sdk.context.walletAddress,
				ethers.utils.formatBytes32String(currencyKey)
			)) as ethers.BigNumberish

		return Number(maxSecsLeftInWaitingPeriod)
	}

	public async swapSynthSwap(
		fromToken: Token,
		toToken: Token,
		fromAmount: string,
		metaOnly?: 'meta_tx' | 'estimate_gas'
	) {
		if (this.sdk.context.networkId !== 10) throw new Error(sdkErrors.UNSUPPORTED_NETWORK)

		const sUSD = this.tokensMap['sUSD']

		const oneInchFrom = this.tokensMap[fromToken.symbol] ? sUSD.address : fromToken.address
		const oneInchTo = this.tokensMap[toToken.symbol] ? sUSD.address : toToken.address

		const fromSymbolBytes = ethers.utils.formatBytes32String(fromToken.symbol)
		const sUSDBytes = ethers.utils.formatBytes32String('sUSD')

		let synthAmountEth = fromAmount

		if (this.tokensMap[fromToken.symbol]) {
			if (!this.sdk.context.contracts.Exchanger) {
				throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
			}
			const fromAmountWei = wei(fromAmount).toString(0, true)
			const amounts = await this.sdk.context.contracts.Exchanger.getAmountsForExchange(
				fromAmountWei,
				fromSymbolBytes,
				sUSDBytes
			)

			const usdValue = amounts.amountReceived.sub(amounts.fee)
			synthAmountEth = ethers.utils.formatEther(usdValue)
		}

		const params = await this.getOneInchSwapParams(
			oneInchFrom,
			oneInchTo,
			synthAmountEth,
			fromToken.decimals
		)

		const formattedData = getFormattedSwapData(params, SYNTH_SWAP_OPTIMISM_ADDRESS)

		const SynthSwap = this.sdk.context.contracts.SynthSwap

		if (!SynthSwap) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		const contractFunc =
			metaOnly === 'meta_tx'
				? SynthSwap.populateTransaction
				: metaOnly === 'estimate_gas'
				? SynthSwap.estimateGas
				: SynthSwap

		if (this.tokensMap[toToken.symbol]) {
			const symbolBytes = ethers.utils.formatBytes32String(toToken.symbol)
			if (formattedData.functionSelector === 'swap') {
				return metaOnly
					? contractFunc.swapInto(symbolBytes, formattedData.data)
					: this.sdk.transactions.createContractTxn(SynthSwap, 'swapInto', [
							symbolBytes,
							formattedData.data,
					  ])
			} else {
				return metaOnly
					? contractFunc.uniswapSwapInto(
							symbolBytes,
							fromToken.address,
							params.fromTokenAmount,
							formattedData.data
					  )
					: this.sdk.transactions.createContractTxn(SynthSwap, 'uniswapSwapInto', [
							symbolBytes,
							fromToken.address,
							params.fromTokenAmount,
							formattedData.data,
					  ])
			}
		} else {
			if (formattedData.functionSelector === 'swap') {
				return metaOnly
					? contractFunc.swapOutOf(
							fromSymbolBytes,
							wei(fromAmount).toString(0, true),
							formattedData.data
					  )
					: this.sdk.transactions.createContractTxn(SynthSwap, 'swapOutOf', [
							fromSymbolBytes,
							wei(fromAmount).toString(0, true),
							formattedData.data,
					  ])
			} else {
				const usdValue = ethers.utils.parseEther(synthAmountEth).toString()
				return metaOnly
					? contractFunc.uniswapSwapOutOf(
							fromSymbolBytes,
							toToken.address,
							wei(fromAmount).toString(0, true),
							usdValue,
							formattedData.data
					  )
					: this.sdk.transactions.createContractTxn(SynthSwap, 'uniswapSwapOutOf', [
							fromSymbolBytes,
							toToken.address,
							wei(fromAmount).toString(0, true),
							usdValue,
							formattedData.data,
					  ])
			}
		}
	}

	public async swapOneInchMeta(
		quoteTokenAddress: string,
		baseTokenAddress: string,
		amount: string,
		quoteDecimals: number
	) {
		const params = await this.getOneInchSwapParams(
			quoteTokenAddress,
			baseTokenAddress,
			amount,
			quoteDecimals
		)

		const { from, to, data, value } = params.tx

		return this.sdk.context.signer.populateTransaction({
			from,
			to,
			data,
			value: ethers.BigNumber.from(value),
		})
	}

	public async swapOneInch(
		quoteTokenAddress: string,
		baseTokenAddress: string,
		amount: string,
		quoteDecimals: number
	) {
		const params = await this.getOneInchSwapParams(
			quoteTokenAddress,
			baseTokenAddress,
			amount,
			quoteDecimals
		)

		const { from, to, data, value } = params.tx

		return this.sdk.transactions.createEVMTxn({ from, to, data, value })
	}

	public async swapOneInchGasEstimate(
		quoteTokenAddress: string,
		baseTokenAddress: string,
		amount: string,
		quoteDecimals: number
	) {
		const params = await this.getOneInchSwapParams(
			quoteTokenAddress,
			baseTokenAddress,
			amount,
			quoteDecimals
		)

		return params.tx.gas
	}

	public async getNumEntries(currencyKey: string): Promise<number> {
		if (!this.sdk.context.contracts.Exchanger) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		const { numEntries } = await this.sdk.context.contracts.Exchanger.settlementOwing(
			this.sdk.context.walletAddress,
			ethers.utils.formatBytes32String(currencyKey)
		)

		return numEntries ? Number(numEntries.toString()) : 0
	}

	public async getAtomicRates(currencyKey: string) {
		if (!this.sdk.context.contracts.ExchangeRates) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		const { value } = await this.sdk.context.contracts.ExchangeRates.effectiveAtomicValueAndRates(
			ethers.utils.formatBytes32String(currencyKey),
			UNIT_BIG_NUM,
			ethers.utils.formatBytes32String('sUSD')
		)

		return wei(value) ?? wei(0)
	}

	public async approveSwap(quoteCurrencyKey: string, baseCurrencyKey: string) {
		const txProvider = this.getTxProvider(baseCurrencyKey, quoteCurrencyKey)
		const quoteCurrencyContract = this.getQuoteCurrencyContract(quoteCurrencyKey)
		const approveAddress = await this.getApproveAddress(txProvider)

		if (quoteCurrencyContract) {
			const { hash } = await this.sdk.transactions.createContractTxn(
				quoteCurrencyContract,
				'approve',
				[approveAddress, ethers.constants.MaxUint256]
			)

			return hash
		}

		return undefined
	}

	public async handleSettle(baseCurrencyKey: string) {
		if (!this.sdk.context.isL2) {
			throw new Error(sdkErrors.REQUIRES_L2)
		}

		const numEntries = await this.getNumEntries(baseCurrencyKey)

		if (numEntries > 12) {
			const destinationCurrencyKey = ethers.utils.formatBytes32String(baseCurrencyKey)

			const { hash } = await this.sdk.transactions.createSynthetixTxn('Exchanger', 'settle', [
				this.sdk.context.walletAddress,
				destinationCurrencyKey,
			])

			return hash
		}

		return undefined
	}

	// TODO: Refactor handleExchange

	public async handleExchange(
		quoteCurrencyKey: string,
		baseCurrencyKey: string,
		quoteAmount: string,
		baseAmount: string
	) {
		const txProvider = this.getTxProvider(baseCurrencyKey, quoteCurrencyKey)
		const quoteCurrencyTokenAddress = this.getTokenAddress(quoteCurrencyKey)
		const baseCurrencyTokenAddress = this.getTokenAddress(baseCurrencyKey)
		const quoteDecimals = this.getTokenDecimals(quoteCurrencyKey)

		let tx: ethers.ContractTransaction | null = null

		if (txProvider === '1inch' && !!this.tokensMap) {
			tx = await this.swapOneInch(
				quoteCurrencyTokenAddress,
				baseCurrencyTokenAddress,
				quoteAmount,
				quoteDecimals
			)
		} else if (txProvider === 'synthswap') {
			// @ts-ignore TODO: Fix variable types
			tx = await this.swapSynthSwap(
				this.allTokensMap[quoteCurrencyKey],
				this.allTokensMap[baseCurrencyKey],
				quoteAmount
			)
		} else {
			const isAtomic = this.checkIsAtomic(baseCurrencyKey, quoteCurrencyKey)

			const exchangeParams = this.getExchangeParams(
				quoteCurrencyKey,
				baseCurrencyKey,
				wei(quoteAmount),
				wei(baseAmount).mul(wei(1).sub(ATOMIC_EXCHANGE_SLIPPAGE)),
				isAtomic
			)

			const shouldExchange =
				!!exchangeParams &&
				!!this.sdk.context.walletAddress &&
				!!this.sdk.context.contracts.Synthetix

			if (shouldExchange) {
				const { hash } = await this.sdk.transactions.createSynthetixTxn(
					'Synthetix',
					isAtomic ? 'exchangeAtomically' : 'exchangeWithTracking',
					exchangeParams
				)

				return hash
			}
		}

		return tx?.hash
	}

	public async getTransactionFee(
		quoteCurrencyKey: string,
		baseCurrencyKey: string,
		quoteAmount: string,
		baseAmount: string
	) {
		const gasPrices = await getEthGasPrice(this.sdk.context.networkId, this.sdk.context.provider)
		const txProvider = this.getTxProvider(baseCurrencyKey, quoteCurrencyKey)
		const ethPriceRate = this.getExchangeRatesForCurrencies(this.exchangeRates, 'sETH', 'sUSD')
		const gasPrice = gasPrices.fast

		if (txProvider === 'synthswap' || txProvider === '1inch') {
			const gasInfo = await this.getGasEstimateForExchange(
				txProvider,
				quoteCurrencyKey,
				baseCurrencyKey,
				quoteAmount
			)

			return getTransactionPrice(
				gasPrice,
				BigNumber.from(gasInfo?.limit || 0),
				ethPriceRate,
				gasInfo?.l1Fee ?? ZERO_WEI
			)
		} else {
			if (!this.sdk.context.contracts.Synthetix) {
				throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
			}

			const isAtomic = this.checkIsAtomic(baseCurrencyKey, quoteCurrencyKey)

			const exchangeParams = this.getExchangeParams(
				quoteCurrencyKey,
				baseCurrencyKey,
				wei(quoteAmount || 0),
				wei(baseAmount || 0).mul(wei(1).sub(ATOMIC_EXCHANGE_SLIPPAGE)),
				isAtomic
			)

			const method = isAtomic ? 'exchangeAtomically' : 'exchangeWithTracking'

			const txn = {
				to: this.sdk.context.contracts.Synthetix.address,
				data: this.sdk.context.contracts.Synthetix.interface.encodeFunctionData(
					// @ts-ignore TODO: Fix types
					method,
					exchangeParams
				),
				value: ethers.BigNumber.from(0),
			}

			const [baseGasLimit, optimismLayerOneFee] = await Promise.all([
				this.sdk.transactions.estimateGas(txn),
				this.sdk.transactions.getOptimismLayerOneFees(txn),
			])

			const gasLimit = wei(baseGasLimit ?? 0, 9)
				.mul(1 + DEFAULT_BUFFER)
				.toBN()

			return getTransactionPrice(gasPrice, gasLimit, ethPriceRate, optimismLayerOneFee)
		}
	}

	public async getFeeCost(quoteCurrencyKey: string, baseCurrencyKey: string, quoteAmount: string) {
		const txProvider = this.getTxProvider(baseCurrencyKey, quoteCurrencyKey)

		const coinGeckoPrices = await this.getCoingeckoPrices(quoteCurrencyKey, baseCurrencyKey)

		const [exchangeFeeRate, quotePriceRate] = await Promise.all([
			this.getExchangeFeeRate(quoteCurrencyKey, baseCurrencyKey),
			this.getPriceRate(quoteCurrencyKey, txProvider, coinGeckoPrices),
		])

		const feeAmountInQuoteCurrency = wei(quoteAmount).mul(exchangeFeeRate)

		return feeAmountInQuoteCurrency.mul(quotePriceRate)
	}

	public getApproveAddress(txProvider: ReturnType<ExchangeService['getTxProvider']>) {
		return txProvider !== '1inch' ? SYNTH_SWAP_OPTIMISM_ADDRESS : this.getOneInchApproveAddress()
	}

	public async checkAllowance(quoteCurrencyKey: string, baseCurrencyKey: string) {
		const txProvider = this.getTxProvider(baseCurrencyKey, quoteCurrencyKey)

		const [quoteCurrencyContract, approveAddress] = await Promise.all([
			this.getQuoteCurrencyContract(quoteCurrencyKey),
			this.getApproveAddress(txProvider),
		])

		if (!!quoteCurrencyContract) {
			const allowance = (await quoteCurrencyContract.allowance(
				this.sdk.context.walletAddress,
				approveAddress
			)) as ethers.BigNumber

			return wei(ethers.utils.formatEther(allowance))
		}
	}

	public getCurrencyName(currencyKey: string): string | undefined {
		return this.allTokensMap?.[currencyKey]?.name
	}

	public async getOneInchQuote(baseCurrencyKey: string, quoteCurrencyKey: string, amount: string) {
		const sUSD = this.tokensMap['sUSD']
		const decimals = this.getTokenDecimals(quoteCurrencyKey)
		const quoteTokenAddress = this.getTokenAddress(quoteCurrencyKey)
		const baseTokenAddress = this.getTokenAddress(baseCurrencyKey)
		const txProvider = this.getTxProvider(baseCurrencyKey, quoteCurrencyKey)

		const synth = this.tokensMap[quoteCurrencyKey] || this.tokensMap[baseCurrencyKey]

		const synthUsdRate = synth ? this.getPairRates(synth, 'sUSD') : null

		if (!quoteCurrencyKey || !baseCurrencyKey || !sUSD || !amount.length || wei(amount).eq(0)) {
			return ''
		}

		if (txProvider === '1inch') {
			const estimatedAmount = await this.quoteOneInch(
				quoteTokenAddress,
				baseTokenAddress,
				amount,
				decimals
			)

			return estimatedAmount
		}

		if (this.tokensMap[quoteCurrencyKey]) {
			const usdAmount = wei(amount).div(synthUsdRate)

			const estimatedAmount = await this.quoteOneInch(
				sUSD.address,
				baseTokenAddress,
				usdAmount.toString(),
				decimals
			)

			return estimatedAmount
		} else {
			const estimatedAmount = await this.quoteOneInch(
				quoteTokenAddress,
				sUSD.address,
				amount,
				decimals
			)

			return wei(estimatedAmount).mul(synthUsdRate).toString()
		}
	}

	public async getPriceRate(
		currencyKey: string,
		txProvider: ReturnType<ExchangeService['getTxProvider']>,
		coinGeckoPrices: PriceResponse
	) {
		const tokenAddress = this.getTokenAddress(currencyKey, true).toLowerCase()

		if (txProvider !== 'synthetix') {
			const sUSDRate = this.exchangeRates['sUSD']
			const price = coinGeckoPrices && coinGeckoPrices[tokenAddress]

			if (price && sUSDRate?.gt(0)) {
				return wei(price.usd ?? 0).div(sUSDRate)
			} else {
				return wei(0)
			}
		} else {
			return this.checkIsAtomic(currencyKey, 'sUSD')
				? await this.getAtomicRates(currencyKey)
				: this.getExchangeRatesForCurrencies(this.exchangeRates, currencyKey, 'sUSD')
		}
	}

	public async getRedeemableDeprecatedSynths() {
		const { SynthRedeemer } = this.sdk.context.contracts
		const { SynthRedeemer: Redeemer } = this.sdk.context.multicallContracts

		if (!SynthRedeemer || !Redeemer) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		const { walletAddress } = this.sdk.context

		const synthDeprecatedFilter = SynthRedeemer.filters.SynthDeprecated()
		const deprecatedSynthsEvents = await SynthRedeemer.queryFilter(synthDeprecatedFilter)
		const deprecatedProxySynthsAddresses: string[] =
			deprecatedSynthsEvents.map((e) => e.args?.synth).filter(Boolean) ?? []

		const calls = []

		for (const addr of deprecatedProxySynthsAddresses) {
			calls.push(getProxySynthSymbol(addr))
			calls.push(Redeemer.balanceOf(addr, walletAddress))
		}

		const redeemableSynthData = (await this.sdk.context.multicallProvider.all(calls)) as (
			| CurrencyKey
			| ethers.BigNumber
		)[]

		let totalUSDBalance = wei(0)
		const cryptoBalances: DeprecatedSynthBalance[] = []

		for (let i = 0; i < redeemableSynthData.length; i += 2) {
			const usdBalance = wei(redeemableSynthData[i + 1])
			if (usdBalance.gt(0)) {
				totalUSDBalance = totalUSDBalance.add(usdBalance)
				cryptoBalances.push({
					currencyKey: redeemableSynthData[i] as CurrencyKey,
					proxyAddress: deprecatedProxySynthsAddresses[i],
					balance: wei(0),
					usdBalance,
				})
			}
		}

		return { balances: cryptoBalances, totalUSDBalance }
	}

	public validCurrencyKeys(quoteCurrencyKey?: string, baseCurrencyKey?: string) {
		return [quoteCurrencyKey, baseCurrencyKey].map((currencyKey) => {
			return (
				!!currencyKey &&
				(!!this.synthsMap[currencyKey as SynthSymbol] || !!this.tokensMap[currencyKey])
			)
		})
	}

	public async getCoingeckoPrices(quoteCurrencyKey: string, baseCurrencyKey: string) {
		const quoteCurrencyTokenAddress = this.getTokenAddress(quoteCurrencyKey, true).toLowerCase()
		const baseCurrencyTokenAddress = this.getTokenAddress(baseCurrencyKey).toLowerCase()
		const tokenAddresses = [quoteCurrencyTokenAddress, baseCurrencyTokenAddress]

		return this.batchGetCoingeckoPrices(tokenAddresses)
	}

	public async batchGetCoingeckoPrices(tokenAddresses: string[], include24hrChange = false) {
		const platform = this.sdk.context.isL2 ? 'optimistic-ethereum' : 'ethereum'
		const response = await axios.get<PriceResponse>(
			`${CG_BASE_API_URL}/simple/token_price/${platform}?contract_addresses=${tokenAddresses
				.join(',')
				.replace(ETH_ADDRESS, ETH_COINGECKO_ADDRESS)}&vs_currencies=usd${
				include24hrChange ? '&include_24hr_change=true' : ''
			}`
		)
		return response.data
	}

	private get sUSDRate() {
		return this.exchangeRates['sUSD']
	}

	private getExchangeParams(
		quoteCurrencyKey: string,
		baseCurrencyKey: string,
		sourceAmount: Wei,
		minAmount: Wei,
		isAtomic: boolean
	) {
		const sourceCurrencyKey = ethers.utils.formatBytes32String(quoteCurrencyKey)
		const destinationCurrencyKey = ethers.utils.formatBytes32String(baseCurrencyKey)
		const sourceAmountBN = sourceAmount.toBN()

		if (isAtomic) {
			return [
				sourceCurrencyKey,
				sourceAmountBN,
				destinationCurrencyKey,
				KWENTA_TRACKING_CODE,
				minAmount.toBN(),
			]
		} else {
			return [
				sourceCurrencyKey,
				sourceAmountBN,
				destinationCurrencyKey,
				this.sdk.context.walletAddress,
				KWENTA_TRACKING_CODE,
			]
		}
	}

	public getSynthsMap() {
		return this.synthsMap
	}

	public get synthsMap() {
		return getSynthsForNetwork(this.sdk.context.networkId)
	}

	public async getOneInchTokens() {
		const { tokensMap, tokens } = await this.getOneInchTokenList()

		this.tokensMap = tokensMap
		this.tokenList = tokens
		this.allTokensMap = { ...this.synthsMap, ...tokensMap }

		return { tokensMap: this.tokensMap, tokenList: this.tokenList }
	}

	public async getSynthSuspensions() {
		const { SystemStatus } = this.sdk.context.multicallContracts

		const synthsMap = this.sdk.exchange.getSynthsMap()

		if (!SystemStatus) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		const calls = []

		for (let synth in synthsMap) {
			calls.push(SystemStatus.synthExchangeSuspension(formatBytes32String(synth)))
		}

		const responses = (await this.sdk.context.multicallProvider.all(calls)) as [
			boolean,
			BigNumber
		][]

		let ret: Record<
			string,
			{ isSuspended: boolean; reasonCode: number; reason: SynthSuspensionReason | null }
		> = {}
		let i = 0

		for (let synth in synthsMap) {
			const [isSuspended, reason] = responses[i]
			const reasonCode = Number(reason)

			ret[synth] = {
				isSuspended: responses[i][0],
				reasonCode,
				reason: isSuspended ? getReasonFromCode(reasonCode) : null,
			}

			i++
		}

		return ret
	}

	get mainGqlEndpoint() {
		return getMainEndpoint(this.sdk.context.networkId)
	}

	public getWalletTrades() {
		return queryWalletTrades(this.sdk, this.sdk.context.walletAddress)
	}

	private checkIsAtomic(baseCurrencyKey: string, quoteCurrencyKey: string) {
		if (this.sdk.context.isL2 || !baseCurrencyKey || !quoteCurrencyKey) {
			return false
		}

		return [baseCurrencyKey, quoteCurrencyKey].every((currency) =>
			ATOMIC_EXCHANGES_L1.includes(currency)
		)
	}

	private getTokenDecimals(currencyKey: string) {
		return get(this.allTokensMap, [currencyKey, 'decimals'], undefined)
	}

	private getQuoteCurrencyContract(quoteCurrencyKey: string) {
		if (this.allTokensMap[quoteCurrencyKey]) {
			const quoteTknAddress = this.getTokenAddress(quoteCurrencyKey, true)
			return this.createERC20Contract(quoteTknAddress)
		}

		return null
	}

	private get oneInchApiUrl() {
		return `https://api.1inch.io/v5.0/${this.sdk.context.isL2 ? 10 : 1}/`
	}

	private getOneInchQuoteSwapParams(
		quoteTokenAddress: string,
		baseTokenAddress: string,
		amount: string,
		decimals: number
	) {
		return {
			fromTokenAddress: quoteTokenAddress,
			toTokenAddress: baseTokenAddress,
			amount: wei(amount, decimals).toString(0, true),
		}
	}

	private async getOneInchSwapParams(
		quoteTokenAddress: string,
		baseTokenAddress: string,
		amount: string,
		quoteDecimals: number
	) {
		const params = this.getOneInchQuoteSwapParams(
			quoteTokenAddress,
			baseTokenAddress,
			amount,
			quoteDecimals
		)

		const res = await axios.get<OneInchSwapResponse>(this.oneInchApiUrl + 'swap', {
			params: {
				fromTokenAddress: params.fromTokenAddress,
				toTokenAddress: params.toTokenAddress,
				amount: params.amount,
				fromAddress: this.sdk.context.walletAddress,
				slippage: DEFAULT_1INCH_SLIPPAGE,
				PROTOCOLS,
				referrerAddress: KWENTA_REFERRAL_ADDRESS,
				disableEstimate: true,
			},
		})

		return res.data
	}

	private async quoteOneInch(
		quoteTokenAddress: string,
		baseTokenAddress: string,
		amount: string,
		decimals: number
	) {
		const params = this.getOneInchQuoteSwapParams(
			quoteTokenAddress,
			baseTokenAddress,
			amount,
			decimals
		)

		const response = await axios.get<OneInchQuoteResponse>(this.oneInchApiUrl + 'quote', {
			params: {
				fromTokenAddress: params.fromTokenAddress,
				toTokenAddress: params.toTokenAddress,
				amount: params.amount,
				disableEstimate: true,
				PROTOCOLS,
			},
		})

		return ethers.utils
			.formatUnits(response.data.toTokenAmount, response.data.toToken.decimals)
			.toString()
	}

	private async swapSynthSwapGasEstimate(fromToken: Token, toToken: Token, fromAmount: string) {
		return this.swapSynthSwap(fromToken, toToken, fromAmount, 'estimate_gas')
	}

	private async getPairRates(quoteCurrencyKey: string, baseCurrencyKey: string) {
		return this.checkIsAtomic(baseCurrencyKey, quoteCurrencyKey)
			? await Promise.all([
					this.getAtomicRates(quoteCurrencyKey),
					this.getAtomicRates(baseCurrencyKey),
			  ])
			: this.getExchangeRatesTupleForCurrencies(
					this.sdk.prices.currentPrices.onChain,
					quoteCurrencyKey,
					baseCurrencyKey
			  )
	}

	private async getOneInchApproveAddress() {
		const response = await axios.get<OneInchApproveSpenderResponse>(
			this.oneInchApiUrl + 'approve/spender'
		)

		return response.data.address
	}

	private async getGasEstimateForExchange(
		txProvider: ReturnType<ExchangeService['getTxProvider']>,
		quoteCurrencyKey: string,
		baseCurrencyKey: string,
		quoteAmount: string
	) {
		if (!this.sdk.context.isL2) return null

		const quoteCurrencyTokenAddress = this.getTokenAddress(quoteCurrencyKey)
		const baseCurrencyTokenAddress = this.getTokenAddress(baseCurrencyKey)
		const quoteDecimals = this.getTokenDecimals(quoteCurrencyKey)

		if (txProvider === 'synthswap') {
			const [gasEstimate, metaTx] = await Promise.all([
				this.swapSynthSwapGasEstimate(
					this.allTokensMap[quoteCurrencyKey],
					this.allTokensMap[baseCurrencyKey],
					quoteAmount
				),
				this.swapSynthSwap(
					this.allTokensMap[quoteCurrencyKey],
					this.allTokensMap[baseCurrencyKey],
					quoteAmount,
					'meta_tx'
				),
			])

			// @ts-ignore TODO: Fix types from metaTx
			const l1Fee = await this.sdk.transactions.getOptimismLayerOneFees({
				...metaTx,
				gasPrice: 0,
				gasLimit: Number(gasEstimate),
			})

			return { limit: normalizeGasLimit(Number(gasEstimate)), l1Fee }
		} else if (txProvider === '1inch') {
			const [estimate, metaTx] = await Promise.all([
				this.swapOneInchGasEstimate(
					quoteCurrencyTokenAddress,
					baseCurrencyTokenAddress,
					quoteAmount,
					quoteDecimals
				),
				this.swapOneInchMeta(
					quoteCurrencyTokenAddress,
					baseCurrencyTokenAddress,
					quoteAmount,
					quoteDecimals
				),
			])

			const l1Fee = await this.sdk.transactions.getOptimismLayerOneFees({
				...metaTx,
				gasPrice: 0,
				gasLimit: Number(estimate),
			})

			return { limit: normalizeGasLimit(Number(estimate)), l1Fee }
		}
	}

	private isCurrencyETH(currencyKey: string) {
		return currencyKey === CRYPTO_CURRENCY_MAP.ETH
	}

	private getTokenAddress(currencyKey: string, coingecko?: boolean) {
		if (currencyKey != null) {
			if (this.isCurrencyETH(currencyKey)) {
				return coingecko ? ETH_COINGECKO_ADDRESS : ETH_ADDRESS
			} else {
				return get(this.allTokensMap, [currencyKey, 'address'], null)
			}
		} else {
			return null
		}
	}

	private getCoingeckoPricesForCurrencies(
		coingeckoPrices: PriceResponse | null,
		baseAddress: string | null
	) {
		if (!coingeckoPrices || !baseAddress) {
			return wei(0)
		}
		const base = (baseAddress === ETH_ADDRESS ? ETH_COINGECKO_ADDRESS : baseAddress).toLowerCase()

		if (!coingeckoPrices[base]) {
			return wei(0)
		}

		return wei(coingeckoPrices[base].usd)
	}

	private getExchangeRatesForCurrencies(
		rates: Rates | null,
		base: CurrencyKey | FuturesMarketKey | string,
		quote: CurrencyKey | FuturesMarketKey | null
	) {
		base = ADDITIONAL_MARKETS.has(base) ? synthToAsset(base) : base
		return !rates || !base || !quote || !rates[base] || !rates[quote]
			? wei(0)
			: rates[base].div(rates[quote])
	}

	private getExchangeRatesTupleForCurrencies(
		rates: Rates | null,
		base: CurrencyKey | FuturesMarketKey | string,
		quote: CurrencyKey | FuturesMarketKey | null
	) {
		base = ADDITIONAL_MARKETS.has(base) ? synthToAsset(base) : base
		const baseRate = !rates || !base || !rates[base] ? wei(0) : rates[base]
		const quoteRate = !rates || !quote || !rates[quote] ? wei(0) : rates[quote]

		return [baseRate, quoteRate]
	}

	// TODO: This is temporary.
	// We should consider either having another service for this
	// It does not quite fit into the synths service.
	// One idea is to create a "tokens" service that handles everything
	// related to 1inch tokens.

	public async getTokenBalances(walletAddress: string): Promise<TokenBalances> {
		if (!this.sdk.context.isMainnet) return {}
		const filteredTokens = this.tokenList.filter(
			(t) => !FILTERED_TOKENS.includes(t.address.toLowerCase())
		)
		const symbols = filteredTokens.map((token) => token.symbol)
		const tokensMap = keyBy(filteredTokens, 'symbol')
		const calls = []

		for (const { address, symbol } of filteredTokens) {
			if (symbol === CRYPTO_CURRENCY_MAP.ETH) {
				calls.push(this.sdk.context.multicallProvider.getEthBalance(walletAddress))
			} else {
				const tokenContract = new EthCallContract(address, erc20Abi)
				calls.push(tokenContract.balanceOf(walletAddress))
			}
		}

		const data = (await this.sdk.context.multicallProvider.all(calls)) as BigNumber[]

		const tokenBalances: TokenBalances = {}

		data.forEach((value, index) => {
			if (value.lte(0)) return
			const token = tokensMap[symbols[index]]

			tokenBalances[symbols[index]] = {
				balance: wei(value, token.decimals ?? 18),
				token,
			}
		})

		return tokenBalances
	}

	private createERC20Contract(tokenAddress: string) {
		return new ethers.Contract(tokenAddress, erc20Abi, this.sdk.context.provider)
	}
}
