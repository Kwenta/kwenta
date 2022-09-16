import styled from 'styled-components';

import { StakingCard } from './common';

const StakingTab = () => {
	return (
		<StakingTabContainer>
			<StakingCard></StakingCard>
			<StakingCard></StakingCard>
		</StakingTabContainer>
	);
};

const StakingTabContainer = styled.div`
	width: 100%;
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-gap: 15px;
`;

export default StakingTab;
