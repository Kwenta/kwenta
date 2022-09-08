import useSynthetixQueries, { Token } from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import mainnetOneInchTokenList from 'data/token-lists/mainnet.json';
import optimismOneInchTokenList from 'data/token-lists/optimism.json';
import { BigNumber, ethers } from 'ethers';
import produce from 'immer';
import get from 'lodash/get';
import { useRouter } from 'next/router';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { SYNTH_SWAP_OPTIMISM_ADDRESS } from 'constants/address';
import {
	ATOMIC_EXCHANGES_L1,
	CRYPTO_CURRENCY_MAP,
	CurrencyKey,
	ETH_ADDRESS,
	ETH_COINGECKO_ADDRESS,
} from 'constants/currency';
import { DEFAULT_CRYPTO_DECIMALS } from 'constants/defaults';
import ROUTES from 'constants/routes';
import Connector from 'containers/Connector';
import Convert from 'containers/Convert';
import TransactionNotifier from 'containers/TransactionNotifier';
import useDebouncedMemo from 'hooks/useDebouncedMemo';
import { useGetL1SecurityFee } from 'hooks/useGetL1SecurityGasFee';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import use1InchApproveSpenderQuery from 'queries/1inch/use1InchApproveAddressQuery';
import use1InchQuoteQuery from 'queries/1inch/use1InchQuoteQuery';
import useCoinGeckoTokenPricesQuery from 'queries/coingecko/useCoinGeckoTokenPricesQuery';
import { KWENTA_TRACKING_CODE } from 'queries/futures/constants';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useBaseFeeRateQuery from 'queries/synths/useBaseFeeRateQuery';
import useExchangeFeeRateQuery from 'queries/synths/useExchangeFeeRateQuery';
import useNumEntriesQuery from 'queries/synths/useNumEntriesQuery';
import useRedeemableDeprecatedSynthsQuery from 'queries/synths/useRedeemableDeprecatedSynthsQuery';
import useSynthBalances from 'queries/synths/useSynthBalances';
import useTokensBalancesQuery from 'queries/walletBalances/useTokensBalancesQuery';
import { TxProvider } from 'sections/shared/modals/TxConfirmationModal/TxConfirmationModal';
import {
	baseCurrencyAmountState,
	baseCurrencyKeyState,
	currencyPairState,
	quoteCurrencyAmountState,
	quoteCurrencyKeyState,
	ratioState,
	txErrorState,
} from 'store/exchange';
import { ordersState } from 'store/orders';
import { hasOrdersNotificationState, slippageState } from 'store/ui';
import { gasSpeedState } from 'store/wallet';
import {
	newGetCoinGeckoPricesForCurrencies,
	newGetExchangeRatesForCurrencies,
	newGetExchangeRatesTupleForCurrencies,
} from 'utils/currencies';
import { truncateNumbers, zeroBN } from 'utils/formatters/number';
import { hexToAsciiV2 } from 'utils/formatters/string';
import logError from 'utils/logError';
import { normalizeGasLimit, getTransactionPrice } from 'utils/network';

import useIsL2 from './useIsL2';

type ExchangeCardProps = {
	footerCardAttached?: boolean;
	routingEnabled?: boolean;
	showNoSynthsCard?: boolean;
};

type ExchangeModal = 'settle' | 'confirm' | 'approve' | 'redeem' | 'base-select' | 'quote-select';
export type SwapRatio = 25 | 50 | 75 | 100;

