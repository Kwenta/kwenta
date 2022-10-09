import { wei } from '@synthetixio/wei';
import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from 'state/store';
import styled from 'styled-components';

import TimerIcon from 'assets/svg/app/timer.svg';
import StyledTooltip from 'components/Tooltip/StyledTooltip';
import { NO_VALUE } from 'constants/placeholder';
import { formatPercent } from 'utils/formatters/number';

import { SummaryItem, SummaryItemValue, SummaryItemLabel } from '../common';

const FeeRateSummaryItem: FC = memo(() => {
	const { t } = useTranslation();

	const { exchangeFeeRate, baseFeeRate } = useAppSelector(({ exchange }) => ({
		exchangeFeeRate: exchange.exchangeFeeRate,
		baseFeeRate: exchange.baseFeeRate,
	}));

	return (
		<SummaryItem>
			<SummaryItemLabel>{t('exchange.summary-info.fee')}</SummaryItemLabel>
			<SummaryItemValue>
				<FeeRateItem data-testid="exchange-fee-rate">
					<span>
						{baseFeeRate != null
							? formatPercent(baseFeeRate, { minDecimals: 2 })
							: !!exchangeFeeRate
							? formatPercent(wei(exchangeFeeRate), { minDecimals: 2 })
							: NO_VALUE}
					</span>
					{!!exchangeFeeRate != null && baseFeeRate != null ? (
						wei(exchangeFeeRate).sub(baseFeeRate).gt(0) ? (
							<>
								<DynamicFeeLabel>+</DynamicFeeLabel>
								<CustomStyledTooltip
									position="fixed"
									content={t('exchange.summary-info.dynamic-fee-tooltip')}
								>
									<DynamicFeeRateItem>
										<span>
											{formatPercent(wei(exchangeFeeRate).sub(baseFeeRate), { minDecimals: 2 })}
										</span>
										<TimerIcon />
									</DynamicFeeRateItem>
								</CustomStyledTooltip>
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

const CustomStyledTooltip = styled(StyledTooltip)`
	width: 300px;
	padding: 0px 4px;
	text-align: center;
`;

export default FeeRateSummaryItem;
