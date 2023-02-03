import { FC, memo, useCallback } from 'react';
import styled, { css } from 'styled-components';

type NumericInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>, value: string) => void;
	left?: React.ReactNode;
	right?: React.ReactNode;
	dataTestId?: string;
	invalid?: boolean;
	bold?: boolean;
	textAlign?: string;
	suffix?: string;
	max?: number;
};

const INVALID_CHARS = ['-', '+', 'e'];

const isInvalid = (key: string) => INVALID_CHARS.includes(key);

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
		className,
		...props
	}) => {
		const handleChange = useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				const standardizedNum = e.target.value.replace(/,/g, '.').replace(/[e+-]/gi, '');
				// Consider switching to this:
				// const standardizedNum = value
				// .replace(/[^0-9.,]/g, '')
				// .replace(/,/g, '.')
				// .substring(0, 4);
				// TODO: make regex only accept valid numbers, so we don't need to check again.
				if (isNaN(Number(standardizedNum))) return;
				const valueIsAboveMax = max !== 0 && Number(standardizedNum) > max;
				if (!valueIsAboveMax) {
					onChange(e, standardizedNum);
				}
				onChange(e, standardizedNum);
			},
			[onChange, max]
		);

		return (
			<InputContainer
				$invalid={invalid}
				$bold={bold}
				$textAlign={textAlign}
				$length={value.length}
				className={className}
			>
				{left && <div className="left">{left}</div>}
				<input
					data-testid={dataTestId}
					value={value}
					type="text"
					inputMode="decimal"
					onChange={handleChange}
					onKeyDown={(e) => {
						if (isInvalid(e.key)) {
							e.preventDefault();
						}
					}}
					{...props}
				/>
				{right && <div className="right">{right}</div>}
			</InputContainer>
		);
	}
);

const InputContainer = styled.div<{
	$invalid?: boolean;
	$bold?: boolean;
	$textAlign?: string;
	$suffix?: string;
	$length: number;
}>`
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	background: ${(props) => props.theme.colors.selectedTheme.input.secondary.background};
	box-shadow: ${(props) => props.theme.colors.selectedTheme.input.shadow};
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 10px;
	padding: 0 10px;
	height: 46px;
	box-sizing: border-box;

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

	.left {
		margin-right: 4px;
	}

	.right {
		margin-left: 4px;
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
`;

export default NumericInput;