const useExchange = ({
	footerCardAttached = false,
	routingEnabled = false,
	showNoSynthsCard = false,
}: ExchangeCardProps) => {
	const { t } = useTranslation();
	const { monitorTransaction } = TransactionNotifier.useContainer();

	const { synthsMap, tokensMap: synthTokensMap } = Connector.useContainer();
	const {
		createERC20Contract,
		swap1Inch,
		swapSynthSwap,
		swapSynthSwapGasEstimate,
		swap1InchGasEstimate,
	} = Convert.useContainer();

	const {
		useETHBalanceQuery,
		useSynthsBalancesQuery,
		useFeeReclaimPeriodQuery,
		useEthGasPriceQuery,
		useSynthetixTxn,
		useContractTxn,
	} = useSynthetixQueries();

	useSynthBalances();
	const { isWalletConnected, network, walletAddress } = Connector.useContainer();
	const isL2 = useIsL2();

	const router = useRouter();

	const baseCurrencyKey = useRecoilValue(baseCurrencyKeyState);
	const quoteCurrencyKey = useRecoilValue(quoteCurrencyKeyState);

	const [openModal, setOpenModal] = useState<ExchangeModal>();

	const [isApproving, setIsApproving] = useState(false);
	const [isApproved, setIsApproved] = useState(false);
	const [gasInfo, setGasInfo] = useState<{ limit: number; l1Fee: Wei } | null>();

	const [baseCurrencyAmount, setBaseCurrencyAmount] = useRecoilState(baseCurrencyAmountState);
	const [quoteCurrencyAmount, setQuoteCurrencyAmount] = useRecoilState(quoteCurrencyAmountState);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [ratio, setRatio] = useRecoilState(ratioState);

	const setTxError = useSetRecoilState(txErrorState);
	const [atomicExchangeSlippage] = useState('0.01');
	const setOrders = useSetRecoilState(ordersState);
	const setHasOrdersNotification = useSetRecoilState(hasOrdersNotificationState);
	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();
	const slippage = useRecoilValue(slippageState);
	const getL1SecurityFee = useGetL1SecurityFee();

	const gasSpeed = useRecoilValue(gasSpeedState);
	const ethGasPriceQuery = useEthGasPriceQuery();
	const gasPrice = ethGasPriceQuery?.data?.[gasSpeed] ?? null;

	const setCurrencyPair = useSetRecoilState(currencyPairState);
	const ETHBalanceQuery = useETHBalanceQuery(walletAddress);
	const ETHBalance = ETHBalanceQuery.isSuccess ? ETHBalanceQuery.data ?? zeroBN : null;

	const synthsWalletBalancesQuery = useSynthsBalancesQuery(walletAddress);
	const synthsWalletBalance = synthsWalletBalancesQuery.isSuccess
		? synthsWalletBalancesQuery.data
		: null;

	const exchangeRatesQuery = useExchangeRatesQuery();

	const tokenList = isL2 ? optimismOneInchTokenList.tokens : mainnetOneInchTokenList.tokens;
	const oneInchTokensMap: any = isL2
		? optimismOneInchTokenList.tokensMap
		: mainnetOneInchTokenList.tokensMap;

	const allTokensMap = useMemo(() => ({ ...oneInchTokensMap, ...synthTokensMap }), [
		oneInchTokensMap,
		synthTokensMap,
	]);

	const txProvider: TxProvider | null = useMemo(() => {
		if (!baseCurrencyKey || !quoteCurrencyKey) return null;
		if (synthsMap[baseCurrencyKey] && synthsMap[quoteCurrencyKey]) return 'synthetix';
		if (oneInchTokensMap[baseCurrencyKey] && oneInchTokensMap[quoteCurrencyKey]) return '1inch';
		return 'synthswap';
	}, [synthsMap, baseCurrencyKey, quoteCurrencyKey, oneInchTokensMap]);

	// TODO: these queries break when `txProvider` is not `synthetix` and should not be called.
	// however, condition would break rule of hooks here
	const feeReclaimPeriodQuery = useFeeReclaimPeriodQuery(quoteCurrencyKey, walletAddress);

	const numEntriesQuery = useNumEntriesQuery(walletAddress || '', baseCurrencyKey);

	const exchangeFeeRateQuery = useExchangeFeeRateQuery(quoteCurrencyKey, baseCurrencyKey);

	const baseFeeRateQuery = useBaseFeeRateQuery(baseCurrencyKey, quoteCurrencyKey);

	const isBaseCurrencyETH = baseCurrencyKey === CRYPTO_CURRENCY_MAP.ETH;
	const isQuoteCurrencyETH = quoteCurrencyKey === CRYPTO_CURRENCY_MAP.ETH;

	const needsApproval =
		(txProvider === '1inch' || txProvider === 'synthswap') && !isQuoteCurrencyETH;

	const quoteCurrencyAmountDebounced = useDebouncedMemo(
		() => quoteCurrencyAmount,
		[quoteCurrencyAmount],
		300
	);

	const quoteDecimals = get(allTokensMap, [quoteCurrencyKey!, 'decimals'], undefined);

	const selectedTokens: any = tokenList.filter(
		(t) => t.symbol === baseCurrencyKey || t.symbol === quoteCurrencyKey
	);

	const tokensWalletBalancesQuery = useTokensBalancesQuery(selectedTokens, walletAddress || '');
	const tokenBalances = tokensWalletBalancesQuery.data ?? null;

	const quoteCurrencyTokenAddress = useMemo(
		(): Token['address'] | null =>
			quoteCurrencyKey != null
				? isQuoteCurrencyETH
					? ETH_ADDRESS
					: get(allTokensMap, [quoteCurrencyKey, 'address'], null)
				: null,
		[quoteCurrencyKey, isQuoteCurrencyETH, allTokensMap]
	);

	const baseCurrencyTokenAddress = useMemo(
		(): Token['address'] | null =>
			baseCurrencyKey != null
				? isBaseCurrencyETH
					? ETH_ADDRESS
					: get(allTokensMap, [baseCurrencyKey, 'address'], null)
				: null,
		[baseCurrencyKey, isBaseCurrencyETH, allTokensMap]
	);

	const coinGeckoTokenPricesQuery = useCoinGeckoTokenPricesQuery(
		quoteCurrencyTokenAddress != null && baseCurrencyTokenAddress != null
			? [quoteCurrencyTokenAddress, baseCurrencyTokenAddress]
			: [],
		{ enabled: txProvider !== 'synthetix' }
	);

	const coinGeckoPrices = coinGeckoTokenPricesQuery.data ?? null;

	const oneInchQuoteQuery = use1InchQuoteQuery(
		txProvider,
		quoteCurrencyKey && quoteCurrencyTokenAddress
			? { key: quoteCurrencyKey, address: quoteCurrencyTokenAddress }
			: null,
		baseCurrencyKey && baseCurrencyTokenAddress
			? { key: baseCurrencyKey, address: baseCurrencyTokenAddress }
			: null,
		quoteCurrencyAmountDebounced,
		quoteDecimals
	);

	const oneInchApproveAddressQuery = use1InchApproveSpenderQuery({
		enabled: txProvider === '1inch',
	});

	const oneInchApproveAddress = oneInchApproveAddressQuery.data ?? null;

	const approveAddress =
		txProvider === '1inch' ? oneInchApproveAddress : SYNTH_SWAP_OPTIMISM_ADDRESS;

	const quoteCurrencyContract = useMemo(() => {
		if (quoteCurrencyKey && allTokensMap[quoteCurrencyKey] && needsApproval) {
			const quoteTknAddress = allTokensMap[quoteCurrencyKey].address;
			return createERC20Contract(quoteTknAddress);
		}
		return null;
	}, [quoteCurrencyKey, createERC20Contract, needsApproval, allTokensMap]);

	const exchangeFeeRate = exchangeFeeRateQuery.data ?? null;
	const baseFeeRate = baseFeeRateQuery.data ?? null;

	const feeReclaimPeriodInSeconds = feeReclaimPeriodQuery.data ?? 0;

	const numEntries = numEntriesQuery.data ?? null;

	const baseCurrency = baseCurrencyKey != null ? synthsMap[baseCurrencyKey]! : null;
	const quoteCurrency = quoteCurrencyKey != null ? synthsMap[quoteCurrencyKey]! : null;

	const exchangeRates = exchangeRatesQuery.data ?? null;

	const [quoteRate, baseRate] = useMemo(
		() => newGetExchangeRatesTupleForCurrencies(exchangeRates, quoteCurrencyKey, baseCurrencyKey),
		[exchangeRates, quoteCurrencyKey, baseCurrencyKey]
	);

	const rate = useMemo(() => {
		const base = baseRate.lte(0)
			? newGetCoinGeckoPricesForCurrencies(coinGeckoPrices, baseCurrencyTokenAddress)
			: baseRate;
		const quote = quoteRate.lte(0)
			? newGetCoinGeckoPricesForCurrencies(coinGeckoPrices, quoteCurrencyTokenAddress)
			: quoteRate;
		return base.gt(0) && quote.gt(0) ? quote.div(base) : wei(0);
	}, [baseCurrencyTokenAddress, baseRate, coinGeckoPrices, quoteCurrencyTokenAddress, quoteRate]);

	const inverseRate = useMemo(() => (rate.gt(0) ? wei(1).div(rate) : wei(0)), [rate]);

	const getBalance = useCallback(
		(currencyKey: string | null, isETH: boolean) => {
			if (currencyKey != null) {
				if (isETH) {
					return ETHBalance;
				} else if (synthsMap[currencyKey]) {
					return synthsWalletBalance != null
						? (get(synthsWalletBalance, ['balancesMap', currencyKey, 'balance'], zeroBN) as Wei)
						: null;
				} else {
					return tokenBalances?.[currencyKey]?.balance ?? zeroBN;
				}
			}
			return null;
		},
		[synthsMap, ETHBalance, synthsWalletBalance, tokenBalances]
	);

	const quoteCurrencyBalance = useMemo(() => {
		return getBalance(quoteCurrencyKey, isQuoteCurrencyETH);
	}, [getBalance, quoteCurrencyKey, isQuoteCurrencyETH]);

	const baseCurrencyBalance = useMemo(() => {
		return getBalance(baseCurrencyKey, isBaseCurrencyETH);
	}, [getBalance, baseCurrencyKey, isBaseCurrencyETH]);

	// TODO: Fix coingecko prices (optimism issue maybe?)
	const quotePriceRate = useMemo(() => {
		const quoteCurrencyTokenAddresLower = (isQuoteCurrencyETH
			? ETH_COINGECKO_ADDRESS
			: quoteCurrencyTokenAddress
		)?.toLowerCase();

		return txProvider !== 'synthetix' && !quoteCurrency
			? coinGeckoPrices != null &&
			  quoteCurrencyTokenAddress != null &&
			  selectPriceCurrencyRate != null &&
			  quoteCurrencyTokenAddresLower != null &&
			  coinGeckoPrices[quoteCurrencyTokenAddresLower] != null
				? coinGeckoPrices[quoteCurrencyTokenAddresLower].usd / selectPriceCurrencyRate.toNumber()
				: wei(0)
			: newGetExchangeRatesForCurrencies(
					exchangeRates,
					quoteCurrencyKey,
					selectedPriceCurrency.name
			  );
	}, [
		isQuoteCurrencyETH,
		quoteCurrencyTokenAddress,
		txProvider,
		quoteCurrency,
		coinGeckoPrices,
		selectPriceCurrencyRate,
		exchangeRates,
		quoteCurrencyKey,
		selectedPriceCurrency.name,
	]);

	const basePriceRate = useMemo(() => {
		const baseCurrencyTokenAddresLower = (isQuoteCurrencyETH
			? ETH_COINGECKO_ADDRESS
			: baseCurrencyTokenAddress
		)?.toLowerCase();

		return txProvider !== 'synthetix' && !baseCurrency
			? coinGeckoPrices != null &&
			  baseCurrencyTokenAddress != null &&
			  selectPriceCurrencyRate != null &&
			  baseCurrencyTokenAddresLower != null &&
			  coinGeckoPrices[baseCurrencyTokenAddresLower] != null
				? wei(coinGeckoPrices[baseCurrencyTokenAddresLower].usd).div(selectPriceCurrencyRate)
				: wei(0)
			: newGetExchangeRatesForCurrencies(
					exchangeRates,
					baseCurrencyKey,
					selectedPriceCurrency.name
			  );
	}, [
		isQuoteCurrencyETH,
		baseCurrencyTokenAddress,
		txProvider,
		baseCurrency,
		coinGeckoPrices,
		selectPriceCurrencyRate,
		exchangeRates,
		baseCurrencyKey,
		selectedPriceCurrency.name,
	]);

	const settlementWaitingPeriodQuery = useFeeReclaimPeriodQuery(baseCurrencyKey, walletAddress);

	const settlementWaitingPeriodInSeconds = settlementWaitingPeriodQuery.data ?? 0;

	const settlementDisabledReason =
		settlementWaitingPeriodInSeconds > 0
			? t('exchange.summary-info.button.settle-waiting-period')
			: null;

	const ethPriceRate = useMemo(
		() => newGetExchangeRatesForCurrencies(exchangeRates, 'sETH', selectedPriceCurrency.name),
		[exchangeRates, selectedPriceCurrency.name]
	);

	const quoteCurrencyAmountBN = useMemo(
		() => (quoteCurrencyAmount === '' ? zeroBN : wei(quoteCurrencyAmount)),
		[quoteCurrencyAmount]
	);
	const baseCurrencyAmountBN = useMemo(
		() => (baseCurrencyAmount === '' ? zeroBN : wei(baseCurrencyAmount)),
		[baseCurrencyAmount]
	);

	const totalTradePrice = useMemo(() => {
		let tradePrice = quoteCurrencyAmountBN.mul(quotePriceRate || 0);
		if (selectPriceCurrencyRate) {
			tradePrice = tradePrice.div(selectPriceCurrencyRate);
		}

		return tradePrice;
	}, [quoteCurrencyAmountBN, quotePriceRate, selectPriceCurrencyRate]);

	const estimatedBaseTradePrice = useMemo(() => {
		let tradePrice = baseCurrencyAmountBN.mul(basePriceRate);
		if (selectPriceCurrencyRate) {
			tradePrice = tradePrice.div(selectPriceCurrencyRate);
		}

		return tradePrice;
	}, [baseCurrencyAmountBN, basePriceRate, selectPriceCurrencyRate]);

	const selectedBothSides = baseCurrencyKey != null && quoteCurrencyKey != null;

	const submissionDisabledReason = useMemo(() => {
		const insufficientBalance =
			quoteCurrencyBalance != null ? quoteCurrencyAmountBN.gt(quoteCurrencyBalance) : false;

		if (feeReclaimPeriodInSeconds > 0) {
			return t('exchange.summary-info.button.fee-reclaim-period');
		}
		if (!selectedBothSides) {
			return txProvider === '1inch'
				? t('exchange.summary-info.button.select-token')
				: t('exchange.summary-info.button.select-synth');
		}
		if (insufficientBalance) {
			return t('exchange.summary-info.button.insufficient-balance');
		}
		if (isSubmitting) {
			return t('exchange.summary-info.button.submitting-order');
		}
		if (isApproving) {
			return t('exchange.summary-info.button.approving');
		}
		if (oneInchQuoteQuery.error) {
			return t('exchange.summary-info.button.insufficient-liquidity');
		}
		if (!isWalletConnected || baseCurrencyAmountBN.lte(0) || quoteCurrencyAmountBN.lte(0)) {
			return t('exchange.summary-info.button.enter-amount');
		}
		return null;
	}, [
		quoteCurrencyBalance,
		selectedBothSides,
		isSubmitting,
		feeReclaimPeriodInSeconds,
		baseCurrencyAmountBN,
		quoteCurrencyAmountBN,
		isWalletConnected,
		isApproving,
		t,
		txProvider,
		oneInchQuoteQuery,
	]);

	const noSynths =
		synthsWalletBalancesQuery.isSuccess && synthsWalletBalancesQuery.data
			? synthsWalletBalancesQuery.data.balances.length === 0
			: false;

	const routeToMarketPair = (baseCurrencyKey: string, quoteCurrencyKey: string) =>
		routingEnabled
			? router.replace(`/exchange`, ROUTES.Exchange.MarketPair(baseCurrencyKey, quoteCurrencyKey), {
					shallow: true,
			  })
			: undefined;

	const routeToBaseCurrency = (baseCurrencyKey: string) =>
		routingEnabled
			? router.replace(`/exchange`, ROUTES.Exchange.Into(baseCurrencyKey), {
					shallow: true,
			  })
			: false;

	const handleCurrencySwap = () => {
		const quoteAmount = quoteCurrencyAmount;

		setCurrencyPair({ base: quoteCurrencyKey, quote: baseCurrencyKey });

		// TODO: Allow reverse quote for other tx providers
		setBaseCurrencyAmount(txProvider === 'synthetix' ? quoteAmount : '');
		setQuoteCurrencyAmount('');

		if (quoteCurrencyKey != null && baseCurrencyKey != null) {
			routeToMarketPair(quoteCurrencyKey, baseCurrencyKey);
		}
	};

	const feeAmountInQuoteCurrency = useMemo(() => {
		if (exchangeFeeRate != null && quoteCurrencyAmount) {
			return wei(quoteCurrencyAmount).mul(exchangeFeeRate);
		}

		return null;
	}, [quoteCurrencyAmount, exchangeFeeRate]);

	const feeCost = useMemo(() => {
		return feeAmountInQuoteCurrency?.mul(quotePriceRate) ?? null;
	}, [feeAmountInQuoteCurrency, quotePriceRate]);

	useEffect(() => {
		if (!synthsMap) return;

		setCurrencyPair({
			base: (baseCurrencyKey && synthsMap[baseCurrencyKey]?.name) || null,
			quote: (quoteCurrencyKey && synthsMap[quoteCurrencyKey]?.name) || 'sUSD',
		});
		// eslint-disable-next-line
	}, [network?.id, walletAddress, setCurrencyPair, synthsMap]);

	useEffect(() => {
		if (
			oneInchQuoteQuery.isSuccess &&
			oneInchQuoteQuery.data &&
			txProvider !== 'synthetix' &&
			quoteCurrencyAmount !== ''
		) {
			setBaseCurrencyAmount(oneInchQuoteQuery.data);
		}

		if (txProvider === 'synthetix' && quoteCurrencyAmount !== '' && baseCurrencyKey != null) {
			const baseCurrencyAmountNoFee = wei(quoteCurrencyAmount).mul(rate);
			const fee = baseCurrencyAmountNoFee.mul(exchangeFeeRate ?? 0);
			setBaseCurrencyAmount(
				truncateNumbers(baseCurrencyAmountNoFee.sub(fee), DEFAULT_CRYPTO_DECIMALS)
			);
		}
		// eslint-disable-next-line
	}, [quoteCurrencyKey, exchangeFeeRate, oneInchQuoteQuery.isSuccess, oneInchQuoteQuery.data]);

	useEffect(() => {
		if (txProvider === 'synthetix' && baseCurrencyAmount !== '' && quoteCurrencyKey != null) {
			const quoteCurrencyAmountNoFee = wei(baseCurrencyAmount).mul(inverseRate);
			const fee = quoteCurrencyAmountNoFee.mul(exchangeFeeRate ?? 0);
			setQuoteCurrencyAmount(
				truncateNumbers(quoteCurrencyAmountNoFee.add(fee), DEFAULT_CRYPTO_DECIMALS)
			);
		}
		// eslint-disable-next-line
	}, [baseCurrencyKey, exchangeFeeRate]);

	const destinationCurrencyKey = useMemo(
		() => (baseCurrencyKey ? ethers.utils.formatBytes32String(baseCurrencyKey) : null),
		[baseCurrencyKey]
	);

	const sourceCurrencyKey = useMemo(
		() => (quoteCurrencyKey ? ethers.utils.formatBytes32String(quoteCurrencyKey) : null),
		[quoteCurrencyKey]
	);

	const isAtomic = useMemo(() => {
		if (isL2 || !baseCurrencyKey || !quoteCurrencyKey) {
			return false;
		}

		return [baseCurrencyKey, quoteCurrencyKey].every((currency) =>
			ATOMIC_EXCHANGES_L1.includes(currency)
		);
	}, [isL2, baseCurrencyKey, quoteCurrencyKey]);

	const exchangeParams = useMemo(() => {
		const sourceAmount = quoteCurrencyAmountBN.toBN();
		const minAmount = baseCurrencyAmountBN.mul(wei(1).sub(atomicExchangeSlippage)).toBN();

		if (!sourceCurrencyKey || !destinationCurrencyKey) {
			return null;
		}

		if (isAtomic) {
			return [
				sourceCurrencyKey,
				sourceAmount,
				destinationCurrencyKey,
				KWENTA_TRACKING_CODE,
				minAmount,
			];
		} else {
			return [
				sourceCurrencyKey,
				sourceAmount,
				destinationCurrencyKey,
				walletAddress,
				KWENTA_TRACKING_CODE,
			];
		}
	}, [
		quoteCurrencyAmountBN,
		walletAddress,
		baseCurrencyAmountBN,
		atomicExchangeSlippage,
		isAtomic,
		sourceCurrencyKey,
		destinationCurrencyKey,
	]);

	const exchangeTxn = useSynthetixTxn(
		'Synthetix',
		isAtomic ? 'exchangeAtomically' : 'exchangeWithTracking',
		exchangeParams!,
		undefined,
		{
			enabled: (needsApproval ? isApproved : true) && !!exchangeParams && !!walletAddress,
		}
	);

	const monitorExchangeTxn = useCallback(
		(hash: string | null) => {
			if (hash) {
				monitorTransaction({
					txHash: hash,
					onTxConfirmed: () => {
						setOrders((orders) =>
							produce(orders, (draftState) => {
								const orderIndex = orders.findIndex((order) => order.hash === hash);
								if (draftState[orderIndex]) {
									draftState[orderIndex].status = 'confirmed';
								}
							})
						);
						synthsWalletBalancesQuery.refetch();
						numEntriesQuery.refetch();
						setQuoteCurrencyAmount('');
						setBaseCurrencyAmount('');
					},
				});
			}
		},
		[
			monitorTransaction,
			numEntriesQuery,
			setBaseCurrencyAmount,
			setOrders,
			setQuoteCurrencyAmount,
			synthsWalletBalancesQuery,
		]
	);

	useEffect(() => {
		if (exchangeTxn.hash) {
			monitorExchangeTxn(exchangeTxn.hash);
		}

		// eslint-disable-next-line
	}, [exchangeTxn.hash]);

	const oneInchSlippage = useMemo(() => {
		// ETH swaps often fail with lower slippage
		if (
			txProvider === '1inch' &&
			((baseCurrencyKey as string) === 'ETH' || (quoteCurrencyKey as string) === 'ETH')
		) {
			return 3;
		}
		return slippage;
	}, [txProvider, baseCurrencyKey, quoteCurrencyKey, slippage]);

	const getGasEstimateForExchange = useCallback(async () => {
		if (!isL2) return null;
		if (txProvider === 'synthswap') {
			const gasEstimate = await swapSynthSwapGasEstimate(
				allTokensMap[quoteCurrencyKey!],
				allTokensMap[baseCurrencyKey!],
				quoteCurrencyAmount,
				quoteDecimals,
				slippage
			);

			const metaTx = await swapSynthSwap(
				allTokensMap[quoteCurrencyKey!],
				allTokensMap[baseCurrencyKey!],
				quoteCurrencyAmount,
				quoteDecimals,
				slippage,
				'meta_tx'
			);
			const l1Fee = await getL1SecurityFee({
				...metaTx,
				gasPrice: gasPrice?.gasPrice?.toNumber(),
				gasLimit: Number(gasEstimate),
			});

			return { limit: normalizeGasLimit(Number(gasEstimate)), l1Fee };
		} else if (txProvider === '1inch') {
			const estimate = await swap1InchGasEstimate(
				quoteCurrencyTokenAddress!,
				baseCurrencyTokenAddress!,
				quoteCurrencyAmount,
				quoteDecimals,
				oneInchSlippage
			);

			const metaTx = await swap1Inch(
				quoteCurrencyTokenAddress!,
				baseCurrencyTokenAddress!,
				quoteCurrencyAmount,
				quoteDecimals,
				oneInchSlippage,
				true
			);
			const l1Fee = await getL1SecurityFee({
				...metaTx,
				gasPrice: gasPrice?.gasPrice?.toNumber() ?? 0,
				gasLimit: Number(estimate),
			});

			return { limit: normalizeGasLimit(Number(estimate)), l1Fee: l1Fee };
		}
	}, [
		allTokensMap,
		baseCurrencyKey,
		baseCurrencyTokenAddress,
		isL2,
		quoteCurrencyAmount,
		quoteCurrencyKey,
		quoteCurrencyTokenAddress,
		slippage,
		txProvider,
		gasPrice?.gasPrice,
		oneInchSlippage,
		quoteDecimals,
		swap1Inch,
		swap1InchGasEstimate,
		swapSynthSwap,
		swapSynthSwapGasEstimate,
		getL1SecurityFee,
	]);

	// An attempt to show correct gas fees while making as few calls as possible. (as soon as the submission is "valid", compute it once)
	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (submissionDisabledReason == null) {
				try {
					const gasEstimate = await getGasEstimateForExchange();
					setGasInfo(gasEstimate);
				} catch (err) {
					logError(err);
				}
			} else {
				setGasInfo(null);
			}
		};
		getGasLimitEstimate();

		// eslint-disable-next-line
	}, [submissionDisabledReason, txProvider, quoteCurrencyAmount, gasPrice?.gasPrice]);

	const redeemableDeprecatedSynthsQuery = useRedeemableDeprecatedSynthsQuery(walletAddress);
	const redeemableDeprecatedSynths =
		redeemableDeprecatedSynthsQuery.isSuccess && redeemableDeprecatedSynthsQuery.data != null
			? redeemableDeprecatedSynthsQuery.data
			: null;
	const balances = redeemableDeprecatedSynths?.balances ?? [];
	const totalUSDBalance = wei(redeemableDeprecatedSynths?.totalUSDBalance ?? 0);

	const redeemTxn = useSynthetixTxn(
		'SynthRedeemer',
		'redeemAll',
		[redeemableDeprecatedSynths?.balances.map((b) => b.proxyAddress)],
		undefined,
		{ enabled: !!redeemableDeprecatedSynths && redeemableDeprecatedSynths?.totalUSDBalance.gt(0) }
	);

	useEffect(() => {
		if (redeemTxn.hash) {
			monitorTransaction({
				txHash: redeemTxn.hash,
				onTxConfirmed: () => {
					setOpenModal(undefined);
					redeemableDeprecatedSynthsQuery.refetch();
					synthsWalletBalancesQuery.refetch();
				},
			});
		}

		// eslint-disable-next-line
	}, [redeemTxn.hash]);

	const handleRedeem = async () => {
		setTxError(null);
		setOpenModal('redeem');

		try {
			await redeemTxn.mutateAsync();
		} catch (e) {
			logError(e);
			setTxError(
				e.data ? t('common.transaction.revert-reason', { reason: hexToAsciiV2(e.data) }) : e.message
			);
		}
	};

	const handleDismiss = () => {
		setOpenModal(undefined);
	};

	const checkAllowance = useCallback(async () => {
		if (
			isWalletConnected &&
			quoteCurrencyKey != null &&
			quoteCurrencyAmount &&
			allTokensMap[quoteCurrencyKey] != null &&
			approveAddress != null
		) {
			try {
				if (quoteCurrencyContract != null) {
					const allowance = (await quoteCurrencyContract.allowance(
						walletAddress,
						approveAddress
					)) as ethers.BigNumber;

					setIsApproved(wei(ethers.utils.formatEther(allowance)).gte(quoteCurrencyAmount));
				}
			} catch (e) {
				logError(e);
			}
		}
	}, [
		quoteCurrencyAmount,
		isWalletConnected,
		quoteCurrencyKey,
		walletAddress,
		quoteCurrencyContract,
		allTokensMap,
		approveAddress,
	]);

	useEffect(() => {
		if (needsApproval) {
			checkAllowance();
		}
	}, [checkAllowance, needsApproval]);

	const approveTxn = useContractTxn(
		quoteCurrencyContract,
		'approve',
		[approveAddress, ethers.constants.MaxUint256],
		undefined,
		{ enabled: !!approveAddress && !!quoteCurrencyKey && !!oneInchTokensMap && needsApproval }
	);

	useEffect(() => {
		if (approveTxn.hash) {
			monitorTransaction({
				txHash: approveTxn.hash,
				onTxConfirmed: () => {
					setIsApproving(false);
					setIsApproved(true);
				},
			});
		}

		// eslint-disable-next-line
	}, [approveTxn.hash]);

	const settleTxn = useSynthetixTxn(
		'Exchanger',
		'settle',
		[walletAddress, destinationCurrencyKey],
		undefined,
		{ enabled: !isL2 && numEntries >= 12 }
	);

	useEffect(() => {
		if (settleTxn.hash) {
			monitorTransaction({
				txHash: settleTxn.hash,
				onTxConfirmed: () => {
					numEntriesQuery.refetch();
				},
			});
		}

		// eslint-disable-next-line
	}, [settleTxn.hash]);

	const transactionFee = useMemo(() => {
		if (txProvider === 'synthswap' || txProvider === '1inch') {
			// TODO: We should refactor this to use Wei, instead of numbers.
			return getTransactionPrice(
				gasPrice,
				BigNumber.from(gasInfo?.limit || 0),
				ethPriceRate,
				gasInfo?.l1Fee || zeroBN
			);
		} else {
			return getTransactionPrice(
				gasPrice,
				exchangeTxn.gasLimit,
				ethPriceRate,
				exchangeTxn.optimismLayerOneFee
			);
		}
	}, [gasPrice, ethPriceRate, exchangeTxn, gasInfo?.limit, gasInfo?.l1Fee, txProvider]);

	const handleApprove = async () => {
		setTxError(null);
		setOpenModal('approve');

		try {
			await approveTxn.mutateAsync();

			setOpenModal(undefined);
		} catch (e) {
			logError(e);
			setIsApproving(false);
			setTxError(e.message);
		}
	};

	const handleSettle = async () => {
		setTxError(null);
		setOpenModal('settle');

		try {
			await settleTxn.mutateAsync();

			setOpenModal(undefined);
		} catch (e) {
			logError(e);
			setTxError(e.message);
		}
	};

	const handleSubmit = useCallback(async () => {
		setTxError(null);
		setOpenModal('confirm');

		try {
			setIsSubmitting(true);

			let tx: ethers.ContractTransaction | null = null;

			if (txProvider === '1inch' && oneInchTokensMap != null) {
				// @ts-ignore is correct tx type

				tx = await swap1Inch(
					quoteCurrencyTokenAddress!,
					baseCurrencyTokenAddress!,
					quoteCurrencyAmount,
					quoteDecimals,
					oneInchSlippage
				);
			} else if (txProvider === 'synthswap') {
				tx = await swapSynthSwap(
					allTokensMap[quoteCurrencyKey!],
					allTokensMap[baseCurrencyKey!],
					quoteCurrencyAmount,
					quoteDecimals,
					slippage
				);
			} else {
				await exchangeTxn.mutateAsync();
			}

			if (tx != null) {
				setOrders((orders) =>
					produce(orders, (draftState) => {
						draftState.push({
							timestamp: Date.now(),
							hash: tx!.hash,
							baseCurrencyKey: baseCurrencyKey!,
							baseCurrencyAmount,
							quoteCurrencyKey: quoteCurrencyKey!,
							quoteCurrencyAmount,
							orderType: 'market',
							status: 'pending',
							transaction: tx,
						});
					})
				);
				setHasOrdersNotification(true);
			}

			const hash = tx?.hash;

			if (hash) {
				monitorExchangeTxn(hash);
			}
			setOpenModal(undefined);
		} catch (e) {
			logError(e);
			setTxError(e.message);
		} finally {
			setIsSubmitting(false);
		}
	}, [
		baseCurrencyAmount,
		baseCurrencyKey,
		baseCurrencyTokenAddress,
		quoteCurrencyAmount,
		quoteCurrencyKey,
		quoteCurrencyTokenAddress,
		quoteDecimals,
		txProvider,
		slippage,
		oneInchTokensMap,
		allTokensMap,
		exchangeTxn,
		oneInchSlippage,
		monitorExchangeTxn,
		setHasOrdersNotification,
		setOrders,
		swap1Inch,
		swapSynthSwap,
		setTxError,
	]);

	useEffect(() => {
		if (routingEnabled) {
			const baseCurrencyFromQuery = router.query.base as CurrencyKey | null;
			const quoteCurrencyFromQuery = router.query.quote as CurrencyKey | null;

			const tokens = oneInchTokensMap || {};

			const validBaseCurrency =
				baseCurrencyFromQuery != null &&
				(synthsMap[baseCurrencyFromQuery] != null || tokens[baseCurrencyFromQuery]);
			const validQuoteCurrency =
				quoteCurrencyFromQuery != null &&
				(synthsMap[quoteCurrencyFromQuery] != null || tokens[quoteCurrencyFromQuery]);

			if (validBaseCurrency && validQuoteCurrency) {
				setCurrencyPair({
					base: baseCurrencyFromQuery,
					quote: quoteCurrencyFromQuery,
				});
			} else if (validBaseCurrency) {
				setCurrencyPair({
					base: baseCurrencyFromQuery,
					quote: null,
				});
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [routingEnabled, synthsMap]);

	const slippagePercent = useMemo(() => {
		if (txProvider === '1inch' && totalTradePrice.gt(0) && estimatedBaseTradePrice.gt(0)) {
			return totalTradePrice.sub(estimatedBaseTradePrice).div(totalTradePrice).neg();
		}
		return null;
	}, [estimatedBaseTradePrice, txProvider, totalTradePrice]);

	const onBaseCurrencyAmountChange = useCallback(
		async (value: string) => {
			if (value === '') {
				setBaseCurrencyAmount('');
				setQuoteCurrencyAmount('');
			} else {
				setBaseCurrencyAmount(value);
				if (txProvider === 'synthetix' && baseCurrencyKey != null) {
					const quoteCurrencyAmountNoFee = wei(value).mul(inverseRate);
					const fee = quoteCurrencyAmountNoFee.mul(exchangeFeeRate ?? 0);
					setQuoteCurrencyAmount(
						truncateNumbers(quoteCurrencyAmountNoFee.add(fee), DEFAULT_CRYPTO_DECIMALS)
					);
				}
			}
		},
		[
			setBaseCurrencyAmount,
			setQuoteCurrencyAmount,
			baseCurrencyKey,
			exchangeFeeRate,
			inverseRate,
			txProvider,
		]
	);

	const onBaseBalanceClick = useCallback(async () => {
		if (baseCurrencyBalance != null) {
			setBaseCurrencyAmount(truncateNumbers(baseCurrencyBalance, DEFAULT_CRYPTO_DECIMALS));

			if (txProvider === 'synthetix') {
				const baseCurrencyAmountNoFee = baseCurrencyBalance.mul(inverseRate);
				const fee = baseCurrencyAmountNoFee.mul(exchangeFeeRate ?? 0);
				setQuoteCurrencyAmount(
					truncateNumbers(baseCurrencyAmountNoFee.add(fee), DEFAULT_CRYPTO_DECIMALS)
				);
			}
		}
	}, [
		baseCurrencyBalance,
		exchangeFeeRate,
		inverseRate,
		setBaseCurrencyAmount,
		setQuoteCurrencyAmount,
		txProvider,
	]);

	const onQuoteCurrencyAmountChange = useCallback(
		async (value: string) => {
			if (value === '') {
				setQuoteCurrencyAmount('');
				setBaseCurrencyAmount('');
			} else {
				setQuoteCurrencyAmount(value);
				if (txProvider === 'synthetix' && baseCurrencyKey != null) {
					const baseCurrencyAmountNoFee = wei(value).mul(rate);
					const fee = baseCurrencyAmountNoFee.mul(exchangeFeeRate ?? 0);
					setBaseCurrencyAmount(
						truncateNumbers(baseCurrencyAmountNoFee.sub(fee), DEFAULT_CRYPTO_DECIMALS)
					);
				}
			}
		},
		[
			setQuoteCurrencyAmount,
			setBaseCurrencyAmount,
			txProvider,
			baseCurrencyKey,
			exchangeFeeRate,
			rate,
		]
	);

	const onQuoteBalanceClick = useCallback(async () => {
		if (quoteCurrencyBalance != null) {
			if ((quoteCurrencyKey as string) === 'ETH') {
				const ETH_TX_BUFFER = 0.006;
				const balanceWithBuffer = quoteCurrencyBalance.sub(wei(ETH_TX_BUFFER));
				setQuoteCurrencyAmount(
					balanceWithBuffer.lt(0)
						? '0'
						: truncateNumbers(balanceWithBuffer, DEFAULT_CRYPTO_DECIMALS)
				);
			} else {
				setQuoteCurrencyAmount(truncateNumbers(quoteCurrencyBalance, DEFAULT_CRYPTO_DECIMALS));
			}
			if (txProvider === 'synthetix') {
				const baseCurrencyAmountNoFee = quoteCurrencyBalance.mul(rate);
				const fee = baseCurrencyAmountNoFee.mul(exchangeFeeRate ?? 0);
				setBaseCurrencyAmount(
					truncateNumbers(baseCurrencyAmountNoFee.sub(fee), DEFAULT_CRYPTO_DECIMALS)
				);
			}
		}
	}, [
		quoteCurrencyBalance,
		quoteCurrencyKey,
		exchangeFeeRate,
		rate,
		setBaseCurrencyAmount,
		setQuoteCurrencyAmount,
		txProvider,
	]);

	const onRatioChange = useCallback(
		(ratio: SwapRatio) => {
			setRatio(ratio);
			if (!!quoteCurrencyBalance) {
				onQuoteCurrencyAmountChange(
					truncateNumbers(quoteCurrencyBalance.mul(ratio / 100) ?? 0, DEFAULT_CRYPTO_DECIMALS)
				);
			}
		},
		[quoteCurrencyBalance, onQuoteCurrencyAmountChange, setRatio]
	);

	return {
		baseCurrencyKey,
		handleCurrencySwap,
		inverseRate,
		quoteCurrencyKey,
		txProvider,
		openModal,
		setOpenModal,
		slippagePercent,
		baseCurrencyBalance,
		handleSubmit,
		handleSettle,
		handleApprove,
		handleRedeem,
		transactionFee,
		totalUSDBalance,
		feeCost,
		routeToBaseCurrency,
		routeToMarketPair,
		balances,
		handleDismiss,
		noSynths,
		basePriceRate,
		allTokensMap,
		exchangeFeeRate,
		oneInchQuoteQuery,
		numEntries,
		showNoSynthsCard,
		footerCardAttached,
		quoteCurrencyBalance,
		quotePriceRate,
		baseFeeRate,
		needsApproval,
		baseCurrency,
		isApproved,
		estimatedBaseTradePrice,
		settlementWaitingPeriodInSeconds,
		settlementDisabledReason,
		submissionDisabledReason,
		feeReclaimPeriodInSeconds,
		totalTradePrice,
		onBaseCurrencyAmountChange,
		onBaseBalanceClick,
		onQuoteCurrencyAmountChange,
		onQuoteBalanceClick,
		ratio,
		onRatioChange,
		setRatio,
	};
};

export default useExchange;
