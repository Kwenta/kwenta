import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import get from 'lodash/get';
import produce from 'immer';
import Slider from 'react-slick';

import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { DEFAULT_GAS_BUFFER } from 'constants/defaults';
import { zIndex } from 'constants/ui';
import ROUTES from 'constants/routes';
import { CurrencyKey } from 'constants/currency';
import { GWEI_UNIT } from 'constants/network';

import Connector from 'containers/Connector';
import Etherscan from 'containers/Etherscan';

// import Services from 'containers/Services';

import ArrowsIcon from 'assets/inline-svg/app/arrows.svg';

import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';
import useEthGasStationQuery from 'queries/network/useGasStationQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useFrozenSynthsQuery from 'queries/synths/useFrozenSynthsQuery';

import AppLayout from 'sections/shared/Layout/AppLayout';

import CurrencyCard from 'sections/exchange/TradeCard/CurrencyCard';
import PriceChartCard from 'sections/exchange/TradeCard/PriceChartCard';
import MarketDetailsCard from 'sections/exchange/TradeCard/MarketDetailsCard';
import TradeSummaryCard from 'sections/exchange/FooterCard/TradeSummaryCard';
import NoSynthsCard from 'sections/exchange/FooterCard/NoSynthsCard';
import ConnectWalletCard from 'sections/exchange/FooterCard/ConnectWalletCard';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import SelectSynthModal from 'sections/shared/modals/SelectSynthModal';
import SelectAssetModal from 'sections/shared/modals/SelectAssetModal';

import { hasOrdersNotificationState } from 'store/ui';
import {
	customGasPriceState,
	gasSpeedState,
	isWalletConnectedState,
	// walletAddressState,
} from 'store/wallet';
import { ordersState } from 'store/orders';

import { formatCurrency } from 'utils/formatters/number';
import { getExchangeRatesForCurrencies } from 'utils/currencies';

import { useLocalStorage } from 'hooks/useLocalStorage';

import { priceCurrencyState } from 'store/app';

import media from 'styles/media';

import synthetix from 'lib/synthetix';

import {
	FlexDiv,
	FlexDivColCentered,
	resetButtonCSS,
	PageContent,
	MobileContainerMixin,
} from 'styles/common';

import useSynthSuspensionQuery from 'queries/synths/useSynthSuspensionQuery';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import useFeeReclaimPeriodQuery from 'queries/synths/useFeeReclaimPeriodQuery';

