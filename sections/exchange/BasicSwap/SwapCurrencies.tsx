import { useRouter } from 'next/router';
import { memo, useCallback } from 'react';
import styled from 'styled-components';

import ArrowIcon from 'assets/svg/app/arrow-down.svg';
import ROUTES from 'constants/routes';
import { zIndex } from 'constants/ui';
import { swapCurrencies } from 'state/exchange/reducer';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { SwapCurrenciesButton } from 'styles/common';

const SwapCurrencies = memo(() => {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const { quoteCurrencyKey, baseCurrencyKey } = useAppSelector(({ exchange }) => ({
		quoteCurrencyKey: exchange.quoteCurrencyKey,
		baseCurrencyKey: exchange.baseCurrencyKey,
	}));

	const handleCurrencySwap = useCallback(() => {
		dispatch(swapCurrencies());

		if (!!quoteCurrencyKey && !!baseCurrencyKey) {
			router.replace(ROUTES.Exchange.MarketPair(quoteCurrencyKey, baseCurrencyKey), undefined, {
				shallow: true,
			});
		}
	}, [quoteCurrencyKey, baseCurrencyKey, router, dispatch]);

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
