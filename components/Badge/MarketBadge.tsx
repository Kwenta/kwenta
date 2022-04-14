import { CurrencyKey } from 'constants/currency';
import useMarketClosed from 'hooks/useMarketClosed';
import React, { FC, useEffect, useState } from 'react';
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
	timer: string | null;
	isOpen: boolean;
	description: 'long' | 'short';
};

export const TimerBadge: FC<TimerBadgeProps> = ({ isOpen, description, timer }) => {
	const { t } = useTranslation();

	return (
		<StyledBadge
			background={isOpen ? theme.colors.common.primaryRed : theme.colors.common.primaryGreen}
		>
			{description === 'long' && t(`futures.market.state.${isOpen ? 'closes-in' : 'opens-in'}`)}{' '}
			{<CountdownTimer>{timer}</CountdownTimer>}
		</StyledBadge>
	);
};

export const MarketBadge: FC<MarketBadgeProps> = ({ currencyKey, description }) => {
	const { t } = useTranslation();
	const isOpen = marketIsOpen((currencyKey as CurrencyKey) ?? null);

	const [timer, setTimer] = useState<string>('');
	const { isMarketClosed, marketClosureReason } = useMarketClosed(currencyKey);

	const nextOpen = marketNextOpen((currencyKey as CurrencyKey) ?? '');
	const nextTransition = marketNextTransition((currencyKey as CurrencyKey) ?? '');

	const timerSetting = isOpen === null ? null : isOpen ? nextTransition : nextOpen;
	const clock = useMarketHoursTimer(timerSetting ?? null);

	useEffect(() => {
		setTimer(clock);
	}, [timerSetting]);

	if (isOpen !== null && timer) {
		return <TimerBadge description={description || 'short'} isOpen={isOpen} timer={timer} />;
	}

	if (isMarketClosed) {
		return <Badge>{t(`futures.market.state.${marketClosureReason}`)}</Badge>;
	}

	return null;
};

export default MarketBadge;

const CountdownTimer = styled.span`
	font-family: ${(props) => props.theme.fonts.mono};
`;

const StyledBadge = styled(Badge)<{ background: string }>`
	background: ${(props) => props.background};
	padding: 1px 5px;
	line-height: 9px;
`;
