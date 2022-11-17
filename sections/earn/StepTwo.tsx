import styled from 'styled-components';

import media from 'styles/media';

import { Heading, Description } from './common';

const StepTwo = () => {
	return (
		<div>
			<Heading>Step 2: Stake the pool tokens</Heading>
			<Description>Stake your pool tokens</Description>
			<SplitContainer></SplitContainer>
		</div>
	);
};

const SplitContainer = styled.div`
	${media.greaterThan('mdUp')`
		display: grid;
		grid-template-columns: 1fr 1fr;
		& > div {
			flex: 1;

			&:first-child {
				margin-right: 15px;
			}
		}
	`}

	${media.lessThan('mdUp')`
		& > div:first-child {
			margin-bottom: 15px;
		}
	`}
`;

export default StepTwo;
