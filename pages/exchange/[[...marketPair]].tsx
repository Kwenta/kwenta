import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import get from 'lodash/get';
import produce from 'immer';

import { CurrencyKey } from 'constants/currency';
import { GWEI_UNIT } from 'constants/network';

import Connector from 'containers/Connector';
import Services from 'containers/Services';

import ArrowsIcon from 'assets/svg/app/arrows.svg';

import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';
import useEthGasStationQuery from 'queries/network/useGasStationQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useFrozenSynthsQuery from 'queries/synths/useFrozenSynthsQuery';

import TradeCard from 'sections/exchange/TradeCard';
import TradeSummaryCard from 'sections/exchange/TradeSummaryCard';
import NoSynthsCard from 'sections/exchange/NoSynthsCard';

import { hasOrdersNotificationState } from 'store/ui';

import { isWalletConnectedState, walletAddressState } from 'store/wallet';

import { formatCurrency } from 'utils/formatters/number';
import { getExchangeRatesForCurrencies } from 'utils/currencies';

import { priceCurrencyState, appReadyState } from 'store/app';

import media from 'styles/media';

import synthetix from 'lib/synthetix';

import { FlexDivCentered, resetButtonCSS } from 'styles/common';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { useLocalStorage } from 'hooks/useLocalStorage';
import { ordersState } from 'store/orders';

const TxConfirmationModal = dynamic(() => import('sections/shared/modals/TxConfirmationModal'), {
	ssr: false,
});

const SelectSynthModal = dynamic(() => import('sections/shared/modals/SelectSynthModal'), {
	ssr: false,
});

const SelectAssetModal = dynamic(() => import('sections/shared/modals/SelectAssetModal'), {
	ssr: false,
});

