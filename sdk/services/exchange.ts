// @ts-ignore TODO: remove once types are added
import getFormattedSwapData from '@kwenta/synthswap';
import { CurrencyKey, NetworkId } from '@synthetixio/contracts-interface';
import { DeprecatedSynthBalance, TokenBalances } from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import axios from 'axios';
import { Contract as EthCallContract } from 'ethcall';
import { BigNumber, ethers } from 'ethers';
import { get, keyBy } from 'lodash';
import KwentaSDK from 'sdk';
import { getEthGasPrice } from 'sdk/common/gas';
import { startInterval } from 'sdk/utils/interval';

import { KWENTA_REFERRAL_ADDRESS, SYNTH_SWAP_OPTIMISM_ADDRESS } from 'constants/address';
import {
	ATOMIC_EXCHANGES_L1,
	CRYPTO_CURRENCY_MAP,
	ETH_ADDRESS,
	ETH_COINGECKO_ADDRESS,
} from 'constants/currency';
import { DEFAULT_1INCH_SLIPPAGE } from 'constants/defaults';
import { ATOMIC_EXCHANGE_SLIPPAGE } from 'constants/exchange';
import { ETH_UNIT } from 'constants/network';
import erc20Abi from 'lib/abis/ERC20.json';
import { CG_BASE_API_URL } from 'queries/coingecko/constants';
import { PriceResponse } from 'queries/coingecko/types';
import { KWENTA_TRACKING_CODE } from 'queries/futures/constants';
import { Rates } from 'queries/rates/types';
import { getProxySynthSymbol } from 'queries/synths/utils';
import { Token } from 'queries/walletBalances/types';
import {
	newGetCoinGeckoPricesForCurrencies,
	newGetExchangeRatesForCurrencies,
	newGetExchangeRatesTupleForCurrencies,
} from 'utils/currencies';
import { zeroBN } from 'utils/formatters/number';
import { FuturesMarketKey, MarketAssetByKey } from 'utils/futures';
import { getTransactionPrice, normalizeGasLimit } from 'utils/network';

import * as sdkErrors from '../common/errors';
import SynthRedeemerABI from '../contracts/abis/SynthRedeemer.json';
import { getSynthsForNetwork, SynthSymbol } from '../data/synths';
import {
	OneInchApproveSpenderResponse,
	OneInchQuoteResponse,
	OneInchSwapResponse,
	OneInchTokenListResponse,
} from '../types/1inch';

type CurrencyRate = ethers.BigNumberish;
type SynthRatesTuple = [string[], CurrencyRate[]];

const PROTOCOLS =
	'OPTIMISM_UNISWAP_V3,OPTIMISM_SYNTHETIX,OPTIMISM_SYNTHETIX_WRAPPER,OPTIMISM_ONE_INCH_LIMIT_ORDER,OPTIMISM_ONE_INCH_LIMIT_ORDER_V2,OPTIMISM_CURVE,OPTIMISM_BALANCER_V2,OPTIMISM_VELODROME,OPTIMISM_KYBERSWAP_ELASTIC';

const FILTERED_TOKENS = ['0x4922a015c4407f87432b179bb209e125432e4a2a'];
const DEFAULT_BUFFER = 0.2;

export default class ExchangeService {
	private tokensMap: any = {};
	private tokenList: Token[] = [];
	private allTokensMap: any;
	private sdk: KwentaSDK;
	private exchangeRates: Rates = {};
	private ratesInterval: number | undefined;

	constructor(sdk: KwentaSDK) {
		this.sdk = sdk;
	}

	public startRateUpdates() {
		this.getOneInchTokens();

		if (!this.ratesInterval) {
			this.ratesInterval = startInterval(async () => {
				this.exchangeRates = await this.getExchangeRates();
				this.sdk.events.emit('exchangeRates_updated', this.exchangeRates);
			}, 15000);
		}
	}

	public onRatesUpdated(listener: (exchangeRates: Rates) => void) {
		return this.sdk.events.on('exchangeRates_updated', listener);
	}

	public removeRatesListeners() {
		this.sdk.events.removeAllListeners('exchangeRates_updated');
	}

	public getTxProvider(baseCurrencyKey: string, quoteCurrencyKey: string) {
		if (!baseCurrencyKey || !quoteCurrencyKey) return undefined;
		if (
			this.synthsMap?.[baseCurrencyKey as SynthSymbol] &&
			this.synthsMap?.[quoteCurrencyKey as SynthSymbol]
		)
			return 'synthetix';
		if (this.tokensMap[baseCurrencyKey] && this.tokensMap[quoteCurrencyKey]) return '1inch';

		return 'synthswap';
	}

