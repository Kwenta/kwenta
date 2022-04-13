import Table from 'components/Table';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import Connector from 'containers/Connector';
import { FuturesMarket } from 'queries/futures/types';
import Currency from 'components/Currency';
import ChangePercent from 'components/ChangePercent';
import { Synths } from 'constants/currency';
import useLaggedDailyPrice from 'queries/rates/useLaggedDailyPrice';
import useGetFuturesTradingVolumeForAllMarkets from 'queries/futures/useGetFuturesTradingVolumeForAllMarkets';
import { Price } from 'queries/rates/types';
import { FuturesVolumes } from 'queries/futures/types';
import { getSynthDescription } from 'utils/futures';

type FuturesMarketsTableProps = {
	futuresMarkets: FuturesMarket[];
};

const FuturesMarketsTable: FC<FuturesMarketsTableProps> = ({
	futuresMarkets,
}: FuturesMarketsTableProps) => {
	const { t } = useTranslation();
	const router = useRouter();
	const { synthsMap } = Connector.useContainer();

	const synthList = futuresMarkets.map(({ asset }) => asset);
	const dailyPriceChangesQuery = useLaggedDailyPrice(synthList);

	const futuresVolumeQuery = useGetFuturesTradingVolumeForAllMarkets();

	let data = useMemo(() => {
		const dailyPriceChanges = dailyPriceChangesQuery?.data ?? [];
		const futuresVolume: FuturesVolumes = futuresVolumeQuery?.data ?? ({} as FuturesVolumes);

		return futuresMarkets.map((market: FuturesMarket, i: number) => {
			const description = getSynthDescription(market.asset, synthsMap, t);
			const volume = futuresVolume[market.assetHex];
			const pastPrice = dailyPriceChanges.find((price: Price) => price.synth === market.asset);

			return {
				asset: market.asset,
				market: (market.asset[0] === 's' ? market.asset.slice(1) : market.asset) + '-PERP',
				synth: synthsMap[market.asset],
				description: description,
				price: market.price.toNumber(),
				volume: volume?.toNumber() || 0,
				pastPrice: pastPrice?.price || '-',
				priceChange: (market.price.toNumber() - pastPrice?.price) / market.price.toNumber() || '-',
				fundingRate: market.currentFundingRate.toNumber(),
				openInterest: market.marketSize.mul(market.price).toNumber(),
				openInterestNative: market.marketSize.toNumber(),
				longInterest: market.marketSize
					.add(market.marketSkew)
					.div('2')
					.abs()
					.mul(market.price)
					.toNumber(),
				shortInterest: market.marketSize
					.sub(market.marketSkew)
					.div('2')
					.abs()
					.mul(market.price)
					.toNumber(),
				marketSkew: market.marketSkew,
			};
		});
	}, [synthsMap, futuresMarkets, dailyPriceChangesQuery?.data, futuresVolumeQuery?.data, t]);

	return (
		<TableContainer>
			<StyledTable
				data={data}
				// pageSize={5}
				showPagination={true}
				onTableRowClick={(row) => {
					router.push(`/market/${row.original.asset}`);
				}}
				highlightRowsOnHover
				sortBy={[
					{
						id: 'dailyVolume',
						desc: true,
					},
				]}
				columns={[
					{
						Header: (
							<TableHeader>{t('dashboard.overview.futures-markets-table.market')}</TableHeader>
						),
						accessor: 'market',
						Cell: (cellProps: CellProps<any>) => {
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
									<StyledText>{cellProps.row.original.market}</StyledText>
									<StyledValue>{cellProps.row.original.description}</StyledValue>
								</MarketContainer>
							);
						},
						width: 190,
					},
					{
						Header: (
							<TableHeader>
								{t('dashboard.overview.futures-markets-table.oracle-price')}
							</TableHeader>
						),
						accessor: 'oraclePrice',
						Cell: (cellProps: CellProps<any>) => {
							return cellProps.row.original.price === '-' ? (
								<DefaultCell>-</DefaultCell>
							) : (
								<Currency.Price
									currencyKey={Synths.sUSD}
									price={cellProps.row.original.price}
									sign={'$'}
									conversionRate={1}
								/>
							);
						},
						width: 130,
					},
					{
						Header: (
							<TableHeader>
								{t('dashboard.overview.futures-markets-table.daily-change')}
							</TableHeader>
						),
						accessor: 'priceChange',
						Cell: (cellProps: CellProps<any>) => {
							return cellProps.row.original.priceChange === '-' ? (
								<DefaultCell>-</DefaultCell>
							) : (
								<ChangePercent
									value={cellProps.row.original.priceChange}
									decimals={2}
									className="change-pct"
								/>
							);
						},
						width: 105,
					},
					{
						Header: (
							<TableHeader>
								{t('dashboard.overview.futures-markets-table.funding-rate')}
							</TableHeader>
						),
						accessor: 'fundingRate',
						Cell: (cellProps: CellProps<any>) => {
							return cellProps.row.original.fundingRate === '-' ? (
								<DefaultCell>-</DefaultCell>
							) : (
								<ChangePercent
									value={cellProps.row.original.fundingRate}
									decimals={6}
									className="change-pct"
								/>
							);
						},
						width: 125,
					},
					{
						Header: (
							<TableHeader>
								{t('dashboard.overview.futures-markets-table.open-interest')}
							</TableHeader>
						),
						accessor: 'openInterest',
						Cell: (cellProps: CellProps<any>) => {
							return cellProps.row.original.openInterest === '-' ? (
								<DefaultCell>-</DefaultCell>
							) : (
								<OpenInterestContainer>
									<StyledLongPrice
										currencyKey={Synths.sUSD}
										price={cellProps.row.original.longInterest}
										sign={'$'}
										conversionRate={1}
									/>
									<StyledShortPrice
										currencyKey={Synths.sUSD}
										price={cellProps.row.original.shortInterest}
										sign={'$'}
										conversionRate={1}
									/>
								</OpenInterestContainer>
							);
						},
						width: 125,
					},
					{
						Header: (
							<TableHeader>
								{t('dashboard.overview.futures-markets-table.daily-volume')}
							</TableHeader>
						),
						accessor: 'dailyVolume',
						Cell: (cellProps: CellProps<any>) => {
							return cellProps.row.original.volume === '-' ? (
								<DefaultCell>-</DefaultCell>
							) : (
								<Currency.Price
									currencyKey={Synths.sUSD}
									price={cellProps.row.original.volume}
									sign={'$'}
									conversionRate={1}
								/>
							);
						},
						width: 125,
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

const StyledLongPrice = styled(Currency.Price)`
	color: ${(props) => props.theme.colors.common.primaryGreen};
`;

const StyledShortPrice = styled(Currency.Price)`
	color: ${(props) => props.theme.colors.common.primaryRed};
`;

const StyledCurrencyIcon = styled(Currency.Icon)`
	width: 30px;
	height: 30px;
	margin-right: 8px;
`;

const OpenInterestContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
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
	margin-bottom: 20px;
`;

const TableHeader = styled.div``;

const StyledText = styled.div`
	margin-bottom: -4px;
	grid-column: 2;
	grid-row: 1;
`;

const MarketContainer = styled.div`
	display: grid;
	grid-template-rows: auto auto;
	grid-template-columns: auto auto;
	align-items: center;
`;

export default FuturesMarketsTable;
