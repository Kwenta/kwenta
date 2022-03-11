import React from 'react';
import styled from 'styled-components';

type OrderSizingInputProps = {
	value?: string | number;
	onChange?: React.ChangeEventHandler<HTMLInputElement>;
	right: React.ReactNode;
	style?: React.CSSProperties;
	className?: string;
};

const CustomInput: React.FC<OrderSizingInputProps> = ({
	value,
	onChange,
	right,
	style,
	className,
}) => (
	<CustomInputContainer style={style} className={className}>
		<input value={value} onChange={onChange} />
		{typeof right === 'string' ? <span>{right}</span> : right}
	</CustomInputContainer>
);

const CustomInputContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-sizing: border-box;
	height: 46px;
	background: ${(props) => props.theme.colors.selectedTheme.input.background};
	box-shadow: ${(props) => props.theme.colors.selectedTheme.input.shadow};
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 16px;
	padding: 12px 14px;

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
