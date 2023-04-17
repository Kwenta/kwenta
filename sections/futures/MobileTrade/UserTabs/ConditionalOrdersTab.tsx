import styled from 'styled-components';

import ConditionalOrdersTable from 'sections/futures/UserInfo/ConditionalOrdersTable';

const ConditionalOrdersTab: React.FC = () => {
	return (
		<Container>
			<TableContainer>
				<ConditionalOrdersTable />
			</TableContainer>
		</Container>
	);
};

const Container = styled.div`
	width: 100%;
	overflow: scroll;
`;

const TableContainer = styled.div`
	width: 1000px;
`;

export default ConditionalOrdersTab;
