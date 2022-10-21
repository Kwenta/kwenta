// @ts-ignore TODO: remove once types are added
import getFormattedSwapData from '@kwenta/synthswap';
import { CurrencyKey, NetworkId, NetworkIdByName } from '@synthetixio/contracts-interface';
import { DeprecatedSynthBalance, TokenBalances } from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import axios from 'axios';
import { Contract as EthCallContract } from 'ethcall';
import { BigNumber, ethers } from 'ethers';
import { get, keyBy, omit } from 'lodash';
import KwentaSDK from 'sdk';

import { KWENTA_REFERRAL_ADDRESS, SYNTH_SWAP_OPTIMISM_ADDRESS } from 'constants/address';
import {
	ATOMIC_EXCHANGES_L1,
	CRYPTO_CURRENCY_MAP,
	ETH_ADDRESS,
	ETH_COINGECKO_ADDRESS,
} from 'constants/currency';
import { ATOMIC_EXCHANGE_SLIPPAGE } from 'constants/exchange';
import { ETH_UNIT } from 'constants/network';
import {
	OneInchApproveSpenderResponse,
	OneInchQuoteResponse,
	OneInchSwapResponse,
} from 'containers/Convert/Convert';
import erc20Abi from 'lib/abis/ERC20.json';
import synthSwapAbi from 'lib/abis/SynthSwap.json';
import { CG_BASE_API_URL } from 'queries/coingecko/constants';
import { PriceResponse } from 'queries/coingecko/types';
import { KWENTA_TRACKING_CODE } from 'queries/futures/constants';
import { Rates } from 'queries/rates/types';
import { getProxySynthSymbol } from 'queries/synths/utils';
import { OneInchTokenListResponse, Token } from 'queries/tokenLists/types';
import {
	getExchangeRatesForCurrencies,
	newGetCoinGeckoPricesForCurrencies,
	newGetExchangeRatesForCurrencies,
	newGetExchangeRatesTupleForCurrencies,
} from 'utils/currencies';
import { zeroBN } from 'utils/formatters/number';
import { FuturesMarketKey, MarketAssetByKey } from 'utils/futures';
import { getTransactionPrice, normalizeGasLimit } from 'utils/network';

import * as sdkErrors from './common/errors';
import { computeGasFee, getGasPriceFromProvider, getL1SecurityFee, MetaTx } from './common/gas';
import SynthRedeemerABI from './contracts/abis/SynthRedeemer.json';
import { getSynthsForNetwork, SynthsMap, SynthSymbol } from './data/synths';

type CurrencyRate = ethers.BigNumberish;
type SynthRatesTuple = [string[], CurrencyRate[]];

const PROTOCOLS =
	'OPTIMISM_UNISWAP_V3,OPTIMISM_SYNTHETIX,OPTIMISM_SYNTHETIX_WRAPPER,OPTIMISM_ONE_INCH_LIMIT_ORDER,OPTIMISM_ONE_INCH_LIMIT_ORDER_V2,OPTIMISM_CURVE,OPTIMISM_BALANCER_V2,OPTIMISM_VELODROME,OPTIMISM_KYBERSWAP_ELASTIC';

const FILTERED_TOKENS = ['0x4922a015c4407f87432b179bb209e125432e4a2a'];

// TODO:
// - Make sure that all methods that depend on both the base and quote currency
//   keys, accept the arguments in the correct order: (quote, base).
// - Rename `quote` and `base` to `from` and `to`, to reduce confusion.
// - Store more properties in the class instance, so we can reduce the number
//   of async calls. For example, there are a number of functions that take
//   more arguments than they optimally should.
// - Write a getter method that returns the value of this.walletAddress when
//   it is provided, and returns an error when it's undefined.
// - Do the above for the signer as well.
// - Experiment with creating a "generateContext" method that takes the base
//   and quote currency keys as arguments, and returns an instance of a class
//   that has all the ExchangeService methods that depend on those (probably
//   overkill, but worth consideration).

export default class ExchangeService {
	private synthsMap: SynthsMap = {};
	private tokensMap: any = {};
	private tokenList: Token[] = [];
	private allTokensMap: any;
	private sdk: KwentaSDK;

	constructor(sdk: KwentaSDK) {
		this.sdk = sdk;
		this.getAllTokensMap();
	}

	private get isL2() {
		return [10, 420].includes(this.sdk.networkId);
	}

