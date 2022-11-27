import { wei } from '@synthetixio/wei';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';
import Connector from 'containers/Connector';
import useGetFuturesFeeForAccount from 'queries/staking/useGetFuturesFeeForAccount';
import useGetSpotFeeForAccount from 'queries/staking/useGetSpotFeeForAccount';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { claimMultipleRewards, fetchClaimableRewards } from 'state/staking/actions';
import { selectResetTime } from 'state/staking/selectors';
import { FlexDivRow } from 'styles/common';
import media from 'styles/media';
import { formatTruncatedDuration } from 'utils/formatters/date';
import { formatDollars, truncateNumbers, zeroBN } from 'utils/formatters/number';

import { KwentaLabel, StakingCard } from './common';

type TradingRewardProps = {
	period: number | string;
	start?: number;
	end?: number;
};

const TradingRewardsTab: React.FC<TradingRewardProps> = ({
	period = 'ALL',
	start = 0,
	end = Math.floor(Date.now() / 1000),
}: TradingRewardProps) => {
	const { t } = useTranslation();
	const { walletAddress } = Connector.useContainer();
	const dispatch = useAppDispatch();

	const resetTime = useAppSelector(selectResetTime);
	const totalRewards = useAppSelector(({ staking }) => staking.totalRewards);

	const SpotFeeQuery = useGetSpotFeeForAccount(walletAddress!, start, end);
	const spotFeePaid = useMemo(() => {
		const t = SpotFeeQuery.data?.synthExchanges ?? [];

		return t
			.map((trade: any) => Number(trade.feesInUSD))
			.reduce((acc: number, curr: number) => acc + curr, 0);
	}, [SpotFeeQuery.data]);

	const FuturesFeeQuery = useGetFuturesFeeForAccount(walletAddress!, start, end);
	const futuresFeePaid = useMemo(() => {
		const t = FuturesFeeQuery.data ?? [];

		return t
			.map((trade: any) => Number(trade.feesPaid) / 1e18)
			.reduce((acc: number, curr: number) => acc + curr, 0);
	}, [FuturesFeeQuery.data]);

	const feePaid = useMemo(() => spotFeePaid + futuresFeePaid, [futuresFeePaid, spotFeePaid]);

	useEffect(() => {
		dispatch(fetchClaimableRewards());
	}, [dispatch]);

	const handleClaim = useCallback(() => {
		dispatch(claimMultipleRewards());
	}, [dispatch]);

	return (
		<TradingRewardsContainer>
			<CardGridContainer>
				<CardGrid>
					<div>
						<div className="title">
							{t('dashboard.stake.tabs.trading-rewards.claimable-rewards-all')}
						</div>
						<KwentaLabel>{truncateNumbers(wei(totalRewards) ?? zeroBN, 4)}</KwentaLabel>
					</div>
					<div>
						<div className="title">
							{t('dashboard.stake.tabs.trading-rewards.trading-activity-reset')}
						</div>
						<div className="value">
							{formatTruncatedDuration(resetTime - new Date().getTime() / 1000)}
						</div>
					</div>
				</CardGrid>
				<StyledFlexDivRow>
					<Button fullWidth variant="flat" size="sm" onClick={handleClaim}>
						{t('dashboard.stake.tabs.trading-rewards.claim')}
					</Button>
				</StyledFlexDivRow>
			</CardGridContainer>
			<CardGridContainer>
				<CardGrid>
					<div>
						<div className="title">
							{t('dashboard.stake.tabs.trading-rewards.spot-fee-paid', { EpochPeriod: period })}
						</div>
						<div className="value">{formatDollars(spotFeePaid, { minDecimals: 4 })}</div>
					</div>
					<div>
						<div className="title">
							{t('dashboard.stake.tabs.trading-rewards.future-fee-paid', { EpochPeriod: period })}
						</div>
						<div className="value">{formatDollars(futuresFeePaid, { minDecimals: 4 })}</div>
					</div>
					<div>
						<div className="title">
							{t('dashboard.stake.tabs.trading-rewards.fees-paid', { EpochPeriod: period })}
						</div>
						<div className="value">{formatDollars(feePaid, { minDecimals: 4 })}</div>
					</div>
				</CardGrid>
			</CardGridContainer>
		</TradingRewardsContainer>
	);
};

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
