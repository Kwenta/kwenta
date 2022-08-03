import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { CurrencyKey } from 'constants/currency';
import { FuturesClosureReason } from 'hooks/useFuturesMarketClosed';
import useIsMarketTransitioning from 'hooks/useIsMarketTransitioning';
import theme from 'styles/theme';
import { FuturesMarketAsset } from 'utils/futures';
import { marketIsOpen, marketNextOpen, marketNextTransition } from 'utils/marketHours';

import Badge from './Badge';

type MarketBadgeProps = {
	currencyKey: FuturesMarketAsset | null;
	isFuturesMarketClosed: boolean;
	futuresClosureReason: FuturesClosureReason;
};

type TransitionBadgeProps = {
	isOpen: boolean;
};

export const TransitionBadge: FC<TransitionBadgeProps> = ({ isOpen }) => {
	const { t } = useTranslation();

	return (
		<StyledBadge background={isOpen ? theme.colors.gold : theme.colors.common.primaryRed}>
			{t(`futures.market.state.${isOpen ? 'closes-soon' : 'opens-soon'}`)}
		</StyledBadge>
	);
};

export const MarketBadge: FC<MarketBadgeProps> = ({
	currencyKey,
	isFuturesMarketClosed,
	futuresClosureReason,
}) => {
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
		return <Badge>{t(`futures.market.state.${reason}`)}</Badge>;
	}

	if (isMarketTransitioning && isOpen !== null) {
		return <TransitionBadge isOpen={isOpen} />;
	}

	return null;
};

export default MarketBadge;

const StyledBadge = styled(Badge)<{ background: string }>`
	background: ${(props) => props.background};
	padding: 1px 5px;
	line-height: 9px;
`;
