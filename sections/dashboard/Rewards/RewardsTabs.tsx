import { wei } from '@synthetixio/wei';
import { BigNumber } from 'ethers';
import { useRouter } from 'next/router';
import { FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import LinkArrowIcon from 'assets/svg/app/link-arrow.svg';
import Button from 'components/Button';
import { FlexDivCol, FlexDivRow, FlexDivRowCentered } from 'components/layout/flex';
import Pill from 'components/Pill';
import Spacer from 'components/Spacer';
import { Body, Heading, LogoText } from 'components/Text';
import { NO_VALUE } from 'constants/placeholder';
import ROUTES from 'constants/routes';
import useGetFile from 'queries/files/useGetFile';
import { StakingCard } from 'sections/dashboard/Stake/card';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { claimMultipleRewardsAll, claimMultipleRewardsOp } from 'state/staking/actions';
import {
	selectEpochPeriod,
	selectKwentaOpRewards,
	selectSnxOpRewards,
	selectTotalRewardsAll,
} from 'state/staking/selectors';
import { selectNetwork, selectWallet } from 'state/wallet/selectors';
import media from 'styles/media';
import { formatNumber, truncateNumbers, zeroBN } from 'utils/formatters/number';

const RewardsTabs: FC = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const router = useRouter();
	const network = useAppSelector(selectNetwork);
	const walletAddress = useAppSelector(selectWallet);
	const tradingRewards = useAppSelector(selectTotalRewardsAll);
	const kwentaOpRewards = useAppSelector(selectKwentaOpRewards);
	const snxOpRewards = useAppSelector(selectSnxOpRewards);
	const epoch = useAppSelector(selectEpochPeriod);

	const goToStaking = useCallback(() => {
		router.push(ROUTES.Dashboard.TradingRewards);
	}, [router]);

	const handleClaimAll = useCallback(() => {
		dispatch(claimMultipleRewardsAll());
	}, [dispatch]);

	const handleClaimOp = useCallback(() => {
		dispatch(claimMultipleRewardsOp());
	}, [dispatch]);

	const estimatedTradingRewardQuery = useGetFile(
		`trading-rewards-snapshots/${network === 420 ? `goerli-` : ''}epoch-current.json`
	);
	const estimatedTradingReward = useMemo(
		() => BigNumber.from(estimatedTradingRewardQuery?.data?.claims[walletAddress!]?.amount ?? 0),
		[estimatedTradingRewardQuery?.data?.claims, walletAddress]
	);

	const estimatedKwentaOpQuery = useGetFile(
		`trading-rewards-snapshots/${network === 420 ? `goerli-` : ''}epoch-current-op.json`
	);
	const estimatedKwentaOp = useMemo(
		() => BigNumber.from(estimatedKwentaOpQuery?.data?.claims[walletAddress!]?.amount ?? 0),
		[estimatedKwentaOpQuery?.data?.claims, walletAddress]
	);

	const claimDisabledAll = useMemo(
		() => tradingRewards.add(kwentaOpRewards).add(snxOpRewards).lte(0),
		[kwentaOpRewards, snxOpRewards, tradingRewards]
	);

	const claimDisabledKwentaOp = useMemo(() => kwentaOpRewards.lte(0), [kwentaOpRewards]);

	const claimDisabledSnxOp = useMemo(() => snxOpRewards.lte(0), [snxOpRewards]);

	const REWARDS = [
		{
			key: 'trading-rewards',
			title: t('dashboard.rewards.trading-rewards.title'),
			copy: t('dashboard.rewards.trading-rewards.copy'),
			button: t('dashboard.rewards.staking'),
			kwentaIcon: true,
			linkIcon: true,
			rewards: tradingRewards,
			estimatedRewards: truncateNumbers(wei(estimatedTradingReward ?? zeroBN), 4),
			onClick: goToStaking,
			isDisabled: false,
		},
		{
			key: 'kwenta-rewards',
			title: t('dashboard.rewards.kwenta-rewards.title'),
			copy: t('dashboard.rewards.kwenta-rewards.copy'),
			button: t('dashboard.rewards.claim'),
			kwentaIcon: false,
			linkIcon: false,
			rewards: kwentaOpRewards,
			estimatedRewards: truncateNumbers(wei(estimatedKwentaOp ?? zeroBN), 4),
			onClick: handleClaimOp,
			isDisabled: claimDisabledKwentaOp,
		},
		{
			key: 'snx-rewards',
			title: t('dashboard.rewards.snx-rewards.title'),
			copy: t('dashboard.rewards.snx-rewards.copy'),
			button: t('dashboard.rewards.claim'),
			kwentaIcon: false,
			linkIcon: false,
			rewards: snxOpRewards,
			onClick: () => {},
			isDisabled: claimDisabledSnxOp,
		},
	];

	return (
		<RewardsTabContainer>
			<HeaderContainer>
				<StyledFlexDivCol>
					<Heading variant="h4" className="title">
						{t('dashboard.rewards.title')}
					</Heading>
					<div className="value">{t('dashboard.rewards.copy')}</div>
				</StyledFlexDivCol>
				<Pill
					color="yellow"
					size="large"
					blackFont={false}
					onClick={handleClaimAll}
					disabled={claimDisabledAll}
				>
					{t('dashboard.rewards.claim-all')}
				</Pill>
			</HeaderContainer>
			<CardsContainer>
				{REWARDS.map((reward) => (
					<CardGrid key={reward.key}>
						<div>
							<Heading variant="h4" className="title">
								{reward.title}
							</Heading>
							<div className="value">{reward.copy}</div>
						</div>
						<div>
							<Heading className="title">{t('dashboard.rewards.claimable')}</Heading>
							<Spacer height={5} />
							<LogoText kwentaIcon={reward.kwentaIcon} bold={false} size="medium" yellow>
								{truncateNumbers(reward.rewards, 4)}
							</LogoText>
						</div>
						<div
							style={{
								display: 'flex',
								justifyContent: 'flex-start',
								columnGap: '25px',
								alignItems: 'center',
							}}
						>
							<FlexDivCol>
								<Body size="medium" style={{ marginBottom: '5px' }}>
									{t('dashboard.rewards.estimated')}
								</Body>
								<LogoText kwentaIcon={reward.kwentaIcon} bold={false} size="medium" yellow>
									{!!reward.estimatedRewards
										? truncateNumbers(reward.estimatedRewards, 4)
										: NO_VALUE}
								</LogoText>
							</FlexDivCol>
							<FlexDivCol>
								<Body size="medium" style={{ marginBottom: '5px' }}>
									{t('dashboard.rewards.epoch')}
								</Body>
								<FlexDivRow
									className="value"
									style={{ alignItems: 'center', justifyContent: 'flex-start' }}
								>
									{formatNumber(epoch, { minDecimals: 0 })}
								</FlexDivRow>
							</FlexDivCol>
						</div>
						<Button
							fullWidth
							variant="flat"
							size="small"
							disabled={reward.isDisabled}
							onClick={reward.onClick}
						>
							{reward.button}
							{reward.linkIcon ? (
								<LinkArrowIcon
									height={8}
									width={8}
									fill={'#ffffff'}
									style={{ marginLeft: '2px' }}
								/>
							) : null}
						</Button>
					</CardGrid>
				))}
			</CardsContainer>
			<StyledFlexDivCol>
				<div className="value">{t('dashboard.rewards.disclaimer')}</div>
			</StyledFlexDivCol>
		</RewardsTabContainer>
	);
};

