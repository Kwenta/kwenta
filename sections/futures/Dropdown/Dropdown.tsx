import React from 'react';
import styled from 'styled-components';

const Dropdown: React.FC = () => {
	return <DropdownButton></DropdownButton>;
};

const DropdownButton = styled.button`
	padding: 12px 24px 12px 14px;
	border-radius: 16px;
	background: linear-gradient(180deg, #39332d 0%, #2d2a28 100%);
	height: 55px;
`;

export default Dropdown;
