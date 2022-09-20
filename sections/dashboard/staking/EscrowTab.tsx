import { useMemo } from 'react';
import styled from 'styled-components';

import Button from 'components/Button';
import SegmentedControl from 'components/SegmentedControl';
import Table from 'components/Table';

import { StakingCard } from './common';

const EscrowTab = () => {
	const data = useMemo(() => [{}], []);

	return (
		<EscrowTabContainer>
			<StakingCard $noPadding>
				<Table
					data={data}
					columns={[
						{
							Header: () => <input type="checkbox" style={{ marginLeft: -4 }} />,
							Cell: () => <input type="checkbox" />,
							accessor: 'selected',
							width: 30,
						},
						{
							Header: () => <div>Date/Time</div>,
							Cell: () => <div />,
							accessor: 'date',
							width: 150,
						},
						{
							Header: () => (
								<div>
									<div>Time Until</div>
									<div>Vestable</div>
								</div>
							),
							Cell: () => <div />,
							accessor: 'timeUntilVestable',
							width: 120,
						},
						{
							Header: () => (
								<div>
									<div>Immediately</div>
									<div>Vestable</div>
								</div>
							),
							Cell: () => <div />,
							accessor: 'immediatelyVestable',
							width: 120,
						},
						{
							Header: () => <div>Amount</div>,
							Cell: () => <div />,
							accessor: 'amount',
							width: 200,
						},
						{
							Header: () => <div>Early Vest Fee</div>,
							Cell: () => <div />,
							accessor: 'earlyVestFee',
							width: 120,
						},
						{
							Header: () => <div>Status</div>,
							Cell: () => <div />,
							accessor: 'status',
							width: 150,
						},
					]}
				/>
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
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-gap: 15px;
`;

export default EscrowTab;
