import { FC, useState, useMemo, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';

import { CurrencyKey, Synths } from 'constants/currency';
import { Period, PERIOD_LABELS_MAP, PERIOD_LABELS } from 'constants/period';
import { ChartType } from 'constants/chartType';

import ChangePercent from 'components/ChangePercent';
import { FlexDivRowCentered, NoTextTransform, AbsoluteCenteredDiv } from 'styles/common';
import { formatCurrency } from 'utils/formatters/number';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useMarketClosed from 'hooks/useMarketClosed';
import LoaderIcon from 'assets/svg/app/loader.svg';

import CandlesticksChart from './Types/CandlesticksChart';
import AreaChartData from './Types/AreaChart';

import ChartTypeToggle from './common/ChartTypeTextsToggle';
import OverlayMessageContainer from './common/OverlayMessage';
import CurrencyPricePlaceHolder from './common/CurrencyPricePlaceHolder';

import {
	ChartData,
	CurrencyLabel,
	CurrencyPrice,
	Actions,
	PeriodSelector,
	ChartBody,
	StyledTextButton,
	NoData,
	OverlayMessage,
} from './common/styles';
import { Side } from 'sections/exchange/TradeCard/types';
import useAreaChartData from './hooks/useAreaChartData';
import useCandleSticksChartData from './hooks/useCandleSticksChartData';

type ChartCardProps = {
	side: Side;
	currencyKey: CurrencyKey | null;
	priceRate: number | null;
	className?: string;
	openAfterHoursModalCallback?: () => void;
	alignRight?: boolean;

	selectedChartPeriod: Period;
	setSelectedChartPeriod: (p: Period) => void;
	selectedChartType: ChartType;
	setSelectedChartType: (c: ChartType) => void;
};

const ChartCard: FC<ChartCardProps> = ({
	side,
	currencyKey,
	priceRate,
	openAfterHoursModalCallback,
	alignRight,

	selectedChartPeriod,
	setSelectedChartPeriod,
	selectedChartType,
	setSelectedChartType,

	...rest
}) => {
	const { t } = useTranslation();

	const selectedChartPeriodLabel = useMemo(() => PERIOD_LABELS_MAP[selectedChartPeriod], [
		selectedChartPeriod,
	]);

	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();
	const { isMarketClosed, marketClosureReason } = useMarketClosed(currencyKey);

	const {
		noData: noAreaChartData,
		isLoading: isLoadingAreaChartData,
		change,
		rates,
	} = useAreaChartData({ currencyKey, selectedChartPeriodLabel });
	const {
		noData: noCandleSticksChartData,
		isLoading: isLoadingCandleSticksChartData,
		data: candleSticksChartData,
	} = useCandleSticksChartData({ currencyKey, selectedChartPeriodLabel });

	const [currentPrice, setCurrentPrice] = useState<number | null>(null);
	const price = currentPrice || priceRate;

	const showOverlayMessage = isMarketClosed;
	const showLoader = isLoadingAreaChartData || isLoadingCandleSticksChartData;
	const disabledInteraction = showLoader || showOverlayMessage;
	const isSUSD = currencyKey === Synths.sUSD;

	const isAreaChart = useMemo(() => selectedChartType === ChartType.AREA, [selectedChartType]);
	const isCandleStickChart = useMemo(() => selectedChartType === ChartType.CANDLESTICK, [
		selectedChartType,
	]);

	const noData =
		(isAreaChart && noAreaChartData && !isSUSD) ||
		(isCandleStickChart && noCandleSticksChartData && !isSUSD);

	const computedRates = useMemo(() => {
		return rates.map(({ timestamp, rate }: { timestamp: number; rate: number }) => ({
			timestamp,
			value: !selectPriceCurrencyRate ? rate : rate / selectPriceCurrencyRate,
		}));
	}, [rates, selectPriceCurrencyRate]);

	useEffect(() => {
		if (isCandleStickChart) {
			if (isSUSD) {
				// candlesticks type is only available on monthly view
				setSelectedChartType(ChartType.AREA);
			} else if (selectedChartPeriod !== Period.ONE_MONTH) {
				// candlesticks type is only available on monthly view
				setSelectedChartPeriod(Period.ONE_MONTH);
			}
		} // eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isSUSD, isCandleStickChart, selectedChartType, selectedChartPeriod]);

	return (
		<Container {...rest}>
			<ChartHeader>
				<ChartHeaderTop
					{...{
						alignRight,
					}}
				>
					{!currencyKey ? (
						<CurrencyPricePlaceHolder />
					) : (
						<>
							<CurrencyLabel>
								<Trans
									i18nKey="common.currency.currency-price"
									values={{ currencyKey }}
									components={[<NoTextTransform />]}
								/>
							</CurrencyLabel>
							{price != null && (
								<CurrencyPrice>
									{formatCurrency(selectedPriceCurrency.name, price, {
										sign: selectedPriceCurrency.sign,
										// @TODO: each currency key should specify how many decimals to show
										minDecimals:
											currencyKey === ('sKRW' as CurrencyKey) || currencyKey === Synths.sJPY
												? 4
												: 2,
									})}
								</CurrencyPrice>
							)}
							{change != null && <ChangePercent value={change} />}
						</>
					)}
				</ChartHeaderTop>
				{!isMarketClosed && (
					<Actions reverseChildren={alignRight}>
						<PeriodSelector>
							{PERIOD_LABELS.map((period) => (
								<StyledTextButton
									key={period.period}
									isActive={period.period === selectedChartPeriod}
									onClick={(event) => {
										if (isCandleStickChart && period.period !== Period.ONE_MONTH) {
											setSelectedChartType(ChartType.AREA);
										}
										setSelectedChartPeriod(period.period);
									}}
								>
									{t(period.i18nLabel)}
								</StyledTextButton>
							))}
						</PeriodSelector>
						{isSUSD ? null : (
							<ChartTypeToggle
								chartTypes={[ChartType.AREA, ChartType.CANDLESTICK]}
								{...{
									selectedChartType,
									setSelectedChartType,
									selectedChartPeriod,
									setSelectedChartPeriod,
								}}
							/>
						)}
					</Actions>
				)}
			</ChartHeader>
			<ChartBody>
				<ChartData disabledInteraction={disabledInteraction}>
					{isAreaChart ? (
						<AreaChartData
							{...{
								selectedChartPeriodLabel,
								change,
								side,
								setCurrentPrice,
							}}
							data={computedRates}
							noData={!isSUSD && noAreaChartData}
							{...(isSUSD ? { yAxisDomain: ['dataMax', 'dataMax'] } : {})}
							yAxisTickFormatter={(val: number) =>
								formatCurrency(selectedPriceCurrency.name, val, {
									sign: selectedPriceCurrency.sign,
								})
							}
							tooltipPriceFormatter={(n: number) =>
								formatCurrency(selectedPriceCurrency.name, n, {
									sign: selectedPriceCurrency.sign,
								})
							}
							linearGradientId={`price-chart-card-area-${currencyKey}`}
						/>
					) : (
						<CandlesticksChart
							data={candleSticksChartData}
							{...{ selectedChartPeriodLabel, selectedPriceCurrency }}
						/>
					)}
				</ChartData>
				<AbsoluteCenteredDiv>
					{showOverlayMessage ? (
						<OverlayMessage>
							<OverlayMessageContainer
								{...{
									marketClosureReason,
									currencyKey: currencyKey!,
									openAfterHoursModalCallback,
								}}
							/>
						</OverlayMessage>
					) : showLoader ? (
						<Svg src={LoaderIcon} />
					) : noData ? (
						<NoData>{t('exchange.price-chart-card.no-data')}</NoData>
					) : undefined}
				</AbsoluteCenteredDiv>
			</ChartBody>
		</Container>
	);
};

const Container = styled.div`
	width: 100%;
	position: relative;
`;

const ChartHeader = styled.div`
	display: block;
	padding-bottom: 12px;
	position: relative;
	top: 6px;
`;

const ChartHeaderTop = styled(FlexDivRowCentered)<{ alignRight?: boolean }>`
	border-bottom: 1px solid #171a1d;
	justify-content: ${(props) => (props.alignRight ? 'flex-end' : 'flex-start')};
	padding-bottom: 5px;
	grid-gap: 20px;
`;

export default ChartCard;
