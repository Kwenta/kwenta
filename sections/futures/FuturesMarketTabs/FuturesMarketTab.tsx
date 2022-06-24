import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled from 'styled-components';
import { useRouter } from 'next/router';

import Table from 'components/Table';
import { FuturesMarket } from 'queries/futures/types';
import Currency from 'components/Currency';
import ChangePercent from 'components/ChangePercent';
import { Synths } from 'constants/currency';
import useLaggedDailyPrice from 'queries/rates/useLaggedDailyPrice';
import useGetFuturesTradingVolumeForAllMarkets from 'queries/futures/useGetFuturesTradingVolumeForAllMarkets';
import { Price } from 'queries/rates/types';
import { FuturesVolumes } from 'queries/futures/types';
import MarketBadge from 'components/Badge/MarketBadge';
import { DEFAULT_FIAT_EURO_DECIMALS } from 'constants/defaults';
import { FlexDivCol } from 'styles/common';
import { isEurForex } from 'utils/futures';

type FuturesMarketsTableProps = {
	futuresMarkets: FuturesMarket[];
};

enum TableColumnAccessor {
	Market = 'market',
	DailyVolume = 'dailyVolume',
}

const FuturesMarketsTable: FC<FuturesMarketsTableProps> = ({
	futuresMarkets,
}: FuturesMarketsTableProps) => {
	const { t } = useTranslation();
	const router = useRouter();

	const synthList = futuresMarkets.map(({ asset }) => asset);
	const dailyPriceChangesQuery = useLaggedDailyPrice(synthList);

	const futuresVolumeQuery = useGetFuturesTradingVolumeForAllMarkets();

	let data = useMemo(() => {
		const dailyPriceChanges = dailyPriceChangesQuery?.data ?? [];
		const futuresVolume: FuturesVolumes = futuresVolumeQuery?.data ?? ({} as FuturesVolumes);

		return futuresMarkets.map((market: FuturesMarket, i: number) => {
			const volume = futuresVolume[market.assetHex];
			const pastPrice = dailyPriceChanges.find((price: Price) => price.synth === market.asset);

			return {
				asset: market.asset,
				market: (market.asset[0] === 's' ? market.asset.slice(1) : market.asset) + '-PERP',
				price: market.price.toNumber(),
				volume: volume?.toNumber() || 0,
				priceChange: (market.price.toNumber() - pastPrice?.price) / market.price.toNumber() || '-',
			};
		});
	}, [futuresMarkets, dailyPriceChangesQuery?.data, futuresVolumeQuery?.data]);

	return (
		<TableContainer>
			<StyledTable
				data={data}
				showPagination={true}
				onTableRowClick={(row) => {
					router.push(`/market/${row.original.asset}`);
				}}
				highlightRowsOnHover
				customCellProps={() => {
					return {
						[TableColumnAccessor.DailyVolume]: {
							key: TableColumnAccessor.DailyVolume,
							style: {
								justifyContent: 'end',
								textAlign: 'right',
							},
						},
					};
				}}
				customHeaderProps={() => {
					return {
						[TableColumnAccessor.DailyVolume]: {
							key: TableColumnAccessor.DailyVolume,
							style: {
								justifyContent: 'end',
								textAlign: 'right',
							},
						},
					};
				}}
				sortBy={[
					{
						id: 'dailyVolume',
						desc: true,
					},
				]}
				columns={[
					{
						Header: <TableHeader>{t('futures.market.sidebar-tab.market-price')}</TableHeader>,
						accessor: TableColumnAccessor.Market,
						Cell: (cellProps: CellProps<any>) => {
							const formatOptions = isEurForex(cellProps.row.original.asset)
								? { minDecimals: DEFAULT_FIAT_EURO_DECIMALS }
								: {};
							return cellProps.row.original.market === '-' ? (
								<DefaultCell>-</DefaultCell>
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
									{cellProps.row.original.price === '-' ? (
										<DefaultCell>-</DefaultCell>
									) : (
										<StyledPrice isPositive={cellProps.row.original.priceChange > 0}>
											<Currency.Price
												currencyKey={Synths.sUSD}
												price={cellProps.row.original.price}
												sign={'$'}
												conversionRate={1}
												formatOptions={formatOptions}
											/>
										</StyledPrice>
									)}
								</MarketContainer>
							);
						},
						width: 190,
					},
					{
						Header: <TableHeader>{t('futures.market.sidebar-tab.daily-volume')}</TableHeader>,
						accessor: TableColumnAccessor.DailyVolume,
						Cell: (cellProps: CellProps<any>) => {
							return (
								<DataCol>
									<DataRow>
										{cellProps.row.original.volume === '-' ? (
											<DefaultCell>-</DefaultCell>
										) : (
											<Currency.Price
												currencyKey={Synths.sUSD}
												price={cellProps.row.original.volume}
												sign={'$'}
												conversionRate={1}
											/>
										)}
									</DataRow>
									<DataRow>
										{cellProps.row.original.priceChange === '-' ? (
											<DefaultCell>-</DefaultCell>
										) : (
											<ChangePercent
												value={cellProps.row.original.priceChange}
												decimals={2}
												className="change-pct"
											/>
										)}
									</DataRow>
								</DataCol>
							);
						},
						width: 100,
						sortable: true,
						sortType: useMemo(
							() => (rowA: any, rowB: any) => {
								const rowOne = rowA.original.volume;
								const rowTwo = rowB.original.volume;
								return rowOne > rowTwo ? 1 : -1;
							},
							[]
						),
					},
				]}
			/>
		</TableContainer>
	);
};

const StyledPrice = styled.div<{ isPositive: boolean }>`
	span {
		span {
			display: inline-flex;
			align-items: center;
			color: ${(props) =>
				props.isPositive
					? props.theme.colors.selectedTheme.green
					: props.theme.colors.selectedTheme.red};
		}
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

const DefaultCell = styled.p``;

const TableContainer = styled.div`
	margin-top: 16px;
	margin-bottom: '40px';

	.paused {
		color: ${(props) => props.theme.colors.selectedTheme.gray};
	}
`;

const StyledTable = styled(Table)`
	margin-bottom: 20px;
`;

const TableHeader = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`;

const StyledText = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: -4px;
	grid-column: 2;
	grid-row: 1;
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	font-family: ${(props) => props.theme.fonts.bold};
`;

const MarketContainer = styled.div`
	display: grid;
	grid-template-rows: auto auto;
	grid-template-columns: auto auto;
	align-items: center;
`;

const DataCol = styled(FlexDivCol)`
	justify-content: space-between;
`;
const DataRow = styled.div`
	align-items: 'flex-end';
`;

export default FuturesMarketsTable;