const ExchangePage = () => {
	const { t } = useTranslation();
	const { notify } = Connector.useContainer();
	const { synthExchange$, ratesUpdated$ } = Services.useContainer();
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
	const walletAddress = useRecoilValue(walletAddressState);
	const [txConfirmationModalOpen, setTxConfirmationModalOpen] = useState<boolean>(false);
	const [selectSynthModalOpen, setSelectSynthModalOpen] = useState<boolean>(false);
	const [selectAssetModalOpen, setSelectAssetModalOpen] = useState<boolean>(false);
	const selectedPriceCurrency = useRecoilValue(priceCurrencyState);
	const isAppReady = useRecoilValue(appReadyState);
	const setOrders = useSetRecoilState(ordersState);
	const setHasOrdersNotification = useSetRecoilState(hasOrdersNotificationState);

	const { base: baseCurrencyKey, quote: quoteCurrencyKey } = currencyPair;

	const synthsWalletBalancesQuery = useSynthsBalancesQuery({ refetchInterval: false });
	const ethGasStationQuery = useEthGasStationQuery();
	const exchangeRatesQuery = useExchangeRatesQuery({ refetchInterval: false });
	const frozenSynthsQuery = useFrozenSynthsQuery();

	useEffect(() => {
		if (synthExchange$ && walletAddress) {
			const subscription = synthExchange$.subscribe(({ fromAddress }) => {
				if (fromAddress === walletAddress) {
					synthsWalletBalancesQuery.refetch();
				}
			});
			return () => subscription.unsubscribe();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [synthExchange$, walletAddress]);

	useEffect(() => {
		if (ratesUpdated$) {
			const subscription = ratesUpdated$.subscribe(() => {
				exchangeRatesQuery.refetch();
			});
			return () => subscription.unsubscribe();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ratesUpdated$]);

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
	const totalTradePrice = Number(baseCurrencyAmount) * basePriceRate;

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

	const isSubmissionDisabled =
		!selectedBothSides ||
		!baseCurrencyAmount ||
		!quoteCurrencyAmount ||
		!ethGasStationQuery.data ||
		!isWalletConnected ||
		isBaseCurrencyFrozen ||
		isSubmitting ||
		insufficientBalance;

	const noSynths =
		synthsWalletBalancesQuery.isSuccess && synthsWalletBalancesQuery.data
			? synthsWalletBalancesQuery.data.balances.length === 0
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
	};

	function resetCurrencies() {
		setQuoteCurrencyAmount('');
		setBaseCurrencyAmount('');
	}

	const handleSubmit = async () => {
		if (synthetix.js != null) {
			setTxConfirmationModalOpen(true);
			const quoteKeyBytes32 = ethers.utils.formatBytes32String(quoteCurrencyKey!);
			const baseKeyBytes32 = ethers.utils.formatBytes32String(baseCurrencyKey!);
			const amountToExchange = ethers.utils.parseEther(quoteCurrencyAmount);

			const params = [quoteKeyBytes32, amountToExchange, baseKeyBytes32];
			try {
				setIsSubmitting(true);

				const tx = await synthetix.js.contracts.Synthetix.exchange(...params, {
					gasPrice: ethGasStationQuery.data!.average * GWEI_UNIT,
					// gasLimit: gasEstimate + DEFAULT_GAS_BUFFER,
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
						// await tx.wait();
						// synthsWalletBalancesQuery.refetch();
					}
				}
			} catch (e) {
				console.log(e);
			} finally {
				setIsSubmitting(false);
				setTxConfirmationModalOpen(false);
			}
		}
	};

	useEffect(() => {
		if (marketPairQuery && isAppReady) {
			let baseCurrencyFromQuery: CurrencyKey | null = null;
			let quoteCurrencyFromQuery: CurrencyKey | null = null;
			if (marketPairQuery.length) {
				[baseCurrencyFromQuery, quoteCurrencyFromQuery] = marketPairQuery[0].split('-');
			}

			if (currencyPair.base == null && currencyPair.quote == null) {
				// TODO: validate currencies
				if (
					baseCurrencyFromQuery != null &&
					quoteCurrencyFromQuery != null &&
					synthetix.synthsMap != null &&
					// validate synths (potentially)
					synthetix.synthsMap[baseCurrencyFromQuery] != null &&
					synthetix.synthsMap[quoteCurrencyFromQuery] != null
				) {
					setCurrencyPair({
						base: baseCurrencyFromQuery,
						quote: quoteCurrencyFromQuery,
					});
				}
			} else if (
				currencyPair.base != null &&
				currencyPair.quote != null &&
				(quoteCurrencyFromQuery !== currencyPair.quote ||
					baseCurrencyFromQuery !== currencyPair.base)
			) {
				router.replace(
					`/exchange/[[...market]]`,
					`/exchange/${currencyPair.base}-${currencyPair.quote}`,
					{
						shallow: true,
					}
				);
			}
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currencyPair, marketPairQuery, isAppReady]);

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
			<>
				<CardsContainer>
					<LeftCardContainer>
						<TradeCard
							side="quote"
							currencyKey={quoteCurrencyKey}
							currencyAmount={quoteCurrencyAmount}
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
							selectedPriceCurrency={selectedPriceCurrency}
							selectPriceCurrencyRate={selectPriceCurrencyRate}
							priceRate={quotePriceRate}
							isSynthFrozen={isQuoteCurrencyFrozen}
						/>
					</LeftCardContainer>
					<Spacer>
						<SwapCurrenciesButton onClick={handleCurrencySwap}>
							<ArrowsIcon />
						</SwapCurrenciesButton>
					</Spacer>
					<RightCardContainer>
						<TradeCard
							side="base"
							currencyKey={baseCurrencyKey}
							currencyAmount={baseCurrencyAmount}
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
							selectedPriceCurrency={selectedPriceCurrency}
							selectPriceCurrencyRate={selectPriceCurrencyRate}
							priceRate={basePriceRate}
							isSynthFrozen={isBaseCurrencyFrozen}
						/>
					</RightCardContainer>
				</CardsContainer>
				{noSynths ? (
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
					/>
				)}
				{txConfirmationModalOpen && (
					<TxConfirmationModal
						onDismiss={() => setTxConfirmationModalOpen(false)}
						baseCurrencyAmount={baseCurrencyAmount}
						quoteCurrencyAmount={quoteCurrencyAmount}
						baseCurrencyKey={baseCurrencyKey!}
						quoteCurrencyKey={quoteCurrencyKey!}
						totalTradePrice={totalTradePrice}
						selectedPriceCurrency={selectedPriceCurrency}
					/>
				)}
				{selectSynthModalOpen && (
					<SelectSynthModal
						onDismiss={() => setSelectSynthModalOpen(false)}
						synths={synthetix.js?.synths ?? []}
						exchangeRates={exchangeRatesQuery.data}
						onSelect={(currencyKey) => {
							resetCurrencies();
							// @ts-ignore
							setCurrencyPair((pair) => ({
								base: currencyKey,
								quote: pair.quote === currencyKey ? null : pair.quote,
							}));
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
						}}
						selectedPriceCurrency={selectedPriceCurrency}
						selectPriceCurrencyRate={selectPriceCurrencyRate}
					/>
				)}
			</>
		</>
	);
};

const CardsContainer = styled(FlexDivCentered)`
	justify-content: center;
	padding: 0 60px 24px 60px;
	${media.lessThan('extraLarge')`
		padding: 0 0 24px 0;
	`}
`;

const Spacer = styled.div`
	padding: 0 16px;
	align-self: flex-start;
	margin-top: 43px;
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

export default ExchangePage;
