import { wei } from '@synthetixio/wei';
import { BigNumber } from 'ethers';
import { useRouter } from 'next/router';
import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';

import LinkArrowIcon from 'assets/svg/app/link-arrow.svg';
import HelpIcon from 'assets/svg/app/question-mark.svg';
import KwentaLogo from 'assets/svg/earn/KWENTA.svg';
import OptimismLogo from 'assets/svg/providers/optimism.svg';
import Button from 'components/Button';
import { FlexDivCol, FlexDivRow } from 'components/layout/flex';
import Pill from 'components/Pill';
import Spacer from 'components/Spacer/Spacer';
import { Body, Heading, LogoText } from 'components/Text';
import { KWENTA_ADDRESS, OP_ADDRESS } from 'constants/currency';
import ROUTES from 'constants/routes';
import { StakingCard } from 'sections/dashboard/Stake/card';
import { sdk } from 'state/config';
import { useAppSelector } from 'state/hooks';
import { selectAPY, selectEpochPeriod } from 'state/staking/selectors';
import { selectNetwork, selectWallet } from 'state/wallet/selectors';
import media from 'styles/media';
import {
	formatDollars,
	formatNumber,
	formatPercent,
	toWei,
	truncateNumbers,
	zeroBN,
} from 'utils/formatters/number';
// eslint-disable-next-line import/order
import useGetFile from 'queries/files/useGetFile';

const ClaimAllButton = memo(() => {
	const { t } = useTranslation();

	return (
		<Pill color="yellow" fullWidth={true} size="large" isRounded={false} blackFont={false}>
			{t('dashboard.rewards.claim-all')}
		</Pill>
	);
});

