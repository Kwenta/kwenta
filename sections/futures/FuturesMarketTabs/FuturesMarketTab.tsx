import { useRouter } from 'next/router';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { useRecoilValue } from 'recoil';
import styled, { css } from 'styled-components';

import MarketBadge from 'components/Badge/MarketBadge';
import ChangePercent from 'components/ChangePercent';
import Currency from 'components/Currency';
import Table from 'components/Table';
import { Synths } from 'constants/currency';
import { DEFAULT_FIAT_EURO_DECIMALS } from 'constants/defaults';
import ROUTES from 'constants/routes';
import useGetFuturesTradingVolumeForAllMarkets from 'queries/futures/useGetFuturesTradingVolumeForAllMarkets';
import useLaggedDailyPrice from 'queries/rates/useLaggedDailyPrice';
import { futuresMarketsState } from 'store/futures';
import { FlexDivCol } from 'styles/common';
import { FuturesMarketAsset, isEurForex, MarketKeyByAsset } from 'utils/futures';

enum TableColumnAccessor {
	Market = 'market',
	DailyVolume = 'dailyVolume',
}

const FuturesMarketsTable: FC = () => {
	const { t } = useTranslation();
	const router = useRouter();

	const futuresMarkets = useRecoilValue(futuresMarketsState);

	const synthList = futuresMarkets.map(({ asset }) => asset);
	const dailyPriceChangesQuery = useLaggedDailyPrice(synthList);

	const futuresVolumeQuery = useGetFuturesTradingVolumeForAllMarkets();

	let data = useMemo(() => {
		const dailyPriceChanges = dailyPriceChangesQuery?.data ?? [];
		const futuresVolume = futuresVolumeQuery?.data ?? {};

		return (
			futuresMarkets?.map((market) => {
				const volume = futuresVolume[market.assetHex];
				const pastPrice = dailyPriceChanges.find((price) => price.synth === market.asset);

				return {
					asset: market.asset,
					market: market.marketName,
					price: market.price,
					volume: volume?.toNumber() ?? 0,
					priceChange: market.price.sub(pastPrice?.price ?? 0).div(market.price) || 0,
				};
			}) ?? []
		);
	}, [futuresMarkets, dailyPriceChangesQuery?.data, futuresVolumeQuery?.data]);

	return (
		<TableContainer>
			<StyledTable
				data={data}
				showPagination
				onTableRowClick={(row) => {
					router.push(ROUTES.Markets.MarketPair(row.original.asset));
				}}
				highlightRowsOnHover
				sortBy={[{ id: 'dailyVolume', desc: true }]}
				columns={[
					{
						Header: <TableHeader>{t('futures.market.sidebar-tab.market-price')}</TableHeader>,
						accessor: TableColumnAccessor.Market,
						Cell: (cellProps: CellProps<any>) => {
							const formatOptions = isEurForex(cellProps.row.original.asset)
								? { minDecimals: DEFAULT_FIAT_EURO_DECIMALS }
								: {};
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
									<StyledPrice isPositive={cellProps.row.original.priceChange > 0}>
										<Currency.Price
											currencyKey={Synths.sUSD}
											price={cellProps.row.original.price}
											sign={'$'}
											conversionRate={1}
											formatOptions={formatOptions}
										/>
									</StyledPrice>
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
										<Currency.Price
											currencyKey={Synths.sUSD}
											price={cellProps.row.original.volume}
											sign={'$'}
											conversionRate={1}
										/>
									</DataRow>
									<DataRow>
										<ChangePercent
											value={cellProps.row.original.priceChange}
											decimals={2}
											className="change-pct"
										/>
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

const TableContainer = styled.div`
	margin-top: 16px;
	margin-bottom: '40px';

	.paused {
		color: ${(props) => props.theme.colors.selectedTheme.gray};
	}
`;

const TableAlignment = css`
	justify-content: space-between;

	& > div:first-child {
		flex: 60 60 0 !important;
	}

	& > div:last-child {
		justify-content: flex-end;
		text-align: right;
	}
`;

const StyledTable = styled(Table)`
	.table-row {
		${TableAlignment}
	}
	.table-body-row {
		${TableAlignment}
		padding: 6px 0px;
	}
	margin-bottom: 20px;
`;

const TableHeader = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-size: 13px;
`;

const StyledText = styled.div`
	display: flex;
	align-items: center;
	grid-column: 2;
	grid-row: 1;
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	font-family: ${(props) => props.theme.fonts.regular};
	width: max-content;
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
