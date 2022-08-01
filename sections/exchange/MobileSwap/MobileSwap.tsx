import React from 'react';
import styled from 'styled-components';

import ArrowIcon from 'assets/svg/app/arrow-down.svg';
import { useExchangeContext } from 'contexts/ExchangeContext';
import { SwapCurrenciesButton } from 'styles/common';

import BaseCurrencyCard from '../TradeCard/Cards/BaseCurrencyCard';
import QuoteCurrencyCard from '../TradeCard/Cards/QuoteCurrencyCard';
import RatioSelect from './RatioSelect';
import SwapButton from './SwapButton';
import SwapInfoBox from './SwapInfoBox';

const MobileSwap: React.FC = () => {
	const { handleCurrencySwap } = useExchangeContext();

	return (
		<MobileSwapContainer>
			<QuoteCurrencyCard allowQuoteCurrencySelection />

			<RatioSelect />

			<ButtonContainer>
				<StyledSwapButton onClick={handleCurrencySwap}>
					<ArrowIcon className="arrow" />
				</StyledSwapButton>
			</ButtonContainer>

			<BaseCurrencyCard allowBaseCurrencySelection />

			<SwapInfoBox />

			<SwapButton />
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
