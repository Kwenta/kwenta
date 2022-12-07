import { wei } from '@synthetixio/wei';
import { formatEther } from 'ethers/lib/utils.js';
import { useCallback, useEffect, useMemo, FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import HelpIcon from 'assets/svg/app/question-mark.svg';
import Button from 'components/Button';
import StyledTooltip from 'components/Tooltip/StyledTooltip';
import Connector from 'containers/Connector';
import useGetFuturesFee from 'queries/staking/useGetFuturesFee';
import useGetFuturesFeeForAccount from 'queries/staking/useGetFuturesFeeForAccount';
import {
	FuturesFeeForAccountProps,
	FuturesFeeProps,
	TradingRewardProps,
} from 'queries/staking/utils';
import { BigText } from 'sections/earn/common';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { claimMultipleRewards, fetchClaimableRewards } from 'state/staking/actions';
import { selectResetTime, selectTotalRewards } from 'state/staking/selectors';
import { FlexDivRow } from 'styles/common';
import media from 'styles/media';
import { formatTruncatedDuration } from 'utils/formatters/date';
import { formatDollars, formatPercent, truncateNumbers, zeroBN } from 'utils/formatters/number';

import { StakingCard } from './common';

const TradingRewardsTab: FC<TradingRewardProps> = ({
	period = 0,
	start = 0,
	end = Math.floor(Date.now() / 1000),
}) => {
	const { t } = useTranslation();
	const { walletAddress } = Connector.useContainer();
	const dispatch = useAppDispatch();

	const resetTime = useAppSelector(selectResetTime);
	const totalRewards = useAppSelector(selectTotalRewards);

	const futuresFeeQuery = useGetFuturesFeeForAccount(walletAddress!, start, end);
	const futuresFeePaid = useMemo(() => {
		const t: FuturesFeeForAccountProps[] = futuresFeeQuery.data ?? [];

		return t
			.map((trade) => formatEther(trade.feesPaid.toString()))
			.reduce((acc, curr) => acc.add(wei(curr)), zeroBN);
	}, [futuresFeeQuery.data]);

	const totalFuturesFeeQuery = useGetFuturesFee(start, end);
	const totalFuturesFeePaid = useMemo(() => {
		const t: FuturesFeeProps[] = totalFuturesFeeQuery.data ?? [];

		return t
			.map((trade) => formatEther(trade.feesCrossMarginAccounts.toString()))
			.reduce((acc, curr) => acc.add(wei(curr)), zeroBN);
	}, [totalFuturesFeeQuery.data]);

	const claimDisabled = useMemo(() => totalRewards.lte(0), [totalRewards]);

	useEffect(() => {
		dispatch(fetchClaimableRewards());
	}, [dispatch]);

	const handleClaim = useCallback(() => {
		dispatch(claimMultipleRewards());
	}, [dispatch]);

	const ratio = useMemo(
		() =>
			wei(totalFuturesFeePaid).gt(0) ? wei(futuresFeePaid).div(wei(totalFuturesFeePaid)) : zeroBN,
		[futuresFeePaid, totalFuturesFeePaid]
	);

	return (
		<TradingRewardsContainer>
			<CardGridContainer>
				<CardGrid>
					<div>
						<div className="title">
							{t('dashboard.stake.tabs.trading-rewards.claimable-rewards-all')}
						</div>
						<BigText hasKwentaLogo>{truncateNumbers(totalRewards, 4)}</BigText>
					</div>
					<div>
						<div className="title">
							{t('dashboard.stake.tabs.trading-rewards.trading-activity-reset')}
						</div>
						<div className="value">
							{resetTime > new Date().getTime() / 1000
								? formatTruncatedDuration(resetTime - new Date().getTime() / 1000)
								: t('dashboard.stake.tabs.trading-rewards.pending-for-rewards')}
						</div>
					</div>
				</CardGrid>
				<StyledFlexDivRow>
					<Button fullWidth variant="flat" size="sm" onClick={handleClaim} disabled={claimDisabled}>
						{t('dashboard.stake.tabs.trading-rewards.claim')}
					</Button>
				</StyledFlexDivRow>
			</CardGridContainer>
			<CardGridContainer>
				<CardGrid>
					<CustomStyledTooltip
						preset="bottom"
						width={'260px'}
						height={'auto'}
						content={t('dashboard.stake.tabs.trading-rewards.trading-rewards-tooltip')}
					>
						<div>
							<WithCursor cursor="help">
								<div className="title">
									{t('dashboard.stake.tabs.trading-rewards.future-fee-paid', {
										EpochPeriod: period,
									})}
								</div>
								<div className="value">
									{formatDollars(futuresFeePaid, { minDecimals: 2 })}
									<HelpIcon />
								</div>
							</WithCursor>
						</div>
					</CustomStyledTooltip>
					<div>
						<div className="title">
							{t('dashboard.stake.tabs.trading-rewards.fees-paid', { EpochPeriod: period })}
						</div>
						<div className="value">{formatDollars(totalFuturesFeePaid, { minDecimals: 2 })}</div>
					</div>
					<div>
						<div className="title">
							{t('dashboard.stake.tabs.trading-rewards.estimated-fee-share', {
								EpochPeriod: period,
							})}
						</div>
						<div className="value">{formatPercent(ratio, { minDecimals: 2 })}</div>
					</div>
				</CardGrid>
			</CardGridContainer>
		</TradingRewardsContainer>
	);
};

const CustomStyledTooltip = styled(StyledTooltip)`
	padding: 0px 10px 0px;
	${media.lessThan('md')`
		width: 310px;
		left: -5px;
	`}
`;

const WithCursor = styled.div<{ cursor: 'help' }>`
	cursor: ${(props) => props.cursor};
`;

const StyledFlexDivRow = styled(FlexDivRow)`
	column-gap: 15px;
`;

const CardGridContainer = styled(StakingCard)`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
`;

const CardGrid = styled.div`
	display: grid;
	grid-auto-flow: column;
	grid-template-rows: 1fr 1fr;
	grid-template-columns: 1fr 1fr;
	& > div {
		margin-bottom: 20px;
	}

	.value {
		margin-top: 5px;
	}

	svg {
		margin-left: 5px;
	}

	.title {
		color: ${(props) => props.theme.colors.selectedTheme.title};
	}

	${media.lessThan('md')`
		column-gap: 10px;
	`}
`;

const TradingRewardsContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	${media.lessThan('md')`
		grid-template-columns: repeat(1, 1fr);
	`}
	grid-gap: 15px;
`;

export default TradingRewardsTab;
