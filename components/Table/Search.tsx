import { memo, ChangeEvent, FC, useCallback } from 'react';
import styled from 'styled-components';

import SearchIconPath from 'assets/svg/app/search.svg';
import Input from 'components/Input/Input';
import media from 'styles/media';

type SearchProps = {
	value: string | undefined;
	onChange: (text: string) => void;
	disabled: boolean;
};

const Search: FC<SearchProps> = memo(({ value, onChange, disabled }) => {
	const handleOnChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			onChange(event.target.value);
		},
		[onChange]
	);

	return (
		<SearchBar>
			<StyledSvg />
			<SearchInput
				value={value}
				onChange={handleOnChange}
				placeholder="Search..."
				disabled={disabled}
			/>
		</SearchBar>
	);
});

const StyledSvg = styled(SearchIconPath)`
	position: absolute;
	left: 12px;
`;

const SearchInput = styled(Input).attrs({ type: 'search' })`
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

export default Search;
