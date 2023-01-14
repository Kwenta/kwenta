import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';
import { SplitContainer } from 'components/layout/grid';
import { StakingCard } from 'components/staking/card';
import { LogoText } from 'components/Text';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { getReward } from 'state/staking/actions';
import { selectAPY, selectClaimableBalance } from 'state/staking/selectors';
import { formatPercent, truncateNumbers } from 'utils/formatters/number';

import StakeInputCard from './InputCards/StakeInputCard';

const StakingTab = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const claimableBalance = useAppSelector(selectClaimableBalance);
	const apy = useAppSelector(selectAPY);

	const handleGetReward = useCallback(() => {
		dispatch(getReward());
	}, [dispatch]);

	return (
		<SplitContainer>
			<CardGridContainer>
				<CardGrid>
					<div>
						<div className="title">{t('dashboard.stake.tabs.staking.claimable-rewards')}</div>
						<LogoText yellow>{truncateNumbers(claimableBalance, 4)}</LogoText>
					</div>
					<div>
						<div className="title">{t('dashboard.stake.tabs.staking.annual-percentage-yield')}</div>
						<div className="value">{formatPercent(apy, { minDecimals: 2 })}</div>
					</div>
				</CardGrid>
				<Button
					fullWidth
					variant="flat"
					size="sm"
					disabled={!getReward || claimableBalance.eq(0)}
					onClick={handleGetReward}
				>
					{t('dashboard.stake.tabs.staking.claim')}
				</Button>
			</CardGridContainer>
			<StakeInputCard />
		</SplitContainer>
	);
};

const CardGridContainer = styled(StakingCard)`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
`;

const CardGrid = styled.div`
	display: grid;
	grid-template-rows: 1fr 1fr;

	& > div {
		margin-bottom: 20px;
	}

	.value {
		margin-top: 5px;
	}

	.title {
		color: ${(props) => props.theme.colors.selectedTheme.title};
	}
`;

export default StakingTab;
