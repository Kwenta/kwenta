import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import KwentaLogo from 'assets/svg/earn/KWENTA.svg';
import Button from 'components/Button';
import media from 'styles/media';

import { StakingCard } from './common';
import StakingInputCard from './StakingInputCard';

const StakingTab = () => {
	const { t } = useTranslation();

	return (
		<StakingTabContainer>
			<CardGridContainer>
				<CardGrid>
					<div>
						<div className="title">{t('dashboard.stake.tabs.staking.claimable-rewards')}</div>
						<div className="value">
							150
							<StyledKwentaLogo />
						</div>
					</div>
					<div>
						<div className="title">{t('dashboard.stake.tabs.staking.escrowed-rewards')}</div>
						<div className="value">
							100
							<StyledKwentaLogo />
						</div>
					</div>
					<div>
						<div className="title">{t('dashboard.stake.tabs.staking.liquid-rewards')}</div>
						<div className="value">
							50
							<StyledKwentaLogo />
						</div>
					</div>
					<div>
						<div className="title">{t('dashboard.stake.tabs.staking.annual-percentage-yield')}</div>
						<div className="value">68.23%</div>
					</div>
				</CardGrid>
				<Button fullWidth variant="flat" size="sm">
					{t('dashboard.stake.tabs.staking.claim')}
				</Button>
			</CardGridContainer>
			<StakingInputCard inputLabel={t('dashboard.stake.tabs.stake-table.kwenta-token')} />
		</StakingTabContainer>
	);
};

const StakingTabContainer = styled.div`
	${media.greaterThan('mdUp')`
		display: grid;
		grid-template-columns: 1fr 1fr;
		& > div {
			flex: 1;

			&:first-child {
				margin-right: 15px;
			}
		}
	`}

	${media.lessThan('mdUp')`
		& > div:first-child {
			margin-bottom: 15px;
		}
	`}
`;

const StyledKwentaLogo = styled(KwentaLogo)`
	margin-left: 8px;
`;

const CardGridContainer = styled(StakingCard)`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
`;

const CardGrid = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;

	& > div {
		margin-bottom: 20px;
	}

	.value {
		margin-top: 5px;
	}
`;

export default StakingTab;
