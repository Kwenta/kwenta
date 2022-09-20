import React from 'react';
import styled from 'styled-components';

const EscrowTab = () => {
	return <EscrowTabContainer></EscrowTabContainer>;
};

const EscrowTabContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-gap: 15px;
`;

export default EscrowTab;
