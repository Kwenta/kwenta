import { wei } from '@synthetixio/wei';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { erc20ABI, useContractRead } from 'wagmi';

import Button from 'components/Button';
import SegmentedControl from 'components/SegmentedControl';
import Connector from 'containers/Connector';
import { currentThemeState } from 'store/ui';
import { zeroBN } from 'utils/formatters/number';

import { StakingCard } from './common';
import StakeInput from './StakeInput';

type StakingInputCardProps = {
	inputLabel: string;
	tableType: 'stake' | 'redeem';
};

const kwentaTokenContract = {
	addressOrName: '0xDA0C33402Fc1e10d18c532F0Ed9c1A6c5C9e386C',
	contractInterface: erc20ABI,
};

const StakingInputCard: FC<StakingInputCardProps> = ({ inputLabel, tableType }) => {
	const { t } = useTranslation();
	const { walletAddress } = Connector.useContainer();

	const { data: balance } = useContractRead({
		...kwentaTokenContract,
		functionName: 'balanceOf',
		args: [walletAddress ?? undefined],
		cacheOnBlock: true,
		enabled: !!walletAddress,
	});

	const currentTheme = useRecoilValue(currentThemeState);
	const isDarkTheme = useMemo(() => currentTheme === 'dark', [currentTheme]);

	const [activeTab, setActiveTab] = useState(0);

	const handleTabChange = (tabIndex: number) => {
		setActiveTab(tabIndex);
	};

	return (
		<StakingInputCardContainer $darkTheme={isDarkTheme}>
			{tableType === 'stake' && (
				<SegmentedControl
					values={[
						t('dashboard.stake.tabs.stake-table.stake'),
						t('dashboard.stake.tabs.stake-table.unstake'),
					]}
					onChange={handleTabChange}
					selectedIndex={activeTab}
				/>
			)}
			<StakeInput label={inputLabel} balance={Number(wei(balance ?? zeroBN)).toFixed(4) ?? '0'} />
			{tableType === 'stake' ? (
				<Button fullWidth variant="flat" size="sm">
					{activeTab === 0
						? t('dashboard.stake.tabs.stake-table.stake')
						: t('dashboard.stake.tabs.stake-table.unstake')}
				</Button>
			) : (
				<Button fullWidth variant="flat" size="sm">
					{t('dashboard.stake.tabs.stake-table.redeem')}
				</Button>
			)}
		</StakingInputCardContainer>
	);
};

const StakingInputCardContainer = styled(StakingCard)<{ $darkTheme: boolean }>`
	min-height: 200px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
`;

export default StakingInputCard;
