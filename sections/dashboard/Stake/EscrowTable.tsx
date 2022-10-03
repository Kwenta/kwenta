import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import Table from 'components/Table';
import { TableCellHead } from 'components/Table/Table';
import { currentThemeState } from 'store/ui';

import { StakingCard } from './common';

type EscrowRow = {
	date: string;
	time: string;
	vestable: number;
	amount: number;
	fee: number;
	status: 'VESTED' | 'VESTING';
	selected: boolean;
};

const data: EscrowRow[] = [
	{
		date: '02/02/22',
		time: '2D:1H:32M',
		vestable: 0.2,
		amount: 10,
		fee: 0.2,
		status: 'VESTED',
		selected: false,
	},
	{
		date: '02/02/22',
		time: '2D:1H:32M',
		vestable: 0.2,
		amount: 10,
		fee: 0.2,
		status: 'VESTING',
		selected: false,
	},
	{
		date: '02/02/22',
		time: '2D:1H:32M',
		vestable: 0.2,
		amount: 10,
		fee: 0.2,
		status: 'VESTING',
		selected: false,
	},
	{
		date: '02/02/22',
		time: '2D:1H:32M',
		vestable: 0.2,
		amount: 10,
		fee: 0.2,
		status: 'VESTING',
		selected: false,
	},
];

const EscrowTable = () => {
	const { t } = useTranslation();
	const [, setCheckedState] = useState(data.map((d) => d.selected));
	const handleOnChange = (position: number) => {
		data[position].selected = !data[position].selected;
		setCheckedState(data.map((d) => d.selected));
	};

	const selectAll = () => {
		data.forEach((d) => (d.selected = !d.selected));
		setCheckedState(data.map((d) => d.selected));
	};

	const totalAmount = data
		.filter((d) => d.selected)
		.reduce((acc, current) => acc + current.amount, 0);

	const totalFee = data.filter((d) => d.selected).reduce((acc, current) => acc + current.fee, 0);

	const currentTheme = useRecoilValue(currentThemeState);
	const isDarkTheme = useMemo(() => currentTheme === 'dark', [currentTheme]);

	return (
		<EscrowTableContainer $noPadding $darkTheme={isDarkTheme}>
			<DesktopOnlyView>
				<StyledTable
					data={data}
					columns={[
						{
							Header: () => <input type="checkbox" onChange={() => selectAll()} />,
							Cell: (cellProps: CellProps<EscrowRow>) => (
								<input
									key={cellProps.row.index}
									type="checkbox"
									checked={data[cellProps.row.index].selected}
									onChange={() => handleOnChange(cellProps.row.index)}
								/>
							),
							accessor: 'selected',
							width: 40,
						},
						{
							Header: () => (
								<TableHeader $darkTheme={isDarkTheme}>
									{t('dashboard.stake.tabs.escrow.date-time')}
								</TableHeader>
							),
							Cell: (cellProps: CellProps<EscrowRow>) => (
								<TableCell $darkTheme={isDarkTheme}>{cellProps.row.original.date}</TableCell>
							),
							accessor: 'date',
							width: 65,
						},
						{
							Header: () => (
								<TableHeader $darkTheme={isDarkTheme}>
									<div>{t('dashboard.stake.tabs.escrow.time-until-vestable')}</div>
								</TableHeader>
							),
							Cell: (cellProps: CellProps<EscrowRow>) => (
								<TableCell $darkTheme={isDarkTheme}>{cellProps.row.original.time}</TableCell>
							),
							accessor: 'timeUntilVestable',
							width: 80,
						},
						{
							Header: () => (
								<TableHeader $darkTheme={isDarkTheme}>
									<div>{t('dashboard.stake.tabs.escrow.immediately-vestable')}</div>
								</TableHeader>
							),
							Cell: (cellProps: CellProps<EscrowRow>) => (
								<TableCell $darkTheme={isDarkTheme}>
									{cellProps.row.original.vestable}{' '}
									{t('dashboard.stake.tabs.stake-table.kwenta-token')}
								</TableCell>
							),
							accessor: 'immediatelyVestable',
							width: 80,
						},
						{
							Header: () => (
								<TableHeader $darkTheme={isDarkTheme}>
									{t('dashboard.stake.tabs.escrow.amount')}
								</TableHeader>
							),
							Cell: (cellProps: CellProps<EscrowRow>) => (
								<TableCell $darkTheme={isDarkTheme}>
									{cellProps.row.original.amount}{' '}
									{t('dashboard.stake.tabs.stake-table.kwenta-token')}
								</TableCell>
							),
							accessor: 'amount',
							width: 80,
						},
						{
							Header: () => (
								<TableHeader $darkTheme={isDarkTheme}>
									<div>{t('dashboard.stake.tabs.escrow.early-vest-fee')}</div>
								</TableHeader>
							),
							Cell: (cellProps: CellProps<EscrowRow>) => (
								<TableCell $darkTheme={isDarkTheme}>
									{cellProps.row.original.fee} {t('dashboard.stake.tabs.stake-table.kwenta-token')}
								</TableCell>
							),
							accessor: 'earlyVestFee',
							width: 80,
						},
						{
							Header: () => (
								<TableHeader $darkTheme={isDarkTheme}>
									{t('dashboard.stake.tabs.escrow.status')}
								</TableHeader>
							),
							Cell: (cellProps: CellProps<EscrowRow>) => (
								<TableCell $darkTheme={isDarkTheme}>{cellProps.row.original.status}</TableCell>
							),
							accessor: 'status',
							width: 70,
						},
					]}
				/>
			</DesktopOnlyView>
			<MobileOrTabletView>
				<StyledTable
					data={data}
					columns={[
						{
							Header: () => <input type="checkbox" onChange={() => selectAll()} />,
							Cell: (cellProps: CellProps<EscrowRow>) => (
								<input
									key={cellProps.row.index}
									type="checkbox"
									checked={data[cellProps.row.index].selected}
									onChange={() => handleOnChange(cellProps.row.index)}
								/>
							),
							accessor: 'selected',
							width: 40,
						},
						{
							Header: () => (
								<TableHeader $darkTheme={isDarkTheme}>
									{t('dashboard.stake.tabs.escrow.amount')}
								</TableHeader>
							),
							Cell: (cellProps: CellProps<EscrowRow>) => (
								<TableCell $darkTheme={isDarkTheme}>
									{cellProps.row.original.amount}{' '}
									{t('dashboard.stake.tabs.stake-table.kwenta-token')}
								</TableCell>
							),
							accessor: 'amount',
							width: 80,
						},
						{
							Header: () => (
								<TableHeader $darkTheme={isDarkTheme}>
									{t('dashboard.stake.tabs.escrow.early-vest-fee')}
								</TableHeader>
							),
							Cell: (cellProps: CellProps<EscrowRow>) => (
								<TableCell $darkTheme={isDarkTheme}>
									{cellProps.row.original.fee} {t('dashboard.stake.tabs.stake-table.kwenta-token')}
								</TableCell>
							),
							accessor: 'earlyVestFee',
							width: 80,
						},
						{
							Header: () => (
								<TableHeader $darkTheme={isDarkTheme}>
									{t('dashboard.stake.tabs.escrow.status')}
								</TableHeader>
							),
							Cell: (cellProps: CellProps<EscrowRow>) => (
								<TableCell $darkTheme={isDarkTheme}>{cellProps.row.original.status}</TableCell>
							),
							accessor: 'status',
							width: 70,
						},
					]}
				/>
			</MobileOrTabletView>
			<EscrowStats $darkTheme={isDarkTheme}>
				<div>
					<div>
						<div className="stat-title">{t('dashboard.stake.tabs.escrow.total')}</div>
						<div className="stat-value">
							{totalAmount.toFixed(2)} {t('dashboard.stake.tabs.stake-table.kwenta-token')}
						</div>
					</div>
					<div>
						<div className="stat-title">{t('dashboard.stake.tabs.escrow.fee')}</div>
						<div className="stat-value">
							{totalFee.toFixed(2)} {t('dashboard.stake.tabs.stake-table.kwenta-token')}
						</div>
					</div>
					<VestButton $darkTheme={isDarkTheme}>{t('dashboard.stake.tabs.escrow.vest')}</VestButton>
				</div>
			</EscrowStats>
		</EscrowTableContainer>
	);
};

