import { FC, memo, useCallback } from 'react';
import styled from 'styled-components';

type NewNumericInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
	onChange: (e: React.ChangeEvent<HTMLInputElement>, value: string) => void;
	left?: React.ReactNode;
	right?: React.ReactNode;
	dataTestId?: string;
};

const LETTERS = /^[A-Za-z]+$/;
const INVALID_CHARS = ['-', '+', 'e'];

const isInvalid = (key: string) => INVALID_CHARS.includes(key) || key.match(LETTERS);

const NewNumericInput: FC<NewNumericInputProps> = memo(
	({ onChange, left, right, dataTestId, ...props }) => {
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
			<InputContainer>
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

const InputContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	background: ${(props) => props.theme.colors.selectedTheme.input.secondary.background};
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 10px;
	padding: 0 10px;

	& > input {
		display: flex;
		flex: 1;
		font-size: 18px;
		background-color: transparent;
		border: none;
		text-overflow: ellipsis;
	}

	.right {
		margin-left: 4px;
	}
`;

export default NewNumericInput;
