import Wei from '@synthetixio/wei';
import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { NO_VALUE } from 'constants/placeholder';
import { SummaryItem, SummaryItemValue, SummaryItemLabel } from 'sections/exchange/summary';
import { formatPercent } from 'utils/formatters/number';

type PriceImpactProps = {
	slippagePercent: Wei;
};

const PriceImpactSummary: FC<PriceImpactProps> = memo(({ slippagePercent }) => {
	const { t } = useTranslation();

	return (
		<SummaryItem>
			<SummaryItemLabel>{t('exchange.currency-card.price-impact')}</SummaryItemLabel>
			<SummaryItemValue>
				{slippagePercent.lt(0) ? formatPercent(slippagePercent) : NO_VALUE}
			</SummaryItemValue>
		</SummaryItem>
	);
});

export default PriceImpactSummary;
