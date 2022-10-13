import useSynthetixQueries from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import { BigNumber, ethers } from 'ethers';
import produce from 'immer';
import get from 'lodash/get';
import { useRouter } from 'next/router';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import {
	ATOMIC_EXCHANGES_L1,
	CRYPTO_CURRENCY_MAP,
	CurrencyKey,
	ETH_ADDRESS,
	ETH_COINGECKO_ADDRESS,
} from 'constants/currency';
import { DEFAULT_1INCH_SLIPPAGE, DEFAULT_CRYPTO_DECIMALS } from 'constants/defaults';
import { ATOMIC_EXCHANGE_SLIPPAGE } from 'constants/exchange';
import ROUTES from 'constants/routes';
import Connector from 'containers/Connector';
import Convert from 'containers/Convert';
import TransactionNotifier from 'containers/TransactionNotifier';
import useDebouncedMemo from 'hooks/useDebouncedMemo';
import { useGetL1SecurityFee } from 'hooks/useGetL1SecurityGasFee';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import use1InchQuoteQuery from 'queries/1inch/use1InchQuoteQuery';
import useCoinGeckoTokenPricesQuery from 'queries/coingecko/useCoinGeckoTokenPricesQuery';
import { KWENTA_TRACKING_CODE } from 'queries/futures/constants';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useBaseFeeRateQuery from 'queries/synths/useBaseFeeRateQuery';
import useExchangeFeeRateQuery from 'queries/synths/useExchangeFeeRateQuery';
import useNumEntriesQuery from 'queries/synths/useNumEntriesQuery';
import useRedeemableDeprecatedSynthsQuery from 'queries/synths/useRedeemableDeprecatedSynthsQuery';
import useSynthBalances from 'queries/synths/useSynthBalances';
import useOneInchTokenList from 'queries/tokenLists/useOneInchTokenList';
import useTokensBalancesQuery from 'queries/walletBalances/useTokensBalancesQuery';
import { TxProvider } from 'sections/shared/modals/TxConfirmationModal/TxConfirmationModal';
import {
	approveStatusState,
	baseCurrencyAmountBNState,
	baseCurrencyAmountState,
	baseCurrencyKeyState,
	currencyPairState,
	destinationCurrencyKeyState,
	quoteCurrencyAmountBNState,
	quoteCurrencyAmountState,
	quoteCurrencyKeyState,
	ratioState,
	sourceCurrencyKeyState,
	txErrorState,
} from 'store/exchange';
import { ratesState } from 'store/futures';
import { ordersState } from 'store/orders';
import { hasOrdersNotificationState, slippageState } from 'store/ui';
import { gasSpeedState } from 'store/wallet';
import {
	newGetCoinGeckoPricesForCurrencies,
	newGetExchangeRatesForCurrencies,
	newGetExchangeRatesTupleForCurrencies,
} from 'utils/currencies';
import { truncateNumbers, zeroBN } from 'utils/formatters/number';
import logError from 'utils/logError';
import { normalizeGasLimit, getTransactionPrice } from 'utils/network';

import useIsL2 from './useIsL2';

type ExchangeCardProps = {
	showNoSynthsCard?: boolean;
};

type ExchangeModal = 'settle' | 'confirm' | 'approve' | 'redeem' | 'base-select' | 'quote-select';
export type SwapRatio = 25 | 50 | 75 | 100;

