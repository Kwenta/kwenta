import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Tippy from '@tippyjs/react';
import { Svg } from 'react-optimized-image';

import { NO_VALUE } from 'constants/placeholder';

import TimerIcon from 'assets/svg/app/timer.svg';

import { formatPercent } from 'utils/formatters/number';

import { SummaryItem, SummaryItemValue, SummaryItemLabel } from '../common';
import Wei from '@synthetixio/wei';

type FeeRateSummaryItemProps = {
	totalFeeRate: Wei | null;
	baseFeeRate: Wei | null;
};

const FeeRateSummaryItem: FC<FeeRateSummaryItemProps> = ({ totalFeeRate, baseFeeRate }) => {
	const { t } = useTranslation();

	return (
		<SummaryItem>
			<SummaryItemLabel>{t('exchange.summary-info.fee')}</SummaryItemLabel>
			<SummaryItemValue>
				<FeeRateItem data-testid="exchange-fee-rate">
					<span>
						{baseFeeRate != null ? formatPercent(baseFeeRate, { minDecimals: 2 }) : NO_VALUE}
					</span>
					{totalFeeRate != null && baseFeeRate != null ? (
						totalFeeRate.sub(baseFeeRate).toNumber() > 0 ? (
							<>
								<span>+</span>
								<DynamicFeeRateTooltip
									content="This transaction will incur an additional dynamic fee due to market volatility."
									trigger="mouseenter focus"
									arrow={false}
									placement="bottom"
								>
									<DynamicFeeRateItem>
										<span>
											{formatPercent(totalFeeRate.sub(baseFeeRate).toNumber(), { minDecimals: 2 })}
										</span>
										<Svg src={TimerIcon} />
									</DynamicFeeRateItem>
								</DynamicFeeRateTooltip>
							</>
						) : null
					) : null}
				</FeeRateItem>
			</SummaryItemValue>
		</SummaryItem>
	);
};

export const DynamicFeeRateTooltip = styled(Tippy)`
	width: auto;
	text-align: justify;
	font-size: 12px;
	.tippy-content {
		padding: 15px;
		font-family: ${(props) => props.theme.fonts.mono};
	}
`;

export const FeeRateItem = styled.span`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

export const DynamicFeeRateItem = styled.span`
	color: #ffdf6d;
	display: flex;
	align-items: center;
	justify-content: space-between;
	cursor: pointer;
	svg {
		margin-left: 5px;
	}
`;

export default FeeRateSummaryItem;
