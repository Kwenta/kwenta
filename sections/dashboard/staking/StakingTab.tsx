import styled from 'styled-components';

import Button from 'components/Button';
import SegmentedControl from 'components/SegmentedControl';
import media from 'styles/media';

import { StakingCard } from './common';

const StakingTab = () => {
	return (
		<StakingTabContainer>
			<StakingCard>
				<LeftCardGrid>
					<div>
						<div className="title">Claimable Rewards</div>
						<div className="value">150</div>
					</div>
					<div>
						<div className="title">Escrowed Rewards</div>
						<div className="value">100</div>
					</div>
					<div>
						<div className="title">Liquid Rewards</div>
						<div className="value">50</div>
					</div>
					<div>
						<div className="title">Annual Percentage Yield</div>
						<div className="value">68.23%</div>
					</div>
				</LeftCardGrid>
				<Button fullWidth variant="flat" size="sm">
					Claim
				</Button>
			</StakingCard>
			<StakingCard>
				<SegmentedControl values={['Stake', 'Unstake']} onChange={() => {}} selectedIndex={0} />
				<Button fullWidth variant="flat" size="sm">
					Stake
				</Button>
			</StakingCard>
		</StakingTabContainer>
	);
};

const StakingTabContainer = styled.div`
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

const LeftCardGrid = styled.div`
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
