import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { Synth } from 'lib/synthetix';

import Currency from 'components/Currency';

import { NO_VALUE } from 'constants/placeholder';

import { SelectableCurrencyRow } from 'styles/common';
import useHistoricalRatesQuery from 'queries/rates/useHistoricalRatesQuery';
import useHistoricalVolumeQuery from 'queries/rates/useHistoricalVolumeQuery';
import { Period } from 'constants/period';

type SynthRow = {
	price: number | null;
	synth: Synth;
	selectedPriceCurrency: Synth;
	selectPriceCurrencyRate: number | null;
};
const SynthRow: FC<SynthRow> = ({
	price,
	synth,
	selectedPriceCurrency,
	selectPriceCurrencyRate,
}) => {
	const { t } = useTranslation();

	const currencyKey = synth.name;

	useHistoricalVolumeQuery(currencyKey, Period.ONE_DAY);
	const historicalRates = useHistoricalRatesQuery(currencyKey, Period.ONE_DAY);

	return (
		<StyledSelectableCurrencyRow isSelectable={false}>
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
					change={historicalRates.data?.change}
				/>
			) : (
				NO_VALUE
			)}
		</StyledSelectableCurrencyRow>
	);
};

const StyledSelectableCurrencyRow = styled(SelectableCurrencyRow)`
	padding-left: 32px;
	padding-right: 32px;
	padding-bottom: 13px;
`;

export default SynthRow;
