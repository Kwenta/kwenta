import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { useContractRead } from 'wagmi';

import Button from 'components/Button';
import Connector from 'containers/Connector';
import stakingRewardsABI from 'lib/abis/StakingRewards.json';
import { currentThemeState } from 'store/ui';
import media from 'styles/media';

import { KwentaLabel, StakingCard } from './common';
import StakingInputCard from './StakingInputCard';
import { wei } from '@synthetixio/wei';
import { zeroBN } from 'utils/formatters/number';

const STAKING_REWARDS = '0x1653a3a3c4ccee0538685f1600a30df5e3ee830a';

const StakingTab = () => {
	const { t } = useTranslation();
	const { walletAddress } = Connector.useContainer();

	const { data: claimableBalance } = useContractRead({
		addressOrName: STAKING_REWARDS,
		contractInterface: stakingRewardsABI,
		functionName: 'earned',
		args: [walletAddress ?? undefined],
		cacheOnBlock: true,
		onSettled(data, error) {
			// eslint-disable-next-line no-console
			console.log('claimableBalance Settled', { data, error });
		},
	});

	const currentTheme = useRecoilValue(currentThemeState);
	const isDarkTheme = useMemo(() => currentTheme === 'dark', [currentTheme]);

	return (
		<StakingTabContainer>
			<CardGridContainer $darkTheme={isDarkTheme}>
				<CardGrid>
					<div>
						<div className="title">{t('dashboard.stake.tabs.staking.claimable-rewards')}</div>
						<KwentaLabel>{Number(wei(claimableBalance ?? zeroBN)).toFixed(2)}</KwentaLabel>
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

const CardGridContainer = styled(StakingCard)<{ $darkTheme: boolean }>`
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
`;

export default StakingTab;
