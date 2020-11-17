import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import mapValues from 'lodash/mapValues';

import synthetix, { Synth } from 'lib/synthetix';

import Select from 'components/Select';

import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useHistoricalVolumeQuery from 'queries/rates/useHistoricalVolumeQuery';
import useHistoricalRatesQuery from 'queries/rates/useHistoricalRatesQuery';

import { CardTitle } from 'sections/dashboard/common';

import { FlexDivRowCentered } from 'styles/common';

import { trendingSynthsOptionState } from 'store/ui';
import { Period } from 'constants/period';

import SynthRow from './SynthRow';
import { numericSort } from './utils';
import { SYNTH_SORT_OPTIONS, SynthSort } from './constants';

const TrendingSynths: FC = () => {
	const { t } = useTranslation();

	const [currentSynthSort, setCurrentSynthSort] = useRecoilState(trendingSynthsOptionState);

	// eslint-disable-next-line
	const synths = synthetix.js?.synths ?? [];
	const currencyKeys = useMemo(() => synths.map((synth) => synth.name), [synths]);

	const exchangeRatesQuery = useExchangeRatesQuery();
	const historicalRatesQuery = useHistoricalRatesQuery(currencyKeys, Period.ONE_DAY);
	const historicalVolumeQuery = useHistoricalVolumeQuery(Period.ONE_DAY);
	const exchangeRates = exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null;
	const historicalVolume = historicalVolumeQuery.isSuccess
		? historicalVolumeQuery.data ?? null
		: null;
	const historicalRates = historicalRatesQuery.isSuccess ? historicalRatesQuery.data ?? null : null;

	const sortedSynths = useMemo(() => {
		if (currentSynthSort.value === SynthSort.Price && exchangeRates != null) {
			return synths.sort((a: Synth, b: Synth) => numericSort(exchangeRates, a, b));
		}
		if (currentSynthSort.value === SynthSort.Volume && historicalVolume != null) {
			return synths.sort((a: Synth, b: Synth) => numericSort(historicalVolume, a, b));
		}
		if (historicalRates != null) {
			if (currentSynthSort.value === SynthSort.Rates24HHigh) {
				return synths.sort((a: Synth, b: Synth) =>
					numericSort(
						mapValues(historicalRates, (rates) => rates.high),
						a,
						b
					)
				);
			}
			if (currentSynthSort.value === SynthSort.Rates24HLow) {
				return synths.sort((a: Synth, b: Synth) =>
					numericSort(
						mapValues(historicalRates, (rates) => rates.low),
						a,
						b
					)
				);
			}
			if (currentSynthSort.value === SynthSort.Change) {
				return synths.sort((a: Synth, b: Synth) =>
					numericSort(
						mapValues(historicalRates, (rates) => rates.change),
						a,
						b
					)
				);
			}
		}
		return synths;
	}, [synths, currentSynthSort, exchangeRates, historicalVolume, historicalRates]);

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
					const currencyKey = synth.name;

					const price = exchangeRates && exchangeRates[currencyKey];
					const change =
						historicalRates && historicalRates[currencyKey] && historicalRates[currencyKey].change;

					return (
						<SynthRow key={currencyKey} synth={synth} price={price} change={change ?? undefined} />
					);
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
