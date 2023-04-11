import { useRouter } from 'next/router';
import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import LinkArrowIcon from 'assets/svg/app/link-arrow.svg';
import HelpIcon from 'assets/svg/app/question-mark.svg';
import Button from 'components/Button';
import { FlexDivCol, FlexDivRow, FlexDivRowCentered } from 'components/layout/flex';
import Pill from 'components/Pill';
import Spacer from 'components/Spacer';
import { Body, Heading, LogoText } from 'components/Text';
import { EXTERNAL_LINKS } from 'constants/links';
import ROUTES from 'constants/routes';
import { StakingCard } from 'sections/dashboard/Stake/card';
import { useAppSelector } from 'state/hooks';
import { selectAPY, selectEpochPeriod, selectTotalRewards } from 'state/staking/selectors';
import media from 'styles/media';
import { formatNumber, formatPercent, truncateNumbers } from 'utils/formatters/number';

const RewardsTabs: FC = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const stakingApy = useAppSelector(selectAPY);
	const epoch = useAppSelector(selectEpochPeriod);
	const totalRewards = useAppSelector(selectTotalRewards);

	const goToStaking = useCallback(() => {
		router.push(ROUTES.Dashboard.TradingRewards);
	}, [router]);

	const REWARDS = [
		{
			key: 'trading-rewards',
			title: t('dashboard.rewards.trading-rewards.title'),
			copy: t('dashboard.rewards.trading-rewards.copy'),
			button: t('dashboard.rewards.staking'),
			kwentaIcon: true,
			linkIcon: true,
			rewards: totalRewards,
			apy: stakingApy,
			onClick: goToStaking,
		},
		{
			key: 'kwenta-rewards',
			title: t('dashboard.rewards.kwenta-rewards.title'),
			copy: t('dashboard.rewards.kwenta-rewards.copy'),
			button: t('dashboard.rewards.claim'),
			kwentaIcon: false,
			linkIcon: false,
			rewards: totalRewards,
			apy: stakingApy,
			onClick: () => {},
		},
		{
			key: 'snx-rewards',
			title: t('dashboard.rewards.snx-rewards.title'),
			copy: t('dashboard.rewards.snx-rewards.copy'),
			button: t('dashboard.rewards.claim'),
			kwentaIcon: false,
			linkIcon: false,
			rewards: totalRewards,
			apy: stakingApy,
			onClick: () => {},
		},
	];

	return (
		<RewardsTabContainer>
			<FlexDivRowCentered style={{ marginBottom: '22.5px' }}>
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
					onClick={() => window.open(EXTERNAL_LINKS.Docs.Staking, '_blank')}
				>
					{t('dashboard.rewards.claim-all')}
				</Pill>
			</FlexDivRowCentered>
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
							<Heading variant="h6" className="title">
								{t('dashboard.rewards.claimable')}
							</Heading>
							<Spacer height={5} />
							<LogoText kwentaIcon={reward.kwentaIcon} bold={false} size="medium" yellow>
								{truncateNumbers(reward.rewards, 4)}
							</LogoText>
						</div>
						<div style={{ display: 'flex', justifyContent: 'flex-start', columnGap: '25px' }}>
							<FlexDivCol>
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
							</FlexDivCol>
							<FlexDivCol>
								<Body size="medium" style={{ marginBottom: '5px' }}>
									{t('dashboard.rewards.apr')}
								</Body>
								<div className="value">{formatPercent(reward.apy, { minDecimals: 2 })}</div>
							</FlexDivCol>
						</div>
						<Button fullWidth variant="flat" size="small" disabled={false} onClick={reward.onClick}>
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
		</RewardsTabContainer>
	);
};

const SpacedHelpIcon = styled(HelpIcon)`
	margin-left: 5px;
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