	public getTxProvider(baseCurrencyKey: string, quoteCurrencyKey: string) {
		if (!baseCurrencyKey || !quoteCurrencyKey) return null;
		if (
			this.synthsMap?.[baseCurrencyKey as SynthSymbol] &&
			this.synthsMap?.[quoteCurrencyKey as SynthSymbol]
		)
			return 'synthetix';
		if (this.tokensMap[baseCurrencyKey] && this.tokensMap[quoteCurrencyKey]) return '1inch';

		return 'synthswap';
	}

	public async getTotalTradePrice(
		quoteCurrencyKey: string,
		baseCurrencyKey: string,
		quoteAmountWei: Wei
	) {
		const quotePriceRate = await this.getQuotePriceRate(baseCurrencyKey, quoteCurrencyKey);
		const sUSDRate = await this.getSynthUsdRate(quoteCurrencyKey, baseCurrencyKey);
		let tradePrice = quoteAmountWei.mul(quotePriceRate || 0);

		if (sUSDRate) tradePrice = tradePrice.div(sUSDRate);

		return tradePrice;
	}

	public async getEstimatedBaseTradePrice(
		quoteCurrencyKey: string,
		baseCurrencyKey: string,
		baseAmountWei: Wei
	) {
		const basePriceRate = await this.getBasePriceRate(baseCurrencyKey, quoteCurrencyKey);
		const sUSDRate = await this.getSynthUsdRate(quoteCurrencyKey, baseCurrencyKey);
		let tradePrice = baseAmountWei.mul(basePriceRate || 0);

		if (sUSDRate) tradePrice = tradePrice.div(sUSDRate);

		return tradePrice;
	}

	public async getSlippagePercent(
		quoteCurrencyKey: string,
		baseCurrencyKey: string,
		quoteAmountWei: Wei,
		baseAmountWei: Wei
	) {
		const totalTradePrice = await this.getTotalTradePrice(
			quoteCurrencyKey,
			baseCurrencyKey,
			quoteAmountWei
		);

		const estimatedBaseTradePrice = await this.getEstimatedBaseTradePrice(
			quoteCurrencyKey,
			baseCurrencyKey,
			baseAmountWei
		);

		const txProvider = this.getTxProvider(baseCurrencyKey, quoteCurrencyKey);

		if (txProvider === '1inch' && totalTradePrice.gt(0) && estimatedBaseTradePrice.gt(0)) {
			return totalTradePrice.sub(estimatedBaseTradePrice).div(totalTradePrice).neg();
		}

		return null;
	}

	public async getBaseFeeRate(baseCurrencyKey: string, quoteCurrencyKey: string) {
		if (!this.sdk.contracts.SystemSettings) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const [sourceCurrencyFeeRate, destinationCurrencyFeeRate] = await Promise.all([
			this.sdk.contracts.SystemSettings.exchangeFeeRate(
				ethers.utils.formatBytes32String(baseCurrencyKey)
			),
			this.sdk.contracts.SystemSettings.exchangeFeeRate(
				ethers.utils.formatBytes32String(quoteCurrencyKey)
			),
		]);

		return sourceCurrencyFeeRate && destinationCurrencyFeeRate
			? wei(sourceCurrencyFeeRate.add(destinationCurrencyFeeRate)).div(ETH_UNIT)
			: wei(0);
	}

	public async getExchangeFeeRate(quoteCurrencyKey: string, baseCurrencyKey: string) {
		if (!this.sdk.contracts.Exchanger) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const exchangeFeeRate = await this.sdk.contracts.Exchanger.feeRateForExchange(
			ethers.utils.formatBytes32String(quoteCurrencyKey),
			ethers.utils.formatBytes32String(baseCurrencyKey)
		);

		return wei(exchangeFeeRate).div(ETH_UNIT);
	}

