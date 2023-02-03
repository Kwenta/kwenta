import styled from 'styled-components';

import { SplitContainer } from 'components/layout/grid';
import { Heading, Description } from 'sections/earn/text';

import EarnStakeCard from './EarnStakeCard';
import StakeGrid from './StakeGrid';

const StepTwo = () => {
	return (
		<StepTwoContainer>
			<Heading>Step 2: Stake the pool tokens</Heading>
			<Description>Stake your pool tokens</Description>
			<SplitContainer>
				<EarnStakeCard />
				<StakeGrid />
			</SplitContainer>
		</StepTwoContainer>
	);
};

const StepTwoContainer = styled.div`
	margin-bottom: 50px;
`;

export default StepTwo;
