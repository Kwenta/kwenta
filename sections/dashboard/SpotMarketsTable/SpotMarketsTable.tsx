import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import * as _ from 'lodash/fp';
import { Synth, Synths } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';
import useSynthetixQueries from '@synthetixio/queries';
import { CurrencyKey } from 'constants/currency';
import Connector from 'containers/Connector';
import values from 'lodash/values';
import { useQueryClient, Query } from 'react-query';
import { networkState } from 'store/wallet';
import { Rates } from 'queries/rates/types';
import Currency from 'components/Currency';
import { CellProps } from 'react-table';
import ChangePercent from 'components/ChangePercent';
import { DEFAULT_FIAT_EURO_DECIMALS } from 'constants/defaults';
import MarketBadge from 'components/Badge/MarketBadge';
import Table from 'components/Table';
import { isEurForex } from 'utils/futures';

const useHistoricalRates = (synthNames: string[]) => {
	const { subgraph } = useSynthetixQueries();
	const synthCandleQuery = subgraph.useGetDailyCandles(
		{
			where: {
				synth_in: synthNames,
			},
			orderBy: 'timestamp',
			orderDirection: 'desc',
		},
		{
			open: true,
			close: true,
			synth: true,
		}
	);

	const historicalRates: Record<string, number> = useMemo(() => {
		const { isSuccess, data } = synthCandleQuery;
		const synthCandle = isSuccess && data ? synthCandleQuery.data : [];
		return synthNames.reduce((acc, cur) => {
			const candle = synthCandle?.find((it) => it.synth === cur);
			if (candle) {
				acc[candle.synth] = candle.open.sub(candle.close).div(candle.open).toNumber();
			}
			return acc;
		}, {} as Record<string, number>);
	}, [synthNames, synthCandleQuery]);
	return historicalRates;
};

const useHistoricalVolumes = (synthNames: string[]) => {
	const { subgraph } = useSynthetixQueries();

	const yesterday = Math.floor(new Date().setDate(new Date().getDate() - 1) / 1000);

	const historicalVolumeQuery = subgraph.useGetSynthExchanges(
		{
			where: {
				timestamp_gte: yesterday,
				// fromSynth_in expects array of 'id' but 'name' so the returning is [] now.
				// Disable it for now and enable if needed later once either the query is fixed or id of synth is resolved.
				// fromSynth_in: synthNames,
			},
			first: 999999,
		},
		{
			id: true,
			fromAmount: true,
			fromAmountInUSD: true,
			toAmount: true,
			toAmountInUSD: true,
			feesInUSD: true,
			toAddress: true,
			timestamp: true,
			gasPrice: true,
			fromSynth: { name: true, symbol: true, id: true, totalSupply: true },
			toSynth: { name: true, symbol: true, id: true, totalSupply: true },
		}
	);

	const historicalVolumes = useMemo(() => {
		const { isSuccess, data } = historicalVolumeQuery;
		if (!isSuccess) {
			return {};
		}

		const queryResult = synthNames.reduce((acc, cur) => {
			const synthExchange = data
				?.filter(({ fromSynth }) => cur === fromSynth?.symbol)
				.reduce((sum, { fromAmountInUSD }) => sum + fromAmountInUSD.toNumber(), 0);

			acc[cur] = synthExchange ?? 0;

			return acc;
		}, {} as Record<string, number>);

		return queryResult;
	}, [historicalVolumeQuery, synthNames]);

	return historicalVolumes;
};

type SpotMarketsTableProps = {
	exchangeRates: Rates | null;
};

const SpotMarketsTable: FC<SpotMarketsTableProps> = ({ exchangeRates }) => {
	const { t } = useTranslation();
	const network = useRecoilValue(networkState);

	const { synthsMap } = Connector.useContainer();

	const synths = useMemo(() => values(synthsMap) || [], [synthsMap]);

	const queryCache = useQueryClient().getQueryCache();
	// KM-NOTE: come back and delete
	const frozenSynthsQuery = queryCache.find(['synths', 'frozenSynths', network.id]);

	const unfrozenSynths =
		frozenSynthsQuery && (frozenSynthsQuery as Query).state.status === 'success'
			? synths.filter(
					(synth) => !(frozenSynthsQuery.state.data as Set<CurrencyKey>).has(synth.name)
			  )
			: synths;

	const synthNames: string[] = synths.map((synth): string => synth.name);
	const historicalRates: Record<string, number> = useHistoricalRates(synthNames);
	const historicalVolume = useHistoricalVolumes(synthNames);

	let data = useMemo(() => {
		return unfrozenSynths.map((synth: Synth) => {
			const description = synth.description
				? t('common.currency.synthetic-currency-name', {
						currencyName: synth.description,
				  })
				: '';
			const rate = exchangeRates && exchangeRates[synth.name];
			const price = _.isNil(rate) ? 0 : rate.toNumber();
			const volume = historicalVolume[synth.name] ?? 0;
			const change = historicalRates[synth.name] ?? 0;

			return {
				asset: synth.asset,
				market: synth.name,
				synth: synthsMap[synth.asset],
				description: description,
				price,
				change: wei(change).toNumber(),
				volume: wei(volume),
			};
		});
	}, [synthsMap, unfrozenSynths, historicalVolume, historicalRates, exchangeRates, t]);

	return (
		<TableContainer>
			<StyledTable
				data={data}
				showPagination={true}
				highlightRowsOnHover
				sortBy={[
					{
						id: 'price',
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
						width: 190,
					},
					{
						Header: <TableHeader>{t('dashboard.synth-sort.price')}</TableHeader>,
						accessor: 'price',
						Cell: (cellProps: CellProps<any>) => {
							const formatOptions = isEurForex(cellProps.row.original.asset)
								? { minDecimals: DEFAULT_FIAT_EURO_DECIMALS }
								: {};
							return cellProps.row.original.price === '-' ? (
								<DefaultCell>-</DefaultCell>
							) : (
								<Currency.Price
									currencyKey={Synths.sUSD}
									price={cellProps.row.original.price}
									sign={'$'}
									conversionRate={1}
									formatOptions={formatOptions}
								/>
							);
						},
						width: 130,
					},
					{
						Header: <TableHeader>{t('dashboard.synth-sort.24h-change')}</TableHeader>,
						accessor: '24hChange',
						Cell: (cellProps: CellProps<any>) => {
							return cellProps.row.original.change === '-' ? (
								<DefaultCell>-</DefaultCell>
							) : (
								<ChangePercent
									value={cellProps.row.original.change}
									decimals={2}
									className="change-pct"
								/>
							);
						},
						width: 105,
					},
					{
						Header: <TableHeader>{t('dashboard.synth-sort.24h-vol')}</TableHeader>,
						accessor: '24hVolume',
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

	.paused {
		color: ${(props) => props.theme.colors.common.secondaryGray};
	}
`;

const StyledTable = styled(Table)`
	margin-bottom: 20px;
`;

const TableHeader = styled.div``;

const StyledText = styled.div`
	display: flex;
	align-items: center;
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

export default SpotMarketsTable;
