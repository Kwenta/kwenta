import Table from 'components/Table';
import { FC, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import Connector from 'containers/Connector';
import Currency from 'components/Currency';
import PositionType from 'components/Text/PositionType';
import ChangePercent from 'components/ChangePercent';
import { Synths } from 'constants/currency';
import { FuturesPosition, FuturesMarket } from 'queries/futures/types';
import { formatNumber } from 'utils/formatters/number';
import useGetFuturesPositionForMarkets from 'queries/futures/useGetFuturesPositionForMarkets';
import { NO_VALUE } from 'constants/placeholder';
import { DEFAULT_DATA } from './constants';

type FuturesPositionTableProps = {
	futuresMarkets: FuturesMarket[];
};

const FuturesPositionsTable: FC<FuturesPositionTableProps> = ({
	futuresMarkets,
}: FuturesPositionTableProps) => {
	const { t } = useTranslation();
	const { synthsMap } = Connector.useContainer();
	const router = useRouter();
	const futuresPositionQuery = useGetFuturesPositionForMarkets(
		futuresMarkets.map(({ asset }) => asset)
	);
	const futuresPositions = futuresPositionQuery?.data ?? [];

	const getSynthDescription = useCallback(
		(synth: string) => {
			return t('common.currency.futures-market-short-name', {
				currencyName: synthsMap[synth] ? synthsMap[synth].description : '',
			});
		},
		[t, synthsMap]
	);

	let data = useMemo(() => {
		const activePositions = futuresPositions.filter((position: FuturesPosition) => position?.position)
		return activePositions.length > 0 ? activePositions.map((position: FuturesPosition, i: number) => {
			const description = getSynthDescription(position.asset);

			return {
				asset: position.asset,
				market: position.asset.slice(1) + '-PERP',
				description: description,
				notionalValue: position?.position?.notionalValue,
				position: position?.position?.side,
				avgOpenClose: position?.position?.lastPrice,
				liquidationPrice: position?.position?.liquidationPrice,
				pnl: position?.position?.profitLoss.add(position?.position?.accruedFunding),
				pnlPct: position?.position?.profitLoss.div(
					position?.position?.initialMargin.mul(position?.position?.initialLeverage)
				),
				margin: position.accessibleMargin,
				leverage: position?.position?.leverage,
			};
		})
		: DEFAULT_DATA
	}, [futuresPositions, futuresMarkets, getSynthDescription]);

	return (
		<TableContainer>
			<StyledTable
				data={data}
				pageSize={5}
				showPagination={true}
				onTableRowClick={(row) => {
					router.push(`/market/${row.original.asset}`);
				}}
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
										<StyledCurrencyIcon currencyKey={cellProps.row.original.asset} />
									</IconContainer>
									<StyledText>{cellProps.row.original.market}</StyledText>
									<StyledValue>{cellProps.row.original.description}</StyledValue>
								</MarketContainer>
							);
						},
						width: 180,
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
						width: 80,
					},
					{
						Header: (
							<TableHeader>{t('dashboard.overview.futures-positions-table.notionalValue')}</TableHeader>
						),
						accessor: 'notionalValue',
						Cell: (cellProps: CellProps<any>) => {
							return cellProps.row.original.margin === NO_VALUE ? (
								<DefaultCell>{NO_VALUE}</DefaultCell>
							) : (
								<Currency.Price
									currencyKey={Synths.sUSD}
									price={cellProps.row.original.margin}
									sign={'$'}
									conversionRate={1}
								/>
							);
						},
						width: 120,
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
								<p>{formatNumber(cellProps.row.original.leverage ?? 0)}x</p>
							);
						},
						width: 80,
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
									<ChangePercent value={cellProps.row.original.pnlPct} className="change-pct" />
									<div>
										(<Currency.Price
											currencyKey={Synths.sUSD}
											price={cellProps.row.original.pnl}
											sign={'$'}
											conversionRate={1}
										/>)
									</div>
								</PnlContainer>
							);
						},
						width: 125,
					},
					{
						Header: (
							<TableHeader>
								{t('dashboard.overview.futures-positions-table.avg-open-close')}
							</TableHeader>
						),
						accessor: 'avgOpenClose',
						Cell: (cellProps: CellProps<any>) => {
							return cellProps.row.original.avgOpenClose === NO_VALUE ? (
								<DefaultCell>{NO_VALUE}</DefaultCell>
								) : (
									<Currency.Price
									currencyKey={Synths.sUSD}
									price={cellProps.row.original.avgOpenClose}
									sign={'$'}
									conversionRate={1}
								/>
								);
							},
							width: 125,
					},
					{
						Header: (
							<TableHeader>{t('dashboard.overview.futures-positions-table.liquidationPrice')}</TableHeader>
						),
						accessor: 'liquidationPrice',
						Cell: (cellProps: CellProps<any>) => {
							return cellProps.row.original.liquidationPrice === NO_VALUE ? (
								<DefaultCell>{NO_VALUE}</DefaultCell>
							) : (
								<Currency.Price
									currencyKey={Synths.sUSD}
									price={cellProps.row.original.liquidationPrice}
									sign={'$'}
									conversionRate={1}
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
	flex-direction: flex-row;
	align-items: center;

	.change-pct {
		margin-right: 4px;
	}
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
	color: ${(props) => props.theme.colors.common.secondaryGray};
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 12px;
	grid-column: 2;
	grid-row: 2;
`;

const DefaultCell = styled.p``;

const TableContainer = styled.div`
	margin-top: 16px;
	margin-bottom: '40px';
`;

const StyledTable = styled(Table)`
	margin-top: '20px';
`;

const TableHeader = styled.div``;

const StyledText = styled.div`
	grid-column: 2;
	grid-row: 1;
`;

const MarketContainer = styled.div`
	display: grid;
	grid-template-rows: auto auto;
	grid-template-columns: auto auto;
	align-items: center;
`;

export default FuturesPositionsTable;
