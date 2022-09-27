import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import Button from 'components/Button';
import SegmentedControl from 'components/SegmentedControl';
import { currentThemeState } from 'store/ui';

import { StakingCard } from './common';
import StakeInput from './StakeInput';

type StakingInputCardProps = {
	inputLabel: string;
};

const StakingInputCard: FC<StakingInputCardProps> = ({ inputLabel }) => {
	const { t } = useTranslation();

	const currentTheme = useRecoilValue(currentThemeState);
	const isDarkTheme = useMemo(() => currentTheme === 'dark', [currentTheme]);

	const [activeTab, setActiveTab] = useState(0);

	const handleTabChange = (tabIndex: number) => {
		setActiveTab(tabIndex);
	};

	return (
		<StakingInputCardContainer $darkTheme={isDarkTheme}>
			<SegmentedControl
				values={[
					t('dashboard.stake.tabs.stake-table.stake'),
					t('dashboard.stake.tabs.stake-table.unstake'),
				]}
				onChange={handleTabChange}
				selectedIndex={activeTab}
			/>
			<StakeInput label={inputLabel} />
			<Button fullWidth variant="flat" size="sm">
				{activeTab === 0
					? t('dashboard.stake.tabs.stake-table.stake')
					: t('dashboard.stake.tabs.stake-table.unstake')}
			</Button>
		</StakingInputCardContainer>
	);
};

const StakingInputCardContainer = styled(StakingCard)<{ $darkTheme: boolean }>`
	min-height: 250px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
`;

export default StakingInputCard;
