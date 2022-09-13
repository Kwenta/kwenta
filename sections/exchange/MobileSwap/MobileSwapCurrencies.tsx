import React from 'react';
import styled from 'styled-components';

import ArrowIcon from 'assets/svg/app/arrow-down.svg';
import { useExchangeContext } from 'contexts/ExchangeContext';
import { SwapCurrenciesButton } from 'styles/common';

const MobileSwapCurrencies = React.memo(() => {
	const { handleCurrencySwap } = useExchangeContext();

	return (
		<ButtonContainer>
			<StyledSwapButton onClick={handleCurrencySwap}>
				<ArrowIcon className="arrow" />
			</StyledSwapButton>
		</ButtonContainer>
	);
});

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

export default MobileSwapCurrencies;
