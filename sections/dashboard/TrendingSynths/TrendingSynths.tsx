import { useState } from 'react';
import styled from 'styled-components';
import synthetix, { Synth } from 'lib/synthetix';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import { priceCurrencyState } from 'store/app';

import Currency from 'components/Currency';
import Select from 'components/Select';

import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';

import { NO_VALUE } from 'constants/placeholder';

import { CardTitle } from 'sections/dashboard/common';

import { SelectableCurrencyRow, FlexDivRow } from 'styles/common';

const TrendingSynths = () => {
	const { t } = useTranslation();

	const SYNTH_SORT_OPTIONS = [{ label: t('dashboard.synthSort.price'), value: 'PRICE' }];
	const [currentSynthSort, setCurrentSynthSort] = useState(SYNTH_SORT_OPTIONS[0]);

	const synths = synthetix.js?.synths ?? [];
	const exchangeRatesQuery = useExchangeRatesQuery({ refetchInterval: false });
	const selectedPriceCurrency = useRecoilValue(priceCurrencyState);
	const selectPriceCurrencyRate =
		exchangeRatesQuery.data && exchangeRatesQuery.data[selectedPriceCurrency.name];

	const priceSort = (a: Synth, b: Synth) => {
		const priceA = (exchangeRatesQuery.data && exchangeRatesQuery.data[a.name]) || 0;
		const priceB = (exchangeRatesQuery.data && exchangeRatesQuery.data[b.name]) || 0;

		return priceA > priceB ? -1 : 1;
	};

	return (
		<>
			<Container>
				<FlexDivRow>
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
				</FlexDivRow>
			</Container>
			<Rows>
				{synths.sort(priceSort).map((synth: Synth) => {
					const price = exchangeRatesQuery.data && exchangeRatesQuery.data[synth.name];
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

const Rows = styled.div`
	overflow: auto;
`;

const StyledSelectableCurrencyRow = styled(SelectableCurrencyRow)`
	padding-left: 32px;
	padding-right: 32px;
`;

const TrendingSortSelect = styled(Select)`
	width: 30%;
`;

export default TrendingSynths;
