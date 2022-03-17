import Table from 'components/Table';
import { FC, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import Connector from 'containers/Connector';
import { FuturesMarket } from 'queries/futures/types';
import Currency from 'components/Currency';
import ChangePercent from 'components/ChangePercent';
import { Synths } from 'constants/currency';
import { DEFAULT_DATA } from './constants';
import useLaggedDailyPrice from 'queries/rates/useLaggedDailyPrice';
import useGetFuturesTradingVolumeForAllMarkets from 'queries/futures/useGetFuturesTradingVolumeForAllMarkets';
import { Price } from 'queries/rates/types';
import { FuturesVolumes } from 'queries/futures/types';

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

	const getSynthDescription = useCallback(
		(synth: string) => {
			return t('common.currency.synthetic-currency-name', {
				currencyName: synthsMap[synth] ? synthsMap[synth].description : '',
			});
		},
		[t, synthsMap]
	);

	let data = useMemo(() => {
		const dailyPriceChanges = dailyPriceChangesQuery?.data ?? [];
		const futuresVolume: FuturesVolumes = futuresVolumeQuery?.data ?? ({} as FuturesVolumes);

		return futuresMarkets.map((market: FuturesMarket, i: number) => {
			const description = getSynthDescription(market.asset);
			const volume = futuresVolume[market.assetHex];
			const pastPrice = dailyPriceChanges.find((price: Price) => price.synth === market.asset);

			return {
				market: market.asset,
				synth: synthsMap[market.asset],
				description: description,
				price: market.price.toNumber(),
				volume: volume?.toNumber() || 0,
				pastPrice: pastPrice?.price || '-',
				priceChange: (market.price.toNumber() - pastPrice?.price) / market.price.toNumber() || '-',
				fundingRate: market.currentFundingRate.toNumber(),
				openInterest: market.marketSize.toNumber(),
				openInterestNative: market.marketSize.div(market.price).toNumber(),
			};
		});
	}, [
		synthsMap,
		futuresMarkets,
		dailyPriceChangesQuery?.data,
		futuresVolumeQuery?.data,
		getSynthDescription,
	]);

	return (
		<TableContainer>
			<StyledTable
				data={data.length > 0 ? data : DEFAULT_DATA}
				pageSize={5}
				showPagination={true}
				onTableRowClick={(row) => {
					router.push(`/market/${row.original.market}`);
				}}
				highlightRowsOnHover
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
										<StyledCurrencyIcon currencyKey={cellProps.row.original.market} />
									</IconContainer>
									<StyledText>{cellProps.row.original.market}/sUSD</StyledText>
									<StyledValue>{cellProps.row.original.description}</StyledValue>
								</MarketContainer>
							);
						},
						width: 175,
					},
					{
						Header: (
							<TableHeader>{t('dashboard.overview.futures-markets-table.index-price')}</TableHeader>
						),
						accessor: 'indexPrice',
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
						width: 100,
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
						width: 125,
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
									<Currency.Price
										currencyKey={cellProps.row.original.synth}
										price={cellProps.row.original.openInterestNative}
										sign={cellProps.row.original.synth.sign}
										conversionRate={1}
									/>
									<Currency.Price
										currencyKey={Synths.sUSD}
										price={cellProps.row.original.openInterest}
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
					},
				]}
			/>
		</TableContainer>
	);
};

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

export default FuturesMarketsTable;
