import { wei } from '@synthetixio/wei';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import TabButton from 'components/Button/TabButton';
import Text from 'components/Text';
import { EXTERNAL_LINKS } from 'constants/links';
import { useAppSelector } from 'state/hooks';
import {
	selectClaimableBalance,
	selectEscrowedKwentaBalance,
	selectKwentaBalance,
	selectStakedEscrowedKwentaBalance,
	selectStakedKwentaBalance,
} from 'state/staking/selectors';
import { FlexDivRowCentered } from 'styles/common';
import media from 'styles/media';
import { truncateNumbers } from 'utils/formatters/number';

import { SplitStakingCard } from './common';

const StakingPortfolio = () => {
	const { t } = useTranslation();
	const kwentaBalance = useAppSelector(selectKwentaBalance);
	const escrowedKwentaBalance = useAppSelector(selectEscrowedKwentaBalance);
	const stakedEscrowedKwentaBalance = useAppSelector(selectStakedEscrowedKwentaBalance);
	const stakedKwentaBalance = useAppSelector(selectStakedKwentaBalance);
	const claimableBalance = useAppSelector(selectClaimableBalance);
	const totalVestable = useAppSelector(({ staking }) => staking.totalVestable);

	const DEFAULT_CARDS = [
		[
			{
				key: 'Liquid',
				title: t('dashboard.stake.portfolio.liquid'),
				value: truncateNumbers(kwentaBalance, 2),
			},
			{
				key: 'Escrow',
				title: t('dashboard.stake.portfolio.escrow'),
				value: truncateNumbers(escrowedKwentaBalance.sub(stakedEscrowedKwentaBalance), 2),
			},
		],
		[
			{
				key: 'Staked',
				title: t('dashboard.stake.portfolio.staked'),
				value: truncateNumbers(stakedKwentaBalance, 2),
			},
			{
				key: 'StakedEscrow',
				title: t('dashboard.stake.portfolio.staked-escrow'),
				value: truncateNumbers(stakedEscrowedKwentaBalance, 2),
			},
		],
		[
			{
				key: 'Claimable',
				title: t('dashboard.stake.portfolio.claimable'),
				value: truncateNumbers(claimableBalance, 2),
			},
			{
				key: 'Vestable',
				title: t('dashboard.stake.portfolio.vestable'),
				value: truncateNumbers(wei(totalVestable), 2),
			},
		],
	];

	return (
		<StakingPortfolioContainer>
			<FlexDivRowCentered>
				<Header variant="h4">{t('dashboard.stake.portfolio.title')}</Header>
				<StyledTabButton
					isRounded
					title={'Staking Docs'}
					active={true}
					onClick={() => window.open(EXTERNAL_LINKS.Docs.Staking, '_blank')}
				/>
			</FlexDivRowCentered>
			<CardsContainer>
				{DEFAULT_CARDS.map((card, i) => (
					<SplitStakingCard key={i}>
						{card.map(({ key, title, value }) => (
							<div key={key}>
								<div className="title">{title}</div>
								<div className="value">{value}</div>
							</div>
						))}
					</SplitStakingCard>
				))}
			</CardsContainer>
		</StakingPortfolioContainer>
	);
};

const StyledTabButton = styled(TabButton)`
	p {
		font-size: 12px;
	}
	margin-bottom: 9px;
`;
const StakingPortfolioContainer = styled.div`
	${media.lessThan('mdUp')`
		padding: 15px;
	`}

	${media.greaterThan('mdUp')`
		margin-bottom: 100px;
	`}
`;

const Header = styled(Text.Heading)`
	color: ${(props) => props.theme.colors.selectedTheme.text.value};
	margin-bottom: 15px;
	font-variant: all-small-caps;
`;

const CardsContainer = styled.div`
	width: 100%;
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(334px, 1fr));
	grid-gap: 15px;
`;

export default StakingPortfolio;
