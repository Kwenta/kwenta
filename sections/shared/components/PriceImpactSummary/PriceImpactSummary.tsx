import Wei from '@synthetixio/wei';
import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { NO_VALUE } from 'constants/placeholder';
import { formatPercent } from 'utils/formatters/number';

import { SummaryItem, SummaryItemValue, SummaryItemLabel } from '../common';

type PriceImpactProps = {
	slippagePercent: Wei;
};

const PriceImpactSummary: FC<PriceImpactProps> = memo(({ slippagePercent }) => {
	const { t } = useTranslation();

	return (
		<SummaryItem>
			<SummaryItemLabel>{t('exchange.currency-card.price-impact')}</SummaryItemLabel>
			<SummaryItemValue>
				{slippagePercent?.lt(0) ? formatPercent(slippagePercent) : NO_VALUE}
			</SummaryItemValue>
		</SummaryItem>
	);
});

export default PriceImpactSummary;