	public async getTradePrices(
		txProvider: ReturnType<ExchangeService['getTxProvider']>,
		quoteCurrencyKey: string,
		baseCurrencyKey: string,
		quoteAmountWei: Wei,
		baseAmountWei: Wei
	) {
		const coinGeckoPrices = await this.getCoingeckoPrices(quoteCurrencyKey, baseCurrencyKey);

		const [quotePriceRate, basePriceRate] = await Promise.all(
			[quoteCurrencyKey, baseCurrencyKey].map((currencyKey) =>
				this.getPriceRate(currencyKey, txProvider, coinGeckoPrices)
			)
		);

		let quoteTradePrice = quoteAmountWei.mul(quotePriceRate || 0);
		let baseTradePrice = baseAmountWei.mul(basePriceRate || 0);

		if (this.sUSDRate) {
			quoteTradePrice = quoteTradePrice.div(this.sUSDRate);
			baseTradePrice = baseTradePrice.div(this.sUSDRate);
		}

		return { quoteTradePrice, baseTradePrice };
	}

	public async getSlippagePercent(
		quoteCurrencyKey: string,
		baseCurrencyKey: string,
		quoteAmountWei: Wei,
		baseAmountWei: Wei
	) {
		const txProvider = this.getTxProvider(baseCurrencyKey, quoteCurrencyKey);

		if (txProvider === '1inch') {
			const {
				quoteTradePrice: totalTradePrice,
				baseTradePrice: estimatedBaseTradePrice,
			} = await this.getTradePrices(
				txProvider,
				quoteCurrencyKey,
				baseCurrencyKey,
				quoteAmountWei,
				baseAmountWei
			);

			if (totalTradePrice.gt(0) && estimatedBaseTradePrice.gt(0)) {
				return totalTradePrice.sub(estimatedBaseTradePrice).div(totalTradePrice).neg();
			}
		}

		return undefined;
	}

	public async getBaseFeeRate(baseCurrencyKey: string, quoteCurrencyKey: string) {
		if (!this.sdk.context.contracts.SystemSettings) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const [sourceCurrencyFeeRate, destinationCurrencyFeeRate] = await Promise.all([
			this.sdk.context.contracts.SystemSettings.exchangeFeeRate(
				ethers.utils.formatBytes32String(baseCurrencyKey)
			),
			this.sdk.context.contracts.SystemSettings.exchangeFeeRate(
				ethers.utils.formatBytes32String(quoteCurrencyKey)
			),
		]);

		return sourceCurrencyFeeRate && destinationCurrencyFeeRate
			? wei(sourceCurrencyFeeRate.add(destinationCurrencyFeeRate)).div(ETH_UNIT)
			: wei(0);
	}

	public async getExchangeFeeRate(quoteCurrencyKey: string, baseCurrencyKey: string) {
		if (!this.sdk.context.contracts.Exchanger) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const exchangeFeeRate = await this.sdk.context.contracts.Exchanger.feeRateForExchange(
			ethers.utils.formatBytes32String(quoteCurrencyKey),
			ethers.utils.formatBytes32String(baseCurrencyKey)
		);

		return wei(exchangeFeeRate);
	}

	public async getRate(baseCurrencyKey: string, quoteCurrencyKey: string) {
		const baseCurrencyTokenAddress = this.getTokenAddress(baseCurrencyKey);
		const quoteCurrencyTokenAddress = this.getTokenAddress(quoteCurrencyKey);

		const [[quoteRate, baseRate], coinGeckoPrices] = await Promise.all([
			this.getPairRates(quoteCurrencyKey, baseCurrencyKey),
			this.getCoingeckoPrices(quoteCurrencyKey, baseCurrencyKey),
		]);

		const base = baseRate.lte(0)
			? newGetCoinGeckoPricesForCurrencies(coinGeckoPrices, baseCurrencyTokenAddress)
			: baseRate;

		const quote = quoteRate.lte(0)
			? newGetCoinGeckoPricesForCurrencies(coinGeckoPrices, quoteCurrencyTokenAddress)
			: quoteRate;

		return base.gt(0) && quote.gt(0) ? quote.div(base) : wei(0);
	}

