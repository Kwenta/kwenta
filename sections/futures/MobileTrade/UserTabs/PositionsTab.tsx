import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Currency from 'components/Currency';
import { FlexDiv, FlexDivRowCentered } from 'components/layout/flex';
import Pill from 'components/Pill';
import Spacer from 'components/Spacer/Spacer';
import { TableNoResults } from 'components/Table';
import { Body, NumericValue } from 'components/Text';
import { NO_VALUE } from 'constants/placeholder';
import useIsL2 from 'hooks/useIsL2';
import useNetworkSwitcher from 'hooks/useNetworkSwitcher';
import { ConditionalOrderTypeEnum, FuturesMarketKey, PositionSide } from 'sdk/types/futures';
import PositionType from 'sections/futures/PositionType';
import { setShowPositionModal } from 'state/app/reducer';
import { setTradePanelDrawerOpen } from 'state/futures/reducer';
import {
	selectAllSLTPOrders,
	selectCrossMarginPositions,
	selectFuturesType,
	selectIsolatedMarginPositions,
	selectMarketAsset,
	selectMarkets,
	selectPositionHistory,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';

import TradePanelDrawer from '../drawers/TradePanelDrawer';

const PositionsTab = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const { switchToL2 } = useNetworkSwitcher();

	const isL2 = useIsL2();

	const isolatedPositions = useAppSelector(selectIsolatedMarginPositions);
	const crossMarginPositions = useAppSelector(selectCrossMarginPositions);
	const positionHistory = useAppSelector(selectPositionHistory);
	const currentMarket = useAppSelector(selectMarketAsset);
	const futuresMarkets = useAppSelector(selectMarkets);
	const accountType = useAppSelector(selectFuturesType);
	const sltpOrders = useAppSelector(selectAllSLTPOrders);
	const tradeDrawerPanelOpen = useAppSelector(({ futures }) => futures.tradePanelDrawerOpen);

	let data = useMemo(() => {
		const positions = accountType === 'cross_margin' ? crossMarginPositions : isolatedPositions;
		return positions
			.map((position) => {
				const market = futuresMarkets.find((market) => market.asset === position.asset);
				const thisPositionHistory = positionHistory.find((ph) => {
					return ph.isOpen && ph.asset === position.asset;
				});
				const stopLoss = sltpOrders.find(
					(o) => o.marketKey === market?.marketKey && o.orderType === ConditionalOrderTypeEnum.STOP
				);
				const takeProfit = sltpOrders.find(
					(o) => o.marketKey === market?.marketKey && o.orderType === ConditionalOrderTypeEnum.LIMIT
				);
				return {
					market: market!,
					position: position.position!,
					avgEntryPrice: thisPositionHistory?.avgEntryPrice,
					stopLoss: stopLoss?.targetPrice ?? 0,
					takeProfit: takeProfit?.targetPrice ?? 0,
				};
			})
			.filter(({ position, market }) => !!position && !!market)
			.sort((a) => (a.market.asset === currentMarket ? -1 : 1));
	}, [
		accountType,
		crossMarginPositions,
		isolatedPositions,
		futuresMarkets,
		positionHistory,
		sltpOrders,
		currentMarket,
	]);

	const handleCloseDrawer = useCallback(() => {
		dispatch(setTradePanelDrawerOpen(false));
	}, [dispatch]);

	const handleOpenPositionCloseModal = useCallback(
		(marketKey: FuturesMarketKey) => () => {
			dispatch(
				setShowPositionModal({
					type: 'futures_close_position',
					marketKey,
				})
			);
		},
		[dispatch]
	);

	return (
		<PositionsTabContainer>
			{data.length === 0 ? (
				!isL2 ? (
					<TableNoResults>
						{t('common.l2-cta')}
						<div onClick={switchToL2}>{t('homepage.l2.cta-buttons.switch-l2')}</div>
					</TableNoResults>
				) : (
					<TableNoResults>
						{t('dashboard.overview.futures-positions-table.no-result')}
					</TableNoResults>
				)
			) : (
				data.map((row) => (
					<PositionItem key={row.market.asset}>
						<PositionMeta $side={row.position.side}>
							<FlexDiv>
								<div className="position-side-bar" />
								<div>
									<Body>{row.market.marketName}</Body>
									<Body capitalized color="secondary">
										{accountType === 'isolated_margin' ? 'Isolated Margin' : 'Cross-Margin'}
									</Body>
								</div>
							</FlexDiv>
							<div>
								<Pill size="medium" onClick={handleOpenPositionCloseModal(row.market.marketKey)}>
									Close
								</Pill>
							</div>
						</PositionMeta>
						<PositionRow>
							<Body color="secondary">Size</Body>
							<FlexDivRowCentered>
								<div>
									<Currency.Price price={row.position.size} currencyKey={row.market.asset} />
								</div>
								<Spacer width={5} />
								<Currency.Price
									price={row.position.notionalValue}
									formatOptions={row.position.notionalValue.gte(1e6) ? { truncate: true } : {}}
									side="secondary"
								/>
							</FlexDivRowCentered>
						</PositionRow>
						<PositionRow>
							<Body color="secondary">Side</Body>
							<PositionType side={row.position.side} />
						</PositionRow>
						<PositionRow>
							<Body color="secondary">Avg. Entry</Body>
							{row.avgEntryPrice === undefined ? (
								<Body>{NO_VALUE}</Body>
							) : (
								<Currency.Price
									price={row.avgEntryPrice}
									formatOptions={{ suggestDecimals: true }}
								/>
							)}
						</PositionRow>
						<PositionRow>
							<Body color="secondary">Market Margin</Body>
							<FlexDivRowCentered>
								<NumericValue value={row.position.initialMargin} />
							</FlexDivRowCentered>
						</PositionRow>
						<PositionRow>
							<Body color="secondary">Leverage</Body>
							<FlexDivRowCentered>
								<NumericValue value={row.position.leverage} suffix="x" />
							</FlexDivRowCentered>
						</PositionRow>
						<PositionRow>
							<Body color="secondary">Unrealized PnL</Body>
							<Currency.Price price={row.position.pnl} colored />
						</PositionRow>
						<PositionRow>
							<Body color="secondary">TP/SL</Body>
							<FlexDivRowCentered>
								{row.takeProfit === undefined ? (
									<Body>{NO_VALUE}</Body>
								) : (
									<Currency.Price price={row.takeProfit} />
								)}
								<Spacer width={5} />
								{row.stopLoss === undefined ? (
									<Body>{NO_VALUE}</Body>
								) : (
									<Currency.Price price={row.stopLoss} />
								)}
								<Spacer width={5} />
								<Pill
									size="medium"
									onClick={() =>
										dispatch(
											setShowPositionModal({
												type: 'futures_edit_stop_loss_take_profit',
												marketKey: row.market.marketKey,
											})
										)
									}
								>
									Edit
								</Pill>
							</FlexDivRowCentered>
						</PositionRow>
					</PositionItem>
				))
			)}
			{tradeDrawerPanelOpen && (
				<TradePanelDrawer open={tradeDrawerPanelOpen} closeDrawer={handleCloseDrawer} />
			)}
		</PositionsTabContainer>
	);
};

const PositionsTabContainer = styled.div`
	padding-top: 15px;
`;

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
