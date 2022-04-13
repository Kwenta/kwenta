import { CurrencyKey } from 'constants/currency';
import useMarketClosed from 'hooks/useMarketClosed';
import React, { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useMarketHoursTimer from 'sections/exchange/hooks/useMarketHoursTimer';
import styled from 'styled-components';
import theme from 'styles/theme';
import { marketIsOpen, marketNextOpen, marketNextTransition } from 'utils/marketHours';
import Badge from './Badge';

type MarketBadgeProps = {
	currencyKey: CurrencyKey | null;
	description?: 'long' | 'short';
};

type TimerBadgeProps = {
	currencyKey: CurrencyKey | null;
	isOpen: boolean;
	description: 'long' | 'short';
};

export const TimerBadge: FC<TimerBadgeProps> = ({ isOpen, currencyKey, description }) => {
	const [timer, setTimer] = React.useState<any>(null);
	const { t } = useTranslation();
	const nextOpen = marketNextOpen((currencyKey as CurrencyKey) ?? '');
	const nextOpenTimer = useMarketHoursTimer(nextOpen ?? null);

	const nextTransition = marketNextTransition((currencyKey as CurrencyKey) ?? '');
	const nextTransitionTimer = useMarketHoursTimer(nextTransition ?? null);

	useEffect(() => {
		if (isOpen) {
			setTimer(nextTransitionTimer);
		} else {
			setTimer(nextOpenTimer);
		}
	}, []);

	return (
		<StyledBadge
			background={isOpen ? theme.colors.common.primaryRed : theme.colors.common.primaryRed}
		>
			{description === 'long' && t(`futures.market.state.${isOpen ? 'closes-in' : 'opens-in'}`)}{' '}
			{timer && <CountdownTimer>{timer}</CountdownTimer>}
		</StyledBadge>
	);
};

export const MarketBadge: FC<MarketBadgeProps> = ({ currencyKey, description }) => {
	const { t } = useTranslation();
	const isOpen = marketIsOpen((currencyKey as CurrencyKey) ?? null);

	const { isMarketClosed, marketClosureReason } = useMarketClosed(currencyKey);

	if (isOpen !== null) {
		return (
			<TimerBadge description={description || 'short'} isOpen={isOpen} currencyKey={currencyKey} />
		);
	}

	if (isMarketClosed) {
		<Badge>{t(`futures.market.state.${marketClosureReason}`)}</Badge>;
	}

	return null;
};

export default MarketBadge;

const CountdownTimer = styled.span`
	font-family: ${(props) => props.theme.fonts.mono};
`;

const StyledBadge = styled(Badge)<{ background: string }>`
	background: ${(props) => props.background};
`;
