import React, { ChangeEvent } from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';

import SearchInput from 'components/Input/SearchInput';
import SearchIconPath from 'assets/svg/app/search.svg';

type Props = {
	onChange: (text: string) => any;
	disabled: boolean;
};

export default function Search({ onChange, disabled }: Props) {
	const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
		onChange(event.target.value);
	};
	return (
		<SearchBar>
			<StyledSvg src={SearchIconPath} />
			<StyledSearchInput onChange={handleOnChange} placeholder="Search..." disabled={disabled} />
		</SearchBar>
	);
}

const StyledSvg = styled(Svg)`
	position: absolute;
	left: 12px;
`;

const StyledSearchInput = styled(SearchInput)`
	position: relative;
	height: 100%;
	text-indent: 16px;
	border-radius: 8px;
`;

const SearchBar = styled.div`
	width: 100%;
	overflow-x: auto;
	position: relative;
	display: flex;
	align-items: center;
`;
