import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';
import TabButton from 'components/Button/TabButton';
import { FlexDivCol, FlexDivRowCentered } from 'components/layout/flex';
import { Heading, LogoText } from 'components/Text';
import { EXTERNAL_LINKS } from 'constants/links';
import { StakingCard } from 'sections/dashboard/Stake/card';
import { useAppSelector } from 'state/hooks';
import { selectAPY, selectClaimableBalance } from 'state/staking/selectors';
import media from 'styles/media';
import { formatPercent, truncateNumbers } from 'utils/formatters/number';

const RewardsTabs: FC = () => {
	const { t } = useTranslation();
	const claimableBalance = useAppSelector(selectClaimableBalance);
	const apy = useAppSelector(selectAPY);
	const REWARDS = [
		{
			key: 'trading-rewards',
			title: t('dashboard.rewards.trading-rewards.title'),
			copy: t('dashboard.rewards.trading-rewards.copy'),
			button: t('dashboard.rewards.staking'),
		},
		{
			key: 'kwenta-rewards',
			title: t('dashboard.rewards.kwenta-rewards.title'),
			copy: t('dashboard.rewards.kwenta-rewards.copy'),
			button: t('dashboard.rewards.claim'),
		},
		{
			key: 'snx-rewards',
			title: t('dashboard.rewards.snx-rewards.title'),
			copy: t('dashboard.rewards.snx-rewards.copy'),
			button: t('dashboard.rewards.claim'),
		},
	];

	return (
		<RewardsTabContainer>
			<FlexDivRowCentered style={{ marginBottom: '22.5px' }}>
				<StyledFlexDivCol>
					<Heading variant="h4">{t('dashboard.rewards.title')}</Heading>
					<div className="value">{t('dashboard.rewards.copy')}</div>
				</StyledFlexDivCol>
				<StyledTabButton
					isRounded
					title={t('dashboard.rewards.claim-all')}
					active
					onClick={() => window.open(EXTERNAL_LINKS.Docs.Staking, '_blank')}
				/>
			</FlexDivRowCentered>
			<CardsContainer>
				{REWARDS.map((reward) => (
					<CardGrid key={reward.key}>
						<div>
							<Heading variant="h4">{reward.title}</Heading>
							<div className="value">{reward.copy}</div>
						</div>
						<div>
							<Heading variant="h6">{t('dashboard.rewards.claimable')}</Heading>
							<LogoText yellow>{truncateNumbers(claimableBalance, 4)}</LogoText>
						</div>
						<div style={{ display: 'flex', justifyContent: 'flex-start', columnGap: '25px' }}>
							<FlexDivCol>
								<div className="title" style={{ marginBottom: '5px' }}>
									{t('dashboard.rewards.epoch')}
								</div>
								<div className="value">19</div>
							</FlexDivCol>
							<FlexDivCol>
								<div className="title" style={{ marginBottom: '5px' }}>
									{t('dashboard.rewards.apr')}
								</div>
								<div className="value">{formatPercent(apy, { minDecimals: 2 })}</div>
							</FlexDivCol>
						</div>
						<Button fullWidth variant="flat" size="small" disabled={false} onClick={() => {}}>
							{reward.button}
						</Button>
					</CardGrid>
				))}
			</CardsContainer>
		</RewardsTabContainer>
	);
};

const StyledTabButton = styled(TabButton)`
	margin-bottom: 9px;
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
`;
export default RewardsTabs;
