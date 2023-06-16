import styled from 'styled-components';

import media from 'styles/media';

import EscrowTable from './EscrowTable';
import EscrowInputCard from './InputCards/EscrowInputCard';

const EscrowTab = () => {
	return (
		<EscrowTabContainer>
			<EscrowTable />
			<EscrowInputCard />
		</EscrowTabContainer>
	);
};

const EscrowTabContainer = styled.div`
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

export default EscrowTab;
