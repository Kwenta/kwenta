import styled from 'styled-components';

import media from 'styles/media';

import { Heading, Description } from './common';
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

const SplitContainer = styled.div`
	margin-top: 10px;

	${media.greaterThan('mdUp')`
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-gap: 15px;
	`}

	${media.lessThan('mdUp')`
		& > div:first-child {
			margin-bottom: 15px;
		}
	`}
`;

export default StepTwo;
