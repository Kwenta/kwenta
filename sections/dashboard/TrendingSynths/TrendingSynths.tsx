import { Synth } from '@synthetixio/contracts-interface';
import useSynthetixQueries, { HistoricalRatesUpdates } from '@synthetixio/queries';
import mapValues from 'lodash/mapValues';
import values from 'lodash/values';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient, Query } from 'react-query';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled from 'styled-components';

import Select from 'components/Select';
import { CurrencyKey } from 'constants/currency';
import { Period } from 'constants/period';
import { PERIOD_IN_HOURS } from 'constants/period';
import Connector from 'containers/Connector';
import { CardTitle } from 'sections/dashboard/common';
import { trendingSynthsOptionState } from 'store/ui';
import { networkState } from 'store/wallet';
import { FlexDivRowCentered } from 'styles/common';
import { calculateTimestampForPeriod } from 'utils/formatters/date';

import { SYNTH_SORT_OPTIONS, SynthSort } from './constants';
import SynthRow from './SynthRow';
import { numericSort } from './utils';

const TrendingSynths: FC = () => {
	const { t } = useTranslation();
	const network = useRecoilValue(networkState);
	const twentyFourHoursAgo = useMemo(
		() => calculateTimestampForPeriod(PERIOD_IN_HOURS.ONE_DAY),
		[]
	);

	const { synthsMap } = Connector.useContainer();

	const [currentSynthSort, setCurrentSynthSort] = useRecoilState(trendingSynthsOptionState);

	const { useExchangeRatesQuery, subgraph } = useSynthetixQueries();
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

	const exchangeRatesQuery = useExchangeRatesQuery();

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

	const exchangeRates = exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null;

	// bug in queries lib: should return already parsed with `parseBytes32String`
	const historicalVolume = historicalVolumeQuery.isSuccess ? historicalVolumeQuery.data[0] : null;

	const sortedSynths = useMemo(() => {
		if (currentSynthSort.value === SynthSort.Price && exchangeRates != null) {
			return unfrozenSynths.sort((a: Synth, b: Synth) =>
				numericSort(exchangeRates, a.name, b.name)
			);
		}
		if (currentSynthSort.value === SynthSort.Volume && historicalVolume != null) {
			return unfrozenSynths.sort((a: Synth, b: Synth) =>
				numericSort(historicalVolume.toSynth as any, a.name, b.name)
			);
		}
		if (historicalRates != null) {
			if (currentSynthSort.value === SynthSort.Rates24HHigh) {
				return unfrozenSynths.sort((a: Synth, b: Synth) =>
					numericSort(mapValues(historicalRates, 'high'), a.name, b.name)
				);
			}
			if (currentSynthSort.value === SynthSort.Rates24HLow) {
				return unfrozenSynths.sort((a: Synth, b: Synth) =>
					numericSort(mapValues(historicalRates, 'low'), a.name, b.name)
				);
			}
			if (currentSynthSort.value === SynthSort.Change) {
				return unfrozenSynths.sort((a: Synth, b: Synth) =>
					numericSort(mapValues(historicalRates, 'change'), a.name, b.name)
				);
			}
		}

		return unfrozenSynths;
	}, [unfrozenSynths, currentSynthSort, exchangeRates, historicalVolume, historicalRates]);

	return (
		<>
			<Container>
				<TitleSortContainer>
					<CardTitle>{t('dashboard.trending')}</CardTitle>
					<TrendingSortSelect
						inputId="synth-sort-options"
						formatOptionLabel={(option: any) => <span>{t(option.label)}</span>}
						options={SYNTH_SORT_OPTIONS}
						value={currentSynthSort}
						onChange={(option: any) => {
							if (option) {
								setCurrentSynthSort(option);
							}
						}}
					/>
				</TitleSortContainer>
			</Container>
			<Rows>
				{sortedSynths.map((synth: Synth) => {
					const price = exchangeRates && exchangeRates[synth.name];
					return <SynthRow key={synth.name} synth={synth} price={price?.toNumber() ?? 0} />;
				})}
			</Rows>
		</>
	);
};

const Container = styled.div`
	padding: 0 32px;
`;

const TitleSortContainer = styled(FlexDivRowCentered)`
	margin-top: -10px;
`;

const Rows = styled.div`
	overflow: auto;
	padding-top: 10px;
`;

const TrendingSortSelect = styled(Select)`
	width: 120px;
`;

export default TrendingSynths;
