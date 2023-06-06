import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { NO_VALUE } from 'constants/placeholder';
import { formatDollars } from 'sdk/utils/number';
import { SummaryItem, SummaryItemValue, SummaryItemLabel } from 'sections/exchange/summary';
import { selectFeeCostWei } from 'state/exchange/selectors';
import { useAppSelector } from 'state/hooks';

const FeeCostSummary: FC = memo(({ ...rest }) => {
	const { t } = useTranslation();
	const feeCost = useAppSelector(selectFeeCostWei);

	return (
		<SummaryItem {...rest}>
			<SummaryItemLabel>{t('common.summary.fee-cost')}</SummaryItemLabel>
			<SummaryItemValue data-testid="exchange-fee-cost">
				{!!feeCost ? formatDollars(feeCost, { minDecimals: feeCost.lt(0.01) ? 4 : 2 }) : NO_VALUE}
			</SummaryItemValue>
		</SummaryItem>
	);
});

export default FeeCostSummary;
