import moment from 'moment';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { useContractReads } from 'wagmi';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import Table from 'components/Table';
import { TableCellHead } from 'components/Table/Table';
import Connector from 'containers/Connector';
import rewardEscrowABI from 'lib/abis/RewardEscrow.json';
import { currentThemeState } from 'store/ui';
import logError from 'utils/logError';

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

const rewardEscrowContract = {
	addressOrName: '0xaFD87d1a62260bD5714C55a1BB4057bDc8dFA413',
	contractInterface: rewardEscrowABI,
};

let data: EscrowRow[] = [];

const EscrowTable = () => {
	const { t } = useTranslation();
	const { walletAddress } = Connector.useContainer();
	data = [];
	const { data: vestingSchedules, isSuccess } = useContractReads({
		contracts: [
			{
				...rewardEscrowContract,
				functionName: 'getVestingSchedules',
				args: [walletAddress ?? undefined, 0, 1000],
			},
		],
		cacheOnBlock: true,
		enabled: !!walletAddress,
		onError(error) {
			if (error) logError(error);
		},
	});

	const vestingRecords = isSuccess && vestingSchedules !== undefined ? vestingSchedules[0] : [];

	vestingRecords.length > 0 &&
		vestingRecords.forEach((d) => {
			data.push({
				date: moment(Number(d.endTime) * 1000).format('MM/DD/YY'),
				time: moment(Number(d.endTime) * 1000).fromNow(),
				vestable: d.endTime * 1000 > Date.now() ? 0 : Number(d.escrowAmount / 1e18),
				amount: Number(d.escrowAmount / 1e18),
				fee: d.endTime * 1000 > Date.now() ? Number(d.escrowAmount / 1e18) : 0,
				status: d.endTime * 1000 > Date.now() ? 'VESTING' : 'VESTED',
				selected: false,
			});
		});

	const [, setCheckedState] = useState(data.map((d) => d.selected));
	const handleOnChange = (position: number) => {
		data[position].selected = !data[position].selected;
		setCheckedState(data.map((d) => d.selected));
	};

	const selectAll = () => {
		data.forEach((d) => (d.selected = !d.selected));
		setCheckedState(data.map((d) => d.selected));
	};

	const totalVestable = data
		.filter((d) => d.selected)
		.reduce((acc, current) => acc + current.vestable, 0);

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
							{totalVestable.toFixed(2)} {t('dashboard.stake.tabs.stake-table.kwenta-token')}
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
