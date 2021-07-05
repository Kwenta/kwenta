import React, { useMemo } from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from 'react-i18next';

import { FlexDivCentered, FlexDivCol, FlexDivRow, FlexDivRowCentered } from 'styles/common';
import { TabButton, TabList } from 'components/Tab';
import { useState } from 'react';
import { SYNTHS_MAP } from 'constants/currency';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import NumericInput from 'components/Input/NumericInput';
import Button from 'components/Button';
import { formatCurrency, formatPercent } from 'utils/formatters/number';
import { PositionSide } from '../types';
import Slider from 'components/Slider';
import GasPriceSummaryItem from 'sections/shared/components/GasPriceSummaryItem';
import { useRecoilState } from 'recoil';
import { gasSpeedState } from 'store/wallet';
import useEthGasPriceQuery from 'queries/network/useEthGasPriceQuery';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { getTransactionPrice } from 'utils/network';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import FeeRateSummaryItem from 'sections/exchange/FooterCard/TradeSummaryCard/FeeRateSummaryItem';
import { BigNumber } from 'ethers';

type TradeProps = {};

enum TradeTab {
	BUY = 'BUY',
	SELL = 'SELL',
}

const MIN_LEVERAGE = 1;
const MAX_LEVERAGE = 10;

const Trade: React.FC<TradeProps> = ({}) => {
	const { t } = useTranslation();

	const [activeTab, setActiveTab] = useState<TradeTab>(TradeTab.BUY);
	const [tradeSize, setTradeSize] = useState<string>('0');
	const [tradeValue, setTradeValue] = useState<string>('0');
	const [userTradeBalance, setUserTradeBalance] = useState<string>('0');
	const [leverage, setLeverage] = useState<number>(1);
	const [leverageSide, setLeverageSide] = useState<PositionSide>(PositionSide.LONG);

	const [gasLimit, setGasLimit] = useState<number | null>(null);
	const [gasSpeed] = useRecoilState(gasSpeedState);

	const ethGasPriceQuery = useEthGasPriceQuery();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const exchangeRatesQuery = useExchangeRatesQuery();

	const gasPrices = useMemo(
		() => (ethGasPriceQuery.isSuccess ? ethGasPriceQuery?.data ?? undefined : undefined),
		[ethGasPriceQuery.isSuccess, ethGasPriceQuery.data]
	);

	const gasPrice = useMemo(
		() =>
			ethGasPriceQuery.isSuccess
				? ethGasPriceQuery?.data != null
					? ethGasPriceQuery.data[gasSpeed]
					: null
				: null,
		[ethGasPriceQuery.isSuccess, ethGasPriceQuery.data, gasSpeed]
	);

	const exchangeRates = useMemo(
		() => (exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null),
		[exchangeRatesQuery.isSuccess, exchangeRatesQuery.data]
	);

	const ethPriceRate = useMemo(
		() => getExchangeRatesForCurrencies(exchangeRates, SYNTHS_MAP.sETH, selectedPriceCurrency.name),
		[exchangeRates, selectedPriceCurrency.name]
	);

	const transactionFee = useMemo(() => getTransactionPrice(gasPrice, gasLimit, ethPriceRate), [
		gasPrice,
		gasLimit,
		ethPriceRate,
	]);

	const TABS = useMemo(
		() => [
			{
				name: TradeTab.BUY,
				label: t('futures.market.trade.input.buy'),
				active: activeTab === TradeTab.BUY,
				onClick: () => setActiveTab(TradeTab.BUY),
			},
			{
				name: TradeTab.SELL,
				label: t('futures.market.trade.input.sell'),
				active: activeTab === TradeTab.SELL,
				onClick: () => setActiveTab(TradeTab.SELL),
			},
		],
		[t, activeTab]
	);

	const onTradeAmountChange = (value: string) => {
		setTradeSize(value);
		setTradeValue(value.length > 0 ? value : '0');
	};

	return (
		<>
			<FlexDivRow>
				<Title>{t('futures.market.trade.title')}</Title>
				<StyledTabList>
					{TABS.map(({ name, label, active, onClick }) => (
						<StyledTabButton key={name} name={name} active={active} onClick={onClick}>
							{label}
						</StyledTabButton>
					))}
				</StyledTabList>
			</FlexDivRow>

			<FlexDivCentered>
				<FlexDivCentered>
					{/* @TODO make dynamic */}
					<CurrencyIcon currencyKey={SYNTHS_MAP.sBTC} />
					<CurrencyLabel>{SYNTHS_MAP.sBTC}</CurrencyLabel>
				</FlexDivCentered>
				<FlexDivCol>
					<InputContainer>
						<FlexDivCol>
							<TradeAmount
								value={tradeSize}
								onChange={(_, value) => onTradeAmountChange(value)}
								placeholder="0"
								data-testid="trade-amount"
							/>
							<ValueAmount>
								{formatCurrency(SYNTHS_MAP.sUSD, tradeValue, { sign: '$' })}
							</ValueAmount>
						</FlexDivCol>
						<MaxButton variant="text">{t('futures.market.trade.input.max')}</MaxButton>
					</InputContainer>
					<FlexDivRow>
						<BalanceSubtitle>{t('futures.market.trade.input.balance')}</BalanceSubtitle>
						<BalanceValue>{userTradeBalance}</BalanceValue>
					</FlexDivRow>
				</FlexDivCol>
			</FlexDivCentered>

			<FlexDivRow>
				<LeverageTitle>{t('futures.market.trade.input.leverage.title')}</LeverageTitle>
				<FlexDivCol>
					<InputContainer>
						<LeverageAmount>{leverage}x</LeverageAmount>
						<FlexDivRow>
							<LeverageSide side={PositionSide.LONG} isActive={leverageSide === PositionSide.LONG}>
								{t('futures.market.trade.input.leverage.long')}
							</LeverageSide>
							<LeverageSide
								side={PositionSide.SHORT}
								isActive={leverageSide === PositionSide.SHORT}
							>
								{t('futures.market.trade.input.leverage.short')}
							</LeverageSide>
						</FlexDivRow>
					</InputContainer>
					<FlexDivRow>
						<Slider
							minValue={MIN_LEVERAGE}
							maxValue={MAX_LEVERAGE}
							startingLabel={`${MIN_LEVERAGE}x`}
							endingLabel={`${MAX_LEVERAGE}x`}
							value={leverage}
							onChange={(newValue) => setLeverage(newValue)}
						/>
					</FlexDivRow>
				</FlexDivCol>
			</FlexDivRow>

			<FlexDivCol>
				<StyledGasPriceSummaryItem {...{ gasPrices, transactionFee }} />
				<SummaryRow>
					<SummaryLabel>{t('futures.market.trade.summary.usd-value')}</SummaryLabel>
					<SummaryValue>{formatCurrency(SYNTHS_MAP.sUSD, 1500, { sign: '$' })}</SummaryValue>
				</SummaryRow>
				<SummaryRow>
					<SummaryLabel>{t('futures.market.trade.summary.fee-percent')}</SummaryLabel>
					<SummaryValue>{formatPercent(0.0005)}</SummaryValue>
				</SummaryRow>
				<SummaryRow>
					<SummaryLabel>{t('futures.market.trade.summary.fee-cost')}</SummaryLabel>
					<SummaryValue>{formatCurrency(SYNTHS_MAP.sUSD, 5.95, { sign: '$' })}</SummaryValue>
				</SummaryRow>
			</FlexDivCol>
		</>
	);
};
export default Trade;

