import { ChartType } from 'constants/chartType';
import React, { FC } from 'react';
import styled from 'styled-components';
import { ResetButton } from 'styles/common';
import { Svg } from 'react-optimized-image';
import AreaIcon from 'assets/svg/app/area.svg';
import CandlesticksIcon from 'assets/svg/app/candlesticks.svg';

type ChartTypeToggleProps = {
	chartTypes: Array<ChartType>;
	selectedChartType: string;
	setSelectedChartType: Function;
	alignRight?: boolean;
};

const ChartTypeToggle: FC<ChartTypeToggleProps> = ({
	chartTypes,
	selectedChartType,
	setSelectedChartType,
	alignRight,
}) => {
	return (
		<Segment alignRight={!alignRight}>
			{chartTypes.map((chartType) => (
				<Button key={chartType} onClick={() => setSelectedChartType(chartType)}>
					{chartType === ChartType.AREA ? (
						<StyledSvg src={AreaIcon} isActive={chartType === selectedChartType} />
					) : (
						<StyledSvg src={CandlesticksIcon} isActive={chartType === selectedChartType} />
					)}
				</Button>
			))}
		</Segment>
	);
};

const Segment = styled.div<{ alignRight?: boolean }>`
	position: absolute;
	top: 36px;
	${(props) => (props.alignRight ? `right: 64px;` : 'left: 2px;')}
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

const StyledSvg = styled(Svg)<{ isActive: boolean }>`
	filter: ${(props) =>
		!props.isActive &&
		'invert(58%) sepia(9%) saturate(1019%) hue-rotate(203deg) brightness(95%) contrast(88%)'};
`;

export default ChartTypeToggle;
