import { useState, FC, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import synthetix, { Synth } from 'lib/synthetix';

import Currency from 'components/Currency';
import Select from 'components/Select';

import { Rates } from 'queries/rates/useExchangeRatesQuery';

import { NO_VALUE } from 'constants/placeholder';

import { CardTitle } from 'sections/dashboard/common';

import { SelectableCurrencyRow, FlexDivRowCentered } from 'styles/common';

type TrendingSynthsProps = {
	exchangeRates: Rates | null;
	selectedPriceCurrency: Synth;
	selectPriceCurrencyRate: number | null;
};

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

const TrendingSynths: FC<TrendingSynthsProps> = ({
	exchangeRates,
	selectedPriceCurrency,
	selectPriceCurrencyRate,
}) => {
	const { t } = useTranslation();

	const SYNTH_SORT_OPTIONS = useMemo(
		() => [{ label: t('dashboard.synthSort.price'), value: SynthSort.Price }],
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
						<StyledSelectableCurrencyRow key={currencyKey} isSelectable={false}>
							<Currency.Name
								currencyKey={currencyKey}
								name={t('common.currency.synthetic-currency-name', {
									currencyName: synth.description,
								})}
								showIcon={true}
							/>
							{price != null ? (
								<Currency.Price
									currencyKey={selectedPriceCurrency.name}
									price={price}
									sign={selectedPriceCurrency.sign}
									conversionRate={selectPriceCurrencyRate}
								/>
							) : (
								NO_VALUE
							)}
						</StyledSelectableCurrencyRow>
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

const StyledSelectableCurrencyRow = styled(SelectableCurrencyRow)`
	padding-left: 32px;
	padding-right: 32px;
	padding-bottom: 13px;
`;

const TrendingSortSelect = styled(Select)`
	width: 30%;
`;

export default TrendingSynths;
