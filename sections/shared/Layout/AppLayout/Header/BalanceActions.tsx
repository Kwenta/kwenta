import { FC, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import LinkArrowIcon from 'assets/svg/app/link-arrow.svg';
import HelpIcon from 'assets/svg/app/question-mark.svg';
import KwentaLogo from 'assets/svg/earn/KWENTA.svg';
import OptimismLogo from 'assets/svg/providers/optimism.svg';
import Button from 'components/Button';
import { FlexDivCol, FlexDivRow } from 'components/layout/flex';
import Pill from 'components/Pill';
import Spacer from 'components/Spacer/Spacer';
import { Body, Heading, LogoText } from 'components/Text';
import { StakingCard } from 'sections/dashboard/Stake/card';
import { useAppSelector } from 'state/hooks';
import { selectAPY } from 'state/staking/selectors';
import media from 'styles/media';
import { formatPercent } from 'utils/formatters/number';

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
	const [open, setOpen] = useState(false);
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

	const apy = useAppSelector(selectAPY);

	return (
		<>
			<Button
				size="small"
				mono
				onClick={() => setOpen(!open)}
				style={{ color: '#ffb800', borderColor: '#ffb800' }}
			>
				<KwentaLogo style={{ marginRight: '5px' }} />
				<OptimismLogo height={18} width={18} style={{ marginRight: '5px' }} />
				$3,837.82
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
											100
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
											19
											<SpacedHelpIcon />
										</FlexDivRow>
									</StyledFlexDivCol>
									<StyledFlexDivCol>
										<Body size="medium" style={{ marginBottom: '5px' }}>
											{t('dashboard.rewards.apr')}
										</Body>
										<div className="value">{formatPercent(apy, { minDecimals: 2 })}</div>
									</StyledFlexDivCol>
									<Button
										fullWidth
										variant="flat"
										size="small"
										disabled={false}
										onClick={() => {}}
										style={{ marginLeft: '50px' }}
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
