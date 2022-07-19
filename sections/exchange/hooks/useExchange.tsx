import { useState, useEffect, useMemo, useCallback } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import get from 'lodash/get';
import produce from 'immer';
import castArray from 'lodash/castArray';
import { useTranslation } from 'react-i18next';
import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';

import ArrowsIcon from 'assets/svg/app/circle-arrows.svg';

import TransactionNotifier from 'containers/TransactionNotifier';
import Connector from 'containers/Connector';
import Convert from 'containers/Convert';

import Button from 'components/Button';

import { DEFAULT_CRYPTO_DECIMALS } from 'constants/defaults';
import ROUTES from 'constants/routes';
import {
	ATOMIC_EXCHANGES_L1,
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
import { KWENTA_TRACKING_CODE } from 'queries/futures/constants';
import useExchangeFeeRateQuery from 'queries/synths/useExchangeFeeRateQuery';
import useRedeemableDeprecatedSynthsQuery from 'queries/synths/useRedeemableDeprecatedSynthsQuery';

import CurrencyCard from 'sections/exchange/TradeCard/CurrencyCard';
import MarketDetailsCard from 'sections/exchange/TradeCard/Cards/MarketDetailsCard';
import CombinedMarketDetailsCard from 'sections/exchange/TradeCard/Cards/CombinedMarketDetailsCard';
import TradeSummaryCard from 'sections/exchange/FooterCard/TradeSummaryCard';
import NoSynthsCard from 'sections/exchange/FooterCard/NoSynthsCard';
import MarketClosureCard from 'sections/exchange/FooterCard/MarketClosureCard';
import ConnectWalletCard from 'sections/exchange/FooterCard/ConnectWalletCard';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import { TxProvider } from 'sections/shared/modals/TxConfirmationModal/TxConfirmationModal';
import SelectCurrencyModal from 'sections/shared/modals/SelectCurrencyModal';
import TxApproveModal from 'sections/shared/modals/TxApproveModal';
import TxSettleModal from 'sections/shared/modals/TxSettleModal';
import useChartWideWidth from 'sections/exchange/hooks/useChartWideWidth';
import RedeemTxModal from 'sections/dashboard/Deprecated/RedeemTxModal';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useMarketClosed from 'hooks/useMarketClosed';
import useDebouncedMemo from 'hooks/useDebouncedMemo';
import { useGetL1SecurityFee } from 'hooks/useGetL1SecurityGasFee';
import useGas from 'hooks/useGas';

import { hasOrdersNotificationState, slippageState } from 'store/ui';
import { isWalletConnectedState, walletAddressState, isL2State, networkState } from 'store/wallet';
import { ordersState } from 'store/orders';

import { getExchangeRatesForCurrencies } from 'utils/currencies';
import { truncateNumbers, zeroBN } from 'utils/formatters/number';
import { getTransactionPrice, normalizeGasLimit, GasInfo } from 'utils/network';
import { hexToAsciiV2 } from 'utils/formatters/string';

import SettleTransactionsCard from '../FooterCard/SettleTransactionsCard';
import useCurrencyPair from './useCurrencyPair';
import { NoTextTransform } from 'styles/common';

import useOneInchTokenList from 'queries/tokenLists/useOneInchTokenList';
import { SYNTH_SWAP_OPTIMISM_ADDRESS } from 'constants/address';

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
}: ExchangeCardProps) => {
	const { t } = useTranslation();
	const { monitorTransaction } = TransactionNotifier.useContainer();

	const { synthsMap, synthetixjs, tokensMap: synthTokensMap } = Connector.useContainer();

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
	const [, setIsRedeeming] = useState<boolean>(false);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const isL2 = useRecoilValue(isL2State);
	const [txSettleModalOpen, setTxSettleModalOpen] = useState<boolean>(false);
	const [txConfirmationModalOpen, setTxConfirmationModalOpen] = useState<boolean>(false);
	const [txError, setTxError] = useState<string | null>(null);
	const [selectBaseCurrencyModalOpen, setSelectBaseCurrencyModalOpen] = useState<boolean>(false);
	const [selectQuoteCurrencyModalOpen, setSelectQuoteCurrencyModalOpen] = useState<boolean>(false);
	const [txApproveModalOpen, setTxApproveModalOpen] = useState<boolean>(false);
	const [redeemTxModalOpen, setRedeemTxModalOpen] = useState<boolean>(false);
	const [atomicExchangeSlippage] = useState<string>('0.01');
	const setOrders = useSetRecoilState(ordersState);
	const setHasOrdersNotification = useSetRecoilState(hasOrdersNotificationState);
	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();
	const network = useRecoilValue(networkState);
	const { gasPrice, gasPriceWei, gasPrices, gasConfig, getGasLimitEstimate } = useGas();
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

	const oneInchQuery = useOneInchTokenList();

	const tokenList = oneInchQuery.data?.tokens || [];
	const oneInchTokensMap = oneInchQuery.data?.tokensMap || null;
	const allTokensMap = useMemo(() => ({ ...oneInchTokensMap, ...synthTokensMap }), [
		oneInchTokensMap,
		synthTokensMap,
	]);

	const txProvider: TxProvider | null = useMemo(() => {
		if (!baseCurrencyKey || !quoteCurrencyKey) return null;
		if (synthTokensMap[baseCurrencyKey] && synthTokensMap[quoteCurrencyKey]) return 'synthetix';
		if (oneInchTokensMap?.[baseCurrencyKey] && oneInchTokensMap?.[quoteCurrencyKey]) return '1inch';
		return 'synthswap';
	}, [baseCurrencyKey, quoteCurrencyKey, synthTokensMap, oneInchTokensMap]);

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

	const needsApproval =
		(txProvider === '1inch' || txProvider === 'synthswap') && !isQuoteCurrencyETH;

	const quoteCurrencyAmountDebounced = useDebouncedMemo(
		() => quoteCurrencyAmount,
		[quoteCurrencyAmount],
		300
	);

	const selectedTokens = tokenList.filter(
		(t) => t.symbol === baseCurrencyKey || t.symbol === quoteCurrencyKey
	);

	const tokensWalletBalancesQuery = useTokensBalancesQuery(selectedTokens, walletAddress || '');
	const tokenBalances = tokensWalletBalancesQuery.isSuccess
		? tokensWalletBalancesQuery.data ?? null
		: null;

	const quoteCurrencyTokenAddress = useMemo(
		() =>
			quoteCurrencyKey != null
				? isQuoteCurrencyETH
					? ETH_ADDRESS
					: get(allTokensMap, [quoteCurrencyKey, 'address'], null)
				: null,
		[quoteCurrencyKey, isQuoteCurrencyETH, allTokensMap]
	);

	const baseCurrencyTokenAddress = useMemo(
		() =>
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
		{
			enabled: txProvider !== 'synthetix',
		}
	);

	const coinGeckoPrices = coinGeckoTokenPricesQuery.isSuccess
		? coinGeckoTokenPricesQuery.data ?? null
		: null;

	const oneInchQuoteQuery = use1InchQuoteQuery(
		txProvider,
		quoteCurrencyKey && quoteCurrencyTokenAddress
			? {
					key: quoteCurrencyKey,
					address: quoteCurrencyTokenAddress,
			  }
			: null,
		baseCurrencyKey && baseCurrencyTokenAddress
			? {
					key: baseCurrencyKey,
					address: baseCurrencyTokenAddress,
			  }
			: null,
		quoteCurrencyAmountDebounced,
		get(allTokensMap, [quoteCurrencyKey!, 'decimals'], undefined)
	);

	const oneInchApproveAddressQuery = use1InchApproveSpenderQuery({
		enabled: txProvider === '1inch',
	});

	const oneInchApproveAddress = oneInchApproveAddressQuery.isSuccess
		? oneInchApproveAddressQuery.data ?? null
		: null;

	const approveAddress =
		txProvider === '1inch' ? oneInchApproveAddress : SYNTH_SWAP_OPTIMISM_ADDRESS;

	const quoteCurrencyContract = useMemo(() => {
		if (quoteCurrencyKey && allTokensMap[quoteCurrencyKey] && needsApproval) {
			const quoteTknAddress = allTokensMap[quoteCurrencyKey].address;
			return createERC20Contract(quoteTknAddress);
		}
		return null;
	}, [quoteCurrencyKey, createERC20Contract, needsApproval, allTokensMap]);

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
			} else if (synthTokensMap[quoteCurrencyKey]) {
				return synthsWalletBalance != null
					? get(synthsWalletBalance, ['balancesMap', quoteCurrencyKey, 'balance'], zeroBN)
					: null;
			} else {
				return tokenBalances?.[quoteCurrencyKey]?.balance ?? zeroBN;
			}
		}
		return null;
	}, [
		ETHBalance,
		isQuoteCurrencyETH,
		quoteCurrencyKey,
		synthsWalletBalance,
		tokenBalances,
		synthTokensMap,
	]);

	const baseCurrencyBalance = useMemo(() => {
		if (baseCurrencyKey != null) {
			if (isBaseCurrencyETH) {
				return ETHBalance;
			} else if (synthTokensMap[baseCurrencyKey]) {
				return synthsWalletBalance != null
					? get(synthsWalletBalance, ['balancesMap', baseCurrencyKey, 'balance'], zeroBN)
					: null;
			} else {
				return tokenBalances?.[baseCurrencyKey]?.balance ?? zeroBN;
			}
		}
		return null;
	}, [
		ETHBalance,
		isBaseCurrencyETH,
		baseCurrencyKey,
		synthsWalletBalance,
		synthTokensMap,
		tokenBalances,
	]);

	// TODO: Fix coingecko prices (optimism issue maybe?)
	const quotePriceRate = useMemo(
		() =>
			txProvider !== 'synthetix' && !isQuoteCurrencyETH
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
	const basePriceRate = useMemo(() => {
		return txProvider !== 'synthetix' && !isBaseCurrencyETH
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
			  );
	}, [
		exchangeRates,
		baseCurrencyKey,
		selectedPriceCurrency.name,
		txProvider,
		selectPriceCurrencyRate,
		baseCurrencyTokenAddress,
		coinGeckoPrices,
		isBaseCurrencyETH,
	]);

	useEffect(() => {}, [baseCurrencyKey, quoteCurrencyKey]);

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
			? router.replace(
					`/exchange/[[...market]]`,
					ROUTES.Exchange.MarketPair(baseCurrencyKey, quoteCurrencyKey),
					{
						shallow: true,
					}
			  )
			: undefined;

	const routeToBaseCurrency = (baseCurrencyKey: string) =>
		routingEnabled
			? router.replace(`/exchange/[[...market]]`, ROUTES.Exchange.Into(baseCurrencyKey), {
					shallow: true,
			  })
			: false;

	const handleCurrencySwap = () => {
		const quoteAmount = quoteCurrencyAmount;

		setCurrencyPair({
			base: quoteCurrencyKey,
			quote: baseCurrencyKey,
		});

		// TODO: Allow reverse quote for other tx providers
		setBaseCurrencyAmount(txProvider === 'synthetix' ? quoteAmount : '');
		setQuoteCurrencyAmount('');

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
		getGasLimitEstimate();

		// eslint-disable-next-line
	}, [submissionDisabledReason, gasInfo, txProvider]);

	// reset estimated gas limit when currencies are changed.
	useEffect(() => {
		setGasInfo(null);
	}, [baseCurrencyKey, quoteCurrencyKey]);

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

	const getExchangeParams = useCallback(
		(isAtomic: boolean) => {
			const destinationCurrencyKey = ethers.utils.formatBytes32String(baseCurrencyKey!);
			const sourceCurrencyKey = ethers.utils.formatBytes32String(quoteCurrencyKey!);
			const sourceAmount = quoteCurrencyAmountBN.toBN();
			const minAmount = baseCurrencyAmountBN.mul(wei(1).sub(atomicExchangeSlippage)).toBN();

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
				if (synthetixjs != null && txProvider === 'synthetix') {
					const sourceCurrencyKey = ethers.utils.parseBytes32String(
						getExchangeParams(true)[0] as string
					);

					const destinationCurrencyKey = ethers.utils.parseBytes32String(
						getExchangeParams(true)[2] as string
					);

					const isAtomic =
						!isL2 &&
						[sourceCurrencyKey, destinationCurrencyKey].every((currency) =>
							ATOMIC_EXCHANGES_L1.includes(currency)
						);

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
				} else if (txProvider === 'synthswap') {
					const gasEstimate = await swapSynthSwapGasEstimate(
						allTokensMap[quoteCurrencyKey!],
						allTokensMap[baseCurrencyKey!],
						quoteCurrencyAmount,
						slippage
					);
					const metaTx = await swapSynthSwap(
						allTokensMap[quoteCurrencyKey!],
						allTokensMap[baseCurrencyKey!],
						quoteCurrencyAmount,
						slippage,
						'meta_tx'
					);
					const l1Fee = await getL1SecurityFee({
						...metaTx,
						gasPrice: gasPriceInWei!,
						gasLimit: Number(gasEstimate),
					});

					return { limit: normalizeGasLimit(Number(gasEstimate)), l1Fee: l1Fee };
				} else {
					const estimate = await swap1InchGasEstimate(
						quoteCurrencyTokenAddress!,
						baseCurrencyTokenAddress!,
						quoteCurrencyAmount,
						slippage
					);
					const metaTx = await swap1Inch(
						quoteCurrencyTokenAddress!,
						baseCurrencyTokenAddress!,
						quoteCurrencyAmount,
						slippage,
						true
					);
					const l1Fee = await getL1SecurityFee({
						...metaTx,
						gasPrice: gasPriceInWei!,
						gasLimit: Number(estimate),
					});

					return { limit: normalizeGasLimit(Number(estimate)), l1Fee: l1Fee };
				}
			} catch (e) {
				console.log(e);
			}
			return null;
		},
		[
			isL2,
			synthetixjs,
			gasPrice,
			allTokensMap,
			quoteCurrencyTokenAddress,
			baseCurrencyTokenAddress,
			quoteCurrencyAmount,
			slippage,
			txProvider,
			baseCurrencyKey,
			quoteCurrencyKey,
			swapSynthSwapGasEstimate,
			swap1Inch,
			swap1InchGasEstimate,
			swapSynthSwap,
			getL1SecurityFee,
			getExchangeParams,
		]
	);

	const Redeemer = useMemo(() => synthetixjs?.contracts.SynthRedeemer ?? null, [synthetixjs]);
	const redeemableDeprecatedSynthsQuery = useRedeemableDeprecatedSynthsQuery(walletAddress);
	const redeemableDeprecatedSynths =
		redeemableDeprecatedSynthsQuery.isSuccess && redeemableDeprecatedSynthsQuery.data != null
			? redeemableDeprecatedSynthsQuery.data
			: null;
	const balances = redeemableDeprecatedSynths?.balances ?? [];
	const totalUSDBalance = wei(redeemableDeprecatedSynths?.totalUSDBalance ?? 0);

	const getMethodAndParams = useCallback(
		() => ({
			method: 'redeemAll',
			params: [redeemableDeprecatedSynths?.balances.map((b) => b.proxyAddress)],
		}),
		[redeemableDeprecatedSynths?.balances]
	);

	const gasLimitEstimate = useCallback(async (): Promise<number | null> => {
		if (!Redeemer) return null;
		try {
			const { method, params } = getMethodAndParams();
			return await getGasLimitEstimate(() => Redeemer.estimateGas[method](...params));
		} catch (e) {
			return null;
		}
	}, [getMethodAndParams, Redeemer, getGasLimitEstimate]);

	const handleRedeem = async () => {
		if (!(Redeemer && gasPrice)) return;

		setTxError(null);
		setRedeemTxModalOpen(true);

		const { method, params } = getMethodAndParams();

		try {
			setIsRedeeming(true);

			let transaction: ethers.ContractTransaction | null = null;

			const limitEstimate = await gasLimitEstimate();

			transaction = (await Redeemer[method](...params, {
				gasPrice: gasPriceWei,
				gasLimit: limitEstimate,
			})) as ethers.ContractTransaction;

			if (transaction != null) {
				monitorTransaction({
					txHash: transaction.hash,
				});

				await transaction.wait();
			}
			setRedeemTxModalOpen(false);
			redeemableDeprecatedSynthsQuery.refetch();
			synthsWalletBalancesQuery.refetch();
		} catch (e) {
			try {
				await Redeemer.callStatic[method](...params);
				throw e;
			} catch (e) {
				console.log(e);
				setTxError(
					e.data
						? t('common.transaction.revert-reason', { reason: hexToAsciiV2(e.data) })
						: e.message
				);
			}
		} finally {
			setIsRedeeming(false);
		}
	};

	const handleDismiss = () => {
		setRedeemTxModalOpen(false);
		setIsRedeeming(false);
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
				console.log(e);
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

	const handleApprove = async () => {
		if (quoteCurrencyKey != null && gasPrice != null && oneInchTokensMap != null) {
			setTxError(null);
			setTxApproveModalOpen(true);

			try {
				const contract = createERC20Contract(allTokensMap[quoteCurrencyKey].address);
				if (contract != null) {
					const gasEstimate = await contract.estimateGas.approve(
						approveAddress,
						ethers.constants.MaxUint256
					);

					const tx = await contract.approve(approveAddress, ethers.constants.MaxUint256, {
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

			const sourceCurrencyKey = ethers.utils.parseBytes32String(
				getExchangeParams(true)[0] as string
			);

			const destinationCurrencyKey = ethers.utils.parseBytes32String(
				getExchangeParams(true)[2] as string
			);

			const isAtomic =
				!isL2 &&
				[sourceCurrencyKey, destinationCurrencyKey].every((currency) =>
					ATOMIC_EXCHANGES_L1.includes(currency)
				);

			const exchangeParams = getExchangeParams(isAtomic);

			try {
				setIsSubmitting(true);

				let tx: ethers.ContractTransaction | null = null;

				if (txProvider === '1inch' && oneInchTokensMap != null) {
					// @ts-ignore is correct tx type
					tx = await swap1Inch(
						quoteCurrencyTokenAddress!,
						baseCurrencyTokenAddress!,
						quoteCurrencyAmount,
						slippage
					);
				} else if (txProvider === 'synthswap') {
					tx = await swapSynthSwap(
						allTokensMap[quoteCurrencyKey!],
						allTokensMap[baseCurrencyKey!],
						quoteCurrencyAmount,
						slippage
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
				console.warn(e);
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
		oneInchTokensMap,
		synthetixjs,
		gasPriceWei,
		gasConfig,
		isL2,
		allTokensMap,
		swapSynthSwap,
	]);

	useEffect(() => {
		if (routingEnabled && marketQuery != null) {
			const [baseCurrencyFromQuery, quoteCurrencyFromQuery] = marketQuery.split('-') as [
				CurrencyKey,
				CurrencyKey
			];

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
	}, [marketQuery, routingEnabled]);

	const quoteCurrencyCard = (
		<>
			<CurrencyCard
				side="quote"
				currencyKey={quoteCurrencyKey}
				currencyName={quoteCurrencyKey ? allTokensMap[quoteCurrencyKey]?.name : null}
				amount={quoteCurrencyAmount}
				onAmountChange={async (value) => {
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
				}}
				walletBalance={quoteCurrencyBalance}
				onBalanceClick={async () => {
					if (quoteCurrencyBalance != null) {
						if (quoteCurrencyKey === 'ETH') {
							const ETH_TX_BUFFER = 0.1;
							const balanceWithBuffer = quoteCurrencyBalance.sub(wei(ETH_TX_BUFFER));
							setQuoteCurrencyAmount(
								balanceWithBuffer.lt(0)
									? '0'
									: truncateNumbers(balanceWithBuffer, DEFAULT_CRYPTO_DECIMALS)
							);
						} else {
							setQuoteCurrencyAmount(
								truncateNumbers(quoteCurrencyBalance, DEFAULT_CRYPTO_DECIMALS)
							);
						}
						if (txProvider === 'synthetix') {
							const baseCurrencyAmountNoFee = quoteCurrencyBalance.mul(rate);
							const fee = baseCurrencyAmountNoFee.mul(exchangeFeeRate ?? 0);
							setBaseCurrencyAmount(
								truncateNumbers(baseCurrencyAmountNoFee.sub(fee), DEFAULT_CRYPTO_DECIMALS)
							);
						}
					}
				}}
				onCurrencySelect={
					allowQuoteCurrencySelection ? () => setSelectQuoteCurrencyModalOpen(true) : undefined
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
		</>
	);

	const quoteMarketDetailsCard =
		txProvider === 'synthetix' && showMarketDetailsCard ? (
			<MarketDetailsCard currencyKey={quoteCurrencyKey as CurrencyKey} />
		) : null;

	const slippagePercent = useMemo(() => {
		if (txProvider === '1inch' && totalTradePrice.gt(0) && estimatedBaseTradePrice.gt(0)) {
			return totalTradePrice.sub(estimatedBaseTradePrice).div(totalTradePrice).neg();
		}
		return null;
	}, [estimatedBaseTradePrice, txProvider, totalTradePrice]);

	const baseCurrencyCard = (
		<>
			<CurrencyCard
				side="base"
				currencyKey={baseCurrencyKey}
				currencyName={baseCurrencyKey ? allTokensMap[baseCurrencyKey]?.name : null}
				disabled={txProvider !== 'synthetix'}
				amount={baseCurrencyAmount}
				onAmountChange={async (value) => {
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
				}}
				walletBalance={baseCurrencyBalance}
				onBalanceClick={async () => {
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
				}}
				onCurrencySelect={
					allowBaseCurrencySelection ? () => setSelectBaseCurrencyModalOpen(true) : undefined
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
						setQuoteCurrencyAmount('');
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
					showFee={txProvider === 'synthetix'}
					isApproved={needsApproval ? isApproved : undefined}
				/>
			)}
			{balances.length !== 0 && totalUSDBalance.gt(0) && (
				<Button
					variant="primary"
					isRounded={true}
					disabled={false}
					onClick={handleRedeem}
					size="lg"
					data-testid="submit-order"
					fullWidth={true}
				>
					{t('dashboard.deprecated.button.redeem-synths')}
				</Button>
			)}
			{!redeemTxModalOpen ? null : (
				<RedeemTxModal
					{...{ txError, balances, totalUSDBalance }}
					onDismiss={handleDismiss}
					attemptRetry={handleRedeem}
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
