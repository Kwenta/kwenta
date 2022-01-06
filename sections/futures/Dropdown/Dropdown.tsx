import React from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import dropdownArrow from 'assets/svg/futures/dropdown-arrow.svg';

const Dropdown: React.FC = ({ children }) => (
	<DropdownButton>
		{children}
		<Svg src={dropdownArrow} />
	</DropdownButton>
);

const DropdownButton = styled.button`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 24px 12px 14px;
	border-radius: 16px;
	background: linear-gradient(180deg, #39332d 0%, #2d2a28 100%);
	height: 55px;
`;

export default Dropdown;
