import { useRouter } from 'next/router';
import { memo, useCallback } from 'react';
import { swapCurrencies } from 'state/exchange/reducer';
import { useAppDispatch, useAppSelector } from 'state/store';
import styled from 'styled-components';

import ArrowIcon from 'assets/svg/app/arrow-down.svg';
import ROUTES from 'constants/routes';
import { zIndex } from 'constants/ui';
import { SwapCurrenciesButton } from 'styles/common';

const SwapCurrencies = memo(() => {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const { quoteCurrencyKey, baseCurrencyKey } = useAppSelector(({ exchange }) => ({
		quoteCurrencyKey: exchange.quoteCurrencyKey,
		baseCurrencyKey: exchange.baseCurrencyKey,
	}));

	const routeToMarketPair = useCallback(
		(baseCurrencyKey: string, quoteCurrencyKey: string) =>
			router.replace('/exchange', ROUTES.Exchange.MarketPair(baseCurrencyKey, quoteCurrencyKey), {
				shallow: true,
			}),
		[router]
	);

	const handleCurrencySwap = useCallback(() => {
		dispatch(swapCurrencies());

		if (!!quoteCurrencyKey && !!baseCurrencyKey) {
			routeToMarketPair(quoteCurrencyKey, baseCurrencyKey);
		}
	}, [baseCurrencyKey, quoteCurrencyKey, routeToMarketPair, dispatch]);

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
