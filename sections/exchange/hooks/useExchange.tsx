import { useState, useEffect, useMemo, useCallback } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import get from 'lodash/get';
import produce from 'immer';
import castArray from 'lodash/castArray';
import { useTranslation } from 'react-i18next';

import ArrowsIcon from 'assets/svg/app/circle-arrows.svg';

import Convert from 'containers/Convert';

import ROUTES from 'constants/routes';
import {
	AFTER_HOURS_SYNTHS,
	CRYPTO_CURRENCY_MAP,
	CurrencyKey,
	ETH_ADDRESS,
	Synths,
} from 'constants/currency';

import use1InchQuoteQuery from 'queries/1inch/use1InchQuoteQuery';
import use1InchApproveSpenderQuery from 'queries/1inch/use1InchApproveAddressQuery';
import useCoinGeckoTokenPricesQuery from 'queries/coingecko/useCoinGeckoTokenPricesQuery';
import useTokensBalancesQuery from 'queries/walletBalances/useTokensBalancesQuery';
import useBaseFeeRateQuery from 'queries/synths/useBaseFeeRateQuery';
import useNumEntriesQuery from 'queries/synths/useNumEntriesQuery';

import CurrencyCard from 'sections/exchange/TradeCard/CurrencyCard';
import MarketDetailsCard from 'sections/exchange/TradeCard/Cards/MarketDetailsCard';
import CombinedMarketDetailsCard from 'sections/exchange/TradeCard/Cards/CombinedMarketDetailsCard';
import TradeSummaryCard from 'sections/exchange/FooterCard/TradeSummaryCard';
import NoSynthsCard from 'sections/exchange/FooterCard/NoSynthsCard';
import SettleTransactionsCard from '../FooterCard/SettleTransactionsCard';
import MarketClosureCard from 'sections/exchange/FooterCard/MarketClosureCard';
import TradeBalancerFooterCard from 'sections/exchange/FooterCard/TradeBalancerFooterCard';
import ConnectWalletCard from 'sections/exchange/FooterCard/ConnectWalletCard';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import { TxProvider } from 'sections/shared/modals/TxConfirmationModal/TxConfirmationModal';
import SelectCurrencyModal from 'sections/shared/modals/SelectCurrencyModal';
import SelectTokenModal from 'sections/shared/modals/SelectTokenModal';
import TxApproveModal from 'sections/shared/modals/TxApproveModal';
import TxSettleModal from 'sections/shared/modals/TxSettleModal';
import BalancerTradeModal from 'sections/shared/modals/BalancerTradeModal';

import useChartWideWidth from 'sections/exchange/hooks/useChartWideWidth';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useMarketClosed from 'hooks/useMarketClosed';
import useDebouncedMemo from 'hooks/useDebouncedMemo';

import { hasOrdersNotificationState, slippageState } from 'store/ui';
import { isWalletConnectedState, walletAddressState, isL2State, networkState } from 'store/wallet';
import { ordersState } from 'store/orders';

import { getExchangeRatesForCurrencies } from 'utils/currencies';
import { zeroBN } from 'utils/formatters/number';

import { getTransactionPrice, normalizeGasLimit, GasInfo } from 'utils/network';

import useCurrencyPair from './useCurrencyPair';
import TransactionNotifier from 'containers/TransactionNotifier';

import { NoTextTransform } from 'styles/common';
import useZapperTokenList from 'queries/tokenLists/useZapperTokenList';

import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import Connector from 'containers/Connector';
import { useGetL1SecurityFee } from 'hooks/useGetL1SecurityGasFee';
import useGas from 'hooks/useGas';
import { KWENTA_TRACKING_CODE } from 'queries/futures/constants';
import useExchangeFeeRateQuery from 'queries/synths/useExchangeFeeRateQuery';

type ExchangeCardProps = {
	defaultBaseCurrencyKey?: string | null;
	defaultQuoteCurrencyKey?: string | null;
	showPriceCard?: boolean;
	showMarketDetailsCard?: boolean;
	footerCardAttached?: boolean;
	routingEnabled?: boolean;
	persistSelectedCurrencies?: boolean;
	allowQuoteCurrencySelection?: boolean;
	allowBaseCurrencySelection?: boolean;
	showNoSynthsCard?: boolean;
	txProvider?: TxProvider;
};

