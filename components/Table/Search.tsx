import React, { ChangeEvent } from 'react';
import styled from 'styled-components';

import SearchIconPath from 'assets/svg/app/search.svg';
import SearchInput from 'components/Input/SearchInput';
import media from 'styles/media';

type Props = {
	value: string | undefined;
	onChange: (text: string) => any;
	disabled: boolean;
};

export default function Search({ value, onChange, disabled }: Props) {
	const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
		onChange(event.target.value);
	};
	return (
		<SearchBar>
			<StyledSvg />
			<StyledSearchInput
				value={value}
				onChange={handleOnChange}
				placeholder="Search..."
				disabled={disabled}
			/>
		</SearchBar>
	);
}

const StyledSvg = styled(SearchIconPath)`
	position: absolute;
	left: 12px;
`;

const StyledSearchInput = styled(SearchInput)`
	position: relative;
	height: 100%;
	text-indent: 16px;
	border-radius: 8px;
	padding: 10px 15px;

	${media.lessThan('sm')`
		font-size: 13px;
	`}
`;

const SearchBar = styled.div`
	width: 100%;
	overflow-x: auto;
	position: relative;
	display: flex;
	align-items: center;
`;
