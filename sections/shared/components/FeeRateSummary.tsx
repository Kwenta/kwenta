import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Tooltip from 'components/Tooltip/Tooltip';
import { NO_VALUE } from 'constants/placeholder';
import { SummaryItem, SummaryItemValue, SummaryItemLabel } from 'sections/exchange/summary';
import { selectExchangeFeeRateWei, selectBaseFeeRateWei } from 'state/exchange/selectors';
import { useAppSelector } from 'state/hooks';
import { formatPercent } from 'utils/formatters/number';

const FeeRateSummaryItem: FC = memo(() => {
	const { t } = useTranslation();

	const exchangeFeeRate = useAppSelector(selectExchangeFeeRateWei);
	const baseFeeRate = useAppSelector(selectBaseFeeRateWei);

	return (
		<SummaryItem>
			<SummaryItemLabel>{t('exchange.summary-info.fee')}</SummaryItemLabel>
			<SummaryItemValue>
				<FeeRateItem data-testid="exchange-fee-rate">
					<span>
						{!!baseFeeRate
							? formatPercent(baseFeeRate, { minDecimals: 2 })
							: !!exchangeFeeRate
							? formatPercent(exchangeFeeRate, { minDecimals: 2 })
							: NO_VALUE}
					</span>
					{exchangeFeeRate.sub(baseFeeRate).gt(0) ? (
						<>
							<DynamicFeeLabel>+</DynamicFeeLabel>
							<CustomStyledTooltip
								position="fixed"
								content={t('exchange.summary-info.dynamic-fee-tooltip')}
							></CustomStyledTooltip>
						</>
					) : null}
				</FeeRateItem>
			</SummaryItemValue>
		</SummaryItem>
	);
});

export const FeeRateItem = styled.span`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

export const DynamicFeeLabel = styled.span`
	color: ${(props) => props.theme.colors.common.secondaryGray};
`;

const CustomStyledTooltip = styled(Tooltip)`
	width: 300px;
	padding: 0px 4px;
	text-align: center;
`;

export default FeeRateSummaryItem;
