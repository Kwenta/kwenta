import { FC } from 'react';
import styled from 'styled-components';

import Button from 'components/Button';
import useStatsData, { StatsTimeframe } from 'hooks/useStatsData';

const Container = styled.div`
	display: flex;
	justify-content: end;
	gap: 4px;
`;

const StyledBtn = styled(Button)`
	width: 40px;
	height: 24px;
	border: 0.669444px solid rgba(255, 255, 255, 0.1);
	border-color: ${(props) =>
		props.isActive ? props.theme.colors.common.primaryGold : 'rgba(255, 255, 255, 0.1)'};
	border-radius: 7px;
	box-shadow: 0px 1.33889px 1.33889px rgba(0, 0, 0, 0.25),
		inset 0px 0px 13.3889px rgba(255, 255, 255, 0.03);
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 11px;
	text-align: center;
	text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.5);
	padding: 0;

	&:hover,
	&:active {
		border-color: ${(props) => props.theme.colors.common.primaryGold};
	}

	&:before {
		content: unset;
	}
`;

const TIMEFRAMES: StatsTimeframe[] = ['1M', '1Y', 'MAX'];

export const TimeframeSwitcher: FC = () => {
	const { selectedTimeframe, setSelectedTimeframe } = useStatsData();
	return (
		<Container>
			{TIMEFRAMES.map((timeframe) => (
				<StyledBtn
					onClick={() => {
						setSelectedTimeframe(timeframe);
					}}
					isActive={selectedTimeframe === timeframe}
				>
					{timeframe}
				</StyledBtn>
			))}
		</Container>
	);
};
