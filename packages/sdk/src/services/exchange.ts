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

	/**
	 * @desc - Get the provider to be used for transactions on a currency pair.
	 * @param fromCurrencyKey The currency key of the source token.
	 * @param toCurrencyKey The currency key of the destination token.
	 * @returns Returns one of '1inch', 'synthetix', or 'synthswap'.
	 */
	public getTxProvider(fromCurrencyKey: string, toCurrencyKey: string) {
		if (!toCurrencyKey || !fromCurrencyKey) return undefined
		if (
			this.synthsMap?.[toCurrencyKey as SynthSymbol] &&
			this.synthsMap?.[fromCurrencyKey as SynthSymbol]
		)
			return 'synthetix'
		if (this.tokensMap[toCurrencyKey] && this.tokensMap[fromCurrencyKey]) return '1inch'

		return 'synthswap'
	}

	public async getTradePrices(
		txProvider: ReturnType<ExchangeService['getTxProvider']>,
		fromCurrencyKey: string,
		toCurrencyKey: string,
		fromAmount: Wei,
		toAmount: Wei
	) {
		const coinGeckoPrices = await this.getCoingeckoPrices(fromCurrencyKey, toCurrencyKey)

		const [quotePriceRate, basePriceRate] = await Promise.all(
			[fromCurrencyKey, toCurrencyKey].map((currencyKey) =>
				this.getPriceRate(currencyKey, txProvider, coinGeckoPrices)
			)
		)

		let quoteTradePrice = fromAmount.mul(quotePriceRate || 0)
		let baseTradePrice = toAmount.mul(basePriceRate || 0)

		if (this.sUSDRate) {
			quoteTradePrice = quoteTradePrice.div(this.sUSDRate)
			baseTradePrice = baseTradePrice.div(this.sUSDRate)
		}

		return { quoteTradePrice, baseTradePrice }
	}

	public async getSlippagePercent(
		fromCurrencyKey: string,
		toCurrencyKey: string,
		fromAmount: Wei,
		toAmount: Wei
	) {
		const txProvider = this.getTxProvider(fromCurrencyKey, toCurrencyKey)

		if (txProvider === '1inch') {
			const { quoteTradePrice: totalTradePrice, baseTradePrice: estimatedBaseTradePrice } =
				await this.getTradePrices(txProvider, fromCurrencyKey, toCurrencyKey, fromAmount, toAmount)

			if (totalTradePrice.gt(0) && estimatedBaseTradePrice.gt(0)) {
				return totalTradePrice.sub(estimatedBaseTradePrice).div(totalTradePrice).neg()
			}
		}

		return undefined
	}

	public async getBaseFeeRate(fromCurrencyKey: string, toCurrencyKey: string) {
		if (!this.sdk.context.contracts.SystemSettings) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		const [sourceCurrencyFeeRate, destinationCurrencyFeeRate] = await Promise.all([
			this.sdk.context.contracts.SystemSettings.exchangeFeeRate(
				ethers.utils.formatBytes32String(toCurrencyKey)
			),
			this.sdk.context.contracts.SystemSettings.exchangeFeeRate(
				ethers.utils.formatBytes32String(fromCurrencyKey)
			),
		])

		return sourceCurrencyFeeRate && destinationCurrencyFeeRate
			? wei(sourceCurrencyFeeRate.add(destinationCurrencyFeeRate))
			: wei(0)
	}

	/**
	 * @desc - Get the fee rate for exchanging between two currencies.
	 * @param fromCurrencyKey The currency key of the source token.
	 * @param toCurrencyKey The currency key of the destination token.
	 * @returns Returns the fee rate.
	 */
	public async getExchangeFeeRate(fromCurrencyKey: string, toCurrencyKey: string) {
		if (!this.sdk.context.contracts.Exchanger) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		const exchangeFeeRate = await this.sdk.context.contracts.Exchanger.feeRateForExchange(
			ethers.utils.formatBytes32String(fromCurrencyKey),
			ethers.utils.formatBytes32String(toCurrencyKey)
		)

		return wei(exchangeFeeRate)
	}

	public async getRate(fromCurrencyKey: string, toCurrencyKey: string) {
		const fromTokenAddress = this.getTokenAddress(fromCurrencyKey)
		const toTokenAddress = this.getTokenAddress(toCurrencyKey)

		const [[quoteRate, baseRate], coinGeckoPrices] = await Promise.all([
			this.getPairRates(fromCurrencyKey, toCurrencyKey),
			this.getCoingeckoPrices(fromCurrencyKey, toCurrencyKey),
		])

		const base = baseRate.lte(0)
			? this.getCoingeckoPricesForCurrencies(coinGeckoPrices, toTokenAddress)
			: baseRate

		const quote = quoteRate.lte(0)
			? this.getCoingeckoPricesForCurrencies(coinGeckoPrices, fromTokenAddress)
			: quoteRate

		return base.gt(0) && quote.gt(0) ? quote.div(base) : wei(0)
	}

	/**
	 * @desc Get the list of whitelisted tokens on 1inch.
	 * @returns Returns the list of tokens currently whitelisted on 1inch.
	 */
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
							synthAmountEth,
							formattedData.data
					  )
					: this.sdk.transactions.createContractTxn(SynthSwap, 'uniswapSwapInto', [
							symbolBytes,
							fromToken.address,
							synthAmountEth,
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
		fromTokenAddress: string,
		toTokenAddress: string,
		amount: string,
		fromTokenDecimals: number
	) {
		const params = await this.getOneInchSwapParams(
			fromTokenAddress,
			toTokenAddress,
			amount,
			fromTokenDecimals
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
		fromTokenAddress: string,
		toTokenAddress: string,
		amount: string,
		fromTokenDecimals: number
	) {
		const params = await this.getOneInchSwapParams(
			fromTokenAddress,
			toTokenAddress,
			amount,
			fromTokenDecimals
		)

		const { from, to, data, value } = params.tx

		return this.sdk.transactions.createEVMTxn({ from, to, data, value })
	}

	public async swapOneInchGasEstimate(
		fromTokenAddress: string,
		toTokenAddress: string,
		amount: string,
		fromTokenDecimals: number
	) {
		const params = await this.getOneInchSwapParams(
			fromTokenAddress,
			toTokenAddress,
			amount,
			fromTokenDecimals
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

	public async approveSwap(fromCurrencyKey: string, toCurrencyKey: string) {
		const txProvider = this.getTxProvider(fromCurrencyKey, toCurrencyKey)
		const fromCurrencyContract = this.getCurrencyContract(fromCurrencyKey)
		const approveAddress = await this.getApproveAddress(txProvider)

		if (fromCurrencyContract) {
			const { hash } = await this.sdk.transactions.createContractTxn(
				fromCurrencyContract,
				'approve',
				[approveAddress, ethers.constants.MaxUint256]
			)

			return hash
		}

		return undefined
	}

	public async handleSettle(toCurrencyKey: string) {
		if (!this.sdk.context.isL2) {
			throw new Error(sdkErrors.REQUIRES_L2)
		}

		const numEntries = await this.getNumEntries(toCurrencyKey)

		if (numEntries > 12) {
			const destinationCurrencyKey = ethers.utils.formatBytes32String(toCurrencyKey)

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
		fromCurrencyKey: string,
		toCurrencyKey: string,
		fromAmount: string,
		toAmount: string
	) {
		const txProvider = this.getTxProvider(fromCurrencyKey, toCurrencyKey)
		const fromTokenAddress = this.getTokenAddress(fromCurrencyKey)
		const toTokenAddress = this.getTokenAddress(toCurrencyKey)
		const fromTokenDecimals = this.getTokenDecimals(fromCurrencyKey)

		let tx: ethers.ContractTransaction | null = null

		if (txProvider === '1inch' && !!this.tokensMap) {
			tx = await this.swapOneInch(fromTokenAddress, toTokenAddress, fromAmount, fromTokenDecimals)
		} else if (txProvider === 'synthswap') {
			// @ts-ignore TODO: Fix variable types
			tx = await this.swapSynthSwap(
				this.allTokensMap[fromCurrencyKey],
				this.allTokensMap[toCurrencyKey],
				fromAmount
			)
		} else {
			const isAtomic = this.checkIsAtomic(fromCurrencyKey, toCurrencyKey)

			const exchangeParams = this.getExchangeParams(
				fromCurrencyKey,
				toCurrencyKey,
				wei(fromAmount),
				wei(toAmount).mul(wei(1).sub(ATOMIC_EXCHANGE_SLIPPAGE)),
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
		fromCurrencyKey: string,
		toCurrencyKey: string,
		fromAmount: string,
		toAmount: string
	) {
		const gasPrices = await getEthGasPrice(this.sdk.context.networkId, this.sdk.context.provider)
		const txProvider = this.getTxProvider(fromCurrencyKey, toCurrencyKey)
		const ethPriceRate = this.getExchangeRatesForCurrencies(this.exchangeRates, 'sETH', 'sUSD')
		const gasPrice = gasPrices.fast

		if (txProvider === 'synthswap' || txProvider === '1inch') {
			const gasInfo = await this.getGasEstimateForExchange(
				txProvider,
				fromCurrencyKey,
				toCurrencyKey,
				fromAmount
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

			const isAtomic = this.checkIsAtomic(fromCurrencyKey, toCurrencyKey)

			const exchangeParams = this.getExchangeParams(
				fromCurrencyKey,
				toCurrencyKey,
				wei(fromAmount || 0),
				wei(toAmount || 0).mul(wei(1).sub(ATOMIC_EXCHANGE_SLIPPAGE)),
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

	public async getFeeCost(fromCurrencyKey: string, toCurrencyKey: string, fromAmount: string) {
		const txProvider = this.getTxProvider(fromCurrencyKey, toCurrencyKey)

		const coinGeckoPrices = await this.getCoingeckoPrices(fromCurrencyKey, toCurrencyKey)

		const [exchangeFeeRate, fromPriceRate] = await Promise.all([
			this.getExchangeFeeRate(fromCurrencyKey, toCurrencyKey),
			this.getPriceRate(fromCurrencyKey, txProvider, coinGeckoPrices),
		])

		return wei(fromAmount).mul(exchangeFeeRate).mul(fromPriceRate)
	}

	public getApproveAddress(txProvider: ReturnType<ExchangeService['getTxProvider']>) {
		return txProvider !== '1inch' ? SYNTH_SWAP_OPTIMISM_ADDRESS : this.getOneInchApproveAddress()
	}

	public async checkAllowance(fromCurrencyKey: string, toCurrencyKey: string) {
		const txProvider = this.getTxProvider(fromCurrencyKey, toCurrencyKey)

		const [fromCurrencyContract, approveAddress] = await Promise.all([
			this.getCurrencyContract(fromCurrencyKey),
			this.getApproveAddress(txProvider),
		])

		if (!!fromCurrencyContract) {
			const allowance = (await fromCurrencyContract.allowance(
				this.sdk.context.walletAddress,
				approveAddress
			)) as ethers.BigNumber

			return wei(ethers.utils.formatEther(allowance))
		}
	}

	public getCurrencyName(currencyKey: string): string | undefined {
		return this.allTokensMap?.[currencyKey]?.name
	}

	public async getOneInchQuote(toCurrencyKey: string, fromCurrencyKey: string, amount: string) {
		const sUSD = this.tokensMap['sUSD']
		const decimals = this.getTokenDecimals(fromCurrencyKey)
		const fromTokenAddress = this.getTokenAddress(fromCurrencyKey)
		const toTokenAddress = this.getTokenAddress(toCurrencyKey)
		const txProvider = this.getTxProvider(fromCurrencyKey, toCurrencyKey)

		const synth = this.tokensMap[fromCurrencyKey] || this.tokensMap[toCurrencyKey]

		const synthUsdRate = synth ? this.getPairRates(synth, 'sUSD') : null

		if (!fromCurrencyKey || !toCurrencyKey || !sUSD || !amount.length || wei(amount).eq(0)) {
			return ''
		}

		if (txProvider === '1inch') {
			const estimatedAmount = await this.quoteOneInch(
				fromTokenAddress,
				toTokenAddress,
				amount,
				decimals
			)

			return estimatedAmount
		}

		if (this.tokensMap[fromCurrencyKey]) {
			const usdAmount = wei(amount).div(synthUsdRate)

			const estimatedAmount = await this.quoteOneInch(
				sUSD.address,
				toTokenAddress,
				usdAmount.toString(),
				decimals
			)

			return estimatedAmount
		} else {
			const estimatedAmount = await this.quoteOneInch(
				fromTokenAddress,
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
			return this.checkIsAtomic('sUSD', currencyKey)
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

	public validCurrencyKeys(fromCurrencyKey?: string, toCurrencyKey?: string) {
		return [fromCurrencyKey, toCurrencyKey].map((currencyKey) => {
			return (
				!!currencyKey &&
				(!!this.synthsMap[currencyKey as SynthSymbol] || !!this.tokensMap[currencyKey])
			)
		})
	}

	public async getCoingeckoPrices(fromCurrencyKey: string, toCurrencyKey: string) {
		const fromTokenAddress = this.getTokenAddress(fromCurrencyKey, true).toLowerCase()
		const toTokenAddress = this.getTokenAddress(toCurrencyKey).toLowerCase()
		const tokenAddresses = [fromTokenAddress, toTokenAddress]

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
		fromCurrencyKey: string,
		toCurrencyKey: string,
		sourceAmount: Wei,
		minAmount: Wei,
		isAtomic: boolean
	) {
		const sourceCurrencyKey = ethers.utils.formatBytes32String(fromCurrencyKey)
		const destinationCurrencyKey = ethers.utils.formatBytes32String(toCurrencyKey)
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

	/**
	 * Get token balances for the given wallet address
	 * @param walletAddress Wallet address
	 * @returns Token balances for the given wallet address
	 */
	public async getTokenBalances(walletAddress: string): Promise<TokenBalances> {
		if (!this.sdk.context.isMainnet) return {}

		const filteredTokens: Token[] = []
		const symbols: string[] = []
		const tokensMap: Record<string, Token> = {}

		this.tokenList.forEach((token) => {
			if (!FILTERED_TOKENS.includes(token.address.toLowerCase())) {
				symbols.push(token.symbol)
				tokensMap[token.symbol] = token
				filteredTokens.push(token)
			}
		})

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

		data.forEach((value, i) => {
			if (value.lte(0)) return
			const token = tokensMap[symbols[i]]

			tokenBalances[symbols[i]] = {
				balance: wei(value, token.decimals ?? 18),
				token,
			}
		})

		return tokenBalances
	}

	private checkIsAtomic(fromCurrencyKey: string, toCurrencyKey: string) {
		if (this.sdk.context.isL2 || !toCurrencyKey || !fromCurrencyKey) {
			return false
		}

		return [toCurrencyKey, fromCurrencyKey].every((currency) =>
			ATOMIC_EXCHANGES_L1.includes(currency)
		)
	}

	private getTokenDecimals(currencyKey: string) {
		return get(this.allTokensMap, [currencyKey, 'decimals'], undefined)
	}

	private getCurrencyContract(currencyKey: string) {
		if (this.allTokensMap[currencyKey]) {
			const tokenAddress = this.getTokenAddress(currencyKey, true)
			return this.createERC20Contract(tokenAddress)
		}

		return null
	}

	private get oneInchApiUrl() {
		return `${process.env.NEXT_PUBLIC_SERVICES_PROXY}/1inch/swap/v5.2/${
			this.sdk.context.isL2 ? 10 : 1
		}/`
	}

	private getOneInchQuoteSwapParams(
		fromTokenAddress: string,
		toTokenAddress: string,
		amount: string,
		decimals: number
	) {
		return {
			fromTokenAddress,
			toTokenAddress,
			amount: wei(amount, decimals).toString(0, true),
		}
	}

	private async getOneInchSwapParams(
		fromTokenAddress: string,
		toTokenAddress: string,
		amount: string,
		fromTokenDecimals: number
	) {
		const params = this.getOneInchQuoteSwapParams(
			fromTokenAddress,
			toTokenAddress,
			amount,
			fromTokenDecimals
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
				includeTokenInfo: true,
			},
		})

		return res.data
	}

	private async quoteOneInch(
		fromTokenAddress: string,
		toTokenAddress: string,
		amount: string,
		decimals: number
	) {
		const params = this.getOneInchQuoteSwapParams(
			fromTokenAddress,
			toTokenAddress,
			amount,
			decimals
		)

		const response = await axios.get<OneInchQuoteResponse>(this.oneInchApiUrl + 'quote', {
			params: {
				fromTokenAddress: params.fromTokenAddress,
				toTokenAddress: params.toTokenAddress,
				amount: params.amount,
				PROTOCOLS,
				includeTokensInfo: true,
			},
		})

		return ethers.utils
			.formatUnits(response.data.toAmount, response.data.toToken.decimals)
			.toString()
	}

	private async swapSynthSwapGasEstimate(fromToken: Token, toToken: Token, fromAmount: string) {
		return this.swapSynthSwap(fromToken, toToken, fromAmount, 'estimate_gas')
	}

	private async getPairRates(fromCurrencyKey: string, toCurrencyKey: string) {
		return this.checkIsAtomic(fromCurrencyKey, toCurrencyKey)
			? await Promise.all([
					this.getAtomicRates(fromCurrencyKey),
					this.getAtomicRates(toCurrencyKey),
			  ])
			: this.getExchangeRatesTupleForCurrencies(
					this.sdk.prices.currentPrices.onChain,
					fromCurrencyKey,
					toCurrencyKey
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
		fromCurrencyKey: string,
		toCurrencyKey: string,
		quoteAmount: string
	) {
		if (!this.sdk.context.isL2) return null

		const fromTokenAddress = this.getTokenAddress(fromCurrencyKey)
		const toTokenAddress = this.getTokenAddress(toCurrencyKey)
		const quoteDecimals = this.getTokenDecimals(fromCurrencyKey)

		if (txProvider === 'synthswap') {
			const [gasEstimate, metaTx] = await Promise.all([
				this.swapSynthSwapGasEstimate(
					this.allTokensMap[fromCurrencyKey],
					this.allTokensMap[toCurrencyKey],
					quoteAmount
				),
				this.swapSynthSwap(
					this.allTokensMap[fromCurrencyKey],
					this.allTokensMap[toCurrencyKey],
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
				this.swapOneInchGasEstimate(fromTokenAddress, toTokenAddress, quoteAmount, quoteDecimals),
				this.swapOneInchMeta(fromTokenAddress, toTokenAddress, quoteAmount, quoteDecimals),
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

	private createERC20Contract(tokenAddress: string) {
		return new ethers.Contract(tokenAddress, erc20Abi, this.sdk.context.provider)
	}
}