const useExchange = ({
	defaultBaseCurrencyKey = null,
	defaultQuoteCurrencyKey = null,
	showMarketDetailsCard = false,
	footerCardAttached = false,
	routingEnabled = false,
	persistSelectedCurrencies = false,
	allowQuoteCurrencySelection = true,
	allowBaseCurrencySelection = true,
	showNoSynthsCard = true,
	txProvider = 'synthetix',
}: ExchangeCardProps) => {
	const { t } = useTranslation();
	const { monitorTransaction } = TransactionNotifier.useContainer();

	const { synthsMap, synthetixjs } = Connector.useContainer();
	const { createERC20Contract, swap1Inch } = Convert.useContainer();

	const {
		useETHBalanceQuery,
		useSynthsBalancesQuery,
		useExchangeRatesQuery,
		useFeeReclaimPeriodQuery,
	} = useSynthetixQueries();

	const router = useRouter();

	const marketQuery = useMemo(
		() => (router.query.market ? castArray(router.query.market)[0] : null),
		[router.query]
	);

	const [currencyPair, setCurrencyPair] = useCurrencyPair<string>({
		persistSelectedCurrencies,
		defaultBaseCurrencyKey,
		defaultQuoteCurrencyKey,
	});

	const [isApproving, setIsApproving] = useState<boolean>(false);
	const [isApproved, setIsApproved] = useState<boolean>(false);
	const [baseCurrencyAmount, setBaseCurrencyAmount] = useState<string>('');
	const [quoteCurrencyAmount, setQuoteCurrencyAmount] = useState<string>('');
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const isL2 = useRecoilValue(isL2State);
	const [txSettleModalOpen, setTxSettleModalOpen] = useState<boolean>(false);
	const [txConfirmationModalOpen, setTxConfirmationModalOpen] = useState<boolean>(false);
	const [txError, setTxError] = useState<string | null>(null);
	const [selectBaseCurrencyModalOpen, setSelectBaseCurrencyModalOpen] = useState<boolean>(false);
	const [selectQuoteCurrencyModalOpen, setSelectQuoteCurrencyModalOpen] = useState<boolean>(false);
	const [selectBalancerTradeModal, setSelectBalancerTradeModal] = useState<boolean>(false);
	const [selectQuoteTokenModalOpen, setSelectQuoteTokenModalOpen] = useState<boolean>(false);
	const [selectBaseTokenModalOpen, setSelectBaseTokenModalOpen] = useState<boolean>(false);
	const [txApproveModalOpen, setTxApproveModalOpen] = useState<boolean>(false);
	const [atomicExchangeSlippage] = useState<string>('0.01');
	const setOrders = useSetRecoilState(ordersState);
	const setHasOrdersNotification = useSetRecoilState(hasOrdersNotificationState);
	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();
	const network = useRecoilValue(networkState);
	const { gasPrice, gasPriceWei, gasPrices, gasConfig } = useGas();
	const slippage = useRecoilValue(slippageState);
	const getL1SecurityFee = useGetL1SecurityFee();

	const wideWidth = useChartWideWidth();

	const [gasInfo, setGasInfo] = useState<GasInfo | null>(null);

	const { base: baseCurrencyKey, quote: quoteCurrencyKey } = currencyPair;
	const ETHBalanceQuery = useETHBalanceQuery(walletAddress);
	const ETHBalance = ETHBalanceQuery.isSuccess ? ETHBalanceQuery.data ?? zeroBN : null;

	const synthsWalletBalancesQuery = useSynthsBalancesQuery(walletAddress);
	const synthsWalletBalance = synthsWalletBalancesQuery.isSuccess
		? synthsWalletBalancesQuery.data
		: null;

	const exchangeRatesQuery = useExchangeRatesQuery();

	// TODO: these queries break when `txProvider` is not `synthetix` and should not be called.
	// however, condition would break rule of hooks here
	const feeReclaimPeriodQuery = useFeeReclaimPeriodQuery(
		quoteCurrencyKey as CurrencyKey,
		walletAddress
	);

	const numEntriesQuery = useNumEntriesQuery(walletAddress || '', baseCurrencyKey as CurrencyKey);

	const settlementWaitingPeriodQuery = useFeeReclaimPeriodQuery(
		baseCurrencyKey as CurrencyKey,
		walletAddress
	);

	const exchangeFeeRateQuery = useExchangeFeeRateQuery(
		quoteCurrencyKey as CurrencyKey,
		baseCurrencyKey as CurrencyKey
	);

	const baseFeeRateQuery = useBaseFeeRateQuery(
		baseCurrencyKey as CurrencyKey,
		quoteCurrencyKey as CurrencyKey
	);

	const isBaseCurrencyETH = baseCurrencyKey === CRYPTO_CURRENCY_MAP.ETH;
	const isQuoteCurrencyETH = quoteCurrencyKey === CRYPTO_CURRENCY_MAP.ETH;

	const needsApproval = txProvider === '1inch' && !isQuoteCurrencyETH;

	const quoteCurrencyAmountDebounced = useDebouncedMemo(
		() => quoteCurrencyAmount,
		[quoteCurrencyAmount],
		300
	);

	const tokenListQuery = useZapperTokenList({
		enabled: txProvider === '1inch',
	});
	const tokenList = tokenListQuery.isSuccess ? tokenListQuery.data?.tokens ?? [] : [];

	const tokensWalletBalancesQuery = useTokensBalancesQuery(tokenList, walletAddress || '');
	const tokenBalances = tokensWalletBalancesQuery.isSuccess
		? tokensWalletBalancesQuery.data ?? null
		: null;

	const tokensMap = tokenListQuery.isSuccess ? tokenListQuery.data?.tokensMap ?? null : null;

	const quoteCurrencyTokenAddress = useMemo(
		() =>
			quoteCurrencyKey != null
				? isQuoteCurrencyETH
					? ETH_ADDRESS
					: get(tokensMap, [quoteCurrencyKey, 'address'], null)
				: null,
		[tokensMap, quoteCurrencyKey, isQuoteCurrencyETH]
	);

	const baseCurrencyTokenAddress = useMemo(
		() =>
			baseCurrencyKey != null
				? isBaseCurrencyETH
					? ETH_ADDRESS
					: get(tokensMap, [baseCurrencyKey, 'address'], null)
				: null,
		[tokensMap, baseCurrencyKey, isBaseCurrencyETH]
	);

	const coinGeckoTokenPricesQuery = useCoinGeckoTokenPricesQuery(
		quoteCurrencyTokenAddress != null && baseCurrencyTokenAddress != null
			? [quoteCurrencyTokenAddress, baseCurrencyTokenAddress]
			: [],
		{
			enabled: txProvider === '1inch',
		}
	);

	const coinGeckoPrices = coinGeckoTokenPricesQuery.isSuccess
		? coinGeckoTokenPricesQuery.data ?? null
		: null;

	const oneInchQuoteQuery = use1InchQuoteQuery(
		quoteCurrencyTokenAddress,
		baseCurrencyTokenAddress,
		quoteCurrencyAmountDebounced,
		get(tokensMap, [quoteCurrencyKey!, 'decimals'], undefined),
		{
			enabled:
				txProvider === '1inch' &&
				quoteCurrencyKey != null &&
				quoteCurrencyAmount != null &&
				quoteCurrencyAmountDebounced !== '' &&
				tokensMap != null,
		}
	);

	const oneInchApproveAddressQuery = use1InchApproveSpenderQuery({
		enabled: txProvider === '1inch',
	});

	const oneInchApproveAddress = oneInchApproveAddressQuery.isSuccess
		? oneInchApproveAddressQuery.data ?? null
		: null;

	const quoteCurrencyContract = useMemo(
		() =>
			needsApproval && tokensMap != null && quoteCurrencyKey != null
				? createERC20Contract(tokensMap[quoteCurrencyKey].address)
				: null,
		[tokensMap, quoteCurrencyKey, createERC20Contract, needsApproval]
	);

	const exchangeFeeRate = exchangeFeeRateQuery.isSuccess ? exchangeFeeRateQuery.data ?? null : null;
	const baseFeeRate = baseFeeRateQuery.isSuccess ? baseFeeRateQuery.data ?? null : null;

	const feeReclaimPeriodInSeconds = feeReclaimPeriodQuery.isSuccess
		? feeReclaimPeriodQuery.data ?? 0
		: 0;

	const settlementWaitingPeriodInSeconds = settlementWaitingPeriodQuery.isSuccess
		? settlementWaitingPeriodQuery.data ?? 0
		: 0;

	const numEntries = numEntriesQuery.isSuccess ? numEntriesQuery.data ?? null : null;

	const baseCurrency = baseCurrencyKey != null ? synthsMap[baseCurrencyKey as CurrencyKey]! : null;

	const exchangeRates = exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null;

	const rate = useMemo(
		() => getExchangeRatesForCurrencies(exchangeRates, quoteCurrencyKey, baseCurrencyKey),
		[exchangeRates, quoteCurrencyKey, baseCurrencyKey]
	);
	const inverseRate = useMemo(() => (rate > 0 ? 1 / rate : 0), [rate]);

	const quoteCurrencyBalance = useMemo(() => {
		if (quoteCurrencyKey != null) {
			if (isQuoteCurrencyETH) {
				return ETHBalance;
			} else if (txProvider === '1inch') {
				return tokenBalances?.[quoteCurrencyKey]?.balance ?? zeroBN;
			} else {
				return synthsWalletBalance != null
					? get(synthsWalletBalance, ['balancesMap', quoteCurrencyKey, 'balance'], zeroBN)
					: null;
			}
		}
		return null;
	}, [
		ETHBalance,
		isQuoteCurrencyETH,
		quoteCurrencyKey,
		synthsWalletBalance,
		txProvider,
		tokenBalances,
	]);

	const baseCurrencyBalance = useMemo(() => {
		if (baseCurrencyKey != null) {
			if (isBaseCurrencyETH) {
				return ETHBalance;
			} else {
				return synthsWalletBalance != null
					? get(synthsWalletBalance, ['balancesMap', baseCurrencyKey, 'balance'], zeroBN)
					: null;
			}
		}
		return null;
	}, [ETHBalance, isBaseCurrencyETH, baseCurrencyKey, synthsWalletBalance]);

	const quotePriceRate = useMemo(
		() =>
			txProvider === '1inch' && !isQuoteCurrencyETH
				? coinGeckoPrices != null &&
				  quoteCurrencyTokenAddress != null &&
				  selectPriceCurrencyRate != null &&
				  coinGeckoPrices[quoteCurrencyTokenAddress.toLowerCase()] != null
					? coinGeckoPrices[quoteCurrencyTokenAddress.toLowerCase()].usd /
					  selectPriceCurrencyRate.toNumber()
					: 0
				: getExchangeRatesForCurrencies(
						exchangeRates,
						quoteCurrencyKey as CurrencyKey,
						selectedPriceCurrency.name
				  ),
		[
			exchangeRates,
			quoteCurrencyKey,
			selectedPriceCurrency.name,
			txProvider,
			selectPriceCurrencyRate,
			coinGeckoPrices,
			quoteCurrencyTokenAddress,
			isQuoteCurrencyETH,
		]
	);
	const basePriceRate = useMemo(
		() =>
			txProvider === '1inch' && !isBaseCurrencyETH
				? coinGeckoPrices != null &&
				  baseCurrencyTokenAddress != null &&
				  selectPriceCurrencyRate != null &&
				  coinGeckoPrices[baseCurrencyTokenAddress.toLowerCase()] != null
					? coinGeckoPrices[baseCurrencyTokenAddress.toLowerCase()].usd /
					  selectPriceCurrencyRate.toNumber()
					: 0
				: getExchangeRatesForCurrencies(
						exchangeRates,
						baseCurrencyKey as CurrencyKey,
						selectedPriceCurrency.name
				  ),
		[
			exchangeRates,
			baseCurrencyKey,
			selectedPriceCurrency.name,
			txProvider,
			selectPriceCurrencyRate,
			baseCurrencyTokenAddress,
			coinGeckoPrices,
			isBaseCurrencyETH,
		]
	);

	const ethPriceRate = useMemo(
		() => getExchangeRatesForCurrencies(exchangeRates, Synths.sETH, selectedPriceCurrency.name),
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

	// TODO: again, this fails when provider is not `synthetix`
	const quoteCurrencyMarketClosed = useMarketClosed(quoteCurrencyKey as CurrencyKey);
	const baseCurrencyMarketClosed = useMarketClosed(baseCurrencyKey as CurrencyKey);

	const settlementDisabledReason =
		settlementWaitingPeriodInSeconds > 0
			? t('exchange.summary-info.button.settle-waiting-period')
			: null;

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
	]);

	const noSynths =
		synthsWalletBalancesQuery.isSuccess && synthsWalletBalancesQuery.data
			? synthsWalletBalancesQuery.data.balances.length === 0
			: false;

	const routeToMarketPair = (baseCurrencyKey: string, quoteCurrencyKey: string) =>
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

	const transactionFee = useMemo(
		() => getTransactionPrice(gasPrice, gasInfo?.limit, ethPriceRate, gasInfo?.l1Fee),
		[gasPrice, gasInfo?.limit, ethPriceRate, gasInfo?.l1Fee]
	);

	const feeAmountInQuoteCurrency = useMemo(() => {
		if (exchangeFeeRate != null && quoteCurrencyAmount) {
			return wei(quoteCurrencyAmount).mul(exchangeFeeRate);
		}

		return null;
	}, [quoteCurrencyAmount, exchangeFeeRate]);

	const feeCost = useMemo(() => {
		if (feeAmountInQuoteCurrency != null) {
			return feeAmountInQuoteCurrency.mul(quotePriceRate);
		}
		return null;
	}, [feeAmountInQuoteCurrency, quotePriceRate]);

	useEffect(() => {
		setCurrencyPair({
			base: null,
			quote: 'sUSD',
		});
	}, [network.id, setCurrencyPair]);

	// An attempt to show correct gas fees while making as few calls as possible. (as soon as the submission is "valid", compute it once)
	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (gasInfo == null && submissionDisabledReason == null) {
				const gasEstimate = await getGasEstimateForExchange(gasPriceWei);
				setGasInfo(gasEstimate);
			}
		};
		if (txProvider === 'synthetix') {
			getGasLimitEstimate();
		}
		// eslint-disable-next-line
	}, [submissionDisabledReason, gasInfo, txProvider]);

	// reset estimated gas limit when currencies are changed.
	useEffect(() => {
		setGasInfo(null);
	}, [baseCurrencyKey, quoteCurrencyKey]);

	useEffect(() => {
		if (txProvider === '1inch' && quoteCurrencyAmount !== '') {
			if (oneInchQuoteQuery.isSuccess && oneInchQuoteQuery.data != null) {
				setBaseCurrencyAmount(oneInchQuoteQuery.data);
			}
		}
		if (txProvider === 'synthetix' && quoteCurrencyAmount !== '' && baseCurrencyKey != null) {
			const baseCurrencyAmountNoFee = wei(quoteCurrencyAmount).mul(rate);
			const fee = baseCurrencyAmountNoFee.mul(exchangeFeeRate ?? 1);
			setBaseCurrencyAmount(baseCurrencyAmountNoFee.sub(fee).toString());
		}
	}, [
		rate,
		baseCurrencyKey,
		quoteCurrencyAmount,
		baseCurrencyAmount,
		exchangeFeeRate,
		txProvider,
		oneInchQuoteQuery.data,
		oneInchQuoteQuery.isSuccess,
	]);

	const getExchangeParams = useCallback(
		(isAtomic: boolean) => {
			const destinationCurrencyKey = ethers.utils.formatBytes32String(quoteCurrencyKey!);
			const sourceCurrencyKey = ethers.utils.formatBytes32String(baseCurrencyKey!);
			const sourceAmount = quoteCurrencyAmountBN.toBN();
			const minAmount = baseCurrencyAmountBN.mul(wei(1).sub(atomicExchangeSlippage)).toBN();

			if (isAtomic) {
				return [
					destinationCurrencyKey,
					sourceAmount,
					sourceCurrencyKey,
					KWENTA_TRACKING_CODE,
					minAmount,
				];
			} else {
				return [
					destinationCurrencyKey,
					sourceAmount,
					sourceCurrencyKey,
					walletAddress,
					KWENTA_TRACKING_CODE,
				];
			}
		},
		[
			baseCurrencyKey,
			quoteCurrencyAmountBN,
			quoteCurrencyKey,
			walletAddress,
			baseCurrencyAmountBN,
			atomicExchangeSlippage,
		]
	);

	const getGasEstimateForExchange = useCallback(
		async (gasPriceInWei: number | null) => {
			try {
				if (isL2 && !gasPrice) return null;
				if (synthetixjs != null) {
					const destinationCurrencyKey = ethers.utils.parseBytes32String(
						getExchangeParams(true)[0] as string
					);
					const isAtomic =
						!isL2 &&
						(destinationCurrencyKey === 'sBTC' ||
							destinationCurrencyKey === 'sETH' ||
							destinationCurrencyKey === 'sEUR' ||
							destinationCurrencyKey === 'sUSD');
					const exchangeParams = getExchangeParams(isAtomic);

					let gasEstimate, gasLimitNum, metaTx;

					if (isAtomic) {
						gasEstimate = await synthetixjs.contracts.Synthetix.estimateGas.exchangeAtomically(
							...exchangeParams
						);
					} else {
						gasEstimate = await synthetixjs.contracts.Synthetix.estimateGas.exchangeWithTracking(
							...exchangeParams
						);
					}

					gasLimitNum = Number(gasEstimate);

					if (isAtomic) {
						metaTx = await synthetixjs.contracts.Synthetix.populateTransaction.exchangeAtomically(
							...exchangeParams
						);
					} else {
						metaTx = await synthetixjs.contracts.Synthetix.populateTransaction.exchangeWithTracking(
							...exchangeParams
						);
					}

					const l1Fee = await getL1SecurityFee({
						...metaTx,
						gasPrice: gasPriceInWei!,
						gasLimit: gasLimitNum,
					});
					const limit = isL2 ? gasLimitNum : normalizeGasLimit(gasLimitNum);
					return { limit, l1Fee };
				}
			} catch (e) {
				console.log(e);
			}
			return null;
		},
		[getExchangeParams, isL2, synthetixjs, gasPrice, getL1SecurityFee]
	);

	const checkAllowance = useCallback(async () => {
		if (
			isWalletConnected &&
			quoteCurrencyKey != null &&
			quoteCurrencyAmount &&
			tokensMap != null &&
			tokensMap![quoteCurrencyKey!] != null &&
			oneInchApproveAddress != null
		) {
			try {
				if (quoteCurrencyContract != null) {
					const allowance = (await quoteCurrencyContract.allowance(
						walletAddress,
						oneInchApproveAddress
					)) as ethers.BigNumber;

					setIsApproved(wei(ethers.utils.formatEther(allowance)).gte(quoteCurrencyAmount));
				}
			} catch (e) {
				console.log(e);
			}
		}
	}, [
		quoteCurrencyAmount,
		isWalletConnected,
		quoteCurrencyKey,
		walletAddress,
		quoteCurrencyContract,
		tokensMap,
		oneInchApproveAddress,
	]);

	useEffect(() => {
		if (needsApproval) {
			checkAllowance();
		}
	}, [checkAllowance, needsApproval]);

	const handleApprove = async () => {
		if (quoteCurrencyKey != null && gasPrice != null && tokensMap != null) {
			setTxError(null);
			setTxApproveModalOpen(true);

			try {
				const contract = createERC20Contract(tokensMap[quoteCurrencyKey].address);
				if (contract != null) {
					const gasEstimate = await contract.estimateGas.approve(
						oneInchApproveAddress,
						ethers.constants.MaxUint256
					);

					const tx = await contract.approve(oneInchApproveAddress, ethers.constants.MaxUint256, {
						gasLimit: isL2 ? Number(gasEstimate) : normalizeGasLimit(Number(gasEstimate)),
						...gasConfig,
					});

					if (tx != null) {
						monitorTransaction({
							txHash: tx.hash,
							onTxConfirmed: () => {
								setIsApproving(false);
								setIsApproved(true);
							},
						});
					}
				}

				setTxApproveModalOpen(false);
			} catch (e) {
				console.log(e);
				setIsApproving(false);
				setTxError(e.message);
			}
		}
	};

	const handleSettle = async () => {
		if (synthetixjs != null && gasPrice != null) {
			setTxError(null);
			setTxSettleModalOpen(true);

			try {
				const gasEstimate = await synthetixjs.contracts.Exchanger.estimateGas.settle(
					walletAddress,
					ethers.utils.formatBytes32String(baseCurrencyKey as string)
				);

				const gas = {
					gasPrice: gasPriceWei,
					gasLimit: normalizeGasLimit(Number(gasEstimate)),
				};

				// send transaction
				const tx = await synthetixjs.contracts.Exchanger.settle(
					walletAddress,
					ethers.utils.formatBytes32String(baseCurrencyKey as string),
					gas
				);

				if (tx != null) {
					monitorTransaction({
						txHash: tx.hash,
						onTxConfirmed: () => {
							numEntriesQuery.refetch();
						},
					});
				}

				setTxSettleModalOpen(false);
			} catch (e) {
				console.log(e);
				setTxError(e.message);
			}
		}
	};

	const handleSubmit = useCallback(async () => {
		if (synthetixjs != null && gasPrice != null) {
			setTxError(null);
			setTxConfirmationModalOpen(true);

			const destinationCurrencyKey = ethers.utils.parseBytes32String(
				getExchangeParams(true)[0] as string
			);

			const isAtomic =
				!isL2 &&
				(destinationCurrencyKey === 'sBTC' ||
					destinationCurrencyKey === 'sETH' ||
					destinationCurrencyKey === 'sEUR' ||
					destinationCurrencyKey === 'sUSD');

			const exchangeParams = getExchangeParams(isAtomic);

			try {
				setIsSubmitting(true);

				let tx: ethers.ContractTransaction | null = null;

				if (txProvider === '1inch' && tokensMap != null) {
					tx = await swap1Inch(
						quoteCurrencyTokenAddress!,
						baseCurrencyTokenAddress!,
						quoteCurrencyAmount,
						slippage,
						tokensMap[quoteCurrencyKey!].decimals
					);
				} else {
					const gasInfo = await getGasEstimateForExchange(gasPriceWei);

					setGasInfo(gasInfo);

					const gas = {
						gasLimit: gasInfo?.limit,
						...gasConfig,
					};

					if (isAtomic) {
						tx = await synthetixjs.contracts.Synthetix.exchangeAtomically(...exchangeParams, gas);
					} else {
						tx = await synthetixjs.contracts.Synthetix.exchangeWithTracking(...exchangeParams, gas);
					}
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
							numEntriesQuery.refetch();
							setQuoteCurrencyAmount('');
							setBaseCurrencyAmount('');
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
		baseCurrencyTokenAddress,
		gasPrice,
		getExchangeParams,
		getGasEstimateForExchange,
		quoteCurrencyAmount,
		quoteCurrencyKey,
		quoteCurrencyTokenAddress,
		setHasOrdersNotification,
		setOrders,
		swap1Inch,
		synthsWalletBalancesQuery,
		numEntriesQuery,
		txProvider,
		monitorTransaction,
		slippage,
		tokensMap,
		synthetixjs,
		gasPriceWei,
		gasConfig,
		isL2,
	]);

	useEffect(() => {
		if (routingEnabled && marketQuery != null) {
			const [baseCurrencyFromQuery, quoteCurrencyFromQuery] = marketQuery.split('-') as [
				CurrencyKey,
				CurrencyKey
			];

			const validBaseCurrency =
				baseCurrencyFromQuery != null && synthsMap[baseCurrencyFromQuery] != null;
			const validQuoteCurrency =
				quoteCurrencyFromQuery != null && synthsMap[quoteCurrencyFromQuery] != null;

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
	}, [marketQuery, routingEnabled]);

	const quoteCurrencyCard = (
		<>
			<CurrencyCard
				side="quote"
				currencyKey={quoteCurrencyKey}
				amount={quoteCurrencyAmount}
				onAmountChange={async (value) => {
					if (value === '') {
						setQuoteCurrencyAmount('');
					} else {
						setQuoteCurrencyAmount(value);
						if (txProvider === 'synthetix' && baseCurrencyKey != null) {
							const baseCurrencyAmountNoFee = wei(value).mul(rate);
							const fee = baseCurrencyAmountNoFee.mul(exchangeFeeRate ?? 1);
							setBaseCurrencyAmount(baseCurrencyAmountNoFee.sub(fee).toString());
						}
					}
				}}
				walletBalance={quoteCurrencyBalance}
				onBalanceClick={async () => {
					if (quoteCurrencyBalance != null) {
						if (quoteCurrencyKey === 'ETH') {
							const ETH_TX_BUFFER = 0.1;
							const balanceWithBuffer = quoteCurrencyBalance.sub(wei(ETH_TX_BUFFER));
							setQuoteCurrencyAmount(balanceWithBuffer.lt(0) ? '0' : balanceWithBuffer.toString());
						} else {
							setQuoteCurrencyAmount(quoteCurrencyBalance.toString());
						}
						if (txProvider === 'synthetix') {
							const baseCurrencyAmountNoFee = quoteCurrencyBalance.mul(rate);
							const fee = baseCurrencyAmountNoFee.mul(exchangeFeeRate ?? 1);
							setBaseCurrencyAmount(baseCurrencyAmountNoFee.sub(fee).toString());
						}
					}
				}}
				onCurrencySelect={
					allowQuoteCurrencySelection
						? () =>
								txProvider === '1inch'
									? setSelectQuoteTokenModalOpen(true)
									: setSelectQuoteCurrencyModalOpen(true)
						: undefined
				}
				priceRate={quotePriceRate}
				label={t('exchange.common.from')}
				txProvider={txProvider}
			/>
			{selectQuoteCurrencyModalOpen && (
				<SelectCurrencyModal
					onDismiss={() => setSelectQuoteCurrencyModalOpen(false)}
					onSelect={(currencyKey) => {
						setBaseCurrencyAmount('');
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
			{selectQuoteTokenModalOpen && (
				<SelectTokenModal
					onDismiss={() => setSelectQuoteTokenModalOpen(false)}
					onSelect={(currencyKey) => {
						setBaseCurrencyAmount('');
						// @ts-ignore
						setCurrencyPair((pair) => ({
							base: pair.base === currencyKey ? null : pair.base,
							quote: currencyKey,
						}));
						if (currencyPair.base && currencyPair.base !== currencyKey) {
							routeToMarketPair(currencyPair.base, currencyKey);
						}
					}}
					tokensToOmit={Object.keys(Synths)}
				/>
			)}
		</>
	);

	const quoteMarketDetailsCard =
		txProvider === 'synthetix' && showMarketDetailsCard ? (
			<MarketDetailsCard currencyKey={quoteCurrencyKey as CurrencyKey} />
		) : null;

	const slippagePercent = useMemo(() => {
		if (txProvider === '1inch' && totalTradePrice.gt(0)) {
			return totalTradePrice.sub(estimatedBaseTradePrice).div(totalTradePrice).neg();
		}
		return null;
		// eslint-disable-next-line
	}, [estimatedBaseTradePrice, txProvider]);

	const baseCurrencyCard = (
		<>
			<CurrencyCard
				side="base"
				currencyKey={baseCurrencyKey}
				amount={baseCurrencyAmount}
				onAmountChange={async (value) => {
					if (value === '') {
						setBaseCurrencyAmount('');
					} else {
						setBaseCurrencyAmount(value);
						if (txProvider === 'synthetix' && baseCurrencyKey != null) {
							const quoteCurrencyAmountNoFee = wei(value).mul(inverseRate);
							const fee = quoteCurrencyAmountNoFee.mul(exchangeFeeRate ?? 1);
							setQuoteCurrencyAmount(quoteCurrencyAmountNoFee.add(fee).toString());
						}
					}
				}}
				walletBalance={baseCurrencyBalance}
				onBalanceClick={async () => {
					if (baseCurrencyBalance != null) {
						setBaseCurrencyAmount(baseCurrencyBalance.toString());

						if (txProvider === 'synthetix') {
							const baseCurrencyAmountNoFee = baseCurrencyBalance.mul(inverseRate);
							const fee = baseCurrencyAmountNoFee.mul(exchangeFeeRate ?? 1);
							setQuoteCurrencyAmount(baseCurrencyAmountNoFee.add(fee).toString());
						}
					}
				}}
				onCurrencySelect={
					allowBaseCurrencySelection
						? () =>
								txProvider === '1inch'
									? setSelectBaseTokenModalOpen(true)
									: setSelectBaseCurrencyModalOpen(true)
						: undefined
				}
				priceRate={basePriceRate}
				label={t('exchange.common.into')}
				slippagePercent={slippagePercent}
				isLoading={txProvider === '1inch' && oneInchQuoteQuery.isFetching}
				txProvider={txProvider}
			/>
			{selectBaseCurrencyModalOpen && (
				<SelectCurrencyModal
					onDismiss={() => setSelectBaseCurrencyModalOpen(false)}
					onSelect={(currencyKey) => {
						setBaseCurrencyAmount('');
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
			{selectBaseTokenModalOpen && (
				<SelectCurrencyModal
					onDismiss={() => setSelectBaseTokenModalOpen(false)}
					onSelect={(currencyKey) => {
						setBaseCurrencyAmount('');
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
					synthsOverride={[Synths.sETH, Synths.sUSD]}
				/>
			)}
		</>
	);

	const baseMarketDetailsCard =
		txProvider === 'synthetix' && showMarketDetailsCard ? (
			<MarketDetailsCard currencyKey={baseCurrencyKey as CurrencyKey} />
		) : null;

	const combinedMarketDetailsCard = showMarketDetailsCard ? (
		<CombinedMarketDetailsCard
			{...{
				baseCurrencyKey: baseCurrencyKey as CurrencyKey,
				basePriceRate,
				quoteCurrencyKey: quoteCurrencyKey as CurrencyKey,
				quotePriceRate,
			}}
		/>
	) : null;

	const footerCard = (
		<>
			{!isWalletConnected ? (
				<ConnectWalletCard attached={footerCardAttached} />
			) : (baseCurrencyMarketClosed.isMarketClosed &&
					baseCurrencyKey &&
					AFTER_HOURS_SYNTHS.has(baseCurrencyKey as CurrencyKey)) ||
			  (quoteCurrencyMarketClosed.isMarketClosed &&
					quoteCurrencyKey &&
					AFTER_HOURS_SYNTHS.has(quoteCurrencyKey as CurrencyKey)) ? (
				<TradeBalancerFooterCard
					attached={footerCardAttached}
					onClick={() => setSelectBalancerTradeModal(true)}
				/>
			) : baseCurrencyMarketClosed.isMarketClosed || quoteCurrencyMarketClosed.isMarketClosed ? (
				<MarketClosureCard
					baseCurrencyMarketClosed={baseCurrencyMarketClosed}
					quoteCurrencyMarketClosed={quoteCurrencyMarketClosed}
					attached={footerCardAttached}
					quoteCurrencyKey={quoteCurrencyKey as CurrencyKey}
					baseCurrencyKey={baseCurrencyKey as CurrencyKey}
				/>
			) : showNoSynthsCard && noSynths ? (
				<NoSynthsCard attached={footerCardAttached} />
			) : !isL2 && numEntries >= 12 ? (
				<SettleTransactionsCard
					attached={footerCardAttached}
					submissionDisabledReason={settlementDisabledReason}
					settlementWaitingPeriodInSeconds={settlementWaitingPeriodInSeconds}
					onSubmit={handleSettle}
					settleCurrency={baseCurrencyKey as CurrencyKey}
					numEntries={numEntries}
				/>
			) : (
				<TradeSummaryCard
					attached={footerCardAttached}
					submissionDisabledReason={submissionDisabledReason}
					onSubmit={needsApproval ? (isApproved ? handleSubmit : handleApprove) : handleSubmit}
					totalTradePrice={baseCurrencyAmount ? totalTradePrice.toString() : null}
					baseCurrencyAmount={baseCurrencyAmount}
					basePriceRate={basePriceRate}
					baseCurrency={baseCurrency}
					gasPrices={gasPrices}
					feeReclaimPeriodInSeconds={feeReclaimPeriodInSeconds}
					quoteCurrencyKey={quoteCurrencyKey as CurrencyKey}
					totalFeeRate={exchangeFeeRate != null ? exchangeFeeRate : null}
					baseFeeRate={baseFeeRate != null ? baseFeeRate : null}
					transactionFee={transactionFee}
					feeCost={feeCost}
					// show fee's only for "synthetix" (provider)
					showFee={txProvider === 'synthetix' ? true : false}
					isApproved={needsApproval ? isApproved : undefined}
					show1InchProvider={txProvider === '1inch'}
				/>
			)}
			{txConfirmationModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxConfirmationModalOpen(false)}
					txError={txError}
					attemptRetry={handleSubmit}
					baseCurrencyAmount={baseCurrencyAmount}
					quoteCurrencyAmount={quoteCurrencyAmount}
					feeCost={txProvider === 'synthetix' ? feeCost : null}
					baseCurrencyKey={baseCurrencyKey!}
					quoteCurrencyKey={quoteCurrencyKey!}
					totalTradePrice={estimatedBaseTradePrice.toString()}
					txProvider={txProvider}
					quoteCurrencyLabel={t('exchange.common.from')}
					baseCurrencyLabel={t('exchange.common.into')}
					icon={<ArrowsIcon />}
				/>
			)}
			{txApproveModalOpen && (
				<TxApproveModal
					onDismiss={() => setTxApproveModalOpen(false)}
					txError={txError}
					attemptRetry={handleApprove}
					currencyKey={quoteCurrencyKey!}
					currencyLabel={<NoTextTransform>{quoteCurrencyKey}</NoTextTransform>}
					txProvider={txProvider}
				/>
			)}
			{selectBalancerTradeModal && (
				<BalancerTradeModal onDismiss={() => setSelectBalancerTradeModal(false)} />
			)}
			{txSettleModalOpen && (
				<TxSettleModal
					onDismiss={() => setTxSettleModalOpen(false)}
					txError={txError}
					attemptRetry={handleSettle}
					currencyKey={baseCurrencyKey!}
					currencyLabel={<NoTextTransform>{baseCurrencyKey}</NoTextTransform>}
					txProvider={txProvider}
				/>
			)}
		</>
	);

	return {
		baseCurrencyCard,
		baseCurrencyKey,
		baseMarketDetailsCard,
		combinedMarketDetailsCard,
		footerCard,
		handleCurrencySwap,
		inverseRate,
		quoteCurrencyCard,
		quoteCurrencyKey,
		quoteMarketDetailsCard,
		wideWidth,
	};
};

export default useExchange;
