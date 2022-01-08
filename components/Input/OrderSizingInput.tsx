import React from 'react';
import styled from 'styled-components';

type OrderSizingInputProps = {
	value?: string;
	onChange: React.ChangeEventHandler<HTMLInputElement>;
	synth: string;
};

const OrderSizingInput: React.FC<OrderSizingInputProps> = ({ value, onChange, synth }) => (
	<OrderSizingInputContainer>
		<input value={value} onChange={onChange} />
		<span>{synth}</span>
	</OrderSizingInputContainer>
);

const OrderSizingInputContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-sizing: border-box;
	height: 46px;
	background: linear-gradient(180deg, #1b1b1b 0%, rgba(27, 27, 27, 0.75) 100%);
	box-shadow: 0px 0.5px 0px 0px #ffffff14;
	border: 1px solid #ffffff1a;
	border-radius: 16px;
	padding: 12px 14px;

	input {
		font-family: ${(props) => props.theme.fonts.mono};
		font-size: 18px;
		line-height: 22px;
		background-color: transparent;
		border: none;
		color: #ece8e3;

		&:focus {
			outline: none;
		}

		::placeholder {
			color: #787878;
		}
	}

	span {
		font-family: monospace;
		font-size: 16px;
		color: #787878;
	}
`;

export default OrderSizingInput;
