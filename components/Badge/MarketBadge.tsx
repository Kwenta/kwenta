import { CurrencyKey } from 'constants/currency';
import useIsMarketTransitioning from 'hooks/useIsMarketTransitioning';
import { useFuturesMarketClosed } from 'hooks/useMarketClosed';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import theme from 'styles/theme';
import { marketIsOpen, marketNextOpen, marketNextTransition } from 'utils/marketHours';

import Badge from './Badge';

type MarketBadgeProps = {
	currencyKey: CurrencyKey | null;
};

type TransitionBadgeProps = {
	isOpen: boolean;
};

export const TransitionBadge: FC<TransitionBadgeProps> = ({ isOpen }) => {
	const { t } = useTranslation();

	return (
		<StyledBadge background={isOpen ? theme.colors.yellow : theme.colors.common.primaryRed}>
			{t(`futures.market.state.${isOpen ? 'closes-soon' : 'opens-soon'}`)}
		</StyledBadge>
	);
};

export const MarketBadge: FC<MarketBadgeProps> = ({ currencyKey }) => {
	const { t } = useTranslation();
	const isOpen = marketIsOpen((currencyKey as CurrencyKey) ?? null);

	const { isMarketClosed, marketClosureReason } = useFuturesMarketClosed(currencyKey);
	const nextOpen = marketNextOpen((currencyKey as CurrencyKey) ?? '');
	const nextTransition = marketNextTransition((currencyKey as CurrencyKey) ?? '');

	const timerSetting = isOpen === null ? null : isOpen ? nextTransition : nextOpen;
	const isMarketTransitioning = useIsMarketTransitioning(timerSetting ?? null);

	if (isMarketTransitioning && isOpen !== null) {
		return <TransitionBadge isOpen={isOpen} />;
	}

	if (!isMarketClosed) {
		return null;
	}

	return <Badge>{t(`futures.market.state.${marketClosureReason}`)}</Badge>;
};

export default MarketBadge;

const StyledBadge = styled(Badge)<{ background: string }>`
	background: ${(props) => props.background};
	padding: 1px 5px;
	line-height: 9px;
`;
