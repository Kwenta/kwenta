import Link from 'next/link';
import { useRouter } from 'next/router';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled, { useTheme } from 'styled-components';

import LinkArrow from 'assets/svg/app/link-arrow.svg';
import Button from 'components/Button';
import Currency from 'components/Currency';
import { FlexDivRowCentered } from 'components/layout/flex';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import Pill from 'components/Pill';
import Spacer from 'components/Spacer';
import Table, { TableNoResults } from 'components/Table';
import { Body, NumericValue } from 'components/Text';
import { EXTERNAL_LINKS } from 'constants/links';
import { NO_VALUE } from 'constants/placeholder';
import ROUTES from 'constants/routes';
import useIsL2 from 'hooks/useIsL2';
import useNetworkSwitcher from 'hooks/useNetworkSwitcher';
import { FuturesAccountType } from 'queries/futures/subgraph';
import MobilePositionRow from 'sections/dashboard/FuturesPositionsTable/MobilePositionRow';
import PositionType from 'sections/futures/PositionType';
import { setShowPositionModal } from 'state/app/reducer';
import {
	selectCrossMarginPositions,
	selectIsolatedMarginPositions,
	selectMarketAsset,
	selectMarkets,
	selectPositionHistory,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import media from 'styles/media';

import TableMarketDetails from './TableMarketDetails';

type FuturesPositionTableProps = {
	accountType: FuturesAccountType;
	showCurrentMarket?: boolean;
	showEmptyTable?: boolean;
};

const LegacyLink = () => {
	const { t } = useTranslation();
	const theme = useTheme();
	return (
		<ButtonContainer>
			<Button
				fullWidth
				variant="flat"
				size="small"
				noOutline={true}
				textTransform="none"
				onClick={() => window.open(EXTERNAL_LINKS.Trade.V1, '_blank', 'noopener noreferrer')}
			>
				{t('dashboard.overview.futures-positions-table.legacy-link')}
				<StyledArrow fill={theme.colors.selectedTheme.text.value} />
			</Button>
		</ButtonContainer>
	);
};

const PositionsTable: FC<FuturesPositionTableProps> = ({ accountType, showEmptyTable = true }) => {
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
		<div style={{ height: '100%' }}>
			<DesktopOnlyView>
				<Table
					data={data}
					rounded={false}
					onTableRowClick={(row) =>
						router.push(ROUTES.Markets.MarketPair(row.original.market.asset, accountType))
					}
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
									<TableMarketDetails
										marketName={cellProps.row.original.market.marketName}
										marketKey={cellProps.row.original.market.marketKey}
									/>
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
										<div style={{ marginRight: 10 }}>
											<NumericValue value={cellProps.row.original.position.initialMargin} />
											<NumericValue
												value={cellProps.row.original.position.leverage}
												color="secondary"
												suffix="x"
											/>
										</div>
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
												<NumericValue value={cellProps.row.original.takeProfit} />
											)}
											{cellProps.row.original.stopLoss === undefined ? (
												<Body>{NO_VALUE}</Body>
											) : (
												<NumericValue value={cellProps.row.original.stopLoss} />
											)}
										</div>
										<Pill>Edit</Pill>
									</FlexDivRowCentered>
								);
							},
							width: 90,
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
			</DesktopOnlyView>
			<MobileOrTabletView>
				<LegacyLink />
				{(showEmptyTable || data.length) && (
					<>
						<OpenPositionsHeader>
							<div>{t('dashboard.overview.futures-positions-table.mobile.market')}</div>
							<OpenPositionsRightHeader>
								<div>{t('dashboard.overview.futures-positions-table.mobile.price')}</div>
								<div>{t('dashboard.overview.futures-positions-table.mobile.pnl')}</div>
							</OpenPositionsRightHeader>
						</OpenPositionsHeader>
						<div style={{ margin: '0 15px' }}>
							{data.length === 0 ? (
								<NoPositionsText>
									<Link href={ROUTES.Markets.Home(accountType)}>
										<div>{t('common.perp-cta')}</div>
									</Link>
								</NoPositionsText>
							) : (
								data.map((row) => (
									<MobilePositionRow
										onClick={() =>
											router.push(
												ROUTES.Markets.MarketPair(row.market?.asset ?? 'sETH', accountType)
											)
										}
										key={row.market?.asset}
										row={row}
									/>
								))
							)}
						</div>
					</>
				)}
			</MobileOrTabletView>
		</div>
	);
};

const ButtonContainer = styled.div`
	margin: 8px 0px 16px;

	${media.lessThan('md')`
		margin: 8px 15px 16px;
	`};
`;

const StyledArrow = styled(LinkArrow)`
	margin-left: 2px;
	width: 9px;
	height: 9px;
`;

const PnlContainer = styled.div`
	display: flex;
	flex-direction: column;
`;

const TableHeader = styled(Body)`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`;

const OpenPositionsHeader = styled.div`
	display: flex;
	justify-content: space-between;
	margin: 15px 15px 8px;
	padding: 0 10px;

	& > div {
		color: ${(props) => props.theme.colors.selectedTheme.gray};
	}

	& > div:first-child {
		width: 125px;
		margin-right: 30px;
	}
`;

const OpenPositionsRightHeader = styled.div`
	display: flex;
	flex: 1;
	justify-content: space-between;
`;

const NoPositionsText = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.text.value};
	margin: 20px 0;
	font-size: 16px;
	text-align: center;
	text-decoration: underline;
`;

export default PositionsTable;
