import { memo, ChangeEvent, FC, useCallback, useRef } from 'react'
import styled from 'styled-components'

import CrossIcon from 'assets/svg/app/close.svg'
import SearchIconPath from 'assets/svg/app/search.svg'
import Input from 'components/Input/Input'
import media from 'styles/media'

type SearchProps = {
	value: string | undefined
	disabled?: boolean
	border?: boolean
	autoFocus?: boolean
	onChange: (text: string) => void
	onClear?: () => void
}

const Search: FC<SearchProps> = memo(
	({ value, disabled, border = true, autoFocus, onChange, onClear }) => {
		const inputRef = useRef<HTMLInputElement>(null!)

		const handleOnChange = useCallback(
			(event: ChangeEvent<HTMLInputElement>) => {
				onChange(event.target.value)
			},
			[onChange]
		)

		const onKeyClear = useCallback(
			(event: React.KeyboardEvent<HTMLInputElement>) => {
				if (event.key === 'Escape') {
					onClear?.()
				}
			},
			[onClear]
		)

		return (
			<SearchBar border={border}>
				<SearchIconPath />
				<SearchInput
					autoFocus={autoFocus}
					border={border}
					value={value}
					onChange={handleOnChange}
					placeholder="Search..."
					disabled={disabled}
					onKeyDown={onKeyClear}
					ref={inputRef}
				/>
				<IconContainer
					onClick={() => {
						onClear?.()
						inputRef.current?.focus()
					}}
				>
					<CrossIcon width={10} height={10} />
				</IconContainer>
			</SearchBar>
		)
	}
)

const IconContainer = styled.div`
	padding-right: 20px;
	padding-top: 2px;
	cursor: pointer;
	:hover {
		opacity: 0.5;
	}
`
const SearchInput = styled(Input)<{ border: boolean }>`
	position: relative;
	height: 38px;
	border-radius: 8px;
	padding: 10px 15px;
	font-size: 14px;
	background: ${(props) =>
		props.border
			? props.theme.colors.selectedTheme.input.background
			: props.theme.colors.selectedTheme.newTheme.containers.primary.background};
	border: none;

	${media.lessThan('sm')`
		font-size: 13px;
	`}
`

const SearchBar = styled.div<{ border: boolean }>`
	width: 100%;
	overflow-x: auto;
	position: relative;
	display: flex;
	align-items: center;
	padding-left: 18px;
	background: ${(props) =>
		props.border
			? props.theme.colors.selectedTheme.input.background
			: props.theme.colors.selectedTheme.newTheme.containers.primary.background};
	border-radius: 8px;
	border: ${(props) => (props.border ? props.theme.colors.selectedTheme.input.border : 'none')};
`

export default Search
