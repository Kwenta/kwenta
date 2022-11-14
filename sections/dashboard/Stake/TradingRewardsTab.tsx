import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { useContractReads, useContractWrite, usePrepareContractWrite } from 'wagmi';

import Button from 'components/Button';
import Connector from 'containers/Connector';
import { useStakingContext } from 'contexts/StakingContext';
import useGetFiles from 'queries/files/useGetFiles';
import useGetFuturesFeeForAccount from 'queries/staking/useGetFuturesFeeForAccount';
import useGetSpotFeeForAccount from 'queries/staking/useGetSpotFeeForAccount';
import { currentThemeState } from 'store/ui';
import { FlexDivRow } from 'styles/common';
import media from 'styles/media';
import { formatTruncatedDuration, getNextSunday } from 'utils/formatters/date';
import { truncateNumbers } from 'utils/formatters/number';

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
	}[];
};

const TradingRewardsTab: React.FC<TradingRewardProps> = ({
	period = 'ALL',
	start = 0,
	end = Math.floor(Date.now() / 1000),
}: TradingRewardProps) => {
	const { t } = useTranslation();
	const { walletAddress } = Connector.useContainer();
	const { multipleMerkleDistributorContract, periods } = useStakingContext();
	const currentTheme = useRecoilValue(currentThemeState);
	const isDarkTheme = useMemo(() => currentTheme === 'dark', [currentTheme]);

	const fileNames = useMemo(() => {
		let fileNames: string[] = [];
		periods.forEach((i) => {
			fileNames.push(`trading-rewards-snapshots/epoch-${i - 1}.json`);
		});
		return fileNames;
	}, [periods]);

	const allEpochQuery = useGetFiles(fileNames);
	const allEpochData = useMemo(() => allEpochQuery?.data ?? [], [allEpochQuery?.data]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	let rewards: [any, any, any, any, any][] = [];

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

	let checkIsClaimed: any[] = [];
	rewards.length > 0 &&
		rewards.forEach((walletReward) =>
			checkIsClaimed.push({
				...multipleMerkleDistributorContract,
				functionName: 'isClaimed',
				args: [walletReward[0], walletReward[4]],
			})
		);

	const { data: isClaimable } = useContractReads({
		contracts: checkIsClaimed,
		enabled: checkIsClaimed.length > 0,
		watch: true,
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
			? claimableRewards.reduce((acc, curr) => acc + Number(curr[2] / 1e18), 0)
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

	// eslint-disable-next-line no-console
	console.log(`args`, claimableRewards);
	const { config: claimEpochConfig } = usePrepareContractWrite({
		...multipleMerkleDistributorContract,
		functionName: 'claimMultiple',
		args: [claimableRewards],
		enabled: claimableRewards && claimableRewards.length > 0,
	});

	const { write: claim } = useContractWrite(claimEpochConfig);

	return (
		<TradingRewardsContainer>
			<CardGridContainer $darkTheme={isDarkTheme}>
				<CardGrid>
					<div>
						<div className="title">
							{t('dashboard.stake.tabs.trading-rewards.claimable-rewards-all')}
						</div>
						<KwentaLabel>{truncateNumbers(totalRewards ?? 0, 4)}</KwentaLabel>
					</div>
				</CardGrid>
				<StyledFlexDivRow>
					<Button
						fullWidth
						variant="flat"
						size="sm"
						disabled={!claimableRewards || claimableRewards.length === 0}
						onClick={() => claim?.()}
					>
						{t('dashboard.stake.tabs.trading-rewards.claim-all')}
					</Button>
				</StyledFlexDivRow>
			</CardGridContainer>
			<CardGridContainer $darkTheme={isDarkTheme}>
				<CardGrid>
					<div>
						<div className="title">
							{t('dashboard.stake.tabs.trading-rewards.fees-paid', { EpochPeriod: period })}
						</div>
						<div className="value">{truncateNumbers(feePaid ?? 0, 4)}</div>
					</div>
					<div>
						<div className="title">
							{t('dashboard.stake.tabs.trading-rewards.trading-activity-reset')}
						</div>
						<div className="value">
							{formatTruncatedDuration(
								getNextSunday(new Date()).getTime() / 1000 - new Date().getTime() / 1000
							)}
						</div>
					</div>
				</CardGrid>
			</CardGridContainer>
		</TradingRewardsContainer>
	);
};

const StyledFlexDivRow = styled(FlexDivRow)`
	column-gap: 15px;
`;

const CardGridContainer = styled(StakingCard)<{ $darkTheme: boolean }>`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
`;

const CardGrid = styled.div`
	display: grid;
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
