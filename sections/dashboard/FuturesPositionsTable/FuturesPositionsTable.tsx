import Table from 'components/Table';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import Connector from 'containers/Connector';
import Currency from 'components/Currency';
import PositionType from 'components/Text/PositionType';
import ChangePercent from 'components/ChangePercent';
import { Synths } from 'constants/currency';
import { FuturesPosition, FuturesMarket, PositionHistory } from 'queries/futures/types';
import { formatNumber } from 'utils/formatters/number';
import useGetFuturesPositionForMarkets from 'queries/futures/useGetFuturesPositionForMarkets';
import { NO_VALUE } from 'constants/placeholder';
import { DEFAULT_DATA } from './constants';
import { DEFAULT_FIAT_EURO_DECIMALS } from 'constants/defaults';
import { getMarketKey, getSynthDescription, isEurForex } from 'utils/futures';
import MarketBadge from 'components/Badge/MarketBadge';

type FuturesPositionTableProps = {
	futuresMarkets: FuturesMarket[];
	futuresPositionHistory: PositionHistory[];
};

const FuturesPositionsTable: FC<FuturesPositionTableProps> = ({
	futuresMarkets,
	futuresPositionHistory,
}: FuturesPositionTableProps) => {
	const { t } = useTranslation();
	const { synthsMap, network } = Connector.useContainer();
	const router = useRouter();

	const futuresPositionQuery = useGetFuturesPositionForMarkets(
		futuresMarkets.map(({ asset }) => getMarketKey(asset, network.id))
	);

	let data = useMemo(() => {
		const futuresPositions = futuresPositionQuery?.data ?? [];
		const activePositions = futuresPositions.filter(
			(position: FuturesPosition) => position?.position
		);
		return activePositions.length > 0
			? activePositions.map((position: FuturesPosition, i: number) => {
					const market = futuresMarkets.find((market) => market.asset === position.asset);
					const description = getSynthDescription(position.asset, synthsMap, t);
					const positionHistory = futuresPositionHistory?.find(
						(positionHistory: PositionHistory) => {
							return positionHistory.isOpen && positionHistory.asset === position.asset;
						}
					);

					return {
						asset: position.asset,
						market:
							(position.asset[0] === 's' ? position.asset.slice(1) : position.asset) + '-PERP',
						description: description,
						notionalValue: position?.position?.notionalValue.abs(),
						position: position?.position?.side,
						lastPrice: position?.position?.lastPrice,
						avgEntryPrice: positionHistory?.entryPrice ?? NO_VALUE,
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
			: DEFAULT_DATA;
	}, [futuresPositionQuery?.data, futuresMarkets, synthsMap, t, futuresPositionHistory]);

	return (
		<TableContainer>
			<StyledTable
				data={data}
				showPagination={true}
				onTableRowClick={(row) =>
					row.original.asset !== NO_VALUE ? router.push(`/market/${row.original.asset}`) : undefined
				}
				highlightRowsOnHover
				columns={[
					{
						Header: (
							<TableHeader>{t('dashboard.overview.futures-positions-table.market')}</TableHeader>
						),
						accessor: 'market',
						Cell: (cellProps: CellProps<any>) => {
							return cellProps.row.original.market === NO_VALUE ? (
								<DefaultCell>{NO_VALUE}</DefaultCell>
							) : (
								<MarketContainer>
									<IconContainer>
										<StyledCurrencyIcon
											currencyKey={
												(cellProps.row.original.asset[0] !== 's' ? 's' : '') +
												cellProps.row.original.asset
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
							<TableHeader>{t('dashboard.overview.futures-positions-table.position')}</TableHeader>
						),
						accessor: 'position',
						Cell: (cellProps: CellProps<any>) => {
							return cellProps.row.original.position === NO_VALUE ? (
								<DefaultCell>{NO_VALUE}</DefaultCell>
							) : (
								<PositionType side={cellProps.row.original.position} />
							);
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
							return cellProps.row.original.notionalValue === NO_VALUE ? (
								<DefaultCell>{NO_VALUE}</DefaultCell>
							) : (
								<Currency.Price
									currencyKey={Synths.sUSD}
									price={cellProps.row.original.notionalValue}
									sign={'$'}
									conversionRate={1}
								/>
							);
						},
						width: 90,
					},
					{
						Header: (
							<TableHeader>{t('dashboard.overview.futures-positions-table.leverage')}</TableHeader>
						),
						accessor: 'leverage',
						Cell: (cellProps: CellProps<any>) => {
							return cellProps.row.original.leverage === NO_VALUE ? (
								<DefaultCell>{NO_VALUE}</DefaultCell>
							) : (
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
							return cellProps.row.original.pnl === NO_VALUE ? (
								<DefaultCell>{NO_VALUE}</DefaultCell>
							) : (
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
							<TableHeader>{t('dashboard.overview.futures-positions-table.avg-entry')}</TableHeader>
						),
						accessor: 'avgEntryPrice',
						Cell: (cellProps: CellProps<any>) => {
							const formatOptions = isEurForex(cellProps.row.original.asset)
								? { minDecimals: DEFAULT_FIAT_EURO_DECIMALS }
								: {};
							return cellProps.row.original.avgEntryPrice === NO_VALUE ? (
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
							return cellProps.row.original.liquidationPrice === NO_VALUE ? (
								<DefaultCell>{NO_VALUE}</DefaultCell>
							) : (
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
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
`;

const TableContainer = styled.div``;

const StyledTable = styled(Table)`
	/* margin-top: 20px; */
`;

const TableHeader = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`;

const StyledText = styled.div`
	display: flex;
	align-items: center;
	grid-column: 2;
	grid-row: 1;
	margin-bottom: -4px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	font-family: ${(props) => props.theme.fonts.bold};
`;

const MarketContainer = styled.div`
	display: grid;
	grid-template-rows: auto auto;
	grid-template-columns: auto auto;
	align-items: center;
`;

export default FuturesPositionsTable;
