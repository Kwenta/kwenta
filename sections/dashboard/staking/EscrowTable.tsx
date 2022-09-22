import { useMemo } from 'react';
import styled from 'styled-components';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import Table from 'components/Table';
import { TableCellHead } from 'components/Table/Table';

import { StakingCard } from './common';

const EscrowTable = () => {
	const data = useMemo(() => [], []);

	return (
		<EscrowTableContainer $noPadding>
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
							width: 65,
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
							width: 80,
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
							Header: () => <TableHeader>Early Vest Fee</TableHeader>,
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
			<EscrowStats>
				<div>
					<div>
						<div className="stat-title">Total</div>
						<div className="stat-value">10 KWENTA</div>
					</div>
					<div>
						<div className="stat-title">Fee</div>
						<div className="stat-value">10 KWENTA</div>
					</div>
					<VestButton>Vest</VestButton>
				</div>
			</EscrowStats>
		</EscrowTableContainer>
	);
};

const EscrowTableContainer = styled(StakingCard)`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
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

const TableHeader = styled.div`
	font-size: 10px;
`;

const EscrowStats = styled.div`
	display: flex;
	justify-content: flex-end;
	margin-top: 22px;
	padding: 18px;
	border-top: ${(props) => props.theme.colors.selectedTheme.border};

	.stat-title {
		font-size: 10px;
		color: ${(props) => props.theme.colors.selectedTheme.text.title};
	}

	.stat-value {
		font-size: 11px;
		font-family: ${(props) => props.theme.fonts.mono};
		color: ${(props) => props.theme.colors.selectedTheme.text.value};
		margin-top: 4px;
	}

	& > div {
		display: flex;
		align-items: center;

		& > *:not(:last-child) {
			margin-right: 15px;
		}
	}
`;

const VestButton = styled.button`
	border: 1px solid ${(props) => props.theme.colors.selectedTheme.yellow};
	height: 24px;
	box-sizing: border-box;
	border-radius: 14px;
	cursor: pointer;
	background-color: transparent;
	color: ${(props) => props.theme.colors.selectedTheme.yellow};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 12px;
	padding-left: 12px;
	padding-right: 12px;
	text-transform: uppercase;
`;

export default EscrowTable;
