import Head from 'next/head';
import { useTranslation, Trans } from 'react-i18next';
import { useState } from 'react';
import { CurrencyKey, FIAT_CURRENCY_MAP } from 'constants/currency';
import { DEFAULT_BASE_SYNTH, DEFAULT_QUOTE_SYNTH, DEFAULT_GAS_BUFFER } from 'constants/defaults';
import CurrencyCard from 'sections/exchange/CurrencyCard';
import {
	FlexDivCentered,
	resetButtonCSS,
	FlexDivRowCentered,
	NoTextTransform,
} from 'styles/common';
import styled from 'styled-components';

import get from 'lodash/get';

import ArrowsIcon from 'assets/svg/app/arrows.svg';

import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';
import useEthGasStationQuery from 'queries/network/useGasStationQuery';
import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';
import MarketDetailsCard from 'sections/exchange/MarketDetailsCard';
import ChartCard from 'sections/exchange/PriceChartCard';
import { NO_VALUE } from 'constants/placeholder';
import Button from 'components/Button';
import Contracts from 'containers/Contracts';
import { ethers } from 'ethers';
import { GWEI_UNIT } from 'constants/network';
import Connector from 'containers/Connector';
import { useRecoilValue } from 'recoil';
import { isWalletConnectedState } from 'store/connection';

export const getExchangeRatesForCurrencies = (
	rates: Rates | null,
	base: CurrencyKey,
	quote: CurrencyKey
) => (rates == null ? 0 : rates[base] * (1 / rates[quote]));

