import styled, { css } from 'styled-components'

import { isInvalidNumber } from 'utils/input'

type SplitSelectOptionInput = {
	type: 'input'
	value?: string
	onChange(value: string): void
}

type SplitSelectOptionButton<T> = {
	type: 'button'
	value: T
}

type SplitSelectProps<T extends string | number> = {
	selected: T | undefined
	options: (SplitSelectOptionButton<T> | SplitSelectOptionInput)[]
	onSelect(option?: T): void
	formatOption?: (option: T) => string
	disabled?: boolean
}

const SplitSelect = <T extends string | number>({
	selected,
	options,
	onSelect,
	formatOption,
	disabled,
}: SplitSelectProps<T>) => {
	return (
		<SplitSelectContainer $length={options.length}>
			{options.map((o) => {
				return o.type === 'button' ? (
					<SplitSelectButton
						key={`option-${o.value}`}
						onClick={() => onSelect(o.value)}
						disabled={disabled}
						$selected={selected === o.value}
					>
						{formatOption?.(o.value) ?? o.value}
					</SplitSelectButton>
				) : (
					<SplitSelectInput
						key="option-input"
						onChange={(e) => o.onChange(e.target.value)}
						disabled={disabled}
						placeholder="Custom"
						type="number"
						step="0.0001"
						onFocus={() => onSelect(undefined)}
						onBlur={(e) => {
							if (!e.target.value) {
								onSelect(options[0].value as T)
							}
						}}
						onKeyDown={(e) => {
							if (isInvalidNumber(e.key)) {
								e.preventDefault()
							}
						}}
					/>
				)
			})}
		</SplitSelectContainer>
	)
}

const SplitSelectInput = styled.input`
	background-color: transparent;
	border: none;
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.primary};
	text-align: center;
	width: 100%;

	&:focus {
		outline: none;
		&::placeholder {
			color: transparent;
		}
		background: ${(props) => props.theme.colors.selectedTheme.newTheme.button.default.background};
	}
`

const SplitSelectContainer = styled.div<{ $length: number }>`
	width: 100%;
	display: grid;
	grid-gap: 1px;
	border-radius: 8px;
	height: 26px;
	overflow: hidden;
	margin-bottom: 30px;

	${(props) => css`
		grid-template-columns: repeat(${props.$length}, 1fr);
		border: ${props.theme.colors.selectedTheme.border};
		background-color: ${props.theme.colors.selectedTheme.newTheme.exchange.ratioSelect.background};
	`}
`

const SplitSelectButton = styled.button<{ $selected: boolean }>`
	height: 100%;
	border: none;
	font-size: 13px;
	background-color: transparent;
	text-align: center;
	cursor: pointer;

	${(props) => css`
		font-family: ${props.theme.fonts.regular};
		color: ${props.theme.colors.selectedTheme.text.value};

		&:not(:last-child) {
			border-right: ${props.theme.colors.selectedTheme.border};
		}

		${props.$selected &&
		css`
			color: ${props.theme.colors.selectedTheme.white};
			background: ${props.theme.colors.selectedTheme.newTheme.button.default.background};
		`}
	`}
`

export default SplitSelect
