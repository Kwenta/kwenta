import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { useContractWrite, usePrepareContractWrite } from 'wagmi';

import Button from 'components/Button';
import Connector from 'containers/Connector';
import { useStakingContext } from 'contexts/StakingContext';
import useGetFile from 'queries/files/useGetFile';
import useGetFuturesFeeForAccount from 'queries/staking/useGetFuturesFeeForAccount';
import useGetSpotFeeForAccount from 'queries/staking/useGetSpotFeeForAccount';
import { currentThemeState } from 'store/ui';
import { FlexDivRow } from 'styles/common';
import media from 'styles/media';
import { formatTruncatedDuration } from 'utils/formatters/date';
import { truncateNumbers } from 'utils/formatters/number';
import logError from 'utils/logError';

import { KwentaLabel, StakingCard } from './common';

type TradingRewardProps = {
	period: number;
};

const TradingRewardsTab: React.FC<TradingRewardProps> = ({ period = 1 }: TradingRewardProps) => {
	const { t } = useTranslation();
	const { walletAddress } = Connector.useContainer();
	const { multipleMerkleDistributorContract } = useStakingContext();
	const currentTheme = useRecoilValue(currentThemeState);
	const isDarkTheme = useMemo(() => currentTheme === 'dark', [currentTheme]);

	const getNextSunday = (date: Date) => {
		const nextSunday = new Date();
		nextSunday.setDate(date.getDate() + (7 - date.getDay()));
		nextSunday.setHours(0, 0, 0, 0);
		return nextSunday;
	};

	const epochQuery = useGetFile(`trading-rewards-snapshots/epoch-${period - 1}.json`);
	const epochData = epochQuery.isSuccess ? epochQuery.data : null;

	const walletReward = useMemo(
		() => (epochData != null && walletAddress != null ? epochData.claims[walletAddress] : null),
		[epochData, walletAddress]
	);

	const currentWeeklyReward = useMemo(() => (epochData != null ? epochData.tokenTotal : 0), [
		epochData,
	]);

	const tradingRewardsRatio = useMemo(
		() =>
			walletReward != null && currentWeeklyReward != null && currentWeeklyReward !== 0
				? walletReward.amount / currentWeeklyReward
				: 0,
		[currentWeeklyReward, walletReward]
	);

	const SpotFeeQuery = useGetSpotFeeForAccount(walletAddress!);
	const spotFeePaid = useMemo(() => {
		const t = SpotFeeQuery.data?.synthExchanges ?? [];

		return t
			.map((trade: any) => Number(trade.feesInUSD))
			.reduce((acc: number, curr: number) => acc + curr, 0);
	}, [SpotFeeQuery.data]);

	const FuturesFeeQuery = useGetFuturesFeeForAccount(walletAddress!);
	const futuresFeePaid = useMemo(() => {
		const t = FuturesFeeQuery.data ?? [];

		return t
			.map((trade: any) => Number(trade.feesPaid) / 1e18)
			.reduce((acc: number, curr: number) => acc + curr, 0);
	}, [FuturesFeeQuery.data]);

	const feePaid = useMemo(() => spotFeePaid + futuresFeePaid, [futuresFeePaid, spotFeePaid]);

	const { config: claimEpochConfig } = usePrepareContractWrite({
		...multipleMerkleDistributorContract,
		functionName: 'claim',
		args: [walletReward?.index, walletAddress, walletReward?.amount, walletReward?.proof, period],
		enabled: walletReward != null,
		onError(error) {
			logError(error);
		},
		staleTime: Infinity,
	});

	const { write: claim } = useContractWrite(claimEpochConfig);

	return (
		<TradingRewardsContainer>
			<CardGridContainer $darkTheme={isDarkTheme}>
				<CardGrid>
					<div>
						<div className="title">
							{t('dashboard.stake.tabs.trading-rewards.claimable-rewards-epoch', {
								EpochPeriod: period,
							})}
						</div>
						<KwentaLabel>
							{truncateNumbers(Number(currentWeeklyReward / 1e18) * tradingRewardsRatio, 4)}
						</KwentaLabel>
					</div>
					<div>
						<div className="title">
							{t('dashboard.stake.tabs.trading-rewards.claimable-rewards-all')}
						</div>
						<KwentaLabel>
							{truncateNumbers(Number(currentWeeklyReward / 1e18) * tradingRewardsRatio, 4)}
						</KwentaLabel>
					</div>
				</CardGrid>
				<StyledFlexDivRow>
					<Button
						fullWidth
						variant="flat"
						size="sm"
						disabled={tradingRewardsRatio === 0}
						onClick={() => claim?.()}
					>
						{t('dashboard.stake.tabs.trading-rewards.claim-epoch', { EpochPeriod: period })}
					</Button>
					<Button
						fullWidth
						variant="flat"
						size="sm"
						disabled={tradingRewardsRatio === 0}
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
							{t('dashboard.stake.tabs.trading-rewards.estimated-rewards')}
						</div>
						<KwentaLabel>
							{truncateNumbers(Number(currentWeeklyReward / 1e18) * tradingRewardsRatio, 4)}
						</KwentaLabel>
					</div>
					<div>
						<div className="title">
							{t('dashboard.stake.tabs.trading-rewards.estimated-fee-share')}
						</div>
						<div className="value">{truncateNumbers(tradingRewardsRatio * 100, 4)}%</div>
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
