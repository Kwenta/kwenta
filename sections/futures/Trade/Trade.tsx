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
import { formatCurrency } from 'utils/formatters/number';
import { PositionSide } from '../types';
import Slider from 'components/Slider';
import { useRecoilState } from 'recoil';
import { gasSpeedState } from 'store/wallet';
import useEthGasPriceQuery from 'queries/network/useEthGasPriceQuery';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { getTransactionPrice } from 'utils/network';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import { getExchangeRatesForCurrencies } from 'utils/currencies';

import GasPriceSelect from 'sections/shared/components/GasPriceSelect';
import FeeRateSummary from 'sections/shared/components/FeeRateSummary';
import FeeCostSummary from 'sections/shared/components/FeeCostSummary';
import SlippageSelect from 'sections/shared/components/SlippageSelect';
import Card from 'components/Card';

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
	const [tradeSize, setTradeSize] = useState<string>('');
	const [tradeValue, setTradeValue] = useState<string>('0');
	const [userTradeBalance, setUserTradeBalance] = useState<string>('0');
	const [leverage, setLeverage] = useState<number>(1);
	const [leverageSide, setLeverageSide] = useState<PositionSide>(PositionSide.LONG);

	const [gasLimit, setGasLimit] = useState<number | null>(null);
	const [gasSpeed] = useRecoilState(gasSpeedState);
	const [maxSlippageTolerance, setMaxSlippageTolerance] = useState<string>('0.005');
	const [availableMargin, setAvailableMargin] = useState<string>('20000');
	const [availableBalance, setAvailableBalance] = useState<string>('150000');

	const ethGasPriceQuery = useEthGasPriceQuery();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const exchangeRatesQuery = useExchangeRatesQuery();

	const isSubmitOrderDisabled = useMemo(() => Number(tradeSize) === 0 || tradeSize.length === 0, [
		tradeSize,
	]);

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
		<Panel>
			<TopRow>
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

				<InputRow>
					<FlexDivRowCentered>
						{/* @TODO make dynamic */}
						<CurrencyIcon currencyKey={SYNTHS_MAP.sBTC} />
						<CurrencyLabel>{SYNTHS_MAP.sBTC}</CurrencyLabel>
					</FlexDivRowCentered>
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
				</InputRow>

				<LeverageRow>
					<LeverageTitle>{t('futures.market.trade.input.leverage.title')}</LeverageTitle>
					<FlexDivCol>
						<InputContainer>
							<LeverageAmount>{leverage}x</LeverageAmount>
							<LeverageSideContainer>
								<LeverageSide
									variant="outline"
									side={PositionSide.LONG}
									isActive={leverageSide === PositionSide.LONG}
									onClick={() => setLeverageSide(PositionSide.LONG)}
								>
									{t('futures.market.trade.input.leverage.long')}
								</LeverageSide>
								<LeverageSide
									variant="outline"
									side={PositionSide.SHORT}
									isActive={leverageSide === PositionSide.SHORT}
									onClick={() => setLeverageSide(PositionSide.SHORT)}
								>
									{t('futures.market.trade.input.leverage.short')}
								</LeverageSide>
							</LeverageSideContainer>
						</InputContainer>
						<SliderRow>
							<Slider
								minValue={MIN_LEVERAGE}
								maxValue={MAX_LEVERAGE}
								startingLabel={`${MIN_LEVERAGE}x`}
								endingLabel={`${MAX_LEVERAGE}x`}
								value={leverage}
								onChange={(newValue) => setLeverage(newValue)}
							/>
						</SliderRow>
					</FlexDivCol>
				</LeverageRow>

				<FlexDivCol>
					<StyledGasPriceSelect {...{ gasPrices, transactionFee }} />
					<StyledFeeRateSummary feeRate={null} />
					<StyledFeeCostSummary feeCost={null} />
					<StyledSlippageSelcet
						maxSlippageTolerance={maxSlippageTolerance}
						setMaxSlippageTolerance={setMaxSlippageTolerance}
					/>
					<Button variant="primary" disabled={isSubmitOrderDisabled} isRounded size="lg">
						{isSubmitOrderDisabled
							? t('futures.market.trade.button.enter-amount')
							: t('futures.market.trade.button.open-trade', { side: activeTab.toLowerCase() })}
					</Button>
				</FlexDivCol>
			</TopRow>

			<BottomRow>
				<Divider />
				<StyledCard>
					<FlexDivRowCentered>
						<FlexDivCol>
							<AvailableMargin>{t('futures.market.trade.margin.available-margin')}</AvailableMargin>
							<MarginBalance>
								{formatCurrency(SYNTHS_MAP.sUSD, availableMargin, { sign: '$' })}
							</MarginBalance>
						</FlexDivCol>
						<Button variant="primary" isRounded>
							{t('futures.market.trade.button.edit')}
						</Button>
					</FlexDivRowCentered>
				</StyledCard>
				<FlexDivRow>
					<AvailableBalanceLabel>
						{t('futures.market.trade.margin.available-balance')}
					</AvailableBalanceLabel>
					<AvailableBalanceValue>
						{formatCurrency(SYNTHS_MAP.sUSD, availableBalance, { sign: '$' })}
					</AvailableBalanceValue>
				</FlexDivRow>
			</BottomRow>
		</Panel>
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

