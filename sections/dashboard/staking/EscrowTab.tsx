import styled from 'styled-components';

import Button from 'components/Button';
import SegmentedControl from 'components/SegmentedControl';
import media from 'styles/media';

import { StakingCard } from './common';
import EscrowTable from './EscrowTable';

const EscrowTab = () => {
	return (
		<EscrowTabContainer>
			<StakingCard $noPadding>
				<EscrowTable />
			</StakingCard>
			<StakingCard>
				<SegmentedControl values={['Stake', 'Unstake']} onChange={() => {}} selectedIndex={0} />
				<Button variant="flat" size="sm" fullWidth>
					Stake
				</Button>
			</StakingCard>
		</EscrowTabContainer>
	);
};

const EscrowTabContainer = styled.div`
	${media.greaterThan('mdUp')`
		display: flex;

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

export default EscrowTab;