	public async getOneInchTokenList() {
		const response = await axios.get<OneInchTokenListResponse>(this.oneInchApiUrl + 'tokens');

		const tokensMap = response.data.tokens || {};
		const chainId: NetworkId = this.sdk.context.isL2 ? 10 : 1;
		const tokens = Object.values(tokensMap).map((t) => ({ ...t, chainId, tags: [] }));

		return {
			tokens,
			tokensMap: keyBy(tokens, 'symbol'),
			symbols: tokens.map((token) => token.symbol),
		};
	}

	public async getFeeReclaimPeriod(currencyKey: string) {
		if (!this.sdk.context.contracts.Exchanger) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const maxSecsLeftInWaitingPeriod = (await this.sdk.context.contracts.Exchanger.maxSecsLeftInWaitingPeriod(
			this.sdk.context.walletAddress,
			ethers.utils.formatBytes32String(currencyKey)
		)) as ethers.BigNumberish;

		return Number(maxSecsLeftInWaitingPeriod);
	}

	public async swapSynthSwap(
		fromToken: Token,
		toToken: Token,
		fromAmount: string,
		metaOnly?: 'meta_tx' | 'estimate_gas'
	) {
		if (this.sdk.context.networkId !== 10) throw new Error(sdkErrors.UNSUPPORTED_NETWORK);

		const sUSD = this.tokensMap['sUSD'];

		const oneInchFrom = this.tokensMap[fromToken.symbol] ? sUSD.address : fromToken.address;
		const oneInchTo = this.tokensMap[toToken.symbol] ? sUSD.address : toToken.address;

		const fromSymbolBytes = ethers.utils.formatBytes32String(fromToken.symbol);
		const sUSDBytes = ethers.utils.formatBytes32String('sUSD');

		let synthAmountEth = fromAmount;

		if (this.tokensMap[fromToken.symbol]) {
			if (!this.sdk.context.contracts.Exchanger) {
				throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
			}
			const fromAmountWei = wei(fromAmount).toString(0, true);
			const amounts = await this.sdk.context.contracts.Exchanger.getAmountsForExchange(
				fromAmountWei,
				fromSymbolBytes,
				sUSDBytes
			);

			const usdValue = amounts.amountReceived.sub(amounts.fee);
			synthAmountEth = ethers.utils.formatEther(usdValue);
		}

		const params = await this.getOneInchSwapParams(
			oneInchFrom,
			oneInchTo,
			synthAmountEth,
			fromToken.decimals
		);

		const formattedData = getFormattedSwapData(params, SYNTH_SWAP_OPTIMISM_ADDRESS);

		const SynthSwap = this.sdk.context.contracts.SynthSwap;

		if (!SynthSwap) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const contractFunc =
			metaOnly === 'meta_tx'
				? SynthSwap.populateTransaction
				: metaOnly === 'estimate_gas'
				? SynthSwap.estimateGas
				: SynthSwap;

		if (this.tokensMap[toToken.symbol]) {
			const symbolBytes = ethers.utils.formatBytes32String(toToken.symbol);
			if (formattedData.functionSelector === 'swap') {
				return contractFunc.swapInto(symbolBytes, formattedData.data);
			} else {
				return contractFunc.uniswapSwapInto(
					symbolBytes,
					fromToken.address,
					params.fromTokenAmount,
					formattedData.data
				);
			}
		} else {
			if (formattedData.functionSelector === 'swap') {
				return contractFunc.swapOutOf(
					fromSymbolBytes,
					wei(fromAmount).toString(0, true),
					formattedData.data
				);
			} else {
				const usdValue = ethers.utils.parseEther(synthAmountEth).toString();
				return contractFunc.uniswapSwapOutOf(
					fromSymbolBytes,
					toToken.address,
					wei(fromAmount).toString(0, true),
					usdValue,
					formattedData.data
				);
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
		);

		const { from, to, data, value } = params.tx;

		return this.sdk.context.signer.populateTransaction({
			from,
			to,
			data,
			value: ethers.BigNumber.from(value),
		});
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
		);

		const { from, to, data, value } = params.tx;

		return this.sdk.context.signer.sendTransaction({
			from,
			to,
			data,
			value: ethers.BigNumber.from(value),
		});
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
		);

