import styled from 'styled-components';

import media from 'styles/media';

import EscrowTable from './EscrowTable';
import StakingInputCard from './StakingInputCard';

const EscrowTab = () => {
	return (
		<EscrowTabContainer>
			<EscrowTable />
			<StakingInputCard inputLabel="eKWENTA" />
		</EscrowTabContainer>
	);
};

const EscrowTabContainer = styled.div`
	${media.greaterThan('mdUp')`
		display: flex;

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

export default EscrowTab;
