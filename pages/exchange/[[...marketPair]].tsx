import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useRecoilValue } from 'recoil';
import get from 'lodash/get';

import { CurrencyKey } from 'constants/currency';
import { DEFAULT_BASE_SYNTH, DEFAULT_QUOTE_SYNTH } from 'constants/defaults';
import { GWEI_UNIT } from 'constants/network';

import Connector from 'containers/Connector';
import Services from 'containers/Services';

import ArrowsIcon from 'assets/svg/app/arrows.svg';

import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';
import useEthGasStationQuery from 'queries/network/useGasStationQuery';
import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';

import TradeSummaryCard from 'sections/exchange/TradeSummaryCard';

import { isWalletConnectedState, walletAddressState } from 'store/wallet';

import synthetix from 'lib/synthetix';

import useFrozenSynthsQuery from 'queries/synths/useFrozenSynthsQuery';

import { formatCurrency } from 'utils/formatters/number';

import { priceCurrencyState } from 'store/app';

import { FlexDivCentered, resetButtonCSS } from 'styles/common';
import TradeCard from 'sections/exchange/TradeCard';

const TxConfirmationModal = dynamic(() => import('sections/shared/modals/TxConfirmationModal'), {
	ssr: false,
});

const SelectSynthModal = dynamic(() => import('sections/shared/modals/SelectSynthModal'), {
	ssr: false,
});

const SelectAssetModal = dynamic(() => import('sections/shared/modals/SelectAssetModal'), {
	ssr: false,
});

export const getExchangeRatesForCurrencies = (
	rates: Rates | null,
	base: CurrencyKey,
	quote: CurrencyKey
) => (rates == null ? 0 : rates[base] * (1 / rates[quote]));

const ExchangePage = () => {
	const { t } = useTranslation();
	const { notify } = Connector.useContainer();
	const { synthExchange$, ratesUpdated$ } = Services.useContainer();
	const router = useRouter();

	let baseCurrencyFromQuery: CurrencyKey | null = null;
	let quoteCurrencyFromQuery: CurrencyKey | null = null;

	const market = router.query.marketPair || [];

	if (market.length) {
		// check valid market
		[baseCurrencyFromQuery, quoteCurrencyFromQuery] = market[0].split('-');
	}

	const [currencyPair, setCurrencyPair] = useState<{
		base: CurrencyKey;
		quote: CurrencyKey;
	}>({
		base: baseCurrencyFromQuery ?? DEFAULT_BASE_SYNTH,
		quote: quoteCurrencyFromQuery ?? DEFAULT_QUOTE_SYNTH,
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
	const exchangeRates = exchangeRatesQuery.data ?? null;
	const rate = getExchangeRatesForCurrencies(exchangeRates, quoteCurrencyKey, baseCurrencyKey);
	const inverseRate = rate > 0 ? 1 / rate : 0;
	const baseCurrencyBalance = get(
		synthsWalletBalancesQuery.data,
		['balancesMap', baseCurrencyKey, 'balance'],
		null
	);
	const quoteCurrencyBalance = get(
		synthsWalletBalancesQuery.data,
		['balancesMap', quoteCurrencyKey, 'balance'],
		null
	);
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

	const isButtonDisabled =
		!baseCurrencyAmount || !ethGasStationQuery.data || !isWalletConnected || isSubmitting;

	const handleSubmit = async () => {
		if (synthetix.js != null) {
			setTxConfirmationModalOpen(true);
			const quoteKeyBytes32 = ethers.utils.formatBytes32String(quoteCurrencyKey);
			const baseKeyBytes32 = ethers.utils.formatBytes32String(baseCurrencyKey);
			const amountToExchange = ethers.utils.parseEther(quoteCurrencyAmount);

			const params = [quoteKeyBytes32, amountToExchange, baseKeyBytes32];
			try {
				setIsSubmitting(true);

				const tx = await synthetix.js.contracts.Synthetix.exchange(...params, {
					gasPrice: ethGasStationQuery.data!.average * GWEI_UNIT,
					// gasLimit: gasEstimate + DEFAULT_GAS_BUFFER,
				});

				if (notify && tx) {
					const { emitter } = notify.hash(tx.hash);

					emitter.on('txConfirmed', () => {
						synthsWalletBalancesQuery.refetch();
					});
					// await tx.wait();
					// synthsWalletBalancesQuery.refetch();
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
		if (
			currencyPair.base &&
			currencyPair.quote &&
			quoteCurrencyFromQuery !== currencyPair.quote &&
			baseCurrencyFromQuery !== currencyPair.base
		) {
			router.replace(
				`/exchange/[[...market]]`,
				`/exchange/${currencyPair.base}-${currencyPair.quote}`,
				{
					shallow: true,
				}
			);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currencyPair, quoteCurrencyFromQuery, baseCurrencyFromQuery]);

	return (
		<>
			<Head>
				<title>
					{baseCurrencyKey
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
						/>
					</RightCardContainer>
				</CardsContainer>
				<TradeSummaryCard
					selectedPriceCurrency={selectedPriceCurrency}
					isButtonDisabled={isButtonDisabled}
					isSubmitting={isSubmitting}
					baseCurrencyAmount={baseCurrencyAmount}
					onSubmit={handleSubmit}
					totalTradePrice={totalTradePrice}
					basePriceRate={basePriceRate}
					baseCurrency={baseCurrency}
				/>
				{txConfirmationModalOpen && (
					<TxConfirmationModal
						onDismiss={() => setTxConfirmationModalOpen(false)}
						baseCurrencyAmount={baseCurrencyAmount}
						quoteCurrencyAmount={quoteCurrencyAmount}
						baseCurrencyKey={baseCurrencyKey}
						quoteCurrencyKey={quoteCurrencyKey}
						totalTradePrice={totalTradePrice}
						selectedPriceCurrency={selectedPriceCurrency}
					/>
				)}
				{selectSynthModalOpen && (
					<SelectSynthModal
						onDismiss={() => setSelectSynthModalOpen(false)}
						synths={synthetix.js?.synths ?? []}
						exchangeRates={exchangeRatesQuery.data}
						onSelect={(currencyKey) =>
							setCurrencyPair((pair) => ({
								base: currencyKey,
								quote: pair.quote,
							}))
						}
						frozenSynths={frozenSynthsQuery.data || []}
						excludedSynths={quoteCurrencyKey ? [quoteCurrencyKey] : undefined}
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
						onSelect={(currencyKey) =>
							setCurrencyPair((pair) => ({
								base: pair.base,
								quote: currencyKey,
							}))
						}
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
	padding-bottom: 24px;
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
