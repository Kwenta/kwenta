import React from 'react';
import styled from 'styled-components';
import RatioSelect from './RatioSelect';
import SwapInfoBox from './SwapInfoBox';
import SwapInput from './SwapInput';
import { SwapCurrenciesButton } from 'styles/common';
import ArrowIcon from 'assets/svg/app/arrow-down.svg';
import { useExchangeContext } from 'contexts/ExchangeContext';

const MobileSwap: React.FC = () => {
	const { handleCurrencySwap } = useExchangeContext();

	return (
		<MobileSwapContainer>
			<SwapInput />

			<RatioSelect />

			<ButtonContainer>
				<StyledSwapButton onClick={handleCurrencySwap}>
					<ArrowIcon className="arrow" />
				</StyledSwapButton>
			</ButtonContainer>

			<SwapInput />

			<SwapInfoBox />
		</MobileSwapContainer>
	);
};

const MobileSwapContainer = styled.div`
	padding: 15px;
`;

const StyledSwapButton = styled(SwapCurrenciesButton)`
	&::before {
		display: none;
	}
`;

const ButtonContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
`;

export default MobileSwap;
