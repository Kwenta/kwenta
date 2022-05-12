import React, { FC } from 'react';
import styled from 'styled-components';

import AreaIcon from 'assets/svg/app/area.svg';
import CandlesticksIcon from 'assets/svg/app/candlesticks.svg';

import { ResetButton } from 'styles/common';

import { ChartType } from 'constants/chartType';
import { Period } from 'constants/period';

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
	return (
		<Segment>
			{chartTypes.map((chartType) => (
				<Button
					key={chartType}
					onClick={() => {
						if (chartType === ChartType.CANDLESTICK) {
							setSelectedChartPeriod(Period.ONE_MONTH);
						}
						setSelectedChartType(chartType);
					}}
				>
					{chartType === ChartType.AREA ? (
						<StyledAreaIcon isActive={chartType === selectedChartType} />
					) : (
						<StyledCandlesticksIcon isActive={chartType === selectedChartType} />
					)}
				</Button>
			))}
		</Segment>
	);
};

const Segment = styled.div`
	z-index: 1;
	background: ${(props) => props.theme.colors.navy};
	border-radius: 50px;
	padding: 3px;
`;

const Button = styled(ResetButton)`
	background: ${(props) => props.theme.colors.navy};
	color: white;
	padding: 3px 6px;
	&:hover {
		cursor: pointer;
	}
	&:first-child {
		border-radius: 50px 0 0 50px;
	}
	&:not(:first-child) {
		border-left: 1px solid rgba(139, 138, 176, 30%);
	}
	&:last-child {
		border-radius: 0 50px 50px 0;
	}
`;

interface SvgStyledProps {
	className?: string;
	isActive: boolean;
}

const StyledAreaIcon = styled(({ isActive, ...props }) => <AreaIcon {...props} />)<SvgStyledProps>`
	filter: ${(props) =>
		!props.isActive &&
		'invert(58%) sepia(9%) saturate(1019%) hue-rotate(203deg) brightness(95%) contrast(88%)'};
`;

const StyledCandlesticksIcon = styled(({ isActive, ...props }) => <CandlesticksIcon {...props} />)<
	SvgStyledProps
>`
	filter: ${(props) =>
		!props.isActive &&
		'invert(58%) sepia(9%) saturate(1019%) hue-rotate(203deg) brightness(95%) contrast(88%)'};
`;

export default ChartTypeToggle;
