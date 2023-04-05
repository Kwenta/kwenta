import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Pill from 'components/Pill';
import { Body } from 'components/Text';
import useIsL2 from 'hooks/useIsL2';
import useNetworkSwitcher from 'hooks/useNetworkSwitcher';
import { PositionSide } from 'sdk/types/futures';
import {
	selectCrossMarginPositions,
	selectFuturesType,
	selectIsolatedMarginPositions,
	selectMarketAsset,
	selectMarkets,
	selectPositionHistory,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';

const PositionsTab = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { switchToL2 } = useNetworkSwitcher();

	const isL2 = useIsL2();

	const isolatedPositions = useAppSelector(selectIsolatedMarginPositions);
	const crossMarginPositions = useAppSelector(selectCrossMarginPositions);
	const positionHistory = useAppSelector(selectPositionHistory);
	const currentMarket = useAppSelector(selectMarketAsset);
	const futuresMarkets = useAppSelector(selectMarkets);
	const accountType = useAppSelector(selectFuturesType);

	let data = useMemo(() => {
		const positions = accountType === 'cross_margin' ? crossMarginPositions : isolatedPositions;
		return positions
			.map((position) => {
				const market = futuresMarkets.find((market) => market.asset === position.asset);
				const thisPositionHistory = positionHistory.find((ph) => {
					return ph.isOpen && ph.asset === position.asset;
				});

				return {
					market: market!,
					position: position.position!,
					avgEntryPrice: thisPositionHistory?.avgEntryPrice,
					stopLoss: position.stopLoss,
					takeProfit: position.takeProfit,
				};
			})
			.filter(({ position, market }) => !!position && !!market)
			.sort((a) => (a.market.asset === currentMarket ? -1 : 1));
	}, [
		accountType,
		isolatedPositions,
		crossMarginPositions,
		futuresMarkets,
		positionHistory,
		currentMarket,
	]);

	return (
		<div>
			{data.map((row) => (
				<PositionItem key={row.market.asset}>
					<PositionMeta $side={row.position.side}>
						<div style={{ display: 'flex' }}>
							<div className="position-side-bar" />
							<div>
								<Body>{row.market.marketName}</Body>
								<Body capitalized color="secondary">
									{accountType === 'isolated_margin' ? 'Isolated Margin' : 'Cross-Margin'}
								</Body>
							</div>
						</div>
						<div>
							<Pill>Close</Pill>
						</div>
					</PositionMeta>
					<PositionRow>
						<Body color="secondary">Size</Body>
					</PositionRow>
					<PositionRow>
						<Body color="secondary">Side</Body>
					</PositionRow>
					<PositionRow>
						<Body color="secondary">Avg. Entry</Body>
					</PositionRow>
					<PositionRow>
						<Body color="secondary">Market Margin</Body>
					</PositionRow>
					<PositionRow>
						<Body color="secondary">Realized PnL</Body>
					</PositionRow>
					<PositionRow>
						<Body color="secondary">TP/SL</Body>
					</PositionRow>
				</PositionItem>
			))}
		</div>
	);
};

const PositionMeta = styled.div<{ $side: PositionSide }>`
	display: flex;
	justify-content: space-between;
	margin-bottom: 20px;

	.position-side-bar {
		height: 100%;
		width: 4px;
		margin-right: 8px;
		background-color: ${(props) =>
			props.theme.colors.selectedTheme.newTheme.text[
				props.$side === PositionSide.LONG ? 'positive' : 'negative'
			]};
	}
`;

const PositionItem = styled.div`
	margin: 0 20px;
	padding: 20px 0;

	&:not(:last-of-type) {
		border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
	}
`;

const PositionRow = styled.div`
	display: flex;
	justify-content: space-between;

	&:not(:last-of-type) {
		margin-bottom: 10px;
	}
`;

export default PositionsTab;