const ExchangePage = () => {
	const { t } = useTranslation();
	const { notify } = Connector.useContainer();
	const { snxJS } = Contracts.useContainer();

	const [currencyPair, setCurrencyPair] = useState<{
		base: CurrencyKey;
		quote: CurrencyKey;
	}>({
		base: DEFAULT_BASE_SYNTH,
		quote: DEFAULT_QUOTE_SYNTH,
	});
	const [baseCurrencyAmount, setBaseCurrencyAmount] = useState<string>('');
	const [quoteCurrencyAmount, setQuoteCurrencyAmount] = useState<string>('');
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);

	const { base: baseCurrencyKey, quote: quoteCurrencyKey } = currencyPair;

	const synthsWalletBalancesQuery = useSynthsBalancesQuery();
	const ethGasStationQuery = useEthGasStationQuery();
	const exchangeRatesQuery = useExchangeRatesQuery();

	const rate = getExchangeRatesForCurrencies(
		exchangeRatesQuery.data ?? null,
		quoteCurrencyKey,
		baseCurrencyKey
	);
	const inverseRate = getExchangeRatesForCurrencies(
		exchangeRatesQuery.data ?? null,
		baseCurrencyKey,
		quoteCurrencyKey
	);

	const baseCurrencyBalance = get(
		synthsWalletBalancesQuery.data,
		[baseCurrencyKey, 'balance'],
		null
	);

	const quoteCurrencyBalance = get(
		synthsWalletBalancesQuery.data,
		[quoteCurrencyKey, 'balance'],
		null
	);

	const swapCurrencies = () => {
		const baseAmount = baseCurrencyAmount;
		const quoteAmount = quoteCurrencyAmount;

		setCurrencyPair({
			base: quoteCurrencyKey,
			quote: baseCurrencyKey,
		});

		setBaseCurrencyAmount(quoteAmount);
		setQuoteCurrencyAmount(baseAmount);
	};

	const buttonDisabled =
		!baseCurrencyAmount || !ethGasStationQuery.data || !isWalletConnected || isSubmitting;

	const handleSubmit = async () => {
		if (snxJS) {
			const quoteKeyBytes32 = ethers.utils.formatBytes32String(quoteCurrencyKey);
			const baseKeyBytes32 = ethers.utils.formatBytes32String(baseCurrencyKey);
			const amountToExchange = ethers.utils.parseEther(quoteCurrencyAmount);

			const params = [quoteKeyBytes32, amountToExchange, baseKeyBytes32];
			try {
				const gasEstimate = await snxJS.Synthetix.estimateGas.exchange(...params);

				setIsSubmitting(true);

				const tx = await snxJS.Synthetix.exchange(...params, {
					gasPrice: ethGasStationQuery.data!.average * GWEI_UNIT,
					// gasLimit: gasEstimate + DEFAULT_GAS_BUFFER,
				});
				if (notify && tx) {
					const { emitter } = notify.hash(tx.hash);

					// emitter.on('txConfirmed', () => {
					// 	synthsWalletBalancesQuery.refetch();
					// });
					await tx.wait();
					synthsWalletBalancesQuery.refetch();
				}
				setIsSubmitting(false);
			} catch (e) {
				console.log(e);
				setIsSubmitting(false);
			}
		}
	};

	return (
		<>
			<Head>
				<title>{t('exchange.page-title')}</title>
			</Head>
			<>
				<CardsContainer>
					<LeftCardContainer>
						<CurrencyCard
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
						/>
						<ChartCard
							currencyKey={quoteCurrencyKey ?? null}
							usdRate={exchangeRatesQuery.data?.[quoteCurrencyKey] ?? null}
						/>
						<MarketDetailsCard currencyKey={quoteCurrencyKey} />
					</LeftCardContainer>
					<Spacer>
						<SwapCurrenciesButton onClick={swapCurrencies}>
							<ArrowsIcon />
						</SwapCurrenciesButton>
					</Spacer>
					<RightCardContainer>
						<CurrencyCard
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
						/>
						<ChartCard
							currencyKey={baseCurrencyKey ?? null}
							usdRate={exchangeRatesQuery.data?.[baseCurrencyKey] ?? null}
						/>
						<MarketDetailsCard currencyKey={baseCurrencyKey} />
					</RightCardContainer>
				</CardsContainer>
				<TradeInfo>
					<TradeInfoItems>
						<TradeInfoItem>
							<TradeInfoLabel>{t('exchange.trade-info.slippage')}</TradeInfoLabel>
							<TradeInfoValue>{NO_VALUE}</TradeInfoValue>
						</TradeInfoItem>
						<TradeInfoItem>
							<TradeInfoLabel>
								<Trans
									i18nKey="common.currency.currency-value"
									values={{ currencyKey: FIAT_CURRENCY_MAP.USD }}
									components={[<NoTextTransform />]}
								/>
							</TradeInfoLabel>
							<TradeInfoValue>{NO_VALUE}</TradeInfoValue>
						</TradeInfoItem>
						<TradeInfoItem>
							<TradeInfoLabel>{t('exchange.trade-info.fee')}</TradeInfoLabel>
							<TradeInfoValue>{NO_VALUE}</TradeInfoValue>
						</TradeInfoItem>
						<TradeInfoItem>
							<TradeInfoLabel>{t('exchange.trade-info.fee-cost')}</TradeInfoLabel>
							<TradeInfoValue>{NO_VALUE}</TradeInfoValue>
						</TradeInfoItem>
					</TradeInfoItems>
					<div>
						<Button variant="primary" disabled={buttonDisabled} onClick={handleSubmit}>
							{isSubmitting
								? t('exchange.trade-info.button.submitting-order')
								: buttonDisabled
								? t('exchange.trade-info.button.enter-amount')
								: t('exchange.trade-info.button.submit-order')}
						</Button>
					</div>
				</TradeInfo>
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

const TradeInfo = styled(FlexDivRowCentered)`
	border-radius: 1000px;
	background-color: ${(props) => props.theme.colors.elderberry};
	padding: 16px 32px;
	max-width: 680px;
	margin: 0 auto;
`;

const TradeInfoItems = styled.div`
	display: grid;
	grid-auto-flow: column;
	flex-grow: 1;
`;

const TradeInfoItem = styled.div`
	display: grid;
	grid-gap: 4px;
`;

const TradeInfoLabel = styled.div`
	text-transform: capitalize;
`;

const TradeInfoValue = styled.div`
	color: ${(props) => props.theme.colors.white};
`;

export default ExchangePage;
