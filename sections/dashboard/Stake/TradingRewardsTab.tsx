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
import useGetFuturesFeeForAccount from 'queries/staking/useGetFuturesFeeForAccount';
import useGetSpotFeeForAccount from 'queries/staking/useGetSpotFeeForAccount';
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
		resetTime,
		resetStakingState,
		resetVesting,
		resetVestingClaimable,
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

	const { refetch: resetClaimable, data: isClaimable } = useContractReads({
		contracts: checkIsClaimed,
		enabled: checkIsClaimed && checkIsClaimed.length > 0,
		watch: false,
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

	const { config } = usePrepareContractWrite({
		...multipleMerkleDistributorContract,
		functionName: 'claimMultiple',
		args: [claimableRewards],
		enabled: claimableRewards && claimableRewards.length > 0,
	});

	const { writeAsync: claim } = useContractWrite(config);

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
								onTxConfirmed: () => {
									resetStakingState();
									resetClaimable();
									resetVesting();
									resetVestingClaimable();
								},
							});
						}}
					>
						{t('dashboard.stake.tabs.trading-rewards.claim-all')}
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
						<div className="value">{formatDollars(feePaid, { minDecimals: 4 })}</div>
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
