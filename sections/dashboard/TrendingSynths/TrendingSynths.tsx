import { useState, FC, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { useQueryCache } from 'react-query';

import { priceCurrencyState } from 'store/app';

import synthetix, { Synth } from 'lib/synthetix';

import Select from 'components/Select';

import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';

import { CardTitle } from 'sections/dashboard/common';

import { FlexDivRowCentered } from 'styles/common';

import SynthRow from './SynthRow';
import { numericSort, toCurrencyKeyMap } from './utils';

enum SynthSort {
	Price,
	Rates24HLow,
	Rates24HHigh,
	Volume,
	Change,
}

const TrendingSynths: FC = () => {
	const { t } = useTranslation();
	const queryCache = useQueryCache();

	const historicalVolumeCache = queryCache.getQueries(['rates', 'historicalVolume']);
	const historicalRatesCache = queryCache.getQueries(['rates', 'historicalRates']);
	console.log(historicalRatesCache);
	const selectedPriceCurrency = useRecoilValue(priceCurrencyState);
	const exchangeRatesQuery = useExchangeRatesQuery();
	const exchangeRates = exchangeRatesQuery.data ?? null;

	const selectPriceCurrencyRate = exchangeRates && exchangeRates[selectedPriceCurrency.name];

	const SYNTH_SORT_OPTIONS = useMemo(
		() => [
			{ label: t('dashboard.synth-sort.24h-vol'), value: SynthSort.Volume },
			{ label: t('dashboard.synth-sort.24h-high'), value: SynthSort.Rates24HHigh },
			{ label: t('dashboard.synth-sort.24h-low'), value: SynthSort.Rates24HLow },
			{ label: t('dashboard.synth-sort.24h-change'), value: SynthSort.Change },
			{ label: t('dashboard.synth-sort.price'), value: SynthSort.Price },
		],
		[t]
	);
	const [currentSynthSort, setCurrentSynthSort] = useState(SYNTH_SORT_OPTIONS[0]);

	const synths = synthetix.js?.synths ?? [];

	const sortedSynths = useMemo(() => {
		if (currentSynthSort.value === SynthSort.Price && exchangeRates != null) {
			return synths.sort((a: Synth, b: Synth) => numericSort(exchangeRates, a, b));
		}
		if (currentSynthSort.value === SynthSort.Volume && historicalVolumeCache != null) {
			return synths.sort((a: Synth, b: Synth) =>
				numericSort(toCurrencyKeyMap(historicalVolumeCache), a, b)
			);
		}
		if (currentSynthSort.value === SynthSort.Rates24HHigh && historicalRatesCache != null) {
			return synths.sort((a: Synth, b: Synth) =>
				numericSort(toCurrencyKeyMap(historicalRatesCache, 'high'), a, b)
			);
		}
		if (currentSynthSort.value === SynthSort.Rates24HLow && historicalRatesCache != null) {
			return synths.sort((a: Synth, b: Synth) =>
				numericSort(toCurrencyKeyMap(historicalRatesCache, 'low'), a, b)
			);
		}
		if (currentSynthSort.value === SynthSort.Change && historicalRatesCache != null) {
			return synths.sort((a: Synth, b: Synth) =>
				numericSort(toCurrencyKeyMap(historicalRatesCache, 'change'), a, b)
			);
		}
		return synths;
	}, [synths, currentSynthSort, exchangeRates, historicalVolumeCache, historicalRatesCache]);

	return (
		<>
			<Container>
				<TitleSortContainer>
					<CardTitle>{t('dashboard.trending')}</CardTitle>
					<TrendingSortSelect
						formatOptionLabel={(option: any) => <span>{option.label}</span>}
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
					const currencyKey = synth.name;

					return (
						<SynthRow
							key={currencyKey}
							synth={synth}
							price={price}
							selectedPriceCurrency={selectedPriceCurrency}
							selectPriceCurrencyRate={selectPriceCurrencyRate}
						/>
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