const BalanceActions: FC = () => {
	const { t } = useTranslation();
	const theme = useTheme();
	const router = useRouter();
	const network = useAppSelector(selectNetwork);
	const walletAddress = useAppSelector(selectWallet);
	const stakingApy = useAppSelector(selectAPY);
	const epoch = useAppSelector(selectEpochPeriod);
	const [open, setOpen] = useState(false);
	const [rewardBalance, setRewardBalance] = useState(zeroBN);
	const goToStaking = useCallback(() => {
		router.push(ROUTES.Dashboard.TradingRewards);
		setOpen(false);
	}, [router]);

	const estimatedTradingRewardQuery = useGetFile(
		`trading-rewards-snapshots/${network === 420 ? `goerli-` : ''}epoch-current.json`
	);

	const estimatedTradingReward = useMemo(
		() => BigNumber.from(estimatedTradingRewardQuery?.data?.claims[walletAddress!]?.amount ?? 0),
		[estimatedTradingRewardQuery?.data?.claims, walletAddress]
	);

	const estimatedKwentaRewardQuery = useGetFile(
		`trading-rewards-snapshots/${network === 420 ? `goerli-` : ''}epoch-current-op.json`
	);
	const estimatedKwentaReward = useMemo(
		() => BigNumber.from(estimatedKwentaRewardQuery?.data?.claims[walletAddress!]?.amount ?? 0),
		[estimatedKwentaRewardQuery?.data?.claims, walletAddress]
	);

	const REWARDS = [
		{
			key: 'trading-rewards',
			title: t('dashboard.rewards.trading-rewards.title'),
			copy: t('dashboard.rewards.trading-rewards.copy'),
			button: t('dashboard.rewards.staking'),
			kwentaIcon: true,
			linkIcon: true,
			apy: stakingApy,
			rewards: truncateNumbers(wei(estimatedTradingReward ?? zeroBN), 4),
			onClick: goToStaking,
		},
		{
			key: 'kwenta-rewards',
			title: t('dashboard.rewards.kwenta-rewards.title'),
			copy: t('dashboard.rewards.kwenta-rewards.copy'),
			button: t('dashboard.rewards.claim'),
			kwentaIcon: false,
			linkIcon: false,
			apy: stakingApy,
			rewards: truncateNumbers(wei(estimatedKwentaReward ?? zeroBN), 4),
			onClick: () => {},
		},
		{
			key: 'snx-rewards',
			title: t('dashboard.rewards.snx-rewards.title'),
			copy: t('dashboard.rewards.snx-rewards.copy'),
			button: t('dashboard.rewards.claim'),
			kwentaIcon: false,
			linkIcon: false,
			apy: stakingApy,
			rewards: truncateNumbers(wei(estimatedKwentaReward ?? zeroBN), 4),
			onClick: () => {},
		},
	];

	useEffect(() => {
		const tokenAddresses = [KWENTA_ADDRESS, OP_ADDRESS];
		const initExchangeTokens = async () => {
			const coinGeckoPrices = await sdk.exchange.batchGetCoingeckoPrices(tokenAddresses, true);
			const [kwentaPrice, opPrice] = tokenAddresses.map(
				(tokenAddress) => coinGeckoPrices[tokenAddress]?.usd.toString() ?? 0
			);

			setRewardBalance(
				toWei(kwentaPrice)
					.mul(estimatedTradingReward)
					.add(toWei(opPrice).mul(estimatedKwentaReward.add(estimatedKwentaReward)))
			);
		};

		(async () => {
			await initExchangeTokens();
		})();
	}, [estimatedKwentaReward, estimatedTradingReward, rewardBalance]);

	return (
		<>
			<Button
				size="small"
				mono
				onClick={() => setOpen(!open)}
				style={{
					color: theme.colors.selectedTheme.yellow,
					borderColor: theme.colors.selectedTheme.yellow,
				}}
			>
				<KwentaLogo style={{ marginRight: '5px' }} />
				<OptimismLogo height={18} width={18} style={{ marginRight: '5px' }} />
				{formatDollars(rewardBalance, { maxDecimals: 2 })}
			</Button>
			{open && (
				<RewardsTabContainer>
					<CardsContainer>
						{REWARDS.map((reward) => (
							<CardGrid key={reward.key}>
								<Body size="medium">{reward.title}</Body>
								<StyledFlexDivRow>
									<div>
										<Heading variant="h6" className="title">
											{t('dashboard.rewards.claimable')}
										</Heading>
										<Spacer height={5} />
										<LogoText kwentaIcon={reward.kwentaIcon} bold={false} size="medium" yellow>
											{truncateNumbers(reward.rewards, 4)}
										</LogoText>
									</div>
									<StyledFlexDivCol>
										<Body size="medium" style={{ marginBottom: '5px' }}>
											{t('dashboard.rewards.epoch')}
										</Body>
										<FlexDivRow
											className="value"
											style={{ alignItems: 'center', justifyContent: 'flex-start' }}
										>
											{formatNumber(epoch, { minDecimals: 0 })}
											<SpacedHelpIcon />
										</FlexDivRow>
									</StyledFlexDivCol>
									<StyledFlexDivCol>
										<Body size="medium" style={{ marginBottom: '5px' }}>
											{t('dashboard.rewards.apr')}
										</Body>
										<div className="value">{formatPercent(reward.apy, { minDecimals: 2 })}</div>
									</StyledFlexDivCol>
									<Button
										fullWidth
										variant="flat"
										size="small"
										disabled={false}
										onClick={reward.onClick}
										style={{ marginLeft: '50px' }}
									>
										{reward.button}
										{reward.linkIcon ? (
											<LinkArrowIcon height={8} width={8} style={{ marginLeft: '2px' }} />
										) : null}
									</Button>
								</StyledFlexDivRow>
							</CardGrid>
						))}
						<ClaimAllButton />
					</CardsContainer>
				</RewardsTabContainer>
			)}
		</>
	);
};

const SpacedHelpIcon = styled(HelpIcon)`
	margin-left: 5px;
`;

const RewardsTabContainer = styled.div`
	z-index: 100;
	position: absolute;
	right: 12%;
	${media.lessThan('mdUp')`
		padding: 15px;
	`}

	${media.greaterThan('mdUp')`
		margin-top: 56px;
	`}
`;

const CardGrid = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	row-gap: 10px;
	margin-bottom: 15px;
`;

const CardsContainer = styled(StakingCard)`
	display: grid;
	width: 100%;
	grid-template-rows: repeat(3, 1fr);
	grid-gap: 20px;
`;

const StyledFlexDivRow = styled(FlexDivRow)`
	column-gap: 50px;

	.value {
		color: ${(props) => props.theme.colors.selectedTheme.text.label};
		font-size: 13px;
		margin-top: 0px;
		font-family: ${(props) => props.theme.fonts.regular};
	}

	.title {
		font-weight: 400;
		font-size: 16px;
		color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.primary};
	}
`;

const StyledFlexDivCol = styled(FlexDivCol)`
	margin: auto;
	padding: 0;
`;

export default BalanceActions;
