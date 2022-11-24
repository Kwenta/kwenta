import { wei } from '@synthetixio/wei';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useContractReads, useContractWrite, usePrepareContractWrite } from 'wagmi';

import Button from 'components/Button';
import Connector from 'containers/Connector';
import { monitorTransaction } from 'contexts/RelayerContext';
import { useStakingContext } from 'contexts/StakingContext';
import useGetFiles from 'queries/files/useGetFiles';
import useGetFuturesFee from 'queries/staking/useGetFuturesFee';
import useGetFuturesFeeForAccount from 'queries/staking/useGetFuturesFeeForAccount';
import { cobbDouglas, getTradingRewards } from 'queries/staking/utils';
import { FlexDivRow } from 'styles/common';
import media from 'styles/media';
import { formatTruncatedDuration } from 'utils/formatters/date';
import { formatDollars, formatPercent, truncateNumbers, zeroBN } from 'utils/formatters/number';

import { KwentaLabel, StakingCard } from './common';

type TradingRewardProps = {
	period: number | string;
	start?: number;
	end?: number;
};

type EpochDataProps = {
	merkleRoot: string;
	tokenTotal: string;
	claims: {
		[address: string]: {
			index: number;
			amount: string;
			proof: string[];
		};
	};
};

type ClaimParams = [number, string, string, string[], number];

const TradingRewardsTab: React.FC<TradingRewardProps> = ({
	period = 'ALL',
	start = 0,
	end = Math.floor(Date.now() / 1000),
}: TradingRewardProps) => {
	const { t } = useTranslation();
	const { walletAddress } = Connector.useContainer();
	const {
		multipleMerkleDistributorContract,
		periods,
		weekCounter,
		resetTime,
		userStakedBalance,
		totalStakedBalance,
	} = useStakingContext();

	const allEpochQuery = useGetFiles(periods);
	const allEpochData = useMemo(() => allEpochQuery?.data ?? [], [allEpochQuery?.data]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	let rewards: ClaimParams[] = [];

	allEpochData &&
		allEpochData.length > 0 &&
		allEpochData.forEach((d: EpochDataProps, period) => {
			const index = Object.keys(d.claims).findIndex((key) => key === walletAddress);
			if (index !== -1) {
				const walletReward = Object.values(d.claims)[index];
				if (!!walletReward && walletAddress != null) {
					rewards.push([
						walletReward?.index,
						walletAddress,
						walletReward?.amount,
						walletReward?.proof,
						period,
					]);
				}
			}
		});

	const checkIsClaimed = useMemo(() => {
		return rewards.map((reward: ClaimParams) => {
			return {
				...multipleMerkleDistributorContract,
				functionName: 'isClaimed',
				args: [reward[0], reward[4]],
			};
		});
	}, [multipleMerkleDistributorContract, rewards]);

	const { data: isClaimable } = useContractReads({
		contracts: checkIsClaimed,
		enabled: checkIsClaimed && checkIsClaimed.length > 0,
		watch: true,
		scopeKey: 'staking',
	});

	const claimableRewards = useMemo(
		() =>
			isClaimable && isClaimable.length > 0
				? rewards.filter((_, index) => !isClaimable[index])
				: [],
		[isClaimable, rewards]
	);

	const totalRewards =
		claimableRewards.length > 0
			? claimableRewards.reduce((acc, curr) => acc + Number(curr[2]) / 1e18, 0)
			: 0;

	const futuresFeeQuery = useGetFuturesFeeForAccount(walletAddress!, start, end);
	const futuresFeePaid = useMemo(() => {
		const t = futuresFeeQuery.data ?? [];

		return t
			.map((trade: any) => Number(trade.feesPaid) / 1e18)
			.reduce((acc: number, curr: number) => acc + curr, 0);
	}, [futuresFeeQuery.data]);

	const totalFuturesFeeQuery = useGetFuturesFee(start, end);
	const totalFuturesFeePaid = useMemo(() => {
		const t = totalFuturesFeeQuery.data ?? [];

		return t
			.map((trade: any) => Number(trade.feesKwenta) / 1e18)
			.reduce((acc: number, curr: number) => acc + curr, 0);
	}, [totalFuturesFeeQuery.data]);

	const { config } = usePrepareContractWrite({
		...multipleMerkleDistributorContract,
		functionName: 'claimMultiple',
		args: [claimableRewards],
		enabled: claimableRewards && claimableRewards.length > 0,
	});

	const { writeAsync: claim } = useContractWrite(config);

	const { ratio, score: estimatedReward } = useMemo(() => {
		const weeklyReward = getTradingRewards(weekCounter);
		const userScore = cobbDouglas(futuresFeePaid, userStakedBalance);
		const totalScore = cobbDouglas(totalFuturesFeePaid, totalStakedBalance);
		const ratio = totalScore > 0 ? userScore / totalScore : 0;
		return {
			ratio,
			score: ratio * weeklyReward,
		};
	}, [futuresFeePaid, totalFuturesFeePaid, totalStakedBalance, userStakedBalance, weekCounter]);

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
					<Button
						fullWidth
						variant="flat"
						size="sm"
						disabled={!claim}
						onClick={async () => {
							const tx = await claim?.();
							monitorTransaction({
								txHash: tx?.hash ?? '',
							});
						}}
					>
						{t('dashboard.stake.tabs.trading-rewards.claim')}
					</Button>
				</StyledFlexDivRow>
			</CardGridContainer>
			<CardGridContainer>
				<CardGrid>
					<div>
						<div className="title">
							{t('dashboard.stake.tabs.trading-rewards.future-fee-paid', { EpochPeriod: period })}
						</div>
						<div className="value">{formatDollars(futuresFeePaid, { minDecimals: 2 })}</div>
					</div>
					<div>
						<div className="title">
							{t('dashboard.stake.tabs.trading-rewards.fees-paid', { EpochPeriod: period })}
						</div>
						<div className="value">{formatDollars(totalFuturesFeePaid, { minDecimals: 2 })}</div>
					</div>
					{weekCounter <= period ? (
						<>
							<div>
								<div className="title">
									{t('dashboard.stake.tabs.trading-rewards.estimated-rewards', {
										EpochPeriod: period,
									})}
								</div>
								<KwentaLabel>{truncateNumbers(wei(estimatedReward), 4)}</KwentaLabel>
							</div>
							<div>
								<div className="title">
									{t('dashboard.stake.tabs.trading-rewards.estimated-fee-share', {
										EpochPeriod: period,
									})}
								</div>
								<div className="value">{formatPercent(ratio, { minDecimals: 2 })}</div>
							</div>
						</>
					) : null}
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
