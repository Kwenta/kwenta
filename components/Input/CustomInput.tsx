import React from 'react';
import styled from 'styled-components';

type CustomInputProps = {
	placeholder?: string;
	value?: string | number;
	onChange: (e: React.ChangeEvent<HTMLInputElement>, value: string) => void;
	right: React.ReactNode;
	style?: React.CSSProperties;
	className?: string;
	disabled?: boolean;
	id?: string;
	defaultValue?: any;
};

const INVALID_CHARS = ['-', '+', 'e'];

const CustomInput: React.FC<CustomInputProps> = ({
	value,
	placeholder,
	onChange,
	right,
	style,
	className,
	disabled,
	id,
	defaultValue,
}) => {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange(e, e.target.value.replace(/,/g, '.').replace(/[e+-]/gi, ''));
	};

	return (
		<CustomInputContainer style={style} className={className}>
			<input
				disabled={disabled}
				placeholder={placeholder}
				value={value}
				type="number"
				onChange={handleChange}
				onKeyDown={(e) => {
					if (INVALID_CHARS.includes(e.key)) {
						e.preventDefault();
					}
				}}
				id={id}
				defaultValue={defaultValue}
			/>
			{typeof right === 'string' ? <span>{right}</span> : right}
		</CustomInputContainer>
	);
};

const CustomInputContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-sizing: border-box;
	height: 46px;
	background: ${(props) => props.theme.colors.selectedTheme.input.background};
	box-shadow: ${(props) => props.theme.colors.selectedTheme.input.shadow};
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 10px;
	padding: 0 10px;

	input {
		display: flex;
		flex: 1;

		margin-right: 4px;
		font-family: ${(props) => props.theme.fonts.mono};
		font-size: 18px;
		line-height: 22px;
		background-color: transparent;
		border: none;
		color: ${(props) => props.theme.colors.common.primaryWhite};
		width: 100%;

		&:focus {
			outline: none;
		}

		::placeholder {
			color: ${(props) => props.theme.colors.selectedTheme.input.placeholder};
		}
	}

	span {
		font-family: ${(props) => props.theme.fonts.mono};
		font-size: 16px;
		color: ${(props) => props.theme.colors.selectedTheme.input.placeholder};
	}
`;

export default CustomInput;
