import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';
import { getApy } from 'queries/staking/utils';
import { BigText } from 'sections/earn/common';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { getReward } from 'state/staking/actions';
import { selectClaimableBalance } from 'state/staking/selectors';
import media from 'styles/media';
import { formatPercent, truncateNumbers } from 'utils/formatters/number';

import { StakingCard } from './common';
import StakeInputCard from './InputCards/StakeInputCard';

const StakingTab = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const claimableBalance = useAppSelector(selectClaimableBalance);
	const { totalStakedBalance, weekCounter } = useAppSelector(({ staking }) => ({
		totalStakedBalance: Number(staking.totalStakedBalance),
		weekCounter: staking.weekCounter,
	}));

	const apy = useMemo(() => getApy(totalStakedBalance, weekCounter), [
		totalStakedBalance,
		weekCounter,
	]);

	const handleGetReward = useCallback(() => {
		dispatch(getReward());
	}, [dispatch]);

	return (
		<StakingTabContainer>
			<CardGridContainer>
				<CardGrid>
					<div>
						<div className="title">{t('dashboard.stake.tabs.staking.claimable-rewards')}</div>
						<BigText hasKwentaLogo>{truncateNumbers(claimableBalance, 4)}</BigText>
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
		</StakingTabContainer>
	);
};

const StakingTabContainer = styled.div`
	${media.greaterThan('mdUp')`
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-gap: 15px;
	`}

	${media.lessThan('mdUp')`
		& > div:first-child {
			margin-bottom: 15px;
		}
	`}
`;

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
