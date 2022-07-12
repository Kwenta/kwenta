import React from 'react';
import styled from 'styled-components';
import useExchange from '../hooks/useExchange';
import RatioSelect from './RatioSelect';
import SwapInfoBox from './SwapInfoBox';
import SwapInput from './SwapInput';
import { SwapCurrenciesButton } from 'styles/common';
import ArrowIcon from 'assets/svg/app/arrow-down.svg';

const MobileSwap: React.FC = () => {
	const { handleCurrencySwap } = useExchange({
		showPriceCard: true,
		showMarketDetailsCard: true,
		footerCardAttached: false,
		routingEnabled: true,
		persistSelectedCurrencies: true,
		showNoSynthsCard: false,
	});

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
