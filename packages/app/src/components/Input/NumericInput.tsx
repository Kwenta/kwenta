import { FC, memo, useCallback } from 'react'
import styled, { css } from 'styled-components'

import Spacer from 'components/Spacer'
import { isInvalidNumber } from 'utils/input'

type NumericInputProps = Omit<
	React.InputHTMLAttributes<HTMLInputElement>,
	'onChange' | 'maxLength'
> & {
	value: string
	onChange: (e: React.ChangeEvent<HTMLInputElement>, value: string) => void
	left?: React.ReactNode
	right?: React.ReactNode
	dataTestId?: string
	invalid?: boolean
	bold?: boolean
	textAlign?: string
	suffix?: string
	max?: number
	maxLength?: number | 'none'
	roundedCorner?: boolean
	noShadow?: boolean
}

const NumericInput: FC<NumericInputProps> = memo(
	({
		value,
		onChange,
		left,
		right,
		dataTestId,
		invalid,
		bold,
		textAlign,
		max = 0,
		maxLength = 'none',
		className,
		roundedCorner = true,
		disabled,
		noShadow,
		...props
	}) => {
		const handleChange = useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				let standardizedNum = e.target.value.replace(/[^0-9.,]/g, '').replace(/,/g, '.')

				if (maxLength !== 'none') {
					standardizedNum = standardizedNum.substring(0, maxLength)
				}
				// TODO: make regex only accept valid numbers, so we don't need to check again.
				if (isNaN(Number(standardizedNum))) return
				const valueIsAboveMax = max !== 0 && Number(standardizedNum) > max
				if (!valueIsAboveMax) {
					onChange(e, standardizedNum)
				}
			},
			[onChange, max, maxLength]
		)

		return (
			<InputContainer
				$invalid={invalid}
				$bold={bold}
				$textAlign={textAlign}
				$length={value.length}
				className={className}
				$roundedCorner={roundedCorner}
				$disabled={disabled}
				$noShadow={noShadow}
			>
				{left && (
					<>
						{left}
						<Spacer width={4} />
					</>
				)}
				<input
					data-testid={dataTestId}
					value={value}
					disabled={disabled}
					type="text"
					inputMode="decimal"
					onChange={handleChange}
					onKeyDown={(e) => {
						if (isInvalidNumber(e.key)) {
							e.preventDefault()
						}
					}}
					{...props}
				/>
				{right && (
					<>
						<Spacer width={4} />
						{right}
					</>
				)}
			</InputContainer>
		)
	}
)

const InputContainer = styled.div<{
	$invalid?: boolean
	$bold?: boolean
	$textAlign?: string
	$suffix?: string
	$length: number
	$roundedCorner?: boolean
	$disabled?: boolean
	$noShadow?: boolean
}>`
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: ${(props) => props.theme.colors.selectedTheme.input.background};
	${(props) =>
		!props.$noShadow &&
		css`
			box-shadow: ${(props) => props.theme.colors.selectedTheme.input.shadow};
		`}
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-color: ${(props) =>
		props.$invalid
			? props.theme.colors.selectedTheme.red
			: props.theme.colors.selectedTheme.input.borderColor};
	border-radius: ${(props) => (props.$roundedCorner ? '8px' : '0')};
	padding: 0 10px;
	height: 38px;
	box-sizing: border-box;
	opacity: ${(props) => (props.$disabled ? 0.4 : 1)};

	& > input {
		display: flex;
		flex: 1;
		font-family: ${(props) => (props.$bold ? props.theme.fonts.monoBold : props.theme.fonts.mono)};
		font-size: 18px;
		line-height: 22px;
		padding: 0;
		background-color: transparent;
		border: none;
		text-overflow: ellipsis;
		min-width: 0px;
		width: 100%;
		color: ${(props) =>
			props.$invalid
				? props.theme.colors.selectedTheme.red
				: props.theme.colors.selectedTheme.button.text.primary};

		${(props) =>
			props.$textAlign &&
			css`
				text-align: ${props.$textAlign};
			`}

		&:focus {
			outline: none;
		}

		::placeholder {
			color: ${(props) => props.theme.colors.selectedTheme.input.placeholder};
		}
	}

	${(props) =>
		props.$suffix &&
		css`
		::after {
			position: absolute;
			top: calc(25%);
			left: calc(${props.$length} * 1ch + 1.3ch));
			content: var(${props.$length === 0 ? '""' : props.$suffix});
			font-family: ${props.theme.fonts.mono};
			font-size: 18px;
			color: ${props.theme.colors.selectedTheme.input.placeholder};
		}
	`}
`

export default NumericInput
