import { useMemo, useState } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { useContractWrite, usePrepareContractWrite } from 'wagmi';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import Table from 'components/Table';
import { TableCellHead } from 'components/Table/Table';
import { useStakingContext } from 'contexts/StakingContext';
import { EscrowRow } from 'hooks/useStakingData';
import { currentThemeState } from 'store/ui';
import { truncateNumbers } from 'utils/formatters/number';

import { StakingCard } from './common';

const EscrowTable = () => {
	const { t } = useTranslation();
	const { data, rewardEscrowContract } = useStakingContext();
	const [checkedState, setCheckedState] = useState(new Array(data.length).fill(false));
	const [checkAllState, setCheckAllState] = useState(false);

	const handleOnChange = (position: number) => {
		checkedState[position] = !checkedState[position];
		setCheckedState(checkedState.map((d) => d));
	};

	const selectAll = () => {
		if (checkAllState) {
			setCheckedState(new Array(data.length).fill(false));
			setCheckAllState(false);
		} else {
			setCheckedState(new Array(data.length).fill(true));
			setCheckAllState(true);
		}
	};

	const columnsDeps = React.useMemo(() => [checkedState], [checkedState]);

	const totalVestable = checkedState.reduce((acc, current, index) => {
		if (current === true) {
			return acc + data[index]?.vestable ?? 0;
		}
		return acc;
	}, 0);

	const totalFee = checkedState.reduce((acc, current, index) => {
		if (current === true) {
			return acc + data[index]?.fee ?? 0;
		}
		return acc;
	}, 0);

	const { config } = usePrepareContractWrite({
		...rewardEscrowContract,
		functionName: 'vest',
		args: [data.filter((d, index) => !!checkedState[index]).map((d) => d.id)],
		enabled: data.filter((d, index) => !!checkedState[index]).map((d) => d.id).length > 0,
	});

	const { write: vest } = useContractWrite(config);

	const currentTheme = useRecoilValue(currentThemeState);
	const isDarkTheme = useMemo(() => currentTheme === 'dark', [currentTheme]);

	return (
		<EscrowTableContainer $noPadding $darkTheme={isDarkTheme}>
			<DesktopOnlyView>
				<StyledTable
					data={data}
					showPagination={false}
					columnsDeps={columnsDeps}
					columns={[
						{
							Header: () => (
								<input type="checkbox" checked={checkAllState} onChange={() => selectAll()} />
							),
							Cell: (cellProps: CellProps<EscrowRow>) => (
								<input
									key={cellProps.row.index}
									type="checkbox"
									checked={checkedState[cellProps.row.index]}
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
									{Math.trunc(cellProps.row.original.vestable)}{' '}
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
									{Math.trunc(cellProps.row.original.amount)}{' '}
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
									{Math.trunc(cellProps.row.original.fee)}{' '}
									{t('dashboard.stake.tabs.stake-table.kwenta-token')}
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
					columnsDeps={columnsDeps}
					columns={[
						{
							Header: () => (
								<input type="checkbox" checked={checkAllState} onChange={() => selectAll()} />
							),
							Cell: (cellProps: CellProps<EscrowRow>) => (
								<input
									key={cellProps.row.index}
									type="checkbox"
									checked={checkedState[cellProps.row.index]}
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
									{Math.trunc(cellProps.row.original.amount)}{' '}
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
									{Math.trunc(cellProps.row.original.fee)}{' '}
									{t('dashboard.stake.tabs.stake-table.kwenta-token')}
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
							{truncateNumbers(totalVestable ?? 0, 2)}{' '}
							{t('dashboard.stake.tabs.stake-table.kwenta-token')}
						</div>
					</div>
					<div>
						<div className="stat-title">{t('dashboard.stake.tabs.escrow.fee')}</div>
						<div className="stat-value">
							{truncateNumbers(totalFee ?? 0, 2)}{' '}
							{t('dashboard.stake.tabs.stake-table.kwenta-token')}
						</div>
					</div>
					<VestButton $darkTheme={isDarkTheme} disabled={!vest} onClick={() => vest?.()}>
						{t('dashboard.stake.tabs.escrow.vest')}
					</VestButton>
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
