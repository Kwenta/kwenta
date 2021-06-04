import { useState, useEffect, useMemo, useCallback } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import get from 'lodash/get';
import produce from 'immer';
import castArray from 'lodash/castArray';
import { useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';

import ArrowsIcon from 'assets/svg/app/circle-arrows.svg';

import Convert from 'containers/Convert';

import ROUTES from 'constants/routes';
import { DEFAULT_TOKEN_DECIMALS } from 'constants/defaults';
import { CRYPTO_CURRENCY_MAP, CurrencyKey, SYNTHS_MAP } from 'constants/currency';

import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';
import useETHBalanceQuery from 'queries/walletBalances/useETHBalanceQuery';
import useEthGasPriceQuery from 'queries/network/useEthGasPriceQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useFeeReclaimPeriodQuery from 'queries/synths/useFeeReclaimPeriodQuery';
import useExchangeFeeRate from 'queries/synths/useExchangeFeeRate';
import use1InchQuoteQuery from 'queries/1inch/use1InchQuoteQuery';

import CurrencyCard from 'sections/exchange/TradeCard/CurrencyCard';
import PriceChartCard from 'sections/exchange/TradeCard/PriceChartCard';
import MarketDetailsCard from 'sections/exchange/TradeCard/MarketDetailsCard';
import TradeSummaryCard from 'sections/exchange/FooterCard/TradeSummaryCard';
import NoSynthsCard from 'sections/exchange/FooterCard/NoSynthsCard';
import GetL2GasCard from 'sections/exchange/FooterCard/GetL2GasCard';
import MarketClosureCard from 'sections/exchange/FooterCard/MarketClosureCard';
import TradeBalancerFooterCard from 'sections/exchange/FooterCard/TradeBalancerFooterCard';
import ConnectWalletCard from 'sections/exchange/FooterCard/ConnectWalletCard';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import { TxProvider } from 'sections/shared/modals/TxConfirmationModal/TxConfirmationModal';
import SelectCurrencyModal from 'sections/shared/modals/SelectCurrencyModal';
import BalancerTradeModal from 'sections/shared/modals/BalancerTradeModal';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useMarketClosed from 'hooks/useMarketClosed';

import { hasOrdersNotificationState } from 'store/ui';
import {
	customGasPriceState,
	gasSpeedState,
	isWalletConnectedState,
	walletAddressState,
	isL2State,
} from 'store/wallet';
import { ordersState } from 'store/orders';

import { getExchangeRatesForCurrencies } from 'utils/currencies';
import { toBigNumber, zeroBN } from 'utils/formatters/number';

import synthetix from 'lib/synthetix';

import { getTransactionPrice, normalizeGasLimit, gasPriceInWei } from 'utils/network';

import useCurrencyPair from './useCurrencyPair';
import TransactionNotifier from 'containers/TransactionNotifier';
import L2Gas from 'containers/L2Gas';
import useDebouncedMemo from 'hooks/useDebouncedMemo';
import useCMCQuotesQuery from 'queries/cmc/useCMCQuotesQuery';

type ExchangeCardProps = {
	defaultBaseCurrencyKey?: CurrencyKey | null;
	defaultQuoteCurrencyKey?: CurrencyKey | null;
	showPriceCard?: boolean;
	showMarketDetailsCard?: boolean;
	footerCardAttached?: boolean;
	routingEnabled?: boolean;
	persistSelectedCurrencies?: boolean;
	allowCurrencySelection?: boolean;
	showNoSynthsCard?: boolean;
	txProvider?: TxProvider;
};

const useExchange = ({
	defaultBaseCurrencyKey = null,
	defaultQuoteCurrencyKey = null,
	showPriceCard = false,
	showMarketDetailsCard = false,
	footerCardAttached = false,
	routingEnabled = false,
	persistSelectedCurrencies = false,
	allowCurrencySelection = true,
	showNoSynthsCard = true,
	txProvider = 'synthetix',
}: ExchangeCardProps) => {
	const { t } = useTranslation();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { hasNone: hasNoL2Gas } = L2Gas.useContainer();

	const { swap1Inch } = Convert.useContainer();
	const router = useRouter();

	const marketQuery = useMemo(
		() => (router.query.market ? castArray(router.query.market)[0] : null),
		[router.query]
	);

	const [currencyPair, setCurrencyPair] = useCurrencyPair({
		persistSelectedCurrencies,
		defaultBaseCurrencyKey,
		defaultQuoteCurrencyKey,
	});
	const [baseCurrencyAmount, setBaseCurrencyAmount] = useState<string>('');
	const [quoteCurrencyAmount, setQuoteCurrencyAmount] = useState<string>('');
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const isL2 = useRecoilValue(isL2State);
	const [txConfirmationModalOpen, setTxConfirmationModalOpen] = useState<boolean>(false);
	const [selectBaseCurrencyModal, setSelectBaseCurrencyModal] = useState<boolean>(false);
	const [selectQuoteCurrencyModalOpen, setSelectQuoteCurrencyModalOpen] = useState<boolean>(false);
	const [txError, setTxError] = useState<string | null>(null);
	const [selectBalancerTradeModal, setSelectBalancerTradeModal] = useState<boolean>(false);
	const setOrders = useSetRecoilState(ordersState);
	const setHasOrdersNotification = useSetRecoilState(hasOrdersNotificationState);
	const gasSpeed = useRecoilValue(gasSpeedState);
	const customGasPrice = useRecoilValue(customGasPriceState);
	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();
	const cmcQuotesQuery = useCMCQuotesQuery([SYNTHS_MAP.sUSD, CRYPTO_CURRENCY_MAP.ETH], {
		enabled: txProvider === '1inch',
	});

	const [gasLimit, setGasLimit] = useState<number | null>(null);

	const { base: baseCurrencyKey, quote: quoteCurrencyKey } = currencyPair;
	const ETHBalanceQuery = useETHBalanceQuery();
	const synthsWalletBalancesQuery = useSynthsBalancesQuery();
	const ethGasPriceQuery = useEthGasPriceQuery();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const feeReclaimPeriodQuery = useFeeReclaimPeriodQuery(quoteCurrencyKey);
	const exchangeFeeRateQuery = useExchangeFeeRate(quoteCurrencyKey, baseCurrencyKey);

	const quoteCurrencyAmountDebounced = useDebouncedMemo(
		() => quoteCurrencyAmount,
		[quoteCurrencyAmount],
		300
	);

	const oneInchQuoteQuery = use1InchQuoteQuery(
		quoteCurrencyKey,
		baseCurrencyKey,
		quoteCurrencyAmountDebounced,
		{
			enabled:
				txProvider === '1inch' &&
				quoteCurrencyKey != null &&
				quoteCurrencyAmount != null &&
				quoteCurrencyAmountDebounced !== '',
		}
	);

	const isBaseCurrencyETH = useMemo(() => baseCurrencyKey === CRYPTO_CURRENCY_MAP.ETH, [
		baseCurrencyKey,
	]);
	const isQuoteCurrencyETH = useMemo(() => quoteCurrencyKey === CRYPTO_CURRENCY_MAP.ETH, [
		quoteCurrencyKey,
	]);

	const exchangeFeeRate = useMemo(
		() => (exchangeFeeRateQuery.isSuccess ? exchangeFeeRateQuery.data ?? null : null),
		[exchangeFeeRateQuery.isSuccess, exchangeFeeRateQuery.data]
	);

	const feeReclaimPeriodInSeconds = useMemo(
		() => (feeReclaimPeriodQuery.isSuccess ? feeReclaimPeriodQuery.data ?? 0 : 0),
		[feeReclaimPeriodQuery.isSuccess, feeReclaimPeriodQuery.data]
	);

	const baseCurrency = useMemo(
		() =>
			baseCurrencyKey != null && synthetix.synthsMap != null
				? synthetix.synthsMap[baseCurrencyKey]
				: null,
		[baseCurrencyKey]
	);

	const exchangeRates = useMemo(
		() => (exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null),
		[exchangeRatesQuery.isSuccess, exchangeRatesQuery.data]
	);

	const cmcQuotes = useMemo(() => (cmcQuotesQuery.isSuccess ? cmcQuotesQuery.data ?? null : null), [
		cmcQuotesQuery.isSuccess,
		cmcQuotesQuery.data,
	]);

	const rate = useMemo(
		() => getExchangeRatesForCurrencies(exchangeRates, quoteCurrencyKey, baseCurrencyKey),
		[exchangeRates, quoteCurrencyKey, baseCurrencyKey]
	);
	const inverseRate = useMemo(() => (rate > 0 ? 1 / rate : 0), [rate]);

	const quoteCurrencyBalance = useMemo(() => {
		if (quoteCurrencyKey != null) {
			if (isQuoteCurrencyETH) {
				return ETHBalanceQuery.isSuccess ? ETHBalanceQuery.data ?? zeroBN : null;
			} else {
				return synthsWalletBalancesQuery.isSuccess
					? get(
							synthsWalletBalancesQuery.data,
							['balancesMap', quoteCurrencyKey, 'balance'],
							zeroBN
					  )
					: null;
			}
		}
		return null;
	}, [
		ETHBalanceQuery.data,
		ETHBalanceQuery.isSuccess,
		isQuoteCurrencyETH,
		quoteCurrencyKey,
		synthsWalletBalancesQuery.data,
		synthsWalletBalancesQuery.isSuccess,
	]);

	const baseCurrencyBalance = useMemo(() => {
		if (baseCurrencyKey != null) {
			if (isBaseCurrencyETH) {
				return ETHBalanceQuery.isSuccess ? ETHBalanceQuery.data ?? zeroBN : null;
			} else {
				return synthsWalletBalancesQuery.isSuccess
					? get(synthsWalletBalancesQuery.data, ['balancesMap', baseCurrencyKey, 'balance'], zeroBN)
					: null;
			}
		}
		return null;
	}, [
		ETHBalanceQuery.data,
		ETHBalanceQuery.isSuccess,
		isBaseCurrencyETH,
		baseCurrencyKey,
		synthsWalletBalancesQuery.data,
		synthsWalletBalancesQuery.isSuccess,
	]);

	const basePriceRate = useMemo(
		() =>
			txProvider === '1inch'
				? cmcQuotes != null && baseCurrencyKey != null && selectPriceCurrencyRate != null
					? cmcQuotes[baseCurrencyKey].price / selectPriceCurrencyRate
					: 0
				: getExchangeRatesForCurrencies(exchangeRates, baseCurrencyKey, selectedPriceCurrency.name),
		[
			exchangeRates,
			baseCurrencyKey,
			selectedPriceCurrency.name,
			txProvider,
			cmcQuotes,
			selectPriceCurrencyRate,
		]
	);

	const quotePriceRate = useMemo(
		() =>
			txProvider === '1inch'
				? cmcQuotes != null && quoteCurrencyKey != null && selectPriceCurrencyRate != null
					? cmcQuotes[quoteCurrencyKey].price / selectPriceCurrencyRate
					: 0
				: getExchangeRatesForCurrencies(
						exchangeRates,
						quoteCurrencyKey,
						selectedPriceCurrency.name
				  ),
		[
			exchangeRates,
			quoteCurrencyKey,
			selectedPriceCurrency.name,
			txProvider,
			cmcQuotes,
			selectPriceCurrencyRate,
		]
	);
	const ethPriceRate = useMemo(
		() => getExchangeRatesForCurrencies(exchangeRates, SYNTHS_MAP.sETH, selectedPriceCurrency.name),
		[exchangeRates, selectedPriceCurrency.name]
	);

	const baseCurrencyAmountBN = useMemo(() => toBigNumber(baseCurrencyAmount), [baseCurrencyAmount]);
	const quoteCurrencyAmountBN = useMemo(() => toBigNumber(quoteCurrencyAmount), [
		quoteCurrencyAmount,
	]);

	const totalTradePrice = useMemo(() => {
		let tradePrice = quoteCurrencyAmountBN.multipliedBy(quotePriceRate);
		if (selectPriceCurrencyRate) {
			tradePrice = tradePrice.dividedBy(selectPriceCurrencyRate);
		}

		return tradePrice;
	}, [quoteCurrencyAmountBN, quotePriceRate, selectPriceCurrencyRate]);

	const estimatedBaseTradePrice = useMemo(() => {
		let tradePrice = baseCurrencyAmountBN.multipliedBy(basePriceRate);
		if (selectPriceCurrencyRate) {
			tradePrice = tradePrice.dividedBy(selectPriceCurrencyRate);
		}

		return tradePrice;
	}, [baseCurrencyAmountBN, basePriceRate, selectPriceCurrencyRate]);

	const selectedBothSides = useMemo(() => baseCurrencyKey != null && quoteCurrencyKey != null, [
		baseCurrencyKey,
		quoteCurrencyKey,
	]);

	const baseCurrencyMarketClosed = useMarketClosed(baseCurrencyKey);
	const quoteCurrencyMarketClosed = useMarketClosed(quoteCurrencyKey);

	const submissionDisabledReason = useMemo(() => {
		const insufficientBalance =
			quoteCurrencyBalance != null ? quoteCurrencyAmountBN.gt(quoteCurrencyBalance) : false;

		if (feeReclaimPeriodInSeconds > 0) {
			return t('exchange.summary-info.button.fee-reclaim-period');
		}
		if (!selectedBothSides) {
			return t('exchange.summary-info.button.select-synth');
		}
		if (insufficientBalance) {
			return t('exchange.summary-info.button.insufficient-balance');
		}
		if (isSubmitting) {
			return t('exchange.summary-info.button.submitting-order');
		}
		if (
			!isWalletConnected ||
			baseCurrencyAmountBN.isNaN() ||
			quoteCurrencyAmountBN.isNaN() ||
			baseCurrencyAmountBN.lte(0) ||
			quoteCurrencyAmountBN.lte(0)
		) {
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
		t,
	]);

	const noSynths =
		synthsWalletBalancesQuery.isSuccess && synthsWalletBalancesQuery.data
			? synthsWalletBalancesQuery.data.balances.length === 0
			: false;

	const routeToMarketPair = (baseCurrencyKey: CurrencyKey, quoteCurrencyKey: CurrencyKey) =>
		routingEnabled
			? router.replace(
					`/exchange/[[...market]]`,
					ROUTES.Exchange.MarketPair(baseCurrencyKey, quoteCurrencyKey),
					{
						shallow: true,
					}
			  )
			: undefined;

	const routeToBaseCurrency = (baseCurrencyKey: CurrencyKey) =>
		routingEnabled
			? router.replace(`/exchange/[[...market]]`, ROUTES.Exchange.Into(baseCurrencyKey), {
					shallow: true,
			  })
			: false;

	const handleCurrencySwap = () => {
		const baseAmount = baseCurrencyAmount;
		const quoteAmount = quoteCurrencyAmount;

		setCurrencyPair({
			base: quoteCurrencyKey,
			quote: baseCurrencyKey,
		});

		setBaseCurrencyAmount(quoteAmount);
		setQuoteCurrencyAmount(baseAmount);

		if (quoteCurrencyKey != null && baseCurrencyKey != null) {
			routeToMarketPair(quoteCurrencyKey, baseCurrencyKey);
		}
	};

	function resetCurrencies() {
		setQuoteCurrencyAmount('');
		setBaseCurrencyAmount('');
	}

	const gasPrice = useMemo(
		() =>
			isL2
				? ethGasPriceQuery.data!?.fast
				: customGasPrice !== ''
				? Number(customGasPrice)
				: ethGasPriceQuery.data != null
				? ethGasPriceQuery.data[gasSpeed]
				: null,
		[customGasPrice, ethGasPriceQuery.data, gasSpeed, isL2]
	);

	const transactionFee = useMemo(() => getTransactionPrice(gasPrice, gasLimit, ethPriceRate), [
		gasPrice,
		gasLimit,
		ethPriceRate,
	]);

	const feeAmountInBaseCurrency = useMemo(() => {
		if (exchangeFeeRate != null && baseCurrencyAmount) {
			return toBigNumber(baseCurrencyAmount).multipliedBy(exchangeFeeRate);
		}
		return null;
	}, [baseCurrencyAmount, exchangeFeeRate]);

	const feeCost = useMemo(() => {
		if (feeAmountInBaseCurrency != null) {
			return feeAmountInBaseCurrency.multipliedBy(basePriceRate);
		}
		return null;
	}, [feeAmountInBaseCurrency, basePriceRate]);

	// An attempt to show correct gas fees while making as few calls as possible. (as soon as the submission is "valid", compute it once)
	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (gasLimit == null && submissionDisabledReason == null) {
				const gasLimitEstimate = await getGasLimitEstimateForExchange();
				setGasLimit(gasLimitEstimate);
			}
		};
		getGasLimitEstimate();
		// eslint-disable-next-line
	}, [submissionDisabledReason, gasLimit]);

	// reset estimated gas limit when currencies are changed.
	useEffect(() => {
		setGasLimit(null);
	}, [baseCurrencyKey, quoteCurrencyKey]);

	useEffect(() => {
		if (txProvider === '1inch') {
			if (oneInchQuoteQuery.isSuccess && oneInchQuoteQuery.data != null) {
				setBaseCurrencyAmount(oneInchQuoteQuery.data);
			}
		}
	}, [baseCurrencyAmount, txProvider, oneInchQuoteQuery.data, oneInchQuoteQuery.isSuccess]);

	const getExchangeParams = useCallback(() => {
		const quoteKeyBytes32 = ethers.utils.formatBytes32String(quoteCurrencyKey!);
		const baseKeyBytes32 = ethers.utils.formatBytes32String(baseCurrencyKey!);
		const amountToExchange = ethers.utils.parseUnits(
			quoteCurrencyAmountBN.decimalPlaces(DEFAULT_TOKEN_DECIMALS).toString(),
			DEFAULT_TOKEN_DECIMALS
		);
		const trackingCode = ethers.utils.formatBytes32String('KWENTA');

		return [quoteKeyBytes32, amountToExchange, baseKeyBytes32, walletAddress, trackingCode];
	}, [baseCurrencyKey, quoteCurrencyAmountBN, quoteCurrencyKey, walletAddress]);

	const getGasLimitEstimateForExchange = useCallback(async () => {
		try {
			if (synthetix.js != null) {
				const exchangeParams = getExchangeParams();
				const gasEstimate = await synthetix.js.contracts.Synthetix.estimateGas.exchangeWithTracking(
					...exchangeParams
				);
				return normalizeGasLimit(Number(gasEstimate));
			}
		} catch (e) {
			console.log(e);
		}
		return null;
	}, [getExchangeParams]);

	const handleSubmit = useCallback(async () => {
		if (synthetix.js != null && gasPrice != null) {
			setTxError(null);
			setTxConfirmationModalOpen(true);
			const exchangeParams = getExchangeParams();

			try {
				setIsSubmitting(true);

				let tx: ethers.ContractTransaction | null = null;

				const gasPriceWei = gasPriceInWei(gasPrice);

				if (txProvider === '1inch') {
					tx = await swap1Inch(quoteCurrencyKey!, baseCurrencyKey!, quoteCurrencyAmount);
				} else {
					const gasLimitEstimate = await getGasLimitEstimateForExchange();

					setGasLimit(gasLimitEstimate);

					const gas = {
						gasPrice: gasPriceWei,
						gasLimit: gasLimitEstimate,
					};
					tx = await synthetix.js.contracts.Synthetix.exchangeWithTracking(...exchangeParams, gas);
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

					monitorTransaction({
						txHash: tx.hash,
						onTxConfirmed: () => {
							setOrders((orders) =>
								produce(orders, (draftState) => {
									const orderIndex = orders.findIndex((order) => order.hash === tx!.hash);
									if (draftState[orderIndex]) {
										draftState[orderIndex].status = 'confirmed';
									}
								})
							);
							synthsWalletBalancesQuery.refetch();
						},
					});
				}
				setTxConfirmationModalOpen(false);
			} catch (e) {
				console.log(e);
				setTxError(e.message);
			} finally {
				setIsSubmitting(false);
			}
		}
	}, [
		baseCurrencyAmount,
		baseCurrencyKey,
		gasPrice,
		getExchangeParams,
		getGasLimitEstimateForExchange,
		quoteCurrencyAmount,
		quoteCurrencyKey,
		setHasOrdersNotification,
		setOrders,
		swap1Inch,
		synthsWalletBalancesQuery,
		txProvider,
		monitorTransaction,
	]);

	useEffect(() => {
		if (routingEnabled && marketQuery != null) {
			if (synthetix.synthsMap != null) {
				const [baseCurrencyFromQuery, quoteCurrencyFromQuery] = marketQuery.split('-') as [
					CurrencyKey,
					CurrencyKey
				];

				const validBaseCurrency =
					baseCurrencyFromQuery != null && synthetix.synthsMap[baseCurrencyFromQuery] != null;
				const validQuoteCurrency =
					quoteCurrencyFromQuery != null && synthetix.synthsMap[quoteCurrencyFromQuery] != null;

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
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [marketQuery, routingEnabled]);

	const quoteCurrencyCard = (
		<CurrencyCard
			side="quote"
			currencyKey={quoteCurrencyKey}
			amount={quoteCurrencyAmount}
			onAmountChange={async (value) => {
				if (value === '') {
					setQuoteCurrencyAmount('');
					setBaseCurrencyAmount('');
				} else {
					setQuoteCurrencyAmount(value);
					if (txProvider === 'synthetix') {
						setBaseCurrencyAmount(
							toBigNumber(value).multipliedBy(rate).decimalPlaces(DEFAULT_TOKEN_DECIMALS).toString()
						);
					}
				}
			}}
			walletBalance={quoteCurrencyBalance}
			onBalanceClick={async () => {
				if (quoteCurrencyBalance != null) {
					setQuoteCurrencyAmount(quoteCurrencyBalance.toString());
					if (txProvider === 'synthetix') {
						setBaseCurrencyAmount(
							quoteCurrencyBalance
								.multipliedBy(rate)
								.decimalPlaces(DEFAULT_TOKEN_DECIMALS)
								.toString()
						);
					}
				}
			}}
			onCurrencySelect={
				allowCurrencySelection ? () => setSelectQuoteCurrencyModalOpen(true) : undefined
			}
			priceRate={quotePriceRate}
			label={t('exchange.common.from')}
		/>
	);
	const quotePriceChartCard = showPriceCard ? (
		<PriceChartCard
			side="quote"
			currencyKey={quoteCurrencyKey}
			openAfterHoursModalCallback={() => setSelectBalancerTradeModal(true)}
			priceRate={quotePriceRate}
		/>
	) : null;

	const quoteMarketDetailsCard = showMarketDetailsCard ? (
		<MarketDetailsCard currencyKey={quoteCurrencyKey} priceRate={quotePriceRate} />
	) : null;

	const slippagePercent = useMemo(() => {
		if (txProvider === '1inch') {
			if (!totalTradePrice.isNaN() && !estimatedBaseTradePrice.isNaN()) {
				return totalTradePrice.minus(estimatedBaseTradePrice).dividedBy(totalTradePrice).negated();
			}
		}
		return null;
	}, [totalTradePrice, estimatedBaseTradePrice, txProvider]);

	const baseCurrencyCard = (
		<CurrencyCard
			side="base"
			currencyKey={baseCurrencyKey}
			amount={baseCurrencyAmount}
			onAmountChange={async (value) => {
				if (value === '') {
					setBaseCurrencyAmount('');
					setQuoteCurrencyAmount('');
				} else {
					setBaseCurrencyAmount(value);
					if (txProvider === 'synthetix') {
						setQuoteCurrencyAmount(
							toBigNumber(value)
								.multipliedBy(inverseRate)
								.decimalPlaces(DEFAULT_TOKEN_DECIMALS)
								.toString()
						);
					}
				}
			}}
			walletBalance={baseCurrencyBalance}
			onBalanceClick={async () => {
				if (baseCurrencyBalance != null) {
					setBaseCurrencyAmount(baseCurrencyBalance.toString());

					if (txProvider === 'synthetix') {
						setQuoteCurrencyAmount(
							toBigNumber(baseCurrencyBalance)
								.multipliedBy(inverseRate)
								.decimalPlaces(DEFAULT_TOKEN_DECIMALS)
								.toString()
						);
					}
				}
			}}
			onCurrencySelect={allowCurrencySelection ? () => setSelectBaseCurrencyModal(true) : undefined}
			priceRate={basePriceRate}
			label={t('exchange.common.into')}
			interactive={txProvider === 'synthetix'}
			slippagePercent={slippagePercent}
			isLoading={txProvider === '1inch' && oneInchQuoteQuery.isFetching}
		/>
	);

	const basePriceChartCard = showPriceCard ? (
		<PriceChartCard
			side="base"
			currencyKey={baseCurrencyKey}
			priceRate={basePriceRate}
			openAfterHoursModalCallback={() => setSelectBalancerTradeModal(true)}
		/>
	) : null;

	const baseMarketDetailsCard = showMarketDetailsCard ? (
		<MarketDetailsCard currencyKey={baseCurrencyKey} priceRate={basePriceRate} />
	) : null;

	const footerCard = (
		<>
			{!isWalletConnected ? (
				<ConnectWalletCard attached={footerCardAttached} />
			) : hasNoL2Gas ? (
				<GetL2GasCard attached={footerCardAttached} />
			) : (baseCurrencyMarketClosed.isMarketClosed && baseCurrencyKey === SYNTHS_MAP.sTSLA) ||
			  (quoteCurrencyMarketClosed.isMarketClosed && quoteCurrencyKey === SYNTHS_MAP.sTSLA) ? (
				<TradeBalancerFooterCard
					synth={SYNTHS_MAP.sTSLA}
					attached={footerCardAttached}
					onClick={() => setSelectBalancerTradeModal(true)}
				/>
			) : baseCurrencyMarketClosed.isMarketClosed || quoteCurrencyMarketClosed.isMarketClosed ? (
				<MarketClosureCard
					baseCurrencyMarketClosed={baseCurrencyMarketClosed}
					quoteCurrencyMarketClosed={quoteCurrencyMarketClosed}
					attached={footerCardAttached}
				/>
			) : showNoSynthsCard && noSynths ? (
				<NoSynthsCard attached={footerCardAttached} />
			) : (
				<TradeSummaryCard
					attached={footerCardAttached}
					submissionDisabledReason={submissionDisabledReason}
					onSubmit={handleSubmit}
					totalTradePrice={baseCurrencyAmount ? totalTradePrice.toString() : null}
					baseCurrencyAmount={baseCurrencyAmount}
					basePriceRate={basePriceRate}
					baseCurrency={baseCurrency}
					gasPrices={ethGasPriceQuery.data}
					feeReclaimPeriodInSeconds={feeReclaimPeriodInSeconds}
					quoteCurrencyKey={quoteCurrencyKey}
					feeRate={exchangeFeeRate}
					transactionFee={transactionFee}
					feeCost={feeCost}
					// show fee's only for "synthetix" (provider)
					showFee={txProvider === 'synthetix' ? true : false}
				/>
			)}
			{txConfirmationModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxConfirmationModalOpen(false)}
					txError={txError}
					attemptRetry={handleSubmit}
					baseCurrencyAmount={baseCurrencyAmount}
					quoteCurrencyAmount={quoteCurrencyAmount}
					feeAmountInBaseCurrency={txProvider === 'synthetix' ? feeAmountInBaseCurrency : null}
					baseCurrencyKey={baseCurrencyKey!}
					quoteCurrencyKey={quoteCurrencyKey!}
					totalTradePrice={totalTradePrice.toString()}
					txProvider={txProvider}
					quoteCurrencyLabel={t('exchange.common.from')}
					baseCurrencyLabel={t('exchange.common.into')}
					icon={<Svg src={ArrowsIcon} />}
				/>
			)}
			{selectBaseCurrencyModal && (
				<SelectCurrencyModal
					onDismiss={() => setSelectBaseCurrencyModal(false)}
					onSelect={(currencyKey) => {
						resetCurrencies();
						// @ts-ignore
						setCurrencyPair((pair) => ({
							base: currencyKey,
							quote: pair.quote === currencyKey ? null : pair.quote,
						}));

						if (currencyPair.quote != null) {
							if (currencyPair.quote !== currencyKey) {
								routeToMarketPair(currencyKey, currencyPair.quote);
							}
						} else {
							routeToBaseCurrency(currencyKey);
						}
					}}
				/>
			)}
			{selectQuoteCurrencyModalOpen && (
				<SelectCurrencyModal
					onDismiss={() => setSelectQuoteCurrencyModalOpen(false)}
					onSelect={(currencyKey) => {
						resetCurrencies();
						// @ts-ignore
						setCurrencyPair((pair) => ({
							base: pair.base === currencyKey ? null : pair.base,
							quote: currencyKey,
						}));
						if (currencyPair.base && currencyPair.base !== currencyKey) {
							routeToMarketPair(currencyPair.base, currencyKey);
						}
					}}
				/>
			)}
			{selectBalancerTradeModal && (
				<BalancerTradeModal onDismiss={() => setSelectBalancerTradeModal(false)} />
			)}
		</>
	);

	return {
		baseCurrencyKey,
		quoteCurrencyKey,
		inverseRate,
		quoteCurrencyCard,
		quotePriceChartCard,
		quoteMarketDetailsCard,
		baseCurrencyCard,
		basePriceChartCard,
		baseMarketDetailsCard,
		footerCard,
		handleCurrencySwap,
	};
};

export default useExchange;
