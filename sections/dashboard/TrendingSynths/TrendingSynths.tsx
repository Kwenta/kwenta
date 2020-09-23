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
				{synths.map((synth: Synth) => {
					const selectPriceCurrencyRate =
						exchangeRatesQuery.data && exchangeRatesQuery.data[selectedPriceCurrency.name];
					let price = exchangeRatesQuery.data && exchangeRatesQuery.data[synth.name];
					const currencyKey = synth.name;

					if (price != null && selectPriceCurrencyRate != null) {
						price /= selectPriceCurrencyRate;
					}
					return (
						<StyledSelectableCurrencyRow key={currencyKey} isSelectable={false}>
							<Currency.Name currencyKey={currencyKey} name={synth.desc} showIcon={true} />
							{price != null ? (
								<Currency.Price
									currencyKey={selectedPriceCurrency.name}
									price={price}
									sign={selectedPriceCurrency.sign}
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
