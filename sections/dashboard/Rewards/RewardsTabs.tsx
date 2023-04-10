import { FC } from 'react';
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
import { StakingCard } from 'sections/dashboard/Stake/card';
import { useAppSelector } from 'state/hooks';
import { selectAPY } from 'state/staking/selectors';
import media from 'styles/media';
import { formatPercent } from 'utils/formatters/number';

const RewardsTabs: FC = () => {
	const { t } = useTranslation();
	const apy = useAppSelector(selectAPY);
	const REWARDS = [
		{
			key: 'trading-rewards',
			title: t('dashboard.rewards.trading-rewards.title'),
			copy: t('dashboard.rewards.trading-rewards.copy'),
			button: t('dashboard.rewards.staking'),
			kwentaIcon: true,
			linkIcon: true,
		},
		{
			key: 'kwenta-rewards',
			title: t('dashboard.rewards.kwenta-rewards.title'),
			copy: t('dashboard.rewards.kwenta-rewards.copy'),
			button: t('dashboard.rewards.claim'),
			kwentaIcon: false,
			linkIcon: false,
		},
		{
			key: 'snx-rewards',
			title: t('dashboard.rewards.snx-rewards.title'),
			copy: t('dashboard.rewards.snx-rewards.copy'),
			button: t('dashboard.rewards.claim'),
			kwentaIcon: false,
			linkIcon: false,
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
								100
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
									19
									<SpacedHelpIcon />
								</FlexDivRow>
							</FlexDivCol>
							<FlexDivCol>
								<Body size="medium" style={{ marginBottom: '5px' }}>
									{t('dashboard.rewards.apr')}
								</Body>
								<div className="value">{formatPercent(apy, { minDecimals: 2 })}</div>
							</FlexDivCol>
						</div>
						<Button fullWidth variant="flat" size="small" disabled={false} onClick={() => {}}>
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
		color: ${(props) => props.theme.colors.selectedTheme.text.label};
		font-size: 13px;
	}

	.title {
		font-weight: 400;
	}
`;

export default RewardsTabs;
