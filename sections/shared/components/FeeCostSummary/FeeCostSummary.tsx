import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import BigNumber from 'bignumber.js';

import { formatCurrency } from 'utils/formatters/number';

import { NO_VALUE } from 'constants/placeholder';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import { SummaryItem, SummaryItemValue, SummaryItemLabel } from '../common';

type FeeCostSummaryProps = {
	feeCost: BigNumber | null;
};

const FeeCostSummary: FC<FeeCostSummaryProps> = ({ feeCost, ...rest }) => {
	const { t } = useTranslation();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();

	return (
		<SummaryItem {...rest}>
			<SummaryItemLabel>{t('exchange.summary-info.fee-cost')}</SummaryItemLabel>
			<SummaryItemValue data-testid="exchange-fee-cost">
				{feeCost != null
					? formatCurrency(selectedPriceCurrency.name, feeCost, {
							sign: selectedPriceCurrency.sign,
							minDecimals: feeCost.lt(0.01) ? 4 : 2,
					  })
					: NO_VALUE}
			</SummaryItemValue>
		</SummaryItem>
	);
};

export default FeeCostSummary;