	public async getRate(baseCurrencyKey: string, quoteCurrencyKey: string) {
		const [quoteRate, baseRate] = await this.getPairRates(quoteCurrencyKey, baseCurrencyKey);
		const baseCurrencyTokenAddress = this.getTokenAddress(baseCurrencyKey);
		const quoteCurrencyTokenAddress = this.getTokenAddress(quoteCurrencyKey);

		const coinGeckoPrices = await this.getCoingeckoPrices([
			quoteCurrencyTokenAddress,
			baseCurrencyTokenAddress,
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
		const chainId: NetworkId = this.isL2 ? 10 : 1;
		const tokens = Object.values(tokensMap).map((t) => ({ ...t, chainId, tags: [] }));

		return {
			tokens,
			tokensMap: keyBy(tokens, 'symbol'),
			symbols: tokens.map((token) => token.symbol),
		};
	}

	public async getFeeReclaimPeriod(currencyKey: string) {
		if (!this.sdk.walletAddress) {
			throw new Error(sdkErrors.NO_SIGNER);
		}

		if (!this.sdk.contracts.Exchanger) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const maxSecsLeftInWaitingPeriod = (await this.sdk.contracts.Exchanger.maxSecsLeftInWaitingPeriod(
			this.sdk.walletAddress,
			ethers.utils.formatBytes32String(currencyKey)
		)) as ethers.BigNumberish;

		return Number(maxSecsLeftInWaitingPeriod);
	}

	public async getBalance(currencyKey: string) {
		const isETH = this.isCurrencyETH(currencyKey);

		if (isETH) {
			return this.getETHBalance();
		} else if (this.synthsMap[currencyKey as SynthSymbol]) {
			return this.sdk.synths.getSynthBalance(currencyKey);
		} else {
			const token = this.tokenList.find((t) => t.symbol === currencyKey);
			if (token) {
				const tokenBalances = token ? await this.getTokensBalances([token]) : undefined;
				return tokenBalances?.[currencyKey]?.balance ?? zeroBN;
			}
		}

		return zeroBN;
	}

	public async swapSynthSwap(
		fromToken: Token,
		toToken: Token,
		fromAmount: string,
		metaOnly?: 'meta_tx' | 'estimate_gas'
	) {
		if (!this.sdk.signer) throw new Error(sdkErrors.NO_SIGNER);
		if (!this.sdk.provider) throw new Error(sdkErrors.NO_PROVIDER);
		if (this.sdk.networkId !== 10) throw new Error(sdkErrors.UNSUPPORTED_NETWORK);

		const sUSD = this.tokensMap['sUSD'];

		const oneInchFrom = this.tokensMap[fromToken.symbol] ? sUSD.address : fromToken.address;
		const oneInchTo = this.tokensMap[toToken.symbol] ? sUSD.address : toToken.address;

		const fromSymbolBytes = ethers.utils.formatBytes32String(fromToken.symbol);
		const sUSDBytes = ethers.utils.formatBytes32String('sUSD');

		let synthAmountEth = fromAmount;

		if (this.tokensMap[fromToken.symbol]) {
			if (!this.sdk.contracts.Exchanger) {
				throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
			}
			const fromAmountWei = wei(fromAmount).toString(0, true);
			const amounts = await this.sdk.contracts.Exchanger.getAmountsForExchange(
				fromAmountWei,
				fromSymbolBytes,
				sUSDBytes
			);

			const usdValue = amounts.amountReceived.sub(amounts.fee);
			synthAmountEth = ethers.utils.formatEther(usdValue);
		}

		const params = await this.getOneInchSwapParams(oneInchFrom, oneInchTo, synthAmountEth);

		const formattedData = getFormattedSwapData(params, SYNTH_SWAP_OPTIMISM_ADDRESS);

		const synthSwapContract = new ethers.Contract(
			SYNTH_SWAP_OPTIMISM_ADDRESS,
			synthSwapAbi,
			this.sdk.signer
		);

		const contractFunc =
			metaOnly === 'meta_tx'
				? synthSwapContract.populateTransaction
				: metaOnly === 'estimate_gas'
				? synthSwapContract.estimateGas
				: synthSwapContract;

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

	public async swapOneInch(
		quoteTokenAddress: string,
		baseTokenAddress: string,
		amount: string,
		metaOnly = false
	) {
		if (!this.sdk.signer) {
			throw new Error(sdkErrors.NO_SIGNER);
		}

		const params = await this.getOneInchSwapParams(quoteTokenAddress, baseTokenAddress, amount);

		const { from, to, data, value } = params.tx;

		const tx = metaOnly
			? await this.sdk.signer.populateTransaction({
					from,
					to,
					data,
					value: ethers.BigNumber.from(value),
			  })
			: await this.sdk.signer.sendTransaction({
					from,
					to,
					data,
					value: ethers.BigNumber.from(value),
			  });
		return tx;
	}

	public async swapOneInchGasEstimate(
		quoteTokenAddress: string,
		baseTokenAddress: string,
		amount: string
	) {
		if (!this.sdk.walletAddress) {
			throw new Error(sdkErrors.NO_SIGNER);
		}

		const params = await this.getOneInchSwapParams(quoteTokenAddress, baseTokenAddress, amount);

		return params.tx.gas;
	}

	public async getNumEntries(currencyKey: string) {
		if (!this.sdk.walletAddress) {
			throw new Error(sdkErrors.NO_SIGNER);
		}

		if (!this.sdk.contracts.Exchanger) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const { numEntries } = await this.sdk.contracts.Exchanger.settlementOwing(
			this.sdk.walletAddress,
			ethers.utils.formatBytes32String(currencyKey)
		);

		return numEntries ?? 0;
	}

	public async getExchangeRates() {
		if (!this.sdk.contracts.SynthUtil || !this.sdk.contracts.ExchangeRates) {
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
			this.sdk.contracts.SynthUtil.synthsRates(),
			this.sdk.contracts.ExchangeRates.ratesForCurrencies(additionalCurrencies),
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
		const oneInchApproveAddress = await this.getOneInchApproveAddress();
		const quoteCurrencyContract = await this.getQuoteCurrencyContract(quoteCurrencyKey);

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
		if (!this.isL2) {
			throw new Error(sdkErrors.REQUIRES_L2);
		}

		if (!this.sdk.walletAddress) {
			throw new Error(sdkErrors.NO_SIGNER);
		}

		const numEntries = await this.getNumEntries(baseCurrencyKey);
		const destinationCurrencyKey = ethers.utils.formatBytes32String(baseCurrencyKey);

		if (numEntries > 12) {
			const { hash } = await this.sdk.transactions.createSynthetixTxn('Exchanger', 'settle', [
				this.sdk.walletAddress,
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
		baseAmount: string,
		isApproved: boolean
	) {
		const txProvider = this.getTxProvider(baseCurrencyKey, quoteCurrencyKey);
		const quoteCurrencyTokenAddress = this.getTokenAddress(quoteCurrencyKey);
		const baseCurrencyTokenAddress = this.getTokenAddress(baseCurrencyKey);

		let tx: ethers.ContractTransaction | null = null;

		if (txProvider === '1inch' && !!this.tokensMap) {
			// @ts-ignore is correct tx type

			tx = await this.swapOneInch(quoteCurrencyTokenAddress, baseCurrencyTokenAddress, quoteAmount);
		} else if (txProvider === 'synthswap') {
			tx = await this.swapSynthSwap(
				this.allTokensMap[quoteCurrencyKey],
				this.allTokensMap[baseCurrencyKey],
				quoteAmount
			);
		} else {
			const isAtomic = this.checkIsAtomic(baseCurrencyKey, quoteCurrencyKey);
			const needsApproval = this.checkNeedsApproval(baseCurrencyKey, quoteCurrencyKey);
			const exchangeParams = this.getExchangeParams(
				quoteCurrencyKey,
				baseCurrencyKey,
				wei(quoteAmount),
				wei(baseAmount).mul(wei(1).sub(ATOMIC_EXCHANGE_SLIPPAGE))
			);

			const shouldExchange =
				(needsApproval ? isApproved : true) &&
				!!exchangeParams &&
				!!this.sdk.walletAddress &&
				!!this.sdk.contracts.Synthetix;

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
		const txProvider = this.getTxProvider(baseCurrencyKey, quoteCurrencyKey);
		const exchangeRates = await this.getExchangeRates();
		const gasPrices = await this.getEthGasPrice();
		const ethPriceRate = newGetExchangeRatesForCurrencies(exchangeRates, 'sETH', 'sUSD');
		const gasPrice = gasPrices.fast;

		const gasInfo = await this.getGasEstimateForExchange(
			quoteCurrencyKey,
			baseCurrencyKey,
			quoteAmount
		);

		if (txProvider === 'synthswap' || txProvider === '1inch') {
			return getTransactionPrice(
				gasPrice,
				BigNumber.from(gasInfo?.limit || 0),
				ethPriceRate,
				gasInfo?.l1Fee ?? zeroBN
			);
		} else {
			const exchangeParams = this.getExchangeParams(
				quoteCurrencyKey,
				baseCurrencyKey,
				wei(quoteAmount),
				wei(baseAmount).mul(wei(1).sub(ATOMIC_EXCHANGE_SLIPPAGE))
			);

			if (!this.sdk.signer) {
				throw new Error(sdkErrors.NO_SIGNER);
			}

			if (!this.sdk.contracts.Synthetix) {
				throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
			}

			const isAtomic = this.checkIsAtomic(baseCurrencyKey, quoteCurrencyKey);
			const method = isAtomic ? 'exchangeAtomically' : 'exchangeWithTracking';

			const gasLimit = await this.sdk.contracts.Synthetix.connect(this.sdk.signer).estimateGas[
				method
			](...exchangeParams);

			const txn = await this.sdk.contracts.Synthetix.connect(this.sdk.signer).populateTransaction[
				method
			](...exchangeParams);

			const optimismLayerOneFee = await this.getL1SecurityFee({
				...omit(txn, ['maxPriorityFeePerGas', 'maxFeePerGas']),
				gasLimit: txn.gasLimit?.toNumber() ?? 0,
				gasPrice: txn.gasPrice?.toNumber() ?? 0,
			});

			return getTransactionPrice(gasPrice, gasLimit, ethPriceRate, optimismLayerOneFee);
		}
	}

	public async getFeeCost(quoteCurrencyKey: string, baseCurrencyKey: string, quoteAmount: string) {
		const sourceCurrencyKey = ethers.utils.formatBytes32String(quoteCurrencyKey);
		const destinationCurrencyKey = ethers.utils.formatBytes32String(baseCurrencyKey);

		const exchangeFeeRate = await this.getExchangeFeeRate(
			sourceCurrencyKey,
			destinationCurrencyKey
		);

		const feeAmountInQuoteCurrency = wei(quoteAmount).mul(exchangeFeeRate);
		const quotePriceRate = await this.getQuotePriceRate(baseCurrencyKey, quoteCurrencyKey);

		return feeAmountInQuoteCurrency.mul(quotePriceRate);
	}

	public async getApproveAddress(quoteCurrencyKey: string, baseCurrencyKey: string) {
		const txProvider = this.getTxProvider(baseCurrencyKey, quoteCurrencyKey);
		const oneInchApproveAddress = await this.getOneInchApproveAddress();
		return txProvider === '1inch' ? oneInchApproveAddress : SYNTH_SWAP_OPTIMISM_ADDRESS;
	}

	public async checkAllowance(
		quoteCurrencyKey: string,
		baseCurrencyKey: string,
		quoteAmount: string
	) {
		if (!this.sdk.walletAddress) {
			throw new Error(sdkErrors.NO_SIGNER);
		}

		const quoteCurrencyContract = await this.getQuoteCurrencyContract(quoteCurrencyKey);

		const approveAddress = await this.getApproveAddress(quoteCurrencyKey, baseCurrencyKey);

		if (!!quoteCurrencyContract) {
			const allowance = (await quoteCurrencyContract.allowance(
				this.sdk.walletAddress,
				approveAddress
			)) as ethers.BigNumber;

			return wei(ethers.utils.formatEther(allowance)).gte(quoteAmount);
		}
	}

	public checkNeedsApproval(baseCurrencyKey: string, quoteCurrencyKey: string) {
		const txProvider = this.getTxProvider(baseCurrencyKey, quoteCurrencyKey);
		const isQuoteCurrencyETH = this.isCurrencyETH(quoteCurrencyKey);

		return (txProvider === '1inch' || txProvider === 'synthswap') && !isQuoteCurrencyETH;
	}

	public getCurrencyName(currencyKey: string): string | undefined {
		return this.allTokensMap[currencyKey]?.name;
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

		if (this.tokensMap[quoteCurrencyKey as SynthSymbol]) {
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

	public async getQuotePriceRate(baseCurrencyKey: string, quoteCurrencyKey: string) {
		const txProvider = this.getTxProvider(baseCurrencyKey, quoteCurrencyKey);
		const isQuoteCurrencyETH = this.isCurrencyETH(quoteCurrencyKey);

		const quoteCurrencyTokenAddress = (isQuoteCurrencyETH
			? ETH_COINGECKO_ADDRESS
			: this.getTokenAddress(quoteCurrencyKey)
		).toLowerCase();

		const baseCurrencyTokenAddress = this.getTokenAddress(baseCurrencyKey).toLowerCase();

		const coinGeckoPrices = await this.getCoingeckoPrices([
			quoteCurrencyTokenAddress,
			baseCurrencyTokenAddress,
		]);

		const exchangeRates = await this.getExchangeRates();

		if (txProvider !== 'synthetix' && !quoteCurrencyKey) {
			const selectPriceCurrencyRate = exchangeRates['sUSD'];

			if (
				coinGeckoPrices &&
				selectPriceCurrencyRate &&
				coinGeckoPrices[quoteCurrencyTokenAddress]
			) {
				const quotePrice = coinGeckoPrices[quoteCurrencyTokenAddress];

				return quotePrice ? quotePrice.usd / selectPriceCurrencyRate.toNumber() : wei(0);
			} else {
				return wei(0);
			}
		} else {
			return newGetExchangeRatesForCurrencies(exchangeRates, quoteCurrencyKey, 'sUSD');
		}
	}

	public async getBasePriceRate(baseCurrencyKey: string, quoteCurrencyKey: string) {
		const txProvider = this.getTxProvider(baseCurrencyKey, quoteCurrencyKey);
		const isBaseCurrencyETH = this.isCurrencyETH(quoteCurrencyKey);

		const baseCurrencyTokenAddress = (isBaseCurrencyETH
			? ETH_COINGECKO_ADDRESS
			: this.getTokenAddress(baseCurrencyKey)
		).toLowerCase();

		const quoteCurrencyTokenAddress = this.getTokenAddress(baseCurrencyKey).toLowerCase();

		const coinGeckoPrices = await this.getCoingeckoPrices([
			quoteCurrencyTokenAddress,
			baseCurrencyTokenAddress,
		]);

		const exchangeRates = await this.getExchangeRates();

		if (txProvider !== 'synthetix' && !baseCurrencyKey) {
			const selectPriceCurrencyRate = exchangeRates['sUSD'];

			if (coinGeckoPrices && selectPriceCurrencyRate && coinGeckoPrices[baseCurrencyTokenAddress]) {
				const basePrice = coinGeckoPrices[baseCurrencyTokenAddress];
				return basePrice ? basePrice.usd / selectPriceCurrencyRate.toNumber() : wei(0);
			} else {
				return wei(0);
			}
		} else {
			return newGetExchangeRatesForCurrencies(exchangeRates, baseCurrencyKey, 'sUSD');
		}
	}

	public async getRedeemableDeprecatedSynths() {
		if (!this.sdk.walletAddress) {
			throw new Error(sdkErrors.NO_SIGNER);
		}

		if (!this.sdk.contracts?.SynthRedeemer) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const SynthRedeemer = this.sdk.contracts.SynthRedeemer;

		const synthDeprecatedFilter = SynthRedeemer.filters.SynthDeprecated();
		const deprecatedSynthsEvents = await SynthRedeemer.queryFilter(synthDeprecatedFilter);
		const deprecatedProxySynthsAddresses: string[] =
			deprecatedSynthsEvents.map((e) => e.args?.synth).filter(Boolean) ?? [];

		const Redeemer = new EthCallContract(SynthRedeemer.address, SynthRedeemerABI);

		const symbolCalls = [];
		const balanceCalls = [];

		for (const addr of deprecatedProxySynthsAddresses) {
			symbolCalls.push(getProxySynthSymbol(addr));
			balanceCalls.push(Redeemer.balanceOf(addr, this.sdk.walletAddress));
		}

		const deprecatedSynths = (await this.sdk.multicallProvider.all(symbolCalls)) as CurrencyKey[];
		const balanceData = (await this.sdk.multicallProvider.all(balanceCalls)) as ethers.BigNumber[];
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

	public validCurrencyKey(currencyKey: string) {
		return !!this.synthsMap[currencyKey as SynthSymbol] || !!this.tokensMap[currencyKey];
	}

	private async getCoingeckoPrices(tokenAddresses: string[]) {
		const platform = this.isL2 ? 'optimistic-ethereum' : 'ethereum';
		const response = await axios.get<PriceResponse>(
			`${CG_BASE_API_URL}/simple/token_price/${platform}?contract_addresses=${tokenAddresses
				.join(',')
				.replace(ETH_ADDRESS, ETH_COINGECKO_ADDRESS)}&vs_currencies=usd`
		);
		return response.data;
	}

	private async getSynthUsdRate(quoteCurrencyKey: string, baseCurrencyKey: string) {
		if (!quoteCurrencyKey || !baseCurrencyKey) return null;

		const exchangeRates = await this.getExchangeRates();
		const synth = this.tokensMap[quoteCurrencyKey] || this.tokensMap[baseCurrencyKey];

		if (synth) {
			return getExchangeRatesForCurrencies(exchangeRates, 'sUSD', synth.symbol);
		}

		return null;
	}

	private getOneInchSlippage(baseCurrencyKey: string, quoteCurrencyKey: string) {
		const txProvider = this.getTxProvider(baseCurrencyKey, quoteCurrencyKey);

		if (txProvider === '1inch' && (baseCurrencyKey === 'ETH' || quoteCurrencyKey === 'ETH')) {
			return 3;
		}

		return 1;
	}

	private getExchangeParams(
		quoteCurrencyKey: string,
		baseCurrencyKey: string,
		sourceAmount: Wei,
		minAmount: Wei
	) {
		if (!this.sdk.walletAddress) {
			throw new Error(sdkErrors.NO_SIGNER);
		}

		const sourceCurrencyKey = ethers.utils.formatBytes32String(quoteCurrencyKey);
		const destinationCurrencyKey = ethers.utils.formatBytes32String(baseCurrencyKey);

		const sourceAmountBN = sourceAmount.toBN();
		const minAmountBN = minAmount.toBN();
		const isAtomic = this.checkIsAtomic(sourceCurrencyKey, destinationCurrencyKey);

		if (isAtomic) {
			return [
				sourceCurrencyKey,
				sourceAmount,
				destinationCurrencyKey,
				KWENTA_TRACKING_CODE,
				minAmountBN,
			];
		} else {
			return [
				sourceCurrencyKey,
				sourceAmountBN,
				destinationCurrencyKey,
				this.sdk.walletAddress,
				KWENTA_TRACKING_CODE,
			];
		}
	}

	public getSynthsMap() {
		return this.synthsMap;
	}

	public async getOneInchTokens() {
		const { tokensMap, tokens } = await this.getOneInchTokenList();

		this.tokensMap = tokensMap;
		this.tokenList = tokens;

		return { tokensMap: this.tokensMap, tokenList: this.tokenList };
	}

	private async getAllTokensMap() {
		this.synthsMap = getSynthsForNetwork(this.sdk.networkId);
		await this.getOneInchTokens();

		this.allTokensMap = { ...this.synthsMap, ...this.tokensMap };
	}

	private checkIsAtomic(baseCurrencyKey: string, quoteCurrencyKey: string) {
		if (this.isL2 || !baseCurrencyKey || !quoteCurrencyKey) {
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
			const quoteTknAddress = this.allTokensMap[quoteCurrencyKey].address;
			return this.createERC20Contract(quoteTknAddress);
		}

		return null;
	}

	private get oneInchApiUrl() {
		return `https://api.1inch.io/v4.0/${this.isL2 ? 10 : 1}/`;
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
		quoteCurrencyKey: string,
		baseCurrencyKey: string,
		amount: string
	) {
		if (!this.sdk.walletAddress) {
			throw new Error(sdkErrors.NO_SIGNER);
		}

		const quoteTokenAddress = this.getTokenAddress(quoteCurrencyKey);
		const baseTokenAddress = this.getTokenAddress(baseCurrencyKey);
		const slippage = this.getOneInchSlippage(baseCurrencyKey, quoteCurrencyKey);
		const decimals = this.getTokenDecimals(quoteCurrencyKey);

		const params = this.getOneInchQuoteSwapParams(
			quoteTokenAddress,
			baseTokenAddress,
			amount,
			decimals
		);

		const res = await axios.get<OneInchSwapResponse>(this.oneInchApiUrl + 'swap', {
			params: {
				fromTokenAddress: params.fromTokenAddress,
				toTokenAddress: params.toTokenAddress,
				amount: params.amount,
				fromAddress: this.sdk.walletAddress,
				slippage,
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
		const exchangeRates = await this.getExchangeRates();

		const pairRates = newGetExchangeRatesTupleForCurrencies(
			exchangeRates,
			quoteCurrencyKey,
			baseCurrencyKey
		);

		return pairRates;
	}

	private async getTokensBalances(tokens: Token[]) {
		if (!this.sdk.walletAddress) {
			throw new Error(sdkErrors.NO_SIGNER);
		}

		const filteredTokens = tokens.filter((t) => !FILTERED_TOKENS.includes(t.address.toLowerCase()));
		const symbols = filteredTokens.map((token) => token.symbol);
		const filteredTokensMap = keyBy(filteredTokens, 'symbol');

		const calls = [];
		for (const { address, symbol } of filteredTokens) {
			if (symbol === CRYPTO_CURRENCY_MAP.ETH) {
				calls.push(this.sdk.multicallProvider.getEthBalance(this.sdk.walletAddress));
			} else {
				const tokenContract = new EthCallContract(address, erc20Abi);
				calls.push(tokenContract.balanceOf(this.sdk.walletAddress));
			}
		}

		const data = (await this.sdk.multicallProvider.all(calls)) as ethers.BigNumber[];

		const tokenBalances: TokenBalances = {};
		data.forEach((value, index) => {
			if (value.lte(0)) return;
			const token = filteredTokensMap[symbols[index]];

			tokenBalances[symbols[index]] = {
				balance: wei(value, token.decimals ?? 18),
				token,
			};
		});
		return tokenBalances;
	}

	private async getETHBalance() {
		if (!this.sdk.walletAddress) {
			throw new Error(sdkErrors.NO_SIGNER);
		}

		const balance = await this.sdk.provider.getBalance(this.sdk.walletAddress);
		return wei(balance);
	}

	private async getOneInchApproveAddress() {
		const response = await axios.get<OneInchApproveSpenderResponse>(
			this.oneInchApiUrl + 'approve/spender'
		);

		return response.data.address;
	}

	// This is mostly copied over from the Synthetix queries.
	// See: https://github.com/Synthetixio/js-monorepo/blob/master/packages/queries/src/queries/network/useEthGasPriceQuery.ts
	private async getEthGasPrice() {
		try {
			// If network is Mainnet then we use EIP1559
			if (this.sdk.networkId === NetworkIdByName.mainnet) {
				const block = await this.sdk.provider.getBlock('latest');
				if (block?.baseFeePerGas) {
					return {
						fastest: computeGasFee(block.baseFeePerGas, 6),
						fast: computeGasFee(block.baseFeePerGas, 4),
						average: computeGasFee(block.baseFeePerGas, 2),
					};
				} else {
					return getGasPriceFromProvider(this.sdk.provider);
				}
				// If not (Testnet or Optimism network), we get the Gas Price through the provider
			} else {
				return getGasPriceFromProvider(this.sdk.provider);
			}
		} catch (e) {
			throw new Error(`Could not fetch and compute network fee. ${e}`);
		}
	}

	private async getGasEstimateForExchange(
		quoteCurrencyKey: string,
		baseCurrencyKey: string,
		quoteAmount: string
	) {
		if (!this.isL2) return null;

		const txProvider = this.getTxProvider(baseCurrencyKey, quoteCurrencyKey);
		const quoteCurrencyTokenAddress = this.getTokenAddress(quoteCurrencyKey);
		const baseCurrencyTokenAddress = this.getTokenAddress(baseCurrencyKey);

		if (txProvider === 'synthswap') {
			const gasEstimate = await this.swapSynthSwapGasEstimate(
				this.allTokensMap[quoteCurrencyKey],
				this.allTokensMap[baseCurrencyKey],
				quoteAmount
			);

			const metaTx = await this.swapSynthSwap(
				this.allTokensMap[quoteCurrencyKey],
				this.allTokensMap[baseCurrencyKey],
				quoteAmount,
				'meta_tx'
			);

			const l1Fee = await this.getL1SecurityFee({
				...metaTx,
				gasPrice: 0,
				gasLimit: Number(gasEstimate),
			});

			return { limit: normalizeGasLimit(Number(gasEstimate)), l1Fee };
		} else if (txProvider === '1inch') {
			const estimate = await this.swapOneInchGasEstimate(
				quoteCurrencyTokenAddress,
				baseCurrencyTokenAddress,
				quoteAmount
			);

			const metaTx = await this.swapOneInch(
				quoteCurrencyTokenAddress,
				baseCurrencyTokenAddress,
				quoteAmount,
				true
			);

			const l1Fee = await this.getL1SecurityFee({
				...metaTx,
				gasPrice: 0,
				gasLimit: Number(estimate),
			});

			return { limit: normalizeGasLimit(Number(estimate)), l1Fee };
		}
	}

	private getL1SecurityFee(metaTx: MetaTx) {
		return getL1SecurityFee(this.isL2, metaTx, this.sdk.signer);
	}

	private isCurrencyETH(currencyKey: string) {
		return currencyKey === CRYPTO_CURRENCY_MAP.ETH;
	}

	private getTokenAddress(currencyKey: string) {
		if (currencyKey != null) {
			if (this.isCurrencyETH(currencyKey)) {
				return ETH_ADDRESS;
			} else {
				return get(this.allTokensMap, [currencyKey, 'address'], null);
			}
		} else {
			return null;
		}
	}

	private createERC20Contract(tokenAddress: string) {
		return new ethers.Contract(tokenAddress, erc20Abi, this.sdk.provider);
	}
}
