import { memo } from 'react';
import styled from 'styled-components';

import ArrowIcon from 'assets/svg/app/arrow-down.svg';
import { zIndex } from 'constants/ui';
import { useExchangeContext } from 'contexts/ExchangeContext';
import { SwapCurrenciesButton } from 'styles/common';

const SwapCurrencies = memo(() => {
	const { handleCurrencySwap } = useExchangeContext();

	return (
		<SwapCurrenciesButtonContainer>
			<SwapCurrenciesButton onClick={handleCurrencySwap} data-testid="swap-btn">
				<ArrowIcon className="arrow" />
			</SwapCurrenciesButton>
		</SwapCurrenciesButtonContainer>
	);
});

export default SwapCurrencies;

const SwapCurrenciesButtonContainer = styled.div`
	align-self: flex-start;
	margin-top: 170px;
	position: absolute;
	left: calc(50% - 16px);
	z-index: ${zIndex.BASE + 10};
`;
