import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';

import { Synth } from 'lib/synthetix';

import Currency from 'components/Currency';

import { NO_VALUE } from 'constants/placeholder';
import ROUTES from 'constants/routes';

import { SelectableCurrencyRow } from 'styles/common';
import useMarketClosed from 'hooks/useMarketClosed';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

type SynthRowProps = {
	price: number | null;
	change?: number;
	synth: Synth;
};
const SynthRow: FC<SynthRowProps> = ({ price, synth, change }) => {
	const { t } = useTranslation();
	const router = useRouter();
	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();

	const currencyKey = synth.name;

	// const historicalRates = useHistoricalRatesQuery(currencyKey, Period.ONE_DAY);
	const { marketClosureReason } = useMarketClosed(currencyKey);

	return (
		<StyledSelectableCurrencyRow
			isSelectable={true}
			onClick={() => router.push(ROUTES.Exchange.Into(currencyKey))}
		>
			<Currency.Name
				currencyKey={currencyKey}
				name={t('common.currency.synthetic-currency-name', {
					currencyName: synth.description,
				})}
				showIcon={true}
				marketClosureReason={marketClosureReason}
			/>
			{price != null ? (
				<Currency.Price
					currencyKey={selectedPriceCurrency.name}
					price={price}
					sign={selectedPriceCurrency.sign}
					conversionRate={selectPriceCurrencyRate}
					change={change}
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
