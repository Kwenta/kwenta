import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import TimerIcon from 'assets/svg/app/timer.svg';
import StyledTooltip from 'components/Tooltip/StyledTooltip';
import { NO_VALUE } from 'constants/placeholder';
import { selectExchangeFeeRateWei, selectBaseFeeRateWei } from 'state/exchange/selectors';
import { useAppSelector } from 'state/hooks';
import { formatPercent } from 'utils/formatters/number';

import { SummaryItem, SummaryItemValue, SummaryItemLabel } from '../common';

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
					{!!exchangeFeeRate && !!baseFeeRate ? (
						exchangeFeeRate.sub(baseFeeRate).gt(0) ? (
							<>
								<DynamicFeeLabel>+</DynamicFeeLabel>
								<CustomStyledTooltip
									position="fixed"
									content={t('exchange.summary-info.dynamic-fee-tooltip')}
								>
									<DynamicFeeRateItem>
										<span>
											{formatPercent(exchangeFeeRate.sub(baseFeeRate), {
												minDecimals: 2,
											})}
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