const useExchange = ({ showNoSynthsCard = false }: ExchangeCardProps) => {
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
	} = useSynthetixQueries();

	useSynthBalances();
	const { isWalletConnected, network, walletAddress } = Connector.useContainer();
	const isL2 = useIsL2();

	const router = useRouter();

	const baseCurrencyKey = useRecoilValue(baseCurrencyKeyState);
	const quoteCurrencyKey = useRecoilValue(quoteCurrencyKeyState);

	const [openModal, setOpenModal] = useState<ExchangeModal>();
	const approveStatus = useRecoilValue(approveStatusState);
	const isApproved = useMemo(() => approveStatus === 'approved', [approveStatus]);
	const isApproving = useMemo(() => approveStatus === 'approving', [approveStatus]);
	const [gasInfo, setGasInfo] = useState<{ limit: number; l1Fee: Wei } | null>();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [baseCurrencyAmount, setBaseCurrencyAmount] = useRecoilState(baseCurrencyAmountState);
	const [quoteCurrencyAmount, setQuoteCurrencyAmount] = useRecoilState(quoteCurrencyAmountState);
	const [ratio, setRatio] = useRecoilState(ratioState);

	const setTxError = useSetRecoilState(txErrorState);
	const setOrders = useSetRecoilState(ordersState);
	const setHasOrdersNotification = useSetRecoilState(hasOrdersNotificationState);
	const quoteCurrencyAmountBN = useRecoilValue(quoteCurrencyAmountBNState);
	const baseCurrencyAmountBN = useRecoilValue(baseCurrencyAmountBNState);
	useExchangeRatesQuery({ refetchInterval: 15000 });
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
	const synthsWalletBalance = synthsWalletBalancesQuery.data ?? null;

	const oneInchQuery = useOneInchTokenList();

	const tokenList = oneInchQuery.data?.tokens || [];
	const oneInchTokensMap = oneInchQuery.data?.tokensMap || null;
	const allTokensMap = useMemo(() => ({ ...oneInchTokensMap, ...synthTokensMap }), [
		oneInchTokensMap,
		synthTokensMap,
	]);

	const txProvider: TxProvider | null = useMemo(() => {
		if (!baseCurrencyKey || !quoteCurrencyKey) return null;
		if (synthsMap[baseCurrencyKey] && synthsMap[quoteCurrencyKey]) return 'synthetix';
		if (oneInchTokensMap?.[baseCurrencyKey] && oneInchTokensMap?.[quoteCurrencyKey]) return '1inch';
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

	const selectedTokens = tokenList.filter(
		(t) => t.symbol === baseCurrencyKey || t.symbol === quoteCurrencyKey
	);

	const tokensWalletBalancesQuery = useTokensBalancesQuery(selectedTokens, walletAddress || '');
	const tokenBalances = tokensWalletBalancesQuery.data ?? null;

	const quoteCurrencyTokenAddress = useMemo(
		(): string | null =>
			quoteCurrencyKey != null
				? isQuoteCurrencyETH
					? ETH_ADDRESS
					: get(allTokensMap, [quoteCurrencyKey, 'address'], null)
				: null,
		[quoteCurrencyKey, isQuoteCurrencyETH, allTokensMap]
	);

	const baseCurrencyTokenAddress = useMemo(
		(): string | null =>
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

	const exchangeRates = useRecoilValue(ratesState);

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
		const baseCurrencyTokenAddresLower = (isBaseCurrencyETH
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
		isBaseCurrencyETH,
		baseCurrencyTokenAddress,
		txProvider,
		baseCurrency,
		coinGeckoPrices,
		selectPriceCurrencyRate,
		exchangeRates,
		baseCurrencyKey,
		selectedPriceCurrency.name,
	]);

	const ethPriceRate = useMemo(
		() => newGetExchangeRatesForCurrencies(exchangeRates, 'sETH', selectedPriceCurrency.name),
		[exchangeRates, selectedPriceCurrency.name]
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

	const selectedBothSides = !!baseCurrencyKey && !!quoteCurrencyKey;

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

	const noSynths = synthsWalletBalancesQuery.data?.balances.length === 0;

	const routeToMarketPair = useCallback(
		(baseCurrencyKey: string, quoteCurrencyKey: string) =>
			router.replace('/exchange', ROUTES.Exchange.MarketPair(baseCurrencyKey, quoteCurrencyKey), {
				shallow: true,
			}),
		[router]
	);

	const routeToBaseCurrency = useCallback(
		(baseCurrencyKey: string) =>
			router.replace(`/exchange`, ROUTES.Exchange.Into(baseCurrencyKey), {
				shallow: true,
			}),
		[router]
	);

	const handleCurrencySwap = useCallback(() => {
		setCurrencyPair({ base: quoteCurrencyKey, quote: baseCurrencyKey });

		// TODO: Allow reverse quote for other tx providers
		setBaseCurrencyAmount(txProvider === 'synthetix' ? quoteCurrencyAmount : '');
		setQuoteCurrencyAmount('');

		if (!!quoteCurrencyKey && !!baseCurrencyKey) {
			routeToMarketPair(quoteCurrencyKey, baseCurrencyKey);
		}
	}, [
		quoteCurrencyAmount,
		baseCurrencyKey,
		quoteCurrencyKey,
		routeToMarketPair,
		setCurrencyPair,
		setBaseCurrencyAmount,
		setQuoteCurrencyAmount,
		txProvider,
	]);

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

	// TODO: Move this into use1InchQuoteQuery.
	useEffect(() => {
		if (
			oneInchQuoteQuery.isSuccess &&
			oneInchQuoteQuery.data &&
			txProvider !== 'synthetix' &&
			quoteCurrencyAmount !== ''
		) {
			setBaseCurrencyAmount(oneInchQuoteQuery.data);
		}
		// eslint-disable-next-line
	}, [oneInchQuoteQuery.isSuccess, oneInchQuoteQuery.data]);

	const onBaseCurrencyChange = useCallback(
		(currencyKey: string) => {
			setQuoteCurrencyAmount('');

			setCurrencyPair((pair) => ({
				base: currencyKey as CurrencyKey,
				quote: pair.quote === currencyKey ? null : pair.quote,
			}));

			if (!!quoteCurrencyKey && quoteCurrencyKey !== currencyKey) {
				routeToMarketPair(currencyKey, quoteCurrencyKey);
			} else {
				routeToBaseCurrency(currencyKey);
			}

			if (txProvider === 'synthetix' && !!baseCurrencyAmount && !!quoteCurrencyKey) {
				const quoteCurrencyAmountNoFee = wei(baseCurrencyAmount).mul(inverseRate);
				const fee = quoteCurrencyAmountNoFee.mul(exchangeFeeRate ?? 0);
				setQuoteCurrencyAmount(
					truncateNumbers(quoteCurrencyAmountNoFee.add(fee), DEFAULT_CRYPTO_DECIMALS)
				);
			}
		},
		[
			baseCurrencyAmount,
			exchangeFeeRate,
			inverseRate,
			quoteCurrencyKey,
			routeToBaseCurrency,
			routeToMarketPair,
			setCurrencyPair,
			setQuoteCurrencyAmount,
			txProvider,
		]
	);

	const onQuoteCurrencyChange = useCallback(
		(currencyKey: string) => {
			setBaseCurrencyAmount('');

			setCurrencyPair((pair) => ({
				base: pair.base === currencyKey ? null : pair.base,
				quote: currencyKey as CurrencyKey,
			}));

			if (baseCurrencyKey && baseCurrencyKey !== currencyKey) {
				routeToMarketPair(baseCurrencyKey, currencyKey);
			}

			if (txProvider === 'synthetix' && !!quoteCurrencyAmount && !!baseCurrencyKey) {
				const baseCurrencyAmountNoFee = wei(quoteCurrencyAmount).mul(rate);
				const fee = baseCurrencyAmountNoFee.mul(exchangeFeeRate ?? 0);
				setBaseCurrencyAmount(
					truncateNumbers(baseCurrencyAmountNoFee.sub(fee), DEFAULT_CRYPTO_DECIMALS)
				);
			}
		},
		[
			baseCurrencyKey,
			exchangeFeeRate,
			quoteCurrencyAmount,
			rate,
			routeToMarketPair,
			setBaseCurrencyAmount,
			setCurrencyPair,
			txProvider,
		]
	);

	const destinationCurrencyKey = useRecoilValue(destinationCurrencyKeyState);
	const sourceCurrencyKey = useRecoilValue(sourceCurrencyKeyState);

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
		const minAmount = baseCurrencyAmountBN.mul(wei(1).sub(ATOMIC_EXCHANGE_SLIPPAGE)).toBN();

		if (!sourceCurrencyKey || !destinationCurrencyKey) return null;

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
				DEFAULT_1INCH_SLIPPAGE
			);

			const metaTx = await swap1Inch(
				quoteCurrencyTokenAddress!,
				baseCurrencyTokenAddress!,
				quoteCurrencyAmount,
				quoteDecimals,
				DEFAULT_1INCH_SLIPPAGE,
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
	const redeemableDeprecatedSynths = redeemableDeprecatedSynthsQuery.data ?? null;
	const balances = redeemableDeprecatedSynths?.balances ?? [];
	const totalUSDBalance = wei(redeemableDeprecatedSynths?.totalUSDBalance ?? 0);

	const handleDismiss = () => {
		setOpenModal(undefined);
	};

	const transactionFee = useMemo(() => {
		if (txProvider === 'synthswap' || txProvider === '1inch') {
			return getTransactionPrice(
				gasPrice,
				BigNumber.from(gasInfo?.limit || 0),
				ethPriceRate,
				gasInfo?.l1Fee ?? zeroBN
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
					DEFAULT_1INCH_SLIPPAGE
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

			if (tx?.hash) monitorExchangeTxn(tx.hash);

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
		monitorExchangeTxn,
		setHasOrdersNotification,
		setOrders,
		swap1Inch,
		swapSynthSwap,
		setTxError,
	]);

	useEffect(() => {
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [synthsMap]);

	const slippagePercent = useMemo(() => {
		if (txProvider === '1inch' && totalTradePrice.gt(0) && estimatedBaseTradePrice.gt(0)) {
			return totalTradePrice.sub(estimatedBaseTradePrice).div(totalTradePrice).neg();
		}
		return null;
	}, [estimatedBaseTradePrice, txProvider, totalTradePrice]);

	const onBaseCurrencyAmountChange = useCallback(
		async (value: string) => {
			setRatio(undefined);

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
			setRatio,
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
			setRatio(undefined);

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
			setRatio,
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
		quoteCurrencyBalance,
		quotePriceRate,
		baseFeeRate,
		needsApproval,
		baseCurrency,
		estimatedBaseTradePrice,
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
		quoteCurrencyContract,
		onBaseCurrencyChange,
		onQuoteCurrencyChange,
	};
};

export default useExchange;
