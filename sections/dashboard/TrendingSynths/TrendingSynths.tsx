import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useQueryCache } from 'react-query';

import { priceCurrencyState } from 'store/app';

import synthetix, { Synth } from 'lib/synthetix';

import Select from 'components/Select';

import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';

import { CardTitle } from 'sections/dashboard/common';

import { FlexDivRowCentered } from 'styles/common';

import SynthRow from './SynthRow';
import { numericSort, toCurrencyKeyMap } from './utils';
import { SYNTH_SORT_OPTIONS, SynthSort } from './constants';
import { trendingSynthsOptionState } from 'store/ui';

const TrendingSynths: FC = () => {
	const { t } = useTranslation();

	const [currentSynthSort, setCurrentSynthSort] = useRecoilState(trendingSynthsOptionState);

	const queryCache = useQueryCache();

	const historicalVolumeCache = queryCache.getQueries(['rates', 'historicalVolume']);
	const historicalRatesCache = queryCache.getQueries(['rates', 'historicalRates']);

	const selectedPriceCurrency = useRecoilValue(priceCurrencyState);
	const exchangeRatesQuery = useExchangeRatesQuery();
	const exchangeRates = exchangeRatesQuery.data ?? null;

	const selectPriceCurrencyRate = exchangeRates && exchangeRates[selectedPriceCurrency.name];

	// eslint-disable-next-line
	const synths = synthetix.js?.synths ?? [];

	const sortedSynths = useMemo(() => {
		if (currentSynthSort.value === SynthSort.Price && exchangeRates != null) {
			return synths.sort((a: Synth, b: Synth) => numericSort(exchangeRates, a, b));
		}
		if (
			currentSynthSort.value === SynthSort.Volume &&
			historicalVolumeCache != null &&
			historicalVolumeCache.length > 0
		) {
			return synths.sort((a: Synth, b: Synth) =>
				numericSort(toCurrencyKeyMap(historicalVolumeCache), a, b)
			);
		}
		if (historicalRatesCache != null && historicalRatesCache.length > 0) {
			if (currentSynthSort.value === SynthSort.Rates24HHigh) {
				return synths.sort((a: Synth, b: Synth) =>
					numericSort(toCurrencyKeyMap(historicalRatesCache, 'high'), a, b)
				);
			}
			if (currentSynthSort.value === SynthSort.Rates24HLow) {
				return synths.sort((a: Synth, b: Synth) =>
					numericSort(toCurrencyKeyMap(historicalRatesCache, 'low'), a, b)
				);
			}
			if (currentSynthSort.value === SynthSort.Change) {
				return synths.sort((a: Synth, b: Synth) =>
					numericSort(toCurrencyKeyMap(historicalRatesCache, 'change'), a, b)
				);
			}
		}
		return synths;
	}, [synths, currentSynthSort, exchangeRates, historicalVolumeCache, historicalRatesCache]);

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