const EscrowTableContainer = styled(StakingCard)<{ $darkTheme: boolean }>`
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

const TableHeader = styled.div<{ $darkTheme: boolean }>`
	font-size: 10px;
	color: ${(props) => (props.$darkTheme ? props.theme.colors.selectedTheme.text.title : '#6A3300')};
`;

const TableCell = styled.div<{ $darkTheme: boolean }>`
	font-size: 11px;
	color: ${(props) => (props.$darkTheme ? props.theme.colors.selectedTheme.white : '#171002')};
`;

const EscrowStats = styled.div<{ $darkTheme: boolean }>`
	display: flex;
	justify-content: flex-end;
	padding: 18px;
	border-top: ${(props) => props.theme.colors.selectedTheme.border};

	.stat-title {
		font-size: 10px;
		color: ${(props) =>
			props.$darkTheme ? props.theme.colors.selectedTheme.text.title : '#323232'};
	}

	.stat-value {
		font-size: 11px;
		font-family: ${(props) => props.theme.fonts.mono};
		color: ${(props) =>
			props.$darkTheme
				? props.theme.colors.selectedTheme.text.value
				: props.theme.colors.selectedTheme.black};
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

const VestButton = styled.button<{ $darkTheme: boolean }>`
	border-width: 1px;
	border-style: solid;
	border-color: ${(props) =>
		props.$darkTheme ? props.theme.colors.selectedTheme.yellow : '#6A3300'};
	height: 24px;
	box-sizing: border-box;
	border-radius: 14px;
	cursor: pointer;
	background-color: transparent;
	color: ${(props) => (props.$darkTheme ? props.theme.colors.selectedTheme.yellow : '#6A3300')};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 12px;
	padding-left: 12px;
	padding-right: 12px;
	text-transform: uppercase;
`;

export default EscrowTable;
