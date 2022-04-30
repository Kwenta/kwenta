import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import * as _ from 'lodash/fp';
import { Synth, Synths } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';
import useSynthetixQueries, { HistoricalRatesUpdates } from '@synthetixio/queries';
import { CurrencyKey } from 'constants/currency';
import mapValues from 'lodash/mapValues';
import Connector from 'containers/Connector';
import values from 'lodash/values';

import { useQueryClient, Query } from 'react-query';
import { networkState } from 'store/wallet';
import { Period } from 'constants/period';

import { calculateTimestampForPeriod } from 'utils/formatters/date';

import { PERIOD_IN_HOURS } from 'constants/period';
import { Rates } from 'queries/rates/types';
import Currency from 'components/Currency';
import { CellProps } from 'react-table';
import ChangePercent from 'components/ChangePercent';
import { DEFAULT_FIAT_EURO_DECIMALS } from 'constants/defaults';
import MarketBadge from 'components/Badge/MarketBadge';
import Table from 'components/Table';
import { isEurForex } from 'utils/futures';

type SpotMarketsTableProps = {
	exchangeRates: Rates | null;
};

const SpotMarketsTable: FC<SpotMarketsTableProps> = ({ exchangeRates }) => {
	const { t } = useTranslation();
	const network = useRecoilValue(networkState);
	const twentyFourHoursAgo = useMemo(
		() => calculateTimestampForPeriod(PERIOD_IN_HOURS.ONE_DAY),
		[]
	);

	const { synthsMap } = Connector.useContainer();

	const { subgraph } = useSynthetixQueries();
	const historicalVolumeQuery = subgraph.useGetSynthExchanges(
		{
			first: Number.MAX_SAFE_INTEGER,
			where: {
				timestamp_gte: twentyFourHoursAgo,
			},
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
		}
	);

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

	const historicalRates: Partial<Record<CurrencyKey, HistoricalRatesUpdates>> = useMemo(
		() => ({}),
		[]
	);

	for (const synth of unfrozenSynths) {
		const historicalRateQuery = queryCache.find([
			'rates',
			'historicalRates',
			network!.id,
			synth.name,
			Period.ONE_DAY,
		]);

		if (historicalRateQuery && (historicalRateQuery as Query).state.status === 'success') {
			historicalRates[synth.name] = historicalRateQuery.state.data as HistoricalRatesUpdates;
		}
	}

	// bug in queries lib: should return already parsed with `parseBytes32String`
	const historicalVolume = historicalVolumeQuery.isSuccess ? historicalVolumeQuery.data[0] : null;

	let data = useMemo(() => {
		const volumes = !_.isNil(historicalVolume) ? (historicalVolume.toSynth as any) : {};
		const changes = !_.isNil(historicalRates) ? mapValues(historicalRates, 'change') : {};

		return unfrozenSynths.map((synth: Synth) => {
			const description = synth.description
				? t('common.currency.synthetic-currency-name', {
						currencyName: synth.description,
				  })
				: '';
			const rate = exchangeRates && exchangeRates[synth.name];
			const price = _.isNil(rate) ? 0 : rate.toNumber();
			const volume = volumes[synth.asset] ?? 0;
			const change = changes[synth.asset] ?? 0;

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
