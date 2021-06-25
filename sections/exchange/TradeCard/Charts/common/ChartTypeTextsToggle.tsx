import React, { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { ChartType } from 'constants/chartType';
import { Period } from 'constants/period';
import { FlexDiv } from 'styles/common';

type ChartTypeToggleProps = {
	chartTypes: Array<ChartType>;

	selectedChartType: ChartType;
	setSelectedChartType: Function;

	selectedChartPeriod: Period;
	setSelectedChartPeriod: Function;

	itemIsDisabled?: (c: ChartType) => boolean;
};

const ChartTypeToggle: FC<ChartTypeToggleProps> = ({
	chartTypes,

	selectedChartType,
	setSelectedChartType,

	selectedChartPeriod,
	setSelectedChartPeriod,

	itemIsDisabled,
}) => {
	const { t } = useTranslation();
	return (
		<CompareRatioToggleContainer>
			<CompareRatioToggle>
				{chartTypes.map((chartType) =>
					itemIsDisabled?.(chartType) ?? false ? null : (
						<CompareRatioToggleType
							key={chartType}
							onClick={() => {
								if (chartType === ChartType.CANDLESTICK) {
									setSelectedChartPeriod(Period.ONE_MONTH);
								}
								setSelectedChartType(chartType);
							}}
							isActive={selectedChartType === chartType}
						>
							{chartType === ChartType.COMPARE
								? t('common.chart-types.compare')
								: chartType === ChartType.AREA
								? t('common.chart-types.ratio')
								: t('common.chart-types.candlesticks')}
						</CompareRatioToggleType>
					)
				)}
			</CompareRatioToggle>
		</CompareRatioToggleContainer>
	);
};

export const CompareRatioToggleContainer = styled(FlexDiv)`
	flex-direction: column;
	justify-content: center;
`;

export const CompareRatioToggle = styled(FlexDiv)`
	grid-gap: 4px;
`;

export const CompareRatioToggleType = styled.div<{ isActive: boolean }>`
	cursor: pointer;
	font-weight: bold;
	border-bottom: 2px solid ${(props) => (props.isActive ? '#b68b58' : 'transparent')};
	color: ${(props) => (props.isActive ? props.theme.colors.white : 'inherit')};
	text-transform: uppercase;
`;

export default ChartTypeToggle;
