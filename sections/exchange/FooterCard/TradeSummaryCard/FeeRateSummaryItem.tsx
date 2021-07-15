import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { formatPercent } from 'utils/formatters/number';

import { NO_VALUE } from 'constants/placeholder';

import { SummaryItem, SummaryItemValue, SummaryItemLabel } from '../common';
import Wei from '@synthetixio/wei';

type FeeRateSummaryItemProps = {
	feeRate: Wei | null;
};

const FeeRateSummaryItem: FC<FeeRateSummaryItemProps> = ({ feeRate }) => {
	const { t } = useTranslation();

	return (
		<SummaryItem>
			<SummaryItemLabel>{t('exchange.summary-info.fee')}</SummaryItemLabel>
			<SummaryItemValue data-testid="exchange-fee-rate">
				{feeRate != null ? formatPercent(feeRate) : NO_VALUE}
			</SummaryItemValue>
		</SummaryItem>
	);
};

export default FeeRateSummaryItem;
