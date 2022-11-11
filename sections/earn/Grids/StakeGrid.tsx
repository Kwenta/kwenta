import styled from 'styled-components';

import useRewardsTimer from 'hooks/useRewardsTimer';

import { InfoGridContainer, Column, SplitColumn } from '../common';
import GridData from './GridData';
import LiquidityCard from './LiquidityCard';

const DEADLINE = new Date('2022-03-20T23:59:59Z');

const StakeGrid = () => {
	const timeTillDeadline = useRewardsTimer(DEADLINE);

	return (
		<StyledGridContainer>
			<Column>
				<LiquidityCard />
			</Column>
			<SplitColumn>
				<GridData title="Yield / $1K / Day" value="28.12" hasKwentaLogo />
				<GridData title="Your Rewards" value="734.72" hasKwentaLogo />
			</SplitColumn>
			<SplitColumn>
				<GridData title="Time Remaining" value={timeTillDeadline} />
				<GridData title="Last Snapshot" value="2H Ago" />
			</SplitColumn>
		</StyledGridContainer>
	);
};

const StyledGridContainer = styled(InfoGridContainer)`
	margin-bottom: 40px;
`;

export default StakeGrid;
