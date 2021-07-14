import { FC } from 'react';
import { Trans } from 'react-i18next';

import { NoTextTransform } from 'styles/common';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import { SummaryItem, SummaryItemValue, SummaryItemLabel } from '../common';
import { formatCurrency } from 'utils/formatters/number';
import { NO_VALUE } from 'constants/placeholder';
import { CurrencyKey } from 'constants/currency';

type TotalTradePriceSummaryItemProps = {
	totalTradePrice: string | null;
};

const TotalTradePriceSummaryItem: FC<TotalTradePriceSummaryItemProps> = ({ totalTradePrice }) => {
	const { selectedPriceCurrency } = useSelectedPriceCurrency();

	return (
		<SummaryItem>
			<SummaryItemLabel>
				<Trans
					i18nKey="common.currency.currency-value"
					values={{ currencyKey: selectedPriceCurrency.asset }}
					components={[<NoTextTransform />]}
				/>
			</SummaryItemLabel>
			<SummaryItemValue data-testid="total-trade-price">
				{totalTradePrice
					? formatCurrency(selectedPriceCurrency.name as CurrencyKey, totalTradePrice, {
							sign: selectedPriceCurrency.sign,
					  })
					: NO_VALUE}
			</SummaryItemValue>
		</SummaryItem>
	);
};

export default TotalTradePriceSummaryItem;
