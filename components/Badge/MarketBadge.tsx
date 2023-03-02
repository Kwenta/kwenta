import React, { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { CurrencyKey } from 'constants/currency';
import { FuturesClosureReason } from 'hooks/useFuturesMarketClosed';
import useIsMarketTransitioning from 'hooks/useIsMarketTransitioning';
import { FuturesMarketAsset } from 'sdk/types/futures';
import { marketIsOpen, marketNextOpen, marketNextTransition } from 'utils/marketHours';

import Badge from './Badge';

type MarketBadgeProps = {
	currencyKey: FuturesMarketAsset | null;
	isFuturesMarketClosed: boolean;
	futuresClosureReason?: FuturesClosureReason;
};

type TransitionBadgeProps = {
	isOpen: boolean;
};

export const TransitionBadge: FC<TransitionBadgeProps> = memo(({ isOpen }) => {
	const { t } = useTranslation();

	return (
		<StyledBadge color={isOpen ? 'yellow' : 'red'}>
			{t(`futures.market.state.${isOpen ? 'closes' : 'opens'}-soon`)}
		</StyledBadge>
	);
});

export const MarketBadge: FC<MarketBadgeProps> = memo(
	({ currencyKey, isFuturesMarketClosed, futuresClosureReason }) => {
		const { t } = useTranslation();
		const isOpen = marketIsOpen((currencyKey as CurrencyKey) ?? null);

		const nextOpen = marketNextOpen((currencyKey as CurrencyKey) ?? '');
		const nextTransition = marketNextTransition((currencyKey as CurrencyKey) ?? '');

		const timerSetting = isOpen === null ? null : isOpen ? nextTransition : nextOpen;
		const isMarketTransitioning = useIsMarketTransitioning(timerSetting ?? null);

		if (typeof isFuturesMarketClosed !== 'boolean') {
			return null;
		}

		if (isFuturesMarketClosed) {
			const reason = futuresClosureReason || 'unknown';
			return <Badge color="red">{t(`futures.market.state.${reason}`)}</Badge>;
		}

		if (isMarketTransitioning && isOpen !== null) {
			return <TransitionBadge isOpen={isOpen} />;
		}

		return null;
	}
);

export default MarketBadge;

const StyledBadge = styled(Badge)`
	padding: 1px 5px;
	line-height: 9px;
`;
