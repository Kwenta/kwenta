import { useRouter } from 'next/router';
import { memo, useCallback } from 'react';
import { swapCurrencies } from 'state/exchange/reducer';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import styled from 'styled-components';

import ArrowIcon from 'assets/svg/app/arrow-down.svg';
import ROUTES from 'constants/routes';
import { SwapCurrenciesButton } from 'styles/common';

const MobileSwapCurrencies = memo(() => {
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
