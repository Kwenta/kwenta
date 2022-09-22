import { useMemo } from 'react';
import styled from 'styled-components';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import Table from 'components/Table';
import { TableCellHead } from 'components/Table/Table';

import { StakingCard } from './common';

const EscrowTable = () => {
	const data = useMemo(() => [], []);

	return (
		<StakingCard $noPadding>
			<DesktopOnlyView>
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
			</DesktopOnlyView>
			<MobileOrTabletView>
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
			</MobileOrTabletView>
		</StakingCard>
	);
};

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

const TableHeader = styled.div`
	font-size: 10px;
`;

export default EscrowTable;
