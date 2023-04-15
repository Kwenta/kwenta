import { useRouter } from 'next/router';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
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
import useClickOutside from 'hooks/useClickOutside';
import { StakingCard } from 'sections/dashboard/Stake/card';
import { sdk } from 'state/config';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { claimMultipleRewardsAll, claimMultipleRewardsOp } from 'state/staking/actions';
import {
	selectEpochPeriod,
	selectKwentaOpRewards,
	selectSnxOpRewards,
	selectTotalRewards,
} from 'state/staking/selectors';
import media from 'styles/media';
import {
	formatDollars,
	formatNumber,
	toWei,
	truncateNumbers,
	zeroBN,
} from 'utils/formatters/number';

const BalanceActions: FC = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const theme = useTheme();
	const router = useRouter();
	const epoch = useAppSelector(selectEpochPeriod);
	const tradingRewards = useAppSelector(selectTotalRewards);
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

	const claimDisabledAll = useMemo(
		() => tradingRewards.add(kwentaOpRewards).add(snxOpRewards).lte(0),
		[kwentaOpRewards, snxOpRewards, tradingRewards]
	);

	const claimDisabledOp = useMemo(() => kwentaOpRewards.add(snxOpRewards).lte(0), [
		kwentaOpRewards,
		snxOpRewards,
	]);

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
			isDisabled: claimDisabledOp,
		},
		{
			key: 'snx-rewards',
			title: t('dashboard.rewards.snx-rewards.title'),
			copy: t('dashboard.rewards.snx-rewards.copy'),
			button: t('dashboard.rewards.claim'),
			kwentaIcon: false,
			linkIcon: false,
			rewards: snxOpRewards,
			onClick: handleClaimOp,
			isDisabled: claimDisabledOp,
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
					borderColor: theme.colors.selectedTheme.yellow,
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