		return params.tx.gas;
	}

	public async getNumEntries(currencyKey: string): Promise<number> {
		if (!this.sdk.context.contracts.Exchanger) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const { numEntries } = await this.sdk.context.contracts.Exchanger.settlementOwing(
			this.sdk.context.walletAddress,
			ethers.utils.formatBytes32String(currencyKey)
		);

		return numEntries ? Number(numEntries.toString()) : 0;
	}

	public async getExchangeRates() {
		if (!this.sdk.context.contracts.SynthUtil || !this.sdk.context.contracts.ExchangeRates) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const exchangeRates: Rates = {};

		// Additional commonly used currencies to fetch, besides the one returned by the SynthUtil.synthsRates
		const additionalCurrencies = [
			'SNX',
			'XAU',
			'XAG',
			'DYDX',
			'APE',
			'BNB',
			'DOGE',
			'DebtRatio',
			'XMR',
			'OP',
		].map(ethers.utils.formatBytes32String);

		const [synthsRates, ratesForCurrencies] = (await Promise.all([
			this.sdk.context.contracts.SynthUtil.synthsRates(),
			this.sdk.context.contracts.ExchangeRates.ratesForCurrencies(additionalCurrencies),
		])) as [SynthRatesTuple, CurrencyRate[]];

		const synths = [...synthsRates[0], ...additionalCurrencies] as CurrencyKey[];
		const rates = [...synthsRates[1], ...ratesForCurrencies] as CurrencyRate[];

		synths.forEach((currencyKeyBytes32: CurrencyKey, idx: number) => {
			const currencyKey = ethers.utils.parseBytes32String(currencyKeyBytes32) as CurrencyKey;
			const marketAsset = MarketAssetByKey[currencyKey as FuturesMarketKey];

			const rate = Number(ethers.utils.formatEther(rates[idx]));

			exchangeRates[currencyKey] = wei(rate);
			if (marketAsset) exchangeRates[marketAsset] = wei(rate);
		});

		return exchangeRates;
	}

	public async approveSwap(quoteCurrencyKey: string, baseCurrencyKey: string) {
		const txProvider = this.getTxProvider(baseCurrencyKey, quoteCurrencyKey);
		const [oneInchApproveAddress, quoteCurrencyContract] = await Promise.all([
			this.getOneInchApproveAddress(),
			this.getQuoteCurrencyContract(quoteCurrencyKey),
		]);

		const approveAddress =
			txProvider === '1inch' ? oneInchApproveAddress : SYNTH_SWAP_OPTIMISM_ADDRESS;

		if (quoteCurrencyContract) {
			const { hash } = await this.sdk.transactions.createContractTxn(
				quoteCurrencyContract,
				'approve',
				[approveAddress, ethers.constants.MaxUint256]
			);

			return hash;
		}

		return undefined;
	}

	public async handleRedeem() {
		const redeemableDeprecatedSynths = await this.getRedeemableDeprecatedSynths();

		if (redeemableDeprecatedSynths.totalUSDBalance.gt(0)) {
			const { hash } = await this.sdk.transactions.createSynthetixTxn(
				'SynthRedeemer',
				'redeemAll',
				[redeemableDeprecatedSynths.balances.map((b) => b.proxyAddress)]
			);

			return hash;
		}
	}

	public async handleSettle(baseCurrencyKey: string) {
		if (!this.sdk.context.isL2) {
			throw new Error(sdkErrors.REQUIRES_L2);
		}

		const numEntries = await this.getNumEntries(baseCurrencyKey);
		const destinationCurrencyKey = ethers.utils.formatBytes32String(baseCurrencyKey);

		if (numEntries > 12) {
			const { hash } = await this.sdk.transactions.createSynthetixTxn('Exchanger', 'settle', [
				this.sdk.context.walletAddress,
				destinationCurrencyKey,
			]);

			return hash;
		}

		return undefined;
	}

	// TODO: Refactor handleExchange

	public async handleExchange(
		quoteCurrencyKey: string,
		baseCurrencyKey: string,
		quoteAmount: string,
		baseAmount: string
	) {
		const txProvider = this.getTxProvider(baseCurrencyKey, quoteCurrencyKey);
		const quoteCurrencyTokenAddress = this.getTokenAddress(quoteCurrencyKey);
		const baseCurrencyTokenAddress = this.getTokenAddress(baseCurrencyKey);
		const quoteDecimals = this.getTokenDecimals(quoteCurrencyKey);

		let tx: ethers.ContractTransaction | null = null;

		if (txProvider === '1inch' && !!this.tokensMap) {
			tx = await this.swapOneInch(
				quoteCurrencyTokenAddress,
				baseCurrencyTokenAddress,
				quoteAmount,
				quoteDecimals
			);
		} else if (txProvider === 'synthswap') {
			tx = await this.swapSynthSwap(
				this.allTokensMap[quoteCurrencyKey],
				this.allTokensMap[baseCurrencyKey],
				quoteAmount
			);
		} else {
			const isAtomic = this.checkIsAtomic(baseCurrencyKey, quoteCurrencyKey);
			const exchangeParams = this.getExchangeParams(
				quoteCurrencyKey,
				baseCurrencyKey,
				wei(quoteAmount),
				wei(baseAmount).mul(wei(1).sub(ATOMIC_EXCHANGE_SLIPPAGE)),
				isAtomic
			);

			const shouldExchange =
				!!exchangeParams &&
				!!this.sdk.context.walletAddress &&
				!!this.sdk.context.contracts.Synthetix;

			if (shouldExchange) {
				const { hash } = await this.sdk.transactions.createSynthetixTxn(
					'Synthetix',
					isAtomic ? 'exchangeAtomically' : 'exchangeWithTracking',
					exchangeParams
				);

				return hash;
			}
		}

		return tx?.hash;
	}

	public async getTransactionFee(
		quoteCurrencyKey: string,
		baseCurrencyKey: string,
		quoteAmount: string,
		baseAmount: string
	) {
		const gasPrices = await getEthGasPrice(this.sdk.context.networkId, this.sdk.context.provider);
		const txProvider = this.getTxProvider(baseCurrencyKey, quoteCurrencyKey);
		const ethPriceRate = newGetExchangeRatesForCurrencies(this.exchangeRates, 'sETH', 'sUSD');
		const gasPrice = gasPrices.fast;

		if (txProvider === 'synthswap' || txProvider === '1inch') {
			const gasInfo = await this.getGasEstimateForExchange(
				quoteCurrencyKey,
				baseCurrencyKey,
				quoteAmount
			);

			return getTransactionPrice(
				gasPrice,
				BigNumber.from(gasInfo?.limit || 0),
				ethPriceRate,
				gasInfo?.l1Fee ?? zeroBN
			);
		} else {
			if (!this.sdk.context.contracts.Synthetix) {
				throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
			}

			const isAtomic = this.checkIsAtomic(baseCurrencyKey, quoteCurrencyKey);

			const exchangeParams = this.getExchangeParams(
				quoteCurrencyKey,
				baseCurrencyKey,
				wei(quoteAmount || 0),
				wei(baseAmount || 0).mul(wei(1).sub(ATOMIC_EXCHANGE_SLIPPAGE)),
				isAtomic
			);

			const method = isAtomic ? 'exchangeAtomically' : 'exchangeWithTracking';

			const txn = {
				to: this.sdk.context.contracts.Synthetix.address,
				data: this.sdk.context.contracts.Synthetix.interface.encodeFunctionData(
					method,
					exchangeParams
				),
				value: ethers.BigNumber.from(0),
			};

			const [baseGasLimit, optimismLayerOneFee] = await Promise.all([
				this.sdk.transactions.estimateGas(txn),
				this.sdk.transactions.getOptimismLayerOneFees(txn),
			]);

			const gasLimit = wei(baseGasLimit ?? 0, 9)
				.mul(1 + DEFAULT_BUFFER)
				.toBN();

			return getTransactionPrice(gasPrice, gasLimit, ethPriceRate, optimismLayerOneFee);
		}
	}

	public async getFeeCost(quoteCurrencyKey: string, baseCurrencyKey: string, quoteAmount: string) {
		const txProvider = this.getTxProvider(baseCurrencyKey, quoteCurrencyKey);

		const coinGeckoPrices = await this.getCoingeckoPrices(quoteCurrencyKey, baseCurrencyKey);

		const [exchangeFeeRate, quotePriceRate] = await Promise.all([
			this.getExchangeFeeRate(quoteCurrencyKey, baseCurrencyKey),
			this.getPriceRate(quoteCurrencyKey, txProvider, coinGeckoPrices),
		]);

		const feeAmountInQuoteCurrency = wei(quoteAmount).mul(exchangeFeeRate);

		return feeAmountInQuoteCurrency.mul(quotePriceRate);
	}

	public async getApproveAddress(quoteCurrencyKey: string, baseCurrencyKey: string) {
		const txProvider = this.getTxProvider(baseCurrencyKey, quoteCurrencyKey);
		const oneInchApproveAddress = await this.getOneInchApproveAddress();
		return txProvider === '1inch' ? oneInchApproveAddress : SYNTH_SWAP_OPTIMISM_ADDRESS;
	}

	public async checkAllowance(quoteCurrencyKey: string, baseCurrencyKey: string) {
		const [quoteCurrencyContract, approveAddress] = await Promise.all([
			this.getQuoteCurrencyContract(quoteCurrencyKey),
			this.getApproveAddress(quoteCurrencyKey, baseCurrencyKey),
		]);

		if (!!quoteCurrencyContract) {
			const allowance = (await quoteCurrencyContract.allowance(
				this.sdk.context.walletAddress,
				approveAddress
			)) as ethers.BigNumber;

			return wei(ethers.utils.formatEther(allowance));
		}
	}

	public checkNeedsApproval(baseCurrencyKey: string, quoteCurrencyKey: string) {
		const txProvider = this.getTxProvider(baseCurrencyKey, quoteCurrencyKey);
		const isQuoteCurrencyETH = this.isCurrencyETH(quoteCurrencyKey);

		return (txProvider === '1inch' || txProvider === 'synthswap') && !isQuoteCurrencyETH;
	}

	public getCurrencyName(currencyKey: string): string | undefined {
		return this.allTokensMap?.[currencyKey]?.name;
	}

	public async getOneInchQuote(baseCurrencyKey: string, quoteCurrencyKey: string, amount: string) {
		const sUSD = this.tokensMap['sUSD'];
		const decimals = this.getTokenDecimals(quoteCurrencyKey);
		const quoteTokenAddress = this.getTokenAddress(quoteCurrencyKey);
		const baseTokenAddress = this.getTokenAddress(baseCurrencyKey);
		const txProvider = this.getTxProvider(baseCurrencyKey, quoteCurrencyKey);

		const synth = this.tokensMap[quoteCurrencyKey] || this.tokensMap[baseCurrencyKey];

		const synthUsdRate = synth ? await this.getPairRates(synth, 'sUSD') : null;

		if (!quoteCurrencyKey || !baseCurrencyKey || !sUSD || !amount.length || wei(amount).eq(0)) {
			return '';
		}

		if (txProvider === '1inch') {
			const estimatedAmount = await this.quoteOneInch(
				quoteTokenAddress,
				baseTokenAddress,
				amount,
				decimals
			);

			return estimatedAmount;
		}

		if (this.tokensMap[quoteCurrencyKey]) {
			const usdAmount = wei(amount).div(synthUsdRate);

			const estimatedAmount = await this.quoteOneInch(
				sUSD.address,
				baseTokenAddress,
				usdAmount.toString(),
				decimals
			);

			return estimatedAmount;
		} else {
			const estimatedAmount = await this.quoteOneInch(
				quoteTokenAddress,
				sUSD.address,
				amount,
				decimals
			);

			return wei(estimatedAmount).mul(synthUsdRate).toString();
		}
	}

	public async getPriceRate(
		currencyKey: string,
		txProvider: ReturnType<ExchangeService['getTxProvider']>,
		coinGeckoPrices: PriceResponse
	) {
		const tokenAddress = this.getTokenAddress(currencyKey, true).toLowerCase();

		if (txProvider !== 'synthetix') {
			const selectPriceCurrencyRate = this.exchangeRates['sUSD'];

			if (coinGeckoPrices && selectPriceCurrencyRate && coinGeckoPrices[tokenAddress]) {
				const quotePrice = coinGeckoPrices[tokenAddress];
				return quotePrice ? quotePrice.usd / selectPriceCurrencyRate.toNumber() : wei(0);
			} else {
				return wei(0);
			}
		} else {
			return newGetExchangeRatesForCurrencies(this.exchangeRates, currencyKey, 'sUSD');
		}
	}

	public async getRedeemableDeprecatedSynths() {
		if (!this.sdk.context.contracts?.SynthRedeemer) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const SynthRedeemer = this.sdk.context.contracts.SynthRedeemer.connect(
			this.sdk.context.provider
		);

		const synthDeprecatedFilter = SynthRedeemer.filters.SynthDeprecated();
		const deprecatedSynthsEvents = await SynthRedeemer.queryFilter(synthDeprecatedFilter);
		const deprecatedProxySynthsAddresses: string[] =
			deprecatedSynthsEvents.map((e) => e.args?.synth).filter(Boolean) ?? [];

		const Redeemer = new EthCallContract(SynthRedeemer.address, SynthRedeemerABI);

		const symbolCalls = [];
		const balanceCalls = [];

		for (const addr of deprecatedProxySynthsAddresses) {
			symbolCalls.push(getProxySynthSymbol(addr));
			balanceCalls.push(Redeemer.balanceOf(addr, this.sdk.context.walletAddress));
		}

		const [deprecatedSynths, balanceData] = (await Promise.all([
			this.sdk.context.multicallProvider.all(symbolCalls),
			this.sdk.context.multicallProvider.all(balanceCalls),
		])) as [CurrencyKey[], ethers.BigNumber[]];

		const balances = balanceData.map((balance) => wei(balance));

		let totalUSDBalance = wei(0);
		const cryptoBalances: DeprecatedSynthBalance[] = [];

		for (let i = 0; i < balances.length; i++) {
			const usdBalance = balances[i];
			if (usdBalance.gt(0)) {
				const currencyKey = deprecatedSynths[i];
				totalUSDBalance = totalUSDBalance.add(usdBalance);
				cryptoBalances.push({
					currencyKey,
					proxyAddress: deprecatedProxySynthsAddresses[i],
					balance: wei(0),
					usdBalance,
				});
			}
		}

		return { balances: cryptoBalances, totalUSDBalance };
	}

	public validCurrencyKeys(quoteCurrencyKey?: string, baseCurrencyKey?: string) {
		return [quoteCurrencyKey, baseCurrencyKey].map((currencyKey) => {
			return (
				!!currencyKey &&
				(!!this.synthsMap[currencyKey as SynthSymbol] || !!this.tokensMap[currencyKey])
			);
		});
	}

	public async getCoingeckoPrices(quoteCurrencyKey: string, baseCurrencyKey: string) {
		const quoteCurrencyTokenAddress = this.getTokenAddress(quoteCurrencyKey, true).toLowerCase();
		const baseCurrencyTokenAddress = this.getTokenAddress(baseCurrencyKey).toLowerCase();
		const tokenAddresses = [quoteCurrencyTokenAddress, baseCurrencyTokenAddress];

		const platform = this.sdk.context.isL2 ? 'optimistic-ethereum' : 'ethereum';
		const response = await axios.get<PriceResponse>(
			`${CG_BASE_API_URL}/simple/token_price/${platform}?contract_addresses=${tokenAddresses
				.join(',')
				.replace(ETH_ADDRESS, ETH_COINGECKO_ADDRESS)}&vs_currencies=usd`
		);
		return response.data;
	}

	private get sUSDRate() {
		return this.exchangeRates['sUSD'];
	}

	private getExchangeParams(
		quoteCurrencyKey: string,
		baseCurrencyKey: string,
		sourceAmount: Wei,
		minAmount: Wei,
		isAtomic: boolean
	) {
		const sourceCurrencyKey = ethers.utils.formatBytes32String(quoteCurrencyKey);
		const destinationCurrencyKey = ethers.utils.formatBytes32String(baseCurrencyKey);

		const sourceAmountBN = sourceAmount.toBN();
		const minAmountBN = minAmount.toBN();

		if (isAtomic) {
			return [
				sourceCurrencyKey,
				sourceAmountBN,
				destinationCurrencyKey,
				KWENTA_TRACKING_CODE,
				minAmountBN,
			];
		} else {
			return [
				sourceCurrencyKey,
				sourceAmountBN,
				destinationCurrencyKey,
				this.sdk.context.walletAddress,
				KWENTA_TRACKING_CODE,
			];
		}
	}

	public getSynthsMap() {
		return this.synthsMap;
	}

	public get synthsMap() {
		return getSynthsForNetwork(this.sdk.context.networkId);
	}

	public async getOneInchTokens() {
		const { tokensMap, tokens } = await this.getOneInchTokenList();

		this.tokensMap = tokensMap;
		this.tokenList = tokens;
		this.allTokensMap = { ...this.synthsMap, ...tokensMap };

		return { tokensMap: this.tokensMap, tokenList: this.tokenList };
	}

	private checkIsAtomic(baseCurrencyKey: string, quoteCurrencyKey: string) {
		if (this.sdk.context.isL2 || !baseCurrencyKey || !quoteCurrencyKey) {
			return false;
		}

		return [baseCurrencyKey, quoteCurrencyKey].every((currency) =>
			ATOMIC_EXCHANGES_L1.includes(currency)
		);
	}

	private getTokenDecimals(currencyKey: string) {
		return get(this.allTokensMap, [currencyKey, 'decimals'], undefined);
	}

	private async getQuoteCurrencyContract(quoteCurrencyKey: string) {
		if (quoteCurrencyKey && this.allTokensMap[quoteCurrencyKey]) {
			const quoteTknAddress = this.getTokenAddress(quoteCurrencyKey, true);
			return this.createERC20Contract(quoteTknAddress);
		}

		return null;
	}

	private get oneInchApiUrl() {
		return `https://api.1inch.io/v4.0/${this.sdk.context.isL2 ? 10 : 1}/`;
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
		};
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
		);

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
		});

		return res.data;
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
		);

		const response = await axios.get<OneInchQuoteResponse>(this.oneInchApiUrl + 'quote', {
			params: {
				fromTokenAddress: params.fromTokenAddress,
				toTokenAddress: params.toTokenAddress,
				amount: params.amount,
				disableEstimate: true,
				PROTOCOLS,
			},
		});

		return ethers.utils
			.formatUnits(response.data.toTokenAmount, response.data.toToken.decimals)
			.toString();
	}

	private async swapSynthSwapGasEstimate(fromToken: Token, toToken: Token, fromAmount: string) {
		return this.swapSynthSwap(fromToken, toToken, fromAmount, 'estimate_gas');
	}

	private async getPairRates(quoteCurrencyKey: string, baseCurrencyKey: string) {
		const pairRates = newGetExchangeRatesTupleForCurrencies(
			this.exchangeRates,
			quoteCurrencyKey,
			baseCurrencyKey
		);

		return pairRates;
	}

	private async getOneInchApproveAddress() {
		const response = await axios.get<OneInchApproveSpenderResponse>(
			this.oneInchApiUrl + 'approve/spender'
		);

		return response.data.address;
	}

	private async getGasEstimateForExchange(
		quoteCurrencyKey: string,
		baseCurrencyKey: string,
		quoteAmount: string
	) {
		if (!this.sdk.context.isL2) return null;

		const txProvider = this.getTxProvider(baseCurrencyKey, quoteCurrencyKey);
		const quoteCurrencyTokenAddress = this.getTokenAddress(quoteCurrencyKey);
		const baseCurrencyTokenAddress = this.getTokenAddress(baseCurrencyKey);
		const quoteDecimals = this.getTokenDecimals(quoteCurrencyKey);

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
			]);

			const l1Fee = await this.sdk.transactions.getOptimismLayerOneFees({
				...metaTx,
				gasPrice: 0,
				gasLimit: Number(gasEstimate),
			});

			return { limit: normalizeGasLimit(Number(gasEstimate)), l1Fee };
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
			]);

			const l1Fee = await this.sdk.transactions.getOptimismLayerOneFees({
				...metaTx,
				gasPrice: 0,
				gasLimit: Number(estimate),
			});

			return { limit: normalizeGasLimit(Number(estimate)), l1Fee };
		}
	}

	private isCurrencyETH(currencyKey: string) {
		return currencyKey === CRYPTO_CURRENCY_MAP.ETH;
	}

	private getTokenAddress(currencyKey: string, coingecko?: boolean) {
		if (currencyKey != null) {
			if (this.isCurrencyETH(currencyKey)) {
				return coingecko ? ETH_COINGECKO_ADDRESS : ETH_ADDRESS;
			} else {
				return get(this.allTokensMap, [currencyKey, 'address'], null);
			}
		} else {
			return null;
		}
	}

	// TODO: This is temporary.
	// We should consider either having another service for this
	// It does not quite fit into the synths service.
	// One idea is to create a "tokens" service that handles everything
	// related to 1inch tokens.

	public async getTokenBalances(walletAddress: string) {
		const filteredTokens = this.tokenList.filter(
			(t) => !FILTERED_TOKENS.includes(t.address.toLowerCase())
		);
		const symbols = filteredTokens.map((token) => token.symbol);
		const tokensMap = keyBy(filteredTokens, 'symbol');
		const calls = [];

		for (const { address, symbol } of filteredTokens) {
			if (symbol === CRYPTO_CURRENCY_MAP.ETH) {
				calls.push(this.sdk.context.multicallProvider.getEthBalance(walletAddress));
			} else {
				const tokenContract = new EthCallContract(address, erc20Abi);
				calls.push(tokenContract.balanceOf(walletAddress));
			}
		}

		const data = (await this.sdk.context.multicallProvider.all(calls)) as BigNumber[];

		const tokenBalances: TokenBalances = {};

		data.forEach((value, index) => {
			if (value.lte(0)) return;
			const token = tokensMap[symbols[index]];

			tokenBalances[symbols[index]] = {
				balance: wei(value, token.decimals ?? 18),
				token,
			};
		});

		return tokenBalances;
	}

	private createERC20Contract(tokenAddress: string) {
		return new ethers.Contract(tokenAddress, erc20Abi, this.sdk.context.provider);
	}
}
