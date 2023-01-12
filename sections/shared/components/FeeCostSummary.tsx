import Wei from '@synthetixio/wei';
import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { NO_VALUE } from 'constants/placeholder';
import { formatDollars } from 'utils/formatters/number';

import { SummaryItem, SummaryItemValue, SummaryItemLabel } from './common';

type FeeRateSummaryItemProps = {
	feeCost?: Wei;
};

const FeeCostSummary: FC<FeeRateSummaryItemProps> = memo(({ feeCost, ...rest }) => {
	const { t } = useTranslation();

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