const Title = styled.div`
	color: ${(props) => props.theme.colors.silver};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 14px;
	text-transform: capitalize;
`;

const StyledTabList = styled(TabList)`
	margin-bottom: 12px;
`;

const StyledTabButton = styled(TabButton)`
	text-transform: capitalize;
	background: ${(props) => props.theme.colors.elderberry};
`;

const CurrencyLabel = styled.div`
	color: ${(props) => props.theme.colors.white};
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.bold};
	margin-left: 4px;
`;

const InputContainer = styled(FlexDivRowCentered)`
	background: ${(props) => props.theme.colors.black};
`;

const TradeAmount = styled(NumericInput)`
	font-size: 16px;
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.silver};
`;

const ValueAmount = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 10px;
	color: ${(props) => props.theme.colors.blueberry};
	margin-left: 8px;
`;

const MaxButton = styled(Button)`
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.goldColors.color2};
	font-size: 12px;
	text-transform: uppercase;
`;

const BalanceSubtitle = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.blueberry};
	font-size: 12px;
	text-transform: capitalize;
`;

const BalanceValue = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	color: ${(props) => props.theme.colors.blueberry};
	font-size: 12px;
`;

const LeverageTitle = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 14px;
	color: ${(props) => props.theme.colors.white};
	text-transform: capitalize;
`;

const LeverageAmount = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 16px;
	color: ${(props) => props.theme.colors.silver};
`;

const LeverageSide = styled.div<{ side: PositionSide; isActive: boolean }>`
	${(props) =>
		props.isActive
			? css`
					border: 1px solid
						${props.side === PositionSide.LONG ? props.theme.colors.green : props.theme.colors.red};
					color: ${props.side === PositionSide.LONG
						? props.theme.colors.green
						: props.theme.colors.red};
			  `
			: css`
					border: 1px solid ${props.theme.colors.blueberry};
					border-right-width: ${props.side === PositionSide.LONG ? '0px' : '1px'};
					border-left-width: ${props.side === PositionSide.SHORT ? '0px' : '1px'};
					color: ${props.theme.colors.blueberry};
			  `}
	text-transform: uppercase;
	padding: 4px 8px;
	text-align: center;
`;

const SummaryRow = styled(FlexDivRow)`
	border-bottom: 1px solid ${(props) => props.theme.colors.navy};
	margin-bottom: 5px;
`;
const SummaryLabel = styled.div`
	color: ${(props) => props.theme.colors.blueberry};
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.bold};
	text-transform: capitalize;
`;

const SummaryValue = styled.div`
	color: ${(props) => props.theme.colors.white};
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.mono};
	text-transform: capitalize;
`;

const StyledGasPriceSummaryItem = styled(GasPriceSummaryItem)`
	padding: 5px 0;
	display: flex;
	justify-content: space-between;
	width: auto;
	border-bottom: 1px solid ${(props) => props.theme.colors.navy};
	color: ${(props) => props.theme.colors.blueberry};
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.bold};
	text-transform: capitalize;
`;
