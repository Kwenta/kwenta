import { useState, FC, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { priceCurrencyState } from 'store/app';

import synthetix, { Synth } from 'lib/synthetix';

import Select from 'components/Select';

import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';

import { CardTitle } from 'sections/dashboard/common';

import { FlexDivRowCentered } from 'styles/common';

import SynthRow from './SynthRow';

enum SynthSort {
	Price,
	Rates24HLow,
	Rates24HHigh,
	Volume,
}

const priceSort = (exchangeRates: Rates, a: Synth, b: Synth) => {
	const priceA = exchangeRates[a.name] || 0;
	const priceB = exchangeRates[b.name] || 0;

	return priceA > priceB ? -1 : 1;
};

const TrendingSynths: FC = () => {
	const { t } = useTranslation();

	const selectedPriceCurrency = useRecoilValue(priceCurrencyState);
	const exchangeRatesQuery = useExchangeRatesQuery();
	const exchangeRates = exchangeRatesQuery.data ?? null;

	const selectPriceCurrencyRate = exchangeRates && exchangeRates[selectedPriceCurrency.name];

	const SYNTH_SORT_OPTIONS = useMemo(
		() => [{ label: t('dashboard.synth-sort.price'), value: SynthSort.Price }],
		[t]
	);
	const [currentSynthSort, setCurrentSynthSort] = useState(SYNTH_SORT_OPTIONS[0]);

	const synths = synthetix.js?.synths ?? [];

	const sortedSynths = useMemo(() => {
		if (exchangeRates != null) {
			if (currentSynthSort.value === SynthSort.Price) {
				return synths.sort((a: Synth, b: Synth) => priceSort(exchangeRates, a, b));
			}
		}
		return synths;
	}, [synths, currentSynthSort, exchangeRates]);

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
	width: 30%;
`;

export default TrendingSynths;