const InputRow = styled(FlexDivRow)`
	width: 100%;
	margin-bottom: 24px;
`;

const CurrencyLabel = styled.div`
	color: ${(props) => props.theme.colors.white};
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.bold};
	margin-left: 4px;
`;

const InputContainer = styled(FlexDivRowCentered)`
	background: ${(props) => props.theme.colors.black};
	border-radius: 4px;
	padding: 4px;
	width: 225px;
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
	margin-right: 4px;
`;

const BalanceSubtitle = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.blueberry};
	font-size: 12px;
	text-transform: capitalize;
	margin-top: 6px;
`;

const BalanceValue = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	color: ${(props) => props.theme.colors.blueberry};
	font-size: 12px;
	margin-top: 6px;
`;

const LeverageRow = styled(FlexDivRow)`
	width: 100%;
	margin-bottom: 24px;
`;

const LeverageTitle = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 14px;
	color: ${(props) => props.theme.colors.white};
	text-transform: capitalize;
	margin-top: 24px;
`;

const LeverageAmount = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 16px;
	color: ${(props) => props.theme.colors.silver};
	margin-left: 8px;
`;

const LeverageSideContainer = styled(FlexDivRow)`
	padding: 4px 0px;
	margin-right: 4px;
`;

const LeverageSide = styled(Button)<{ side: PositionSide; isActive: boolean }>`
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
	border-radius: ${(props) =>
		props.side === PositionSide.LONG ? `2px 0px 0px 2px` : `0px 2px 2px 0px`};
	text-transform: uppercase;
	text-align: center;
	width: 75px;
`;

const SliderRow = styled(FlexDivRow)`
	margin-top: 8px;
`;

const StyledGasPriceSelect = styled(GasPriceSelect)`
	padding: 5px 0;
	display: flex;
	justify-content: space-between;
	width: auto;
	border-bottom: 1px solid ${(props) => props.theme.colors.navy};
	color: ${(props) => props.theme.colors.blueberry};
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.bold};
	text-transform: capitalize;
	margin-bottom: 8px;
`;

const StyledFeeRateSummary = styled(FeeRateSummary)`
	padding: 5px 0;
	display: flex;
	justify-content: space-between;
	width: auto;
	border-bottom: 1px solid ${(props) => props.theme.colors.navy};
	color: ${(props) => props.theme.colors.blueberry};
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.bold};
	text-transform: capitalize;
	margin-bottom: 8px;
`;

const StyledFeeCostSummary = styled(FeeCostSummary)`
	padding: 5px 0;
	display: flex;
	justify-content: space-between;
	width: auto;
	border-bottom: 1px solid ${(props) => props.theme.colors.navy};
	color: ${(props) => props.theme.colors.blueberry};
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.bold};
	text-transform: capitalize;
	margin-bottom: 8px;
`;

const StyledSlippageSelcet = styled(SlippageSelect)`
	padding: 5px 0;
	display: flex;
	justify-content: space-between;
	width: auto;
	border-bottom: 1px solid ${(props) => props.theme.colors.navy};
	color: ${(props) => props.theme.colors.blueberry};
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.bold};
	text-transform: capitalize;
	margin-bottom: 24px;
`;

const Divider = styled.hr`
	border: 1px solid ${(props) => props.theme.colors.vampire};
	margin: 24px -32px;
`;

const StyledCard = styled(Card)`
	background: ${(props) => props.theme.colors.navy};
	padding: 20px;
	margin-bottom: 24px;
`;

const AvailableMargin = styled.div`
	color: ${(props) => props.theme.colors.silver};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 12px;
	text-transform: capitalize;
`;

const MarginBalance = styled.div`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 16px;
`;

const AvailableBalanceLabel = styled.div`
	color: ${(props) => props.theme.colors.blueberry};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 12px;
	text-transform: capitalize;
`;

const AvailableBalanceValue = styled.div`
	color: ${(props) => props.theme.colors.blueberry};
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 12px;
	text-transform: capitalize;
`;

const TopRow = styled(FlexDivCol)``;

const BottomRow = styled(FlexDivCol)``;

const Panel = styled(FlexDivCol)`
	height: 100%;
	justify-content: space-between;
	padding-bottom: 48px;
`;
