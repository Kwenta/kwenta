import { useCallback } from 'react';
import styled, { css } from 'styled-components';

import { FlexDiv } from 'components/layout/flex';
import { setSelectedChart } from 'state/futures/reducer';
import { useAppSelector, useAppDispatch } from 'state/hooks';

const CHART_OPTIONS: ('price' | 'funding')[] = ['price', 'funding'];

const ChartToggle = () => {
	const dispatch = useAppDispatch();
	const selectedChart = useAppSelector(({ futures }) => futures.selectedChart);

	const handleChartChange = useCallback(
		(chart: 'price' | 'funding') => () => {
			dispatch(setSelectedChart(chart));
		},
		[dispatch]
	);

	return (
		<FlexDiv>
			{CHART_OPTIONS.map((value) => (
				<ToggleButton
					key={value}
					$active={selectedChart === value}
					onClick={handleChartChange(value)}
				>
					{value}
				</ToggleButton>
			))}
		</FlexDiv>
	);
};

const ToggleButton = styled.button<{ $active: boolean }>`
	font-size: 13px;
	font-family: ${(props) => props.theme.fonts.regular};
	cursor: pointer;
	padding: 3.5px 8px;
	display: flex;
	justify-content: center;
	align-items: center;
	text-transform: capitalize;

	&:last-of-type {
		margin-right: 8px;
	}

	${(props) =>
		props.$active &&
		css`
			height: 24px;
			background: ${props.theme.colors.selectedTheme.newTheme.pill.gray.background};
			border: 1px solid ${props.theme.colors.selectedTheme.newTheme.pill.gray.border};
			color: ${props.theme.colors.selectedTheme.text.value};
			border-radius: 50px;
		`}

	${(props) =>
		!props.$active &&
		css`
			background-color: transparent;
			border: 1px solid transparent;
			color: ${props.theme.colors.selectedTheme.newTheme.text.secondary};

			&:hover {
				color: ${props.theme.colors.selectedTheme.text.value};
			}
		`}
`;

export default ChartToggle;
