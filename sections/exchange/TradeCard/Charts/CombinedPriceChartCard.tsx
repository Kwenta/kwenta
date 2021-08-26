import { FC, useState, useMemo, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';

import LoaderIcon from 'assets/svg/app/loader.svg';
import { CurrencyKey, Synths } from 'constants/currency';
import { Period, PERIOD_LABELS_MAP, PERIOD_LABELS } from 'constants/period';
import { ChartType } from 'constants/chartType';
import ChangePercent from 'components/ChangePercent';
import {
	FlexDivRowCentered,
	NoTextTransform,
	AbsoluteCenteredDiv,
	FlexDiv,
	FlexDivCol,
} from 'styles/common';
import { formatNumber } from 'utils/formatters/number';
import useMarketClosed from 'hooks/useMarketClosed';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useCombinedCandleSticksChartData from 'sections/exchange/TradeCard/Charts/hooks/useCombinedCandleSticksChartData';
import useCombinedRates from 'sections/exchange/TradeCard/Charts/hooks/useCombinedRates';
import { DesktopOnlyView, MobileOnlyView } from 'components/Media';

import {
	ChartData,
	CurrencyLabel,
	CurrencyPrice,
	Actions,
	ChartBody,
	StyledTextButton,
	OverlayMessage,
	NoData,
	PeriodSelector,
} from './common/styles';
import OverlayMessageContainer from './common/OverlayMessage';
import CurrencyPricePlaceHolder from './common/CurrencyPricePlaceHolder';
import CurrencyLabelsWithDots from './common/CurrencyLabelsWithDots';
import ChartTypeToggle from './common/ChartTypeTextsToggle';
import AreaChart from './Types/AreaChart';
import CompareChart from './Types/CompareChart';
import CandlesticksChart from './Types/CandlesticksChart';

type CombinedPriceChartCardProps = {
	baseCurrencyKey: CurrencyKey | null;
	quoteCurrencyKey: CurrencyKey | null;
	basePriceRate: number | null;
	quotePriceRate: number | null;
	className?: string;
	openAfterHoursModalCallback?: () => void;
	selectedChartPeriod: Period;
	setSelectedChartPeriod: (p: Period) => void;
	selectedChartType: ChartType;
	setSelectedChartType: (c: ChartType) => void;
};

const CombinedPriceChartCard: FC<CombinedPriceChartCardProps> = ({
	baseCurrencyKey,
	quoteCurrencyKey,
	basePriceRate,
	quotePriceRate,
	openAfterHoursModalCallback,
	selectedChartPeriod,
	setSelectedChartPeriod,
	selectedChartType,
	setSelectedChartType,
	...rest
}) => {
	const { t } = useTranslation();

	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const selectedChartPeriodLabel = useMemo(() => PERIOD_LABELS_MAP[selectedChartPeriod], [
		selectedChartPeriod,
	]);

	const {
		data: areaChartData,
		noData: noAreaChartData,
		change,
		isLoadingRates: isLoadingAreaData,
	} = useCombinedRates({
		baseCurrencyKey,
		quoteCurrencyKey,
		selectedChartPeriodLabel,
	});
	const {
		noData: noCandleSticksChartData,
		isLoading: isLoadingCandleSticksChartData,
		data: candleSticksChartData,
	} = useCombinedCandleSticksChartData({
		baseCurrencyKey,
		quoteCurrencyKey,
		selectedChartPeriodLabel,
	});
	const {
		isMarketClosed: isBaseMarketClosed,
		marketClosureReason: baseMarketClosureReason,
	} = useMarketClosed(baseCurrencyKey);
	const {
		isMarketClosed: isQuoteMarketClosed,
		marketClosureReason: quoteMarketClosureReason,
	} = useMarketClosed(quoteCurrencyKey);

	const isMarketClosed = isBaseMarketClosed || isQuoteMarketClosed;

	const [currentPrice, setCurrentPrice] = useState<number | null>(null);
	const price = currentPrice || (basePriceRate ?? 1) / (quotePriceRate! || 1);

	const eitherCurrencyIsSUSD = useMemo(
		() => baseCurrencyKey === Synths.sUSD || quoteCurrencyKey === Synths.sUSD,
		[baseCurrencyKey, quoteCurrencyKey]
	);

	const showOverlayMessage = isMarketClosed;
	const showLoader = isLoadingAreaData || isLoadingCandleSticksChartData;
	const disabledInteraction = showLoader || showOverlayMessage;

	const isCompareChart = useMemo(() => selectedChartType === ChartType.COMPARE, [
		selectedChartType,
	]);
	const isAreaChart = useMemo(() => selectedChartType === ChartType.AREA, [selectedChartType]);
	const isCandleStickChart = useMemo(() => selectedChartType === ChartType.CANDLESTICK, [
		selectedChartType,
	]);

	const noData =
		(isCandleStickChart && noCandleSticksChartData) || (isAreaChart && noAreaChartData);

	useEffect(() => {
		if (eitherCurrencyIsSUSD && isCompareChart) {
			// cannot use compare chart if either is susd
			setSelectedChartType(ChartType.AREA);
		}
		if (isCandleStickChart && selectedChartPeriod !== Period.ONE_MONTH) {
			// candlesticks type is only available on monthly view
			setSelectedChartPeriod(Period.ONE_MONTH);
		} // eslint-disable-next-line react-hooks/exhaustive-deps
	}, [eitherCurrencyIsSUSD, isCompareChart, isCandleStickChart, selectedChartPeriod]);

	return (
		<Container {...rest}>
			<ChartHeader>
				<ChartHeaderInner>
					{!(baseCurrencyKey && quoteCurrencyKey) ? (
						<CurrencyPricePlaceHolder />
					) : isCompareChart ? (
						<CurrencyLabelsWithDots {...{ baseCurrencyKey, quoteCurrencyKey }} />
					) : (
						<>
							<FlexDiv>
								<DesktopOnlyView>
									<CurrencyLabel>
										<Trans
											i18nKey="common.currency.currency-price"
											values={{ currencyKey: `${baseCurrencyKey}/${quoteCurrencyKey}` }}
											components={[<NoTextTransform />]}
										/>
									</CurrencyLabel>
								</DesktopOnlyView>
								<MobileOnlyView>
									<CurrencyLabel>{`${baseCurrencyKey}/${quoteCurrencyKey}`}</CurrencyLabel>
								</MobileOnlyView>
							</FlexDiv>
							{price != null && (
								<FlexDiv>
									<CurrencyPrice>
										{formatNumber(price, {
											minDecimals: getMinNoOfDecimals(price),
										})}
									</CurrencyPrice>
								</FlexDiv>
							)}
							{change != null && <ChangePercent value={change} />}
						</>
					)}
				</ChartHeaderInner>
				{!isMarketClosed && (
					<Actions>
						<ChartTypeToggle
							chartTypes={[ChartType.COMPARE, ChartType.AREA, ChartType.CANDLESTICK]}
							itemIsDisabled={(chartType: ChartType) =>
								eitherCurrencyIsSUSD && chartType === ChartType.COMPARE
							}
							{...{
								selectedChartType,
								setSelectedChartType,
								selectedChartPeriod,
								setSelectedChartPeriod,
							}}
						/>

						<PeriodSelector>
							{PERIOD_LABELS.map((period) => (
								<StyledTextButton
									key={period.period}
									isActive={period.period === selectedChartPeriod}
									onClick={() => {
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
					</Actions>
				)}
			</ChartHeader>
			<ChartBody>
				<ChartData disabledInteraction={disabledInteraction}>
					{isCompareChart ? (
						<CompareChart {...{ baseCurrencyKey, quoteCurrencyKey, selectedChartPeriodLabel }} />
					) : isCandleStickChart ? (
						<CandlesticksChart
							{...{ selectedChartPeriodLabel, selectedPriceCurrency }}
							data={candleSticksChartData}
							noData={noCandleSticksChartData}
							tooltipPriceFormatter={(n: number) =>
								formatNumber(n, {
									minDecimals: getMinNoOfDecimals(n),
								})
							}
						/>
					) : (
						<AreaChart
							{...{
								selectedChartPeriodLabel,
								change,
								setCurrentPrice,
							}}
							data={areaChartData}
							noData={noAreaChartData}
							yAxisTickFormatter={(val: number) =>
								formatNumber(val, {
									minDecimals: getMinNoOfDecimals(val),
								})
							}
							tooltipPriceFormatter={(n: number) =>
								formatNumber(n, {
									minDecimals: getMinNoOfDecimals(n),
								})
							}
							linearGradientId={`price-chart-card-area-${baseCurrencyKey}-${quoteCurrencyKey}`}
						/>
					)}
				</ChartData>

				<AbsoluteCenteredDiv>
					{showOverlayMessage ? (
						<OverlayMessage>
							{isBaseMarketClosed && isQuoteMarketClosed ? (
								<BothMarketsClosedOverlayMessageContainer>
									<BothMarketsClosedOverlayMessageItem>
										<OverlayMessageContainer
											{...{
												marketClosureReason: quoteMarketClosureReason,
												currencyKey: quoteCurrencyKey!,
												openAfterHoursModalCallback,
											}}
										/>
									</BothMarketsClosedOverlayMessageItem>
									<BothMarketsClosedOverlayMessageItem>
										<OverlayMessageContainer
											{...{
												marketClosureReason: baseMarketClosureReason,
												currencyKey: baseCurrencyKey!,
												openAfterHoursModalCallback,
											}}
										/>
									</BothMarketsClosedOverlayMessageItem>
								</BothMarketsClosedOverlayMessageContainer>
							) : isBaseMarketClosed ? (
								<OverlayMessageContainer
									{...{
										marketClosureReason: baseMarketClosureReason,
										currencyKey: baseCurrencyKey!,
										openAfterHoursModalCallback,
									}}
								/>
							) : (
								<OverlayMessageContainer
									{...{
										marketClosureReason: quoteMarketClosureReason,
										currencyKey: quoteCurrencyKey!,
										openAfterHoursModalCallback,
									}}
								/>
							)}
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

function getMinNoOfDecimals(value: number): number {
	let decimals = 2;
	if (value < 1) {
		const [, afterDecimal] = value.toString().split('.'); // todo
		if (afterDecimal) {
			for (let i = 0; i < afterDecimal.length; i++) {
				const n = afterDecimal[i];
				if (parseInt(n) !== 0) {
					decimals = i + 3;
					break;
				}
			}
		}
	}
	return decimals;
}

const Container = styled.div`
	position: relative;
`;

const ChartHeader = styled(FlexDivRowCentered)`
	border-bottom: 1px solid #171a1d;
	padding-bottom: 5px;
`;

const BothMarketsClosedOverlayMessageContainer = styled(FlexDiv)`
	justify-content: space-around;
	grid-gap: 3rem;
`;

const BothMarketsClosedOverlayMessageItem = styled(FlexDivCol)`
	align-items: center;
`;

const ChartHeaderInner = styled(FlexDivRowCentered)`
	grid-gap: 20px;
`;

export default CombinedPriceChartCard;
