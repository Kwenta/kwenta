import { FC, useState } from 'react';
import styled from 'styled-components';

import Button from 'components/Button';
import SegmentedControl from 'components/SegmentedControl';

import { StakingCard } from './common';
import StakeInput from './StakeInput';

type StakingInputCardProps = {
	inputLabel: string;
};

const StakingInputCard: FC<StakingInputCardProps> = ({ inputLabel }) => {
	const [activeTab, setActiveTab] = useState(0);

	const handleTabChange = (tabIndex: number) => {
		setActiveTab(tabIndex);
	};

	return (
		<StakingInputCardContainer>
			<SegmentedControl
				values={['Stake', 'Unstake']}
				onChange={handleTabChange}
				selectedIndex={activeTab}
			/>
			<StakeInput label={inputLabel} />
			<Button fullWidth variant="flat" size="sm">
				{activeTab === 0 ? 'Stake' : 'Unstake'}
			</Button>
		</StakingInputCardContainer>
	);
};

const StakingInputCardContainer = styled(StakingCard)`
	min-height: 250px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
`;

export default StakingInputCard;
