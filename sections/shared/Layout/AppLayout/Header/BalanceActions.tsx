import { useRouter } from 'next/router';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';

import LinkArrowIcon from 'assets/svg/app/link-arrow.svg';
import KwentaLogo from 'assets/svg/earn/KWENTA.svg';
import OptimismLogo from 'assets/svg/providers/optimism.svg';
import Button from 'components/Button';
import { FlexDivRow } from 'components/layout/flex';
import Pill from 'components/Pill';
import { Body, LogoText } from 'components/Text';
import { KWENTA_ADDRESS, OP_ADDRESS } from 'constants/currency';
import { EXTERNAL_LINKS } from 'constants/links';
import ROUTES from 'constants/routes';
import useClickOutside from 'hooks/useClickOutside';
import { StakingCard } from 'sections/dashboard/Stake/card';
import { sdk } from 'state/config';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import {
	claimMultipleRewardsAll,
	claimMultipleRewardsOp,
	fetchClaimableRewardsAll,
	fetchStakingData,
} from 'state/staking/actions';
import {
	selectKwentaOpRewards,
	selectSnxOpRewards,
	selectTotalRewardsAll,
} from 'state/staking/selectors';
import { selectWallet } from 'state/wallet/selectors';
import media from 'styles/media';
import { formatDollars, toWei, truncateNumbers, zeroBN } from 'utils/formatters/number';

const BalanceActions: FC = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const theme = useTheme();
	const router = useRouter();
	const walletAddress = useAppSelector(selectWallet);
	const tradingRewards = useAppSelector(selectTotalRewardsAll);
	const kwentaOpRewards = useAppSelector(selectKwentaOpRewards);
	const snxOpRewards = useAppSelector(selectSnxOpRewards);
	const [open, setOpen] = useState(false);
	const [rewardBalance, setRewardBalance] = useState(zeroBN);

	const { ref } = useClickOutside(() => setOpen(false));

	const goToStaking = useCallback(() => {
		router.push(ROUTES.Dashboard.TradingRewards);
		setOpen(false);
	}, [router]);

	const handleClaimAll = useCallback(() => {
		dispatch(claimMultipleRewardsAll());
	}, [dispatch]);

	const handleClaimOp = useCallback(() => {
		dispatch(claimMultipleRewardsOp());
	}, [dispatch]);

	useEffect(() => {
		if (!!walletAddress) {
			dispatch(fetchStakingData()).then(() => {
				dispatch(fetchClaimableRewardsAll());
			});
		}
	}, [dispatch, walletAddress]);

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

	useEffect(() => {
		const tokenAddresses = [KWENTA_ADDRESS, OP_ADDRESS];
		const initExchangeTokens = async () => {
			const coinGeckoPrices = await sdk.exchange.batchGetCoingeckoPrices(tokenAddresses, true);
			const [kwentaPrice, opPrice] = tokenAddresses.map(
				(tokenAddress) => coinGeckoPrices[tokenAddress]?.usd.toString() ?? 0
			);

			setRewardBalance(
				toWei(kwentaPrice)
					.mul(tradingRewards)
					.add(toWei(opPrice).mul(kwentaOpRewards.add(snxOpRewards)))
			);
		};

		(async () => {
			await initExchangeTokens();
		})();
	}, [kwentaOpRewards, snxOpRewards, tradingRewards]);

	return (
		<>
			<Button
				size="small"
				mono
				onClick={() => setOpen(!open)}
				style={{
					color: theme.colors.selectedTheme.yellow,
					borderColor: theme.colors.selectedTheme.newTheme.border.yellow,
				}}
			>
				<KwentaLogo style={{ marginRight: '5px' }} />
				<OptimismLogo height={18} width={18} style={{ marginRight: '5px' }} />
				{formatDollars(rewardBalance, { maxDecimals: 2 })}
			</Button>
			{open && (
				<RewardsTabContainer ref={ref}>
					<CardsContainer>
						{REWARDS.map((reward) => (
							<CardGrid key={reward.key}>
								<Body size="medium" color="primary" weight="bold">
									{reward.title}
								</Body>
								<StyledFlexDivRow>
									<div>
										<Body size="medium" color="secondary">
											{t('dashboard.rewards.claimable')}
										</Body>
										<LogoText kwentaIcon={reward.kwentaIcon} bold={false} size="medium" yellow>
											{truncateNumbers(reward.rewards, 4)}
										</LogoText>
									</div>
									<Button
										fullWidth
										variant="flat"
										size="small"
										disabled={reward.isDisabled}
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
						<ButtonContainer>
							<Pill
								color="gray"
								fullWidth={true}
								size="large"
								isRounded={false}
								blackFont={false}
								onClick={() =>
									window.open(EXTERNAL_LINKS.Docs.RewardsGuide, '_blank', 'noopener noreferrer')
								}
								disabled={claimDisabledAll}
							>
								{t('dashboard.rewards.learn-more')}
							</Pill>
							<Pill
								color="yellow"
								fullWidth={true}
								size="large"
								isRounded={false}
								blackFont={false}
								onClick={handleClaimAll}
								disabled={claimDisabledAll}
							>
								{t('dashboard.rewards.claim-all')}
							</Pill>
						</ButtonContainer>
					</CardsContainer>
				</RewardsTabContainer>
			)}
		</>
	);
};

const ButtonContainer = styled(FlexDivRow)`
	column-gap: 15px;
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
	row-gap: 7px;
`;

const CardsContainer = styled(StakingCard)`
	display: grid;
	width: 100%;
	grid-template-rows: repeat(3, 1fr);
	grid-gap: 20px;
`;

const StyledFlexDivRow = styled(FlexDivRow)`
	column-gap: 50px;
	align-items: center;
`;

export default BalanceActions;
