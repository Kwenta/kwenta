import { useMemo } from 'react';
import styled from 'styled-components';

import Button from 'components/Button';
import SegmentedControl from 'components/SegmentedControl';
import Table from 'components/Table';
import { TableCellHead } from 'components/Table/Table';
import media from 'styles/media';

import { StakingCard } from './common';

const EscrowTab = () => {
	const data = useMemo(() => [{}], []);

	return (
		<EscrowTabContainer>
			<StakingCard $noPadding>
				<StyledTable
					data={data}
					columns={[
						{
							Header: () => (
								<div>
									<input type="checkbox" />
								</div>
							),
							Cell: () => (
								<div>
									<input type="checkbox" />
								</div>
							),
							accessor: 'selected',
							width: 40,
						},
						{
							Header: () => <TableHeader>Date/Time</TableHeader>,
							Cell: () => <div />,
							accessor: 'date',
							width: 70,
						},
						{
							Header: () => (
								<TableHeader>
									<div>Time Until</div>
									<div>Vestable</div>
								</TableHeader>
							),
							Cell: () => <div />,
							accessor: 'timeUntilVestable',
							width: 90,
						},
						{
							Header: () => (
								<TableHeader>
									<div>Immediately</div>
									<div>Vestable</div>
								</TableHeader>
							),
							Cell: () => <div />,
							accessor: 'immediatelyVestable',
							width: 90,
						},
						{
							Header: () => <TableHeader>Amount</TableHeader>,
							Cell: () => <div />,
							accessor: 'amount',
							width: 80,
						},
						{
							Header: () => (
								<TableHeader>
									<div>Early</div>
									<div>Vest Fee</div>
								</TableHeader>
							),
							Cell: () => <div />,
							accessor: 'earlyVestFee',
							width: 80,
						},
						{
							Header: () => <TableHeader>Status</TableHeader>,
							Cell: () => <div />,
							accessor: 'status',
							width: 50,
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

const StyledTable = styled(Table)`
	width: 100%;
	border: none;
	border-bottom-left-radius: 0;
	border-bottom-right-radius: 0;

	${TableCellHead} {
		&:first-child {
			padding-left: 14px;
		}
	}
`;

export const TableHeader = styled.div`
	font-size: 10px;
`;

export default EscrowTab;
