import { FC, memo, useCallback } from 'react';
import styled from 'styled-components';

type NumericInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
	onChange: (e: React.ChangeEvent<HTMLInputElement>, value: string) => void;
	left?: React.ReactNode;
	right?: React.ReactNode;
	dataTestId?: string;
	invalid?: boolean;
	bold?: boolean;
};

const INVALID_CHARS = ['-', '+', 'e'];

const isInvalid = (key: string) => INVALID_CHARS.includes(key);

const NumericInput: FC<NumericInputProps> = memo(
	({ onChange, left, right, dataTestId, invalid, bold, ...props }) => {
		const handleChange = useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				const standardizedNum = e.target.value.replace(/,/g, '.').replace(/[e+-]/gi, '');
				// TODO: make regex only accept valid numbers, so we don't need to check again.
				if (isNaN(Number(standardizedNum))) return;
				onChange(e, standardizedNum);
			},
			[onChange]
		);

		return (
			<InputContainer $invalid={invalid} $bold={bold}>
				{left && <div className="left">{left}</div>}
				<input
					data-testid={dataTestId}
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

const InputContainer = styled.div<{ $invalid?: boolean; $bold?: boolean }>`
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	background: ${(props) => props.theme.colors.selectedTheme.input.secondary.background};
	box-shadow: ${(props) => props.theme.colors.selectedTheme.input.shadow};
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 10px;
	padding: 0 10px;
	min-height: 46px;

	& > input {
		display: flex;
		flex: 1;
		font-family: ${(props) => (props.$bold ? props.theme.fonts.monoBold : props.theme.fonts.mono)};
		font-size: 18px;
		line-height: 22px;
		background-color: transparent;
		border: none;
		text-overflow: ellipsis;
		color: ${(props) =>
			props.$invalid
				? props.theme.colors.selectedTheme.red
				: props.theme.colors.selectedTheme.button.text.primary};

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
`;

export default NumericInput;
