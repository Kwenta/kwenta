import Link from 'next/link';
import { useRouter } from 'next/router';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import MarketBadge from 'components/Badge/MarketBadge';
import ChangePercent from 'components/ChangePercent';
import Currency from 'components/Currency';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import Table, { TableNoResults } from 'components/Table';
import PositionType from 'components/Text/PositionType';
import { DEFAULT_CRYPTO_DECIMALS } from 'constants/defaults';
import { NO_VALUE } from 'constants/placeholder';
import ROUTES from 'constants/routes';
import Connector from 'containers/Connector';
import useIsL2 from 'hooks/useIsL2';
import useNetworkSwitcher from 'hooks/useNetworkSwitcher';
import { FuturesAccountType } from 'queries/futures/subgraph';
import { selectFuturesPositions, selectMarketAsset, selectMarkets } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { positionHistoryState } from 'store/futures';
import { formatNumber } from 'utils/formatters/number';
import { getSynthDescription, isDecimalFour } from 'utils/futures';

import MobilePositionRow from './MobilePositionRow';

type FuturesPositionTableProps = {
	accountType: FuturesAccountType;
	showCurrentMarket?: boolean;
};

const FuturesPositionsTable: FC<FuturesPositionTableProps> = ({
	accountType,
	showCurrentMarket = true,
}: FuturesPositionTableProps) => {
	const { t } = useTranslation();
	const { synthsMap } = Connector.useContainer();
	const router = useRouter();
	const { switchToL2 } = useNetworkSwitcher();

	const isL2 = useIsL2();

	const positions = useAppSelector(selectFuturesPositions);
	const positionHistory = useRecoilValue(positionHistoryState);
	const currentMarket = useAppSelector(selectMarketAsset);
	const futuresMarkets = useAppSelector(selectMarkets);

	let data = useMemo(() => {
		return positions
			.map((position) => {
				const market = futuresMarkets.find((market) => market.asset === position.asset);
				const description = getSynthDescription(position.asset, synthsMap, t);
				const thisPositionHistory = positionHistory[accountType].find((positionHistory) => {
					return positionHistory.isOpen && positionHistory.asset === position.asset;
				});

				return {
					market,
					position: position.position,
					description,
					avgEntryPrice: thisPositionHistory?.entryPrice,
				};
			})
			.filter(
				(position) =>
					position.position && (position?.market?.asset !== currentMarket || showCurrentMarket)
			);
	}, [
		positions,
		accountType,
		futuresMarkets,
		positionHistory,
		currentMarket,
		synthsMap,
		t,
		showCurrentMarket,
	]);

	return (
		<>
			<DesktopOnlyView>
				<TableContainer>
					<Table
						data={data}
						showPagination
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
									{!showCurrentMarket ? (
										t('dashboard.overview.futures-positions-table.no-result')
									) : (
										<Link href={ROUTES.Markets.Home(accountType)}>
											<div>{t('common.perp-cta')}</div>
										</Link>
									)}
								</TableNoResults>
							)
						}
						highlightRowsOnHover
						columns={[
							{
								Header: (
									<TableHeader>
										{t('dashboard.overview.futures-positions-table.market')}
									</TableHeader>
								),
								accessor: 'market',
								Cell: (cellProps: CellProps<any>) => {
									return (
										<MarketContainer>
											<IconContainer>
												<StyledCurrencyIcon currencyKey={cellProps.row.original.market.marketKey} />
											</IconContainer>
											<StyledText>
												{cellProps.row.original.market.marketName}
												<MarketBadge
													currencyKey={cellProps.row.original.market.marketKey}
													isFuturesMarketClosed={cellProps.row.original.market.isSuspended}
													futuresClosureReason={cellProps.row.original.market.marketClosureReason}
												/>
											</StyledText>
											<StyledValue>{cellProps.row.original.description}</StyledValue>
										</MarketContainer>
									);
								},
								width: 198,
							},
							{
								Header: (
									<TableHeader>{t('dashboard.overview.futures-positions-table.side')}</TableHeader>
								),
								accessor: 'position',
								Cell: (cellProps: CellProps<any>) => {
									return <PositionType side={cellProps.row.original.position.side} />;
								},
								width: 90,
							},
							{
								Header: (
									<TableHeader>
										{t('dashboard.overview.futures-positions-table.notionalValue')}
									</TableHeader>
								),
								accessor: 'notionalValue',
								Cell: (cellProps: CellProps<any>) => {
									const formatOptions = cellProps.row.original.position.notionalValue.gte(1e6)
										? { truncation: { divisor: 1e6, unit: 'M' } }
										: {};

									return (
										<Currency.Price
											currencyKey={'sUSD'}
											price={cellProps.row.original.position.notionalValue}
											sign={'$'}
											conversionRate={1}
											formatOptions={formatOptions}
										/>
									);
								},
								width: 90,
							},
							{
								Header: (
									<TableHeader>
										{t('dashboard.overview.futures-positions-table.leverage')}
									</TableHeader>
								),
								accessor: 'leverage',
								Cell: (cellProps: CellProps<any>) => {
									return (
										<DefaultCell>
											{formatNumber(cellProps.row.original.position.leverage ?? 0)}x
										</DefaultCell>
									);
								},
								width: 90,
							},
							{
								Header: (
									<TableHeader>{t('dashboard.overview.futures-positions-table.pnl')}</TableHeader>
								),
								accessor: 'pnl',
								Cell: (cellProps: CellProps<any>) => {
									return (
										<PnlContainer>
											<ChangePercent value={cellProps.row.original.position.pnlPct} />
											<div>
												<Currency.Price
													currencyKey={'sUSD'}
													price={cellProps.row.original.position.pnl}
													sign={'$'}
													conversionRate={1}
												/>
											</div>
										</PnlContainer>
									);
								},
								width: 125,
							},
							{
								Header: (
									<TableHeader>
										{t('dashboard.overview.futures-positions-table.avg-entry')}
									</TableHeader>
								),
								accessor: 'avgEntryPrice',
								Cell: (cellProps: CellProps<any>) => {
									const formatOptions = isDecimalFour(cellProps.row.original.market.asset)
										? { minDecimals: DEFAULT_CRYPTO_DECIMALS }
										: {};
									return cellProps.row.original.avgEntryPrice === undefined ? (
										<DefaultCell>{NO_VALUE}</DefaultCell>
									) : (
										<Currency.Price
											currencyKey={'sUSD'}
											price={cellProps.row.original.avgEntryPrice}
											sign={'$'}
											conversionRate={1}
											formatOptions={formatOptions}
										/>
									);
								},
								width: 125,
							},
							{
								Header: (
									<TableHeader>
										{t('dashboard.overview.futures-positions-table.liquidationPrice')}
									</TableHeader>
								),
								accessor: 'liquidationPrice',
								Cell: (cellProps: CellProps<any>) => {
									const formatOptions = isDecimalFour(cellProps.row.original.market.asset)
										? { minDecimals: DEFAULT_CRYPTO_DECIMALS }
										: {};
									return (
										<Currency.Price
											currencyKey={'sUSD'}
											price={cellProps.row.original.position.liquidationPrice}
											sign={'$'}
											conversionRate={1}
											formatOptions={formatOptions}
										/>
									);
								},
								width: 115,
							},
						]}
					/>
				</TableContainer>
			</DesktopOnlyView>
			<MobileOrTabletView>
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
									router.push(ROUTES.Markets.MarketPair(row.market?.asset ?? 'sETH', accountType))
								}
								key={row.market?.asset}
								row={row}
							/>
						))
					)}
				</div>
			</MobileOrTabletView>
		</>
	);
};

const PnlContainer = styled.div`
	display: flex;
	flex-direction: column;
`;

const StyledCurrencyIcon = styled(Currency.Icon)`
	width: 30px;
	height: 30px;
	margin-right: 8px;
`;

const IconContainer = styled.div`
	grid-column: 1;
	grid-row: 1 / span 2;
`;

const StyledValue = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 12px;
	grid-column: 2;
	grid-row: 2;
`;

const DefaultCell = styled.p`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
`;

const TableContainer = styled.div``;

const TableHeader = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`;

const StyledText = styled.div`
	display: flex;
	align-items: center;
	grid-column: 2;
	grid-row: 1;
	margin-bottom: -4px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	font-family: ${(props) => props.theme.fonts.bold};
`;

const MarketContainer = styled.div`
	display: grid;
	grid-template-rows: auto auto;
	grid-template-columns: auto auto;
	align-items: center;
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

export default FuturesPositionsTable;
