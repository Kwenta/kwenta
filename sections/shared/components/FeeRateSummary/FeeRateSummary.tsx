import Wei from '@synthetixio/wei';
import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import TimerIcon from 'assets/svg/app/timer.svg';
import StyledTooltip from 'components/Tooltip/StyledTooltip';
import { NO_VALUE } from 'constants/placeholder';
import { formatPercent } from 'utils/formatters/number';

import { SummaryItem, SummaryItemValue, SummaryItemLabel } from '../common';

type FeeRateSummaryItemProps = {
	totalFeeRate: Wei | null;
	baseFeeRate?: Wei | null;
};

const FeeRateSummaryItem: FC<FeeRateSummaryItemProps> = memo(({ totalFeeRate, baseFeeRate }) => {
	const { t } = useTranslation();

	return (
		<SummaryItem>
			<SummaryItemLabel>{t('exchange.summary-info.fee')}</SummaryItemLabel>
			<SummaryItemValue>
				<FeeRateItem data-testid="exchange-fee-rate">
					<span>
						{baseFeeRate != null
							? formatPercent(baseFeeRate, { minDecimals: 2 })
							: totalFeeRate != null
							? formatPercent(totalFeeRate, { minDecimals: 2 })
							: NO_VALUE}
					</span>
					{totalFeeRate != null && baseFeeRate != null ? (
						totalFeeRate.sub(baseFeeRate).gt(0) ? (
							<>
								<DynamicFeeLabel>+</DynamicFeeLabel>
								<DynamicFeeRateTooltip
									preset="bottom"
									content={t('exchange.summary-info.dynamic-fee-tooltip')}
								>
									<DynamicFeeRateItem>
										<span>{formatPercent(totalFeeRate.sub(baseFeeRate), { minDecimals: 2 })}</span>
										<TimerIcon />
									</DynamicFeeRateItem>
								</DynamicFeeRateTooltip>
							</>
						) : null
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

export const DynamicFeeRateTooltip = styled(StyledTooltip)`
	width: auto;
	text-align: justify;
	font-size: 12px;
	.tippy-content {
		padding: 15px;
		font-family: ${(props) => props.theme.fonts.mono};
	}
`;

export const DynamicFeeRateItem = styled.span`
	color: ${(props) => props.theme.colors.selectedTheme.gold};
	display: flex;
	align-items: center;
	justify-content: space-between;
	cursor: pointer;
	svg {
		margin-left: 3px;
		path {
			fill: ${(props) => props.theme.colors.selectedTheme.gold};
		}
	}
`;

export default FeeRateSummaryItem;
