import React, { ChangeEvent } from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';

import SearchInput from 'components/Input/SearchInput';
import SearchIconPath from 'assets/svg/app/search.svg';

type Props = {
	onChange: (text: string) => any;
};

export default function Search({ onChange }: Props) {
	const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
		onChange(event.target.value);
	};
	return (
		<SearchBar>
			<Svg src={SearchIconPath} />
			<SearchInput onChange={handleOnChange} placeholder="Search" />
		</SearchBar>
	);
}

const SearchBar = styled.div`
	width: 100%;
	height: 100%;
	overflow-x: auto;
	position: relative;
	border: 1px solid ${(props) => props.theme.colors.navy};
	border-radius: 4px;
	padding: 5px 18px;
	display: flex;
	align-items: center;
`;
