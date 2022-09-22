import { useState } from 'react';

import Button from 'components/Button';
import SegmentedControl from 'components/SegmentedControl';

import { StakingCard } from './common';
import StakeInput from './StakeInput';

const EscrowStake = () => {
	const [activeTab, setActiveTab] = useState(0);

	const handleSwitchTab = (tabIndex: number) => {
		setActiveTab(tabIndex);
	};

	return (
		<StakingCard
			style={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				minHeight: 250,
			}}
		>
			<SegmentedControl
				values={['Stake', 'Unstake']}
				onChange={handleSwitchTab}
				selectedIndex={activeTab}
			/>
			<StakeInput />
			<Button variant="flat" size="sm" fullWidth>
				Stake
			</Button>
		</StakingCard>
	);
};

export default EscrowStake;