const HeaderContainer = styled(FlexDivRowCentered)`
	margin-bottom: 22.5px;

	${media.lessThan('mdUp')`
		flex-direction: column;
		row-gap: 15px;
	`}
`;

const RewardsTabContainer = styled.div`
	${media.lessThan('mdUp')`
		padding: 15px;

	`}

	${media.greaterThan('mdUp')`
		margin-top: 66px;
	`}
`;

const CardGrid = styled(StakingCard)`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	row-gap: 25px;

	.title {
		font-weight: 400;
		font-size: 16px;
		color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.primary};
	}

	.value {
		font-size: 13px;
		line-height: 16px;
		color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.secondary};
		margin-top: 0px;
		font-family: ${(props) => props.theme.fonts.regular};
	}
`;

const CardsContainer = styled.div`
	display: grid;
	width: 100%;
	grid-template-columns: repeat(3, 1fr);
	grid-gap: 20px;
	margin-bottom: 20px;

	${media.lessThan('mdUp')`
		grid-template-columns: repeat(1, 1fr);
	`}
`;

const StyledFlexDivCol = styled(FlexDivCol)`
	.value {
		font-size: 13px;
		color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.secondary};
		margin-top: 0px;
		font-family: ${(props) => props.theme.fonts.regular};
	}

	.title {
		font-weight: 400;
		font-size: 16px;
		color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.primary};
	}
`;

export default RewardsTabs;
