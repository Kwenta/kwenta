import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { NO_VALUE } from 'constants/placeholder';
import { SummaryItem, SummaryItemValue, SummaryItemLabel } from 'sections/exchange/summary';
import { selectSlippagePercentWei } from 'state/exchange/selectors';
import { useAppSelector } from 'state/hooks';
import { formatPercent } from 'utils/formatters/number';

const PriceImpactSummary: FC = memo(() => {
	const { t } = useTranslation();
	const slippagePercent = useAppSelector(selectSlippagePercentWei);

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
