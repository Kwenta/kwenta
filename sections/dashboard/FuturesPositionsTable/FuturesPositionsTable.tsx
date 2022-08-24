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
import { Synths } from 'constants/currency';
import { DEFAULT_FIAT_EURO_DECIMALS } from 'constants/defaults';
import { NO_VALUE } from 'constants/placeholder';
import ROUTES from 'constants/routes';
import Connector from 'containers/Connector';
import useNetworkSwitcher from 'hooks/useNetworkSwitcher';
import { PositionHistory } from 'queries/futures/types';
import {
	currentMarketState,
	futuresAccountTypeState,
	futuresMarketsState,
	positionsState,
} from 'store/futures';
import { isL2State } from 'store/wallet';
import { formatNumber } from 'utils/formatters/number';
import {
	FuturesMarketAsset,
	getSynthDescription,
	isEurForex,
	MarketKeyByAsset,
} from 'utils/futures';

import MobilePositionRow from './MobilePositionRow';

type FuturesPositionTableProps = {
	futuresPositionHistory: PositionHistory[];
	showCurrentMarket?: boolean;
};

const FuturesPositionsTable: FC<FuturesPositionTableProps> = ({
	futuresPositionHistory,
	showCurrentMarket = true,
}: FuturesPositionTableProps) => {
	const { t } = useTranslation();
	const { synthsMap } = Connector.useContainer();
	const router = useRouter();
	const { switchToL2 } = useNetworkSwitcher();

	const isL2 = useRecoilValue(isL2State);
	const futuresPositions = useRecoilValue(positionsState);
	const futuresMarkets = useRecoilValue(futuresMarketsState);
	const currentMarket = useRecoilValue(currentMarketState);
	const accountType = useRecoilValue(futuresAccountTypeState);

	let data = useMemo(() => {
		const activePositions = futuresPositions?.filter((position) => position?.position) ?? [];

		return activePositions
			.map((position) => {
				const market = futuresMarkets.find((market) => market.asset === position.asset);
				const description = getSynthDescription(position.asset, synthsMap, t);
				const positionHistory = futuresPositionHistory?.find((positionHistory) => {
					return positionHistory.isOpen && positionHistory.asset === position.asset;
				});

				return {
					asset: position.asset,
					market: market?.marketName,
					marketKey: MarketKeyByAsset[position.asset],
					description,
					price: market?.price,
					size: position?.position?.size,
					notionalValue: position?.position?.notionalValue.abs(),
					position: position?.position?.side,
					lastPrice: position?.position?.lastPrice,
					avgEntryPrice: positionHistory?.entryPrice,
					liquidationPrice: position?.position?.liquidationPrice,
					pnl: position?.position?.profitLoss.add(position?.position?.accruedFunding),
					pnlPct: position?.position?.profitLoss
						.add(position?.position?.accruedFunding)
						.div(position?.position?.initialMargin),
					margin: position.accessibleMargin,
					leverage: position?.position?.leverage,
					isSuspended: market?.isSuspended,
					marketClosureReason: market?.marketClosureReason,
				};
			})
			.filter((position) => position.asset !== currentMarket || showCurrentMarket);
	}, [
		futuresPositions,
		futuresMarkets,
		currentMarket,
		synthsMap,
		t,
		showCurrentMarket,
		futuresPositionHistory,
	]);

	return (
		<>
			<DesktopOnlyView>
				<TableContainer>
					<Table
						data={data}
						showPagination
						onTableRowClick={(row) =>
							router.push(ROUTES.Markets.MarketPair(row.original.asset, accountType))
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
												<StyledCurrencyIcon
													currencyKey={
														MarketKeyByAsset[cellProps.row.original.asset as FuturesMarketAsset]
													}
												/>
											</IconContainer>
											<StyledText>
												{cellProps.row.original.market}
												<MarketBadge
													currencyKey={cellProps.row.original.asset}
													isFuturesMarketClosed={cellProps.row.original.isSuspended}
													futuresClosureReason={cellProps.row.original.marketClosureReason}
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
									<TableHeader>
										{t('dashboard.overview.futures-positions-table.position')}
									</TableHeader>
								),
								accessor: 'position',
								Cell: (cellProps: CellProps<any>) => {
									return <PositionType side={cellProps.row.original.position} />;
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
									const formatOptions = cellProps.row.original.notionalValue.gte(1e6)
										? { truncation: { divisor: 1e6, unit: 'M' } }
										: {};

									return (
										<Currency.Price
											currencyKey={Synths.sUSD}
											price={cellProps.row.original.notionalValue}
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
										<DefaultCell>{formatNumber(cellProps.row.original.leverage ?? 0)}x</DefaultCell>
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
											<ChangePercent value={cellProps.row.original.pnlPct} />
											<div>
												<Currency.Price
													currencyKey={Synths.sUSD}
													price={cellProps.row.original.pnl}
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
									const formatOptions = isEurForex(cellProps.row.original.asset)
										? { minDecimals: DEFAULT_FIAT_EURO_DECIMALS }
										: {};
									return cellProps.row.original.avgEntryPrice === undefined ? (
										<DefaultCell>{NO_VALUE}</DefaultCell>
									) : (
										<Currency.Price
											currencyKey={Synths.sUSD}
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
									const formatOptions = isEurForex(cellProps.row.original.asset)
										? { minDecimals: DEFAULT_FIAT_EURO_DECIMALS }
										: {};
									return (
										<Currency.Price
											currencyKey={Synths.sUSD}
											price={cellProps.row.original.liquidationPrice}
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
								onClick={() => router.push(`/market/?asset=${row.asset}`)}
								key={row.asset}
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
