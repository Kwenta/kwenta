import React from 'react';
import styled from 'styled-components';
import { SectionHeader } from 'sections/futures/MobileTrade/common';

type SwapInputProps = {
	from?: boolean;
};

const SwapInput: React.FC<SwapInputProps> = ({ from }) => {
	return (
		<div>
			<SwapInputHeader>
				<SectionHeader>{from ? 'From' : 'Into'}</SectionHeader>
				<div>Balance: 2.34343</div>
			</SwapInputHeader>
			<MainInput>
				<div>
					<SwapTextInput />
					<SwapCurrencyPrice>$69.874837.75</SwapCurrencyPrice>
				</div>
				{/* Select */}
			</MainInput>
		</div>
	);
};

const SwapInputHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

const MainInput = styled.div`
	box-sizing: border-box;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 10px;
	padding: 10px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 15px;
`;

const SwapTextInput = styled.input`
	background-color: transparent;
	border: none;
	color: ${(props) => props.theme.colors.selectedTheme.text.value};
	font-size: 18px;
	font-family: ${(props) => props.theme.fonts.mono};
	margin-bottom: 10px;

	&:focus {
		outline: none;
	}
`;

const SwapCurrencyPrice = styled.div`
	font-size: 12px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`;

export default SwapInput;