const ExchangePage = () => {
	const { t } = useTranslation();
	const { notify } = Connector.useContainer();
	const { etherscanInstance } = Etherscan.useContainer();
	// const { synthExchange$, ratesUpdated$ } = Services.useContainer();
	const router = useRouter();

	const marketPairQuery = router.query.marketPair || [];

	const [currencyPair, setCurrencyPair] = useLocalStorage<{
		base: CurrencyKey | null;
		quote: CurrencyKey | null;
	}>(LOCAL_STORAGE_KEYS.SELECTED_MARKET, {
		base: null,
		quote: null,
	});

	const [baseCurrencyAmount, setBaseCurrencyAmount] = useState<string>('');
	const [quoteCurrencyAmount, setQuoteCurrencyAmount] = useState<string>('');
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	// const walletAddress = useRecoilValue(walletAddressState);
	const [txConfirmationModalOpen, setTxConfirmationModalOpen] = useState<boolean>(false);
	const [selectSynthModalOpen, setSelectSynthModalOpen] = useState<boolean>(false);
	const [selectAssetModalOpen, setSelectAssetModalOpen] = useState<boolean>(false);
	const [txError, setTxError] = useState<boolean>(false);
	const selectedPriceCurrency = useRecoilValue(priceCurrencyState);
	const setOrders = useSetRecoilState(ordersState);
	const setHasOrdersNotification = useSetRecoilState(hasOrdersNotificationState);
	const gasSpeed = useRecoilValue(gasSpeedState);
	const customGasPrice = useRecoilValue(customGasPriceState);

	const { base: baseCurrencyKey, quote: quoteCurrencyKey } = currencyPair;

	const synthsWalletBalancesQuery = useSynthsBalancesQuery();
	const ethGasStationQuery = useEthGasStationQuery();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const frozenSynthsQuery = useFrozenSynthsQuery();
	const feeReclaimPeriodQuery = useFeeReclaimPeriodQuery(quoteCurrencyKey);

	const feeReclaimPeriodInSeconds = feeReclaimPeriodQuery.data ?? 0;

	// disable usage of .on for now

	// useEffect(() => {
	// 	if (synthExchange$ && walletAddress) {
	// 		const subscription = synthExchange$.subscribe(({ fromAddress }) => {
	// 			if (fromAddress === walletAddress) {
	// 				synthsWalletBalancesQuery.refetch();
	// 			}
	// 		});
	// 		return () => subscription.unsubscribe();
	// 	}
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [synthExchange$, walletAddress]);

	// useEffect(() => {
	// 	if (ratesUpdated$) {
	// 		const subscription = ratesUpdated$.subscribe(() => {
	// 			exchangeRatesQuery.refetch();
	// 		});
	// 		return () => subscription.unsubscribe();
	// 	}
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [ratesUpdated$]);

	const baseCurrency =
		baseCurrencyKey != null && synthetix.synthsMap != null
			? synthetix.synthsMap[baseCurrencyKey]
			: null;
	// const quoteCurrency =
	// 	quoteCurrencyKey != null && synthetix.synthsMap != null
	// 		? synthetix.synthsMap[quoteCurrencyKey]
	// 		: null;
	const exchangeRates = exchangeRatesQuery.data ?? null;
	const rate = getExchangeRatesForCurrencies(exchangeRates, quoteCurrencyKey, baseCurrencyKey);
	const inverseRate = rate > 0 ? 1 / rate : 0;
	const baseCurrencyBalance =
		baseCurrencyKey != null && synthsWalletBalancesQuery.isSuccess
			? get(synthsWalletBalancesQuery.data, ['balancesMap', baseCurrencyKey, 'balance'], 0)
			: null;
	const quoteCurrencyBalance =
		quoteCurrencyKey != null && synthsWalletBalancesQuery.isSuccess
			? get(synthsWalletBalancesQuery.data, ['balancesMap', quoteCurrencyKey, 'balance'], 0)
			: null;
	const basePriceRate = getExchangeRatesForCurrencies(
		exchangeRates,
		baseCurrencyKey,
		selectedPriceCurrency.name
	);
	const quotePriceRate = getExchangeRatesForCurrencies(
		exchangeRates,
		quoteCurrencyKey,
		selectedPriceCurrency.name
	);
	const selectPriceCurrencyRate = exchangeRates && exchangeRates[selectedPriceCurrency.name];
	let totalTradePrice = Number(baseCurrencyAmount) * basePriceRate;
	if (selectPriceCurrencyRate) {
		totalTradePrice /= selectPriceCurrencyRate;
	}

	const insufficientBalance = Number(quoteCurrencyAmount) > Number(quoteCurrencyBalance);
	const selectedBothSides = baseCurrencyKey != null && quoteCurrencyKey != null;

	let isBaseCurrencyFrozen = false;
	let isQuoteCurrencyFrozen = false;

	if (frozenSynthsQuery.isSuccess && frozenSynthsQuery.data) {
		if (baseCurrencyKey != null) {
			isBaseCurrencyFrozen = frozenSynthsQuery.data.has(baseCurrencyKey);
		}
		if (quoteCurrencyKey != null) {
			isQuoteCurrencyFrozen = frozenSynthsQuery.data.has(quoteCurrencyKey);
		}
	}

	const baseCurrencySuspendedQuery = useSynthSuspensionQuery(baseCurrencyKey);
	const quoteCurrencySuspendedQuery = useSynthSuspensionQuery(quoteCurrencyKey);

	const isBaseCurrencySuspended =
		baseCurrencySuspendedQuery.isSuccess &&
		baseCurrencySuspendedQuery.data &&
		baseCurrencySuspendedQuery.data.isSuspended;
	const isQuoteCurrencySuspended =
		quoteCurrencySuspendedQuery.isSuccess &&
		quoteCurrencySuspendedQuery.data &&
		quoteCurrencySuspendedQuery.data.isSuspended;

	const isSubmissionDisabled =
		isBaseCurrencySuspended ||
		isQuoteCurrencySuspended ||
		!selectedBothSides ||
		!Number(baseCurrencyAmount) ||
		!Number(quoteCurrencyAmount) ||
		!ethGasStationQuery.data ||
		!isWalletConnected ||
		isBaseCurrencyFrozen ||
		isSubmitting ||
		insufficientBalance ||
		feeReclaimPeriodInSeconds > 0;

	const noSynths =
		synthsWalletBalancesQuery.isSuccess && synthsWalletBalancesQuery.data
			? synthsWalletBalancesQuery.data.balances.length === 0
			: false;

	const routeToMarketPair = (baseCurrencyKey: CurrencyKey, quoteCurrencyKey: CurrencyKey) =>
		router.replace(
			`/exchange/[[...marketPair]]`,
			ROUTES.Exchange.MarketPair(baseCurrencyKey, quoteCurrencyKey),
			{
				shallow: true,
			}
		);

	const routeToBaseCurrency = (baseCurrencyKey: CurrencyKey) =>
		router.replace(`/exchange/[[...marketPair]]`, ROUTES.Exchange.Into(baseCurrencyKey), {
			shallow: true,
		});

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

	const handleSubmit = async () => {
		if (synthetix.js != null) {
			setTxError(false);
			setTxConfirmationModalOpen(true);
			const quoteKeyBytes32 = ethers.utils.formatBytes32String(quoteCurrencyKey!);
			const baseKeyBytes32 = ethers.utils.formatBytes32String(baseCurrencyKey!);
			const amountToExchange = ethers.utils.parseEther(quoteCurrencyAmount);

			const params = [quoteKeyBytes32, amountToExchange, baseKeyBytes32];
			try {
				setIsSubmitting(true);

				const gasPrice =
					customGasPrice !== '' ? Number(customGasPrice) : ethGasStationQuery.data![gasSpeed];

				const gasEstimate = await synthetix.js.contracts.Synthetix.estimateGas.exchange(...params);

				const tx = await synthetix.js.contracts.Synthetix.exchange(...params, {
					gasPrice: gasPrice * GWEI_UNIT,
					gasLimit: Number(gasEstimate) + DEFAULT_GAS_BUFFER,
				});

				if (tx) {
					setOrders((orders) =>
						produce(orders, (draftState) => {
							draftState.push({
								timestamp: Date.now(),
								hash: tx.hash,
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

					if (notify) {
						const { emitter } = notify.hash(tx.hash);

						emitter.on('txConfirmed', () => {
							setOrders((orders) =>
								produce(orders, (draftState) => {
									const orderIndex = orders.findIndex((order) => order.hash === tx.hash);
									if (draftState[orderIndex]) {
										draftState[orderIndex].status = 'confirmed';
									}
								})
							);
							synthsWalletBalancesQuery.refetch();
						});

						emitter.on('all', () => {
							if (typeof window !== 'undefined' && etherscanInstance != null) {
								return {
									onclick: () => window.open(etherscanInstance.txLink(tx.hash)),
								};
							}
						});
					}
				}
				setTxConfirmationModalOpen(false);
			} catch (e) {
				console.log(e);
				setTxError(true);
			} finally {
				setIsSubmitting(false);
			}
		}
	};

	useEffect(() => {
		if (marketPairQuery.length) {
			if (synthetix.synthsMap != null) {
				const [baseCurrencyFromQuery, quoteCurrencyFromQuery] = marketPairQuery[0].split('-') as [
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
	}, [marketPairQuery]);

	const selectPriceCurrencyProps = {
		selectedPriceCurrency,
		selectPriceCurrencyRate,
	};

	const quoteCurrencyCard = (
		<StyledCurrencyCard
			side="quote"
			currencyKey={quoteCurrencyKey}
			amount={quoteCurrencyAmount}
			onAmountChange={(e) => {
				const value = e.target.value;
				const numValue = Number(value);

				setQuoteCurrencyAmount(value);
				setBaseCurrencyAmount(`${numValue * rate}`);
			}}
			walletBalance={quoteCurrencyBalance}
			onBalanceClick={() => {
				setQuoteCurrencyAmount(`${quoteCurrencyBalance}`);
				setBaseCurrencyAmount(`${Number(quoteCurrencyBalance) * rate}`);
			}}
			onCurrencySelect={() => setSelectAssetModalOpen(true)}
			priceRate={quotePriceRate}
			{...selectPriceCurrencyProps}
		/>
	);
	const quotePriceChartCard = (
		<StyledPriceChartCard
			side="quote"
			currencyKey={quoteCurrencyKey}
			priceRate={quotePriceRate}
			isSynthFrozen={isQuoteCurrencyFrozen}
			{...selectPriceCurrencyProps}
		/>
	);

	const quoteMarketDetailsCard = (
		<StyledMarketDetailsCard
			currencyKey={quoteCurrencyKey}
			priceRate={quotePriceRate}
			{...selectPriceCurrencyProps}
		/>
	);

	const baseCurrencyCard = (
		<StyledCurrencyCard
			side="base"
			currencyKey={baseCurrencyKey}
			amount={baseCurrencyAmount}
			onAmountChange={(e) => {
				const value = e.target.value;
				const numValue = Number(value);

				setBaseCurrencyAmount(value);
				setQuoteCurrencyAmount(`${numValue * inverseRate}`);
			}}
			walletBalance={baseCurrencyBalance}
			onBalanceClick={() => {
				setBaseCurrencyAmount(`${baseCurrencyBalance}`);
				setQuoteCurrencyAmount(`${Number(baseCurrencyBalance) * inverseRate}`);
			}}
			onCurrencySelect={() => setSelectSynthModalOpen(true)}
			priceRate={basePriceRate}
			{...selectPriceCurrencyProps}
		/>
	);

	const basePriceChartCard = (
		<StyledPriceChartCard
			side="base"
			currencyKey={baseCurrencyKey}
			priceRate={basePriceRate}
			isSynthFrozen={isBaseCurrencyFrozen}
			{...selectPriceCurrencyProps}
		/>
	);

	const baseMarketDetailsCard = (
		<StyledMarketDetailsCard
			currencyKey={baseCurrencyKey}
			priceRate={basePriceRate}
			{...selectPriceCurrencyProps}
		/>
	);

	return (
		<>
			<Head>
				<title>
					{baseCurrencyKey != null && quoteCurrencyKey != null
						? t('exchange.page-title-currency-pair', {
								baseCurrencyKey,
								quoteCurrencyKey,
								rate: formatCurrency(quoteCurrencyKey, inverseRate, {
									currencyKey: quoteCurrencyKey,
								}),
						  })
						: t('exchange.page-title')}
				</title>
			</Head>
			<AppLayout>
				<StyledPageContent>
					<DesktopOnlyView>
						<DesktopCardsContainer>
							<LeftCardContainer>
								{quoteCurrencyCard}
								{quotePriceChartCard}
								{quoteMarketDetailsCard}
							</LeftCardContainer>
							<Spacer>
								<SwapCurrenciesButton onClick={handleCurrencySwap}>
									<ArrowsIcon />
								</SwapCurrenciesButton>
							</Spacer>
							<RightCardContainer>
								{baseCurrencyCard}
								{basePriceChartCard}
								{baseMarketDetailsCard}
							</RightCardContainer>
						</DesktopCardsContainer>
					</DesktopOnlyView>
					<MobileOrTabletView>
						<MobileContainer>
							{quoteCurrencyCard}
							<VerticalSpacer>
								<SwapCurrenciesButton onClick={handleCurrencySwap}>
									<ArrowsIcon />
								</SwapCurrenciesButton>
							</VerticalSpacer>
							{baseCurrencyCard}
							<SliderContainer>
								<Slider arrows={false} dots={false}>
									<SliderContent>
										{quotePriceChartCard}
										<SliderContentSpacer />
										{quoteMarketDetailsCard}
									</SliderContent>
									<SliderContent>
										{basePriceChartCard}
										<SliderContentSpacer />
										{baseMarketDetailsCard}
									</SliderContent>
								</Slider>
							</SliderContainer>
						</MobileContainer>
					</MobileOrTabletView>
					{/* TODO: consolidate all the cards into one FooterCard that will take care of rendering the correct card */}
					{!isWalletConnected ? (
						<ConnectWalletCard />
					) : noSynths ? (
						<NoSynthsCard />
					) : (
						<TradeSummaryCard
							selectedPriceCurrency={selectedPriceCurrency}
							isSubmissionDisabled={isSubmissionDisabled}
							isSubmitting={isSubmitting}
							onSubmit={handleSubmit}
							totalTradePrice={totalTradePrice}
							baseCurrencyAmount={baseCurrencyAmount}
							basePriceRate={basePriceRate}
							baseCurrency={baseCurrency}
							isBaseCurrencyFrozen={isBaseCurrencyFrozen}
							insufficientBalance={insufficientBalance}
							selectedBothSides={selectedBothSides}
							isBaseCurrencySuspended={isBaseCurrencySuspended}
							isQuoteCurrencySuspended={isQuoteCurrencySuspended}
							gasPrices={ethGasStationQuery.data}
							feeReclaimPeriodInSeconds={feeReclaimPeriodInSeconds}
							quoteCurrencyKey={quoteCurrencyKey}
						/>
					)}
					{txConfirmationModalOpen && (
						<TxConfirmationModal
							onDismiss={() => setTxConfirmationModalOpen(false)}
							txError={txError}
							attemptRetry={handleSubmit}
							baseCurrencyAmount={baseCurrencyAmount}
							quoteCurrencyAmount={quoteCurrencyAmount}
							baseCurrencyKey={baseCurrencyKey!}
							quoteCurrencyKey={quoteCurrencyKey!}
							totalTradePrice={totalTradePrice}
							selectedPriceCurrency={selectedPriceCurrency}
							txProvider="synthetix"
						/>
					)}
					{selectSynthModalOpen && (
						<SelectSynthModal
							onDismiss={() => setSelectSynthModalOpen(false)}
							synths={synthetix.js?.synths ?? []}
							exchangeRates={exchangeRates}
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
							selectedPriceCurrency={selectedPriceCurrency}
							selectPriceCurrencyRate={selectPriceCurrencyRate}
						/>
					)}
					{selectAssetModalOpen && (
						<SelectAssetModal
							onDismiss={() => setSelectAssetModalOpen(false)}
							synthsMap={synthetix.synthsMap}
							synthBalances={synthsWalletBalancesQuery.data?.balances ?? []}
							synthTotalUSDBalance={synthsWalletBalancesQuery.data?.totalUSDBalance ?? null}
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
							selectedPriceCurrency={selectedPriceCurrency}
							selectPriceCurrencyRate={selectPriceCurrencyRate}
							isWalletConnected={isWalletConnected}
						/>
					)}
				</StyledPageContent>
			</AppLayout>
		</>
	);
};

const StyledPageContent = styled(PageContent)`
	${media.greaterThan('md')`
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding-bottom: 40px;
		padding-top: 55px;
	`}
`;

const DesktopCardsContainer = styled(FlexDiv)`
	align-items: flex-start;
	justify-content: center;
	padding-bottom: 24px;
`;

const SwapCurrenciesButton = styled.button`
	${resetButtonCSS};
	background-color: ${(props) => props.theme.colors.elderberry};
	color: ${(props) => props.theme.colors.white};
	height: 32px;
	width: 32px;
	border-radius: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: ${zIndex.BASE};
`;

const Spacer = styled.div`
	padding: 0 16px;
	align-self: flex-start;
	margin-top: 43px;
`;

const CardContainerMixin = `
	display: grid;
	grid-gap: 24px;
	width: 100%;
`;

const LeftCardContainer = styled.div`
	${CardContainerMixin};
	justify-items: right;
`;

const RightCardContainer = styled.div`
	${CardContainerMixin};
	justify-items: left;
`;

const MobileContainer = styled(FlexDivColCentered)`
	${MobileContainerMixin};
`;

const VerticalSpacer = styled.div`
	height: 2px;
	position: relative;
	${SwapCurrenciesButton} {
		position: absolute;
		transform: translate(-50%, -50%) rotate(90deg);
		border: 2px solid ${(props) => props.theme.colors.black};
	}
`;

const StyledCurrencyCard = styled(CurrencyCard)`
	width: 312px;
	${media.lessThan('md')`
		width: 100%;
	`}
`;

const StyledMarketDetailsCard = styled(MarketDetailsCard)`
	max-width: 618px;
	width: 100%;
	${media.lessThan('md')`
		max-width: unset;
	`}
`;

const StyledPriceChartCard = styled(PriceChartCard)``;

const SliderContainer = styled.div`
	padding: 16px 0;
	width: 100%;
	.slick-dots {
		button:before {
			color: white;
		}
		.slick-active {
			button:before {
				color: white;
			}
		}
	}
	* {
		outline: none;
	}
`;

const SliderContent = styled.div``;

const SliderContentSpacer = styled.div`
	height: 16px;
`;

export default ExchangePage;
