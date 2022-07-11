import React from 'react';
import styled from 'styled-components';
import useExchange from '../hooks/useExchange';
import RatioSelect from './RatioSelect';
import SwapInput from './SwapInput';

const MobileSwap: React.FC = () => {
	const { quoteCurrencyCard, baseCurrencyCard, footerCard, handleCurrencySwap } = useExchange({
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

			<SwapInput />
		</MobileSwapContainer>
	);
};

const MobileSwapContainer = styled.div`
	padding: 15px;
`;

export default MobileSwap;
