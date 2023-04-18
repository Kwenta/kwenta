import { useRouter } from 'next/router';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled from 'styled-components';

import Currency from 'components/Currency';
import { FlexDivRowCentered } from 'components/layout/flex';
import Pill from 'components/Pill';
import Spacer from 'components/Spacer';
import Table, { TableHeader, TableNoResults } from 'components/Table';
import { Body, NumericValue } from 'components/Text';
import { NO_VALUE } from 'constants/placeholder';
import ROUTES from 'constants/routes';
import useIsL2 from 'hooks/useIsL2';
import useNetworkSwitcher from 'hooks/useNetworkSwitcher';
import PositionType from 'sections/futures/PositionType';
import { setShowPositionModal } from 'state/app/reducer';
import {
	selectCrossMarginPositions,
	selectFuturesType,
	selectIsolatedMarginPositions,
	selectMarketAsset,
	selectMarkets,
	selectPositionHistory,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { formatPercent } from 'utils/formatters/number';

import TableMarketDetails from './TableMarketDetails';

type FuturesPositionTableProps = {
	showCurrentMarket?: boolean;
	showEmptyTable?: boolean;
};

const PositionsTable: FC<FuturesPositionTableProps> = () => {
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
		crossMarginPositions,
		isolatedPositions,
		futuresMarkets,
		positionHistory,
		currentMarket,
	]);

	return (
		<Container>
			<TableContainer>
				<Table
					data={data}
					rounded={false}
					hiddenColumns={accountType === 'isolated_margin' ? ['tp-sl'] : []}
					columnsDeps={[accountType]}
					noResultsMessage={
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
					}
					highlightRowsOnHover
					columns={[
						{
							Header: (
								<TableHeader>{t('dashboard.overview.futures-positions-table.market')}</TableHeader>
							),
							accessor: 'market',
							Cell: (cellProps: CellProps<typeof data[number]>) => {
								return (
									<MarketDetailsContainer
										onClick={() =>
											router.push(
												ROUTES.Markets.MarketPair(cellProps.row.original.market.asset, accountType)
											)
										}
									>
										<TableMarketDetails
											marketName={cellProps.row.original.market.marketName}
											marketKey={cellProps.row.original.market.marketKey}
										/>
									</MarketDetailsContainer>
								);
							},
							width: 120,
						},
						{
							Header: (
								<TableHeader>{t('dashboard.overview.futures-positions-table.side')}</TableHeader>
							),
							accessor: 'position',
							Cell: (cellProps: CellProps<typeof data[number]>) => {
								return <PositionType side={cellProps.row.original.position.side} />;
							},
							width: 60,
						},
						{
							Header: (
								<TableHeader>
									{t('dashboard.overview.futures-positions-table.notionalValue')}
								</TableHeader>
							),
							accessor: 'notionalValue',
							Cell: (cellProps: CellProps<typeof data[number]>) => {
								const formatOptions = cellProps.row.original.position.notionalValue.gte(1e6)
									? { truncate: true }
									: {};

								return (
									<FlexDivRowCentered>
										<div>
											<div>
												<Currency.Price
													price={cellProps.row.original.position.size}
													currencyKey={cellProps.row.original.market.asset}
												/>
											</div>
											<Currency.Price
												price={cellProps.row.original.position.notionalValue}
												formatOptions={formatOptions}
												side="secondary"
											/>
										</div>
										<Spacer width={10} />
										{accountType === 'cross_margin' && (
											<Pill
												onClick={() =>
													dispatch(
														setShowPositionModal({
															type: 'futures_edit_position_size',
															marketKey: cellProps.row.original.market.marketKey,
														})
													)
												}
												size="small"
											>
												Edit
											</Pill>
										)}
									</FlexDivRowCentered>
								);
							},
							width: 90,
						},
						{
							Header: (
								<TableHeader>
									{t('dashboard.overview.futures-positions-table.avg-entry')}
								</TableHeader>
							),
							accessor: 'avgEntryPrice',
							Cell: (cellProps: CellProps<typeof data[number]>) => {
								return cellProps.row.original.avgEntryPrice === undefined ? (
									<Body>{NO_VALUE}</Body>
								) : (
									<Currency.Price
										price={cellProps.row.original.avgEntryPrice}
										formatOptions={{ suggestDecimals: true }}
									/>
								);
							},
							width: 115,
						},
						{
							Header: (
								<TableHeader>
									{t('dashboard.overview.futures-positions-table.liquidationPrice')}
								</TableHeader>
							),
							accessor: 'liquidationPrice',
							Cell: (cellProps: CellProps<typeof data[number]>) => {
								return (
									<Currency.Price
										price={cellProps.row.original.position.liquidationPrice}
										formatOptions={{ suggestDecimals: true }}
										side="preview"
									/>
								);
							},
							width: 100,
						},
						{
							Header: <TableHeader>Market Margin</TableHeader>,
							accessor: 'margin',
							Cell: (cellProps: CellProps<typeof data[number]>) => {
								return (
									<FlexDivRowCentered>
										<div>
											<NumericValue value={cellProps.row.original.position.initialMargin} />
											<NumericValue
												value={cellProps.row.original.position.leverage}
												color="secondary"
												suffix="x"
											/>
										</div>
										<Spacer width={10} />
										{accountType === 'cross_margin' && (
											<Pill
												onClick={() =>
													dispatch(
														setShowPositionModal({
															type: 'futures_edit_position_margin',
															marketKey: cellProps.row.original.market.marketKey,
														})
													)
												}
											>
												Edit
											</Pill>
										)}
									</FlexDivRowCentered>
								);
							},
							width: 115,
						},
						{
							Header: (
								<TableHeader>{t('dashboard.overview.futures-positions-table.pnl')}</TableHeader>
							),
							accessor: 'pnl',
							Cell: (cellProps: CellProps<any>) => {
								return (
									<PnlContainer>
										<Currency.Price price={cellProps.row.original.position.pnl} colored />
										<NumericValue value={cellProps.row.original.position.pnlPct} colored>
											{formatPercent(cellProps.row.original.position.pnlPct)}
										</NumericValue>
									</PnlContainer>
								);
							},
							width: 100,
						},
						{
							Header: <TableHeader>Funding</TableHeader>,
							accessor: 'funding',
							Cell: (cellProps: CellProps<typeof data[number]>) => {
								return (
									<Currency.Price price={cellProps.row.original.position.accruedFunding} colored />
								);
							},
							width: 90,
						},
						{
							Header: <TableHeader>TP/SL</TableHeader>,
							accessor: 'tp-sl',
							Cell: (cellProps: CellProps<typeof data[number]>) => {
								return (
									<FlexDivRowCentered>
										<div style={{ marginRight: 10 }}>
											{cellProps.row.original.takeProfit === undefined ? (
												<Body>{NO_VALUE}</Body>
											) : (
												<Currency.Price price={cellProps.row.original.takeProfit} />
											)}
											{cellProps.row.original.stopLoss === undefined ? (
												<Body>{NO_VALUE}</Body>
											) : (
												<Currency.Price price={cellProps.row.original.stopLoss} />
											)}
										</div>
										{accountType === 'cross_margin' && (
											<Pill
												onClick={() =>
													dispatch(
														setShowPositionModal({
															type: 'futures_edit_stop_loss_take_profit',
															marketKey: cellProps.row.original.market.marketKey,
														})
													)
												}
											>
												Edit
											</Pill>
										)}
									</FlexDivRowCentered>
								);
							},
							width: 110,
						},
						{
							Header: <TableHeader>Position</TableHeader>,
							accessor: 'pos',
							Cell: (cellProps: CellProps<typeof data[number]>) => {
								return (
									<div>
										<Pill
											onClick={() =>
												dispatch(
													setShowPositionModal({
														type: 'futures_close_position',
														marketKey: cellProps.row.original.market.marketKey,
													})
												)
											}
											size="small"
										>
											Close
										</Pill>
									</div>
								);
							},
							width: 90,
						},
					]}
				/>
			</TableContainer>
		</Container>
	);
};

const Container = styled.div`
	width: 100%;
	overflow: scroll;
`;

const TableContainer = styled.div`
	min-width: 1200px;
`;

const PnlContainer = styled.div`
	display: flex;
	flex-direction: column;
`;

const MarketDetailsContainer = styled.div`
	cursor: pointer;
`;

export default PositionsTable;
