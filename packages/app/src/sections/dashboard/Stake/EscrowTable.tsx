import { ZERO_WEI } from '@kwenta/sdk/constants'
import { truncateNumbers } from '@kwenta/sdk/utils'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'
import Table from 'components/Table'
import { TableCellHead, TableHeader } from 'components/Table'
import { StakingCard } from 'sections/dashboard/Stake/card'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { vestEscrowedRewards } from 'state/staking/actions'

import VestConfirmationModal from './VestConfirmationModal'

const EscrowTable = () => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const escrowData = useAppSelector(({ staking }) => staking.escrowData)
	const [checkedState, setCheckedState] = useState(escrowData.map((_) => false))
	const [checkAllState, setCheckAllState] = useState(false)
	const [isConfirmModalOpen, setConfirmModalOpen] = useState(false)

	const handleOnChange = useCallback(
		(position: number) => () => {
			checkedState[position] = !checkedState[position]
			setCheckedState([...checkedState])
		},
		[checkedState]
	)

	const selectAll = useCallback(() => {
		if (checkAllState) {
			setCheckedState(escrowData.map((_) => false))
			setCheckAllState(false)
		} else {
			setCheckedState(escrowData.map((_) => true))
			setCheckAllState(true)
		}
	}, [checkAllState, escrowData])

	const columnsDeps = useMemo(() => [checkedState], [checkedState])

	const { totalVestable, totalFee } = useMemo(
		() =>
			checkedState.reduce(
				(acc, current, index) => {
					if (current) {
						acc.totalVestable = acc.totalVestable.add(escrowData[index].vestable)
						acc.totalFee = acc.totalFee.add(escrowData[index].fee)
					}

					return acc
				},
				{ totalVestable: ZERO_WEI, totalFee: ZERO_WEI }
			),
		[checkedState, escrowData]
	)

	const { ids, vestEnabled } = useMemo(() => {
		const ids = escrowData.filter((_, i) => !!checkedState[i]).map((d) => d.id)
		const vestEnabled = ids.length > 0

		return { ids, vestEnabled }
	}, [escrowData, checkedState])

	const handleVest = useCallback(async () => {
		if (vestEnabled) {
			await dispatch(vestEscrowedRewards(ids))
			setCheckedState(escrowData.map((_) => false))
			setCheckAllState(false)
		}

		setConfirmModalOpen(false)
	}, [dispatch, escrowData, ids, vestEnabled])

	const openConfirmModal = useCallback(() => setConfirmModalOpen(true), [])
	const closeConfirmModal = useCallback(() => setConfirmModalOpen(false), [])

	return (
		<EscrowTableContainer $noPadding>
			<DesktopOnlyView>
				<StyledTable
					data={escrowData}
					compactPagination
					pageSize={10}
					showPagination
					columnsDeps={columnsDeps}
					columns={[
						{
							header: () => <input type="checkbox" checked={checkAllState} onChange={selectAll} />,
							cell: (cellProps) => (
								<input
									key={cellProps.row.index}
									type="checkbox"
									checked={checkedState[cellProps.row.index]}
									onChange={handleOnChange(cellProps.row.index)}
								/>
							),
							accessorKey: 'selected',
							size: 40,
						},
						{
							header: () => (
								<TableHeader $small>{t('dashboard.stake.tabs.escrow.date')}</TableHeader>
							),
							cell: (cellProps) => <TableCell>{cellProps.row.original.date}</TableCell>,
							accessorKey: 'date',
							size: 65,
						},
						{
							header: () => (
								<TableHeader $small>
									<div>{t('dashboard.stake.tabs.escrow.time-until-vestable')}</div>
								</TableHeader>
							),
							cell: (cellProps) => <TableCell>{cellProps.row.original.time}</TableCell>,
							accessorKey: 'timeUntilVestable',
							size: 80,
						},
						{
							header: () => (
								<TableHeader $small>
									<div>{t('dashboard.stake.tabs.escrow.immediately-vestable')}</div>
								</TableHeader>
							),
							cell: (cellProps) => (
								<TableCell>{truncateNumbers(cellProps.row.original.vestable, 4)}</TableCell>
							),
							accessorKey: 'immediatelyVestable',
							size: 80,
						},
						{
							header: () => (
								<TableHeader $small>{t('dashboard.stake.tabs.escrow.amount')}</TableHeader>
							),
							cell: (cellProps) => (
								<TableCell>{truncateNumbers(cellProps.row.original.amount, 4)}</TableCell>
							),
							accessorKey: 'amount',
							size: 80,
						},
						{
							header: () => (
								<TableHeader $small>
									<div>{t('dashboard.stake.tabs.escrow.early-vest-fee')}</div>
								</TableHeader>
							),
							cell: (cellProps) => (
								<TableCell>{truncateNumbers(cellProps.row.original.fee, 4)}</TableCell>
							),
							accessorKey: 'earlyVestFee',
							size: 80,
						},
						{
							header: () => (
								<TableHeader $small>{t('dashboard.stake.tabs.escrow.status')}</TableHeader>
							),
							cell: (cellProps) => <TableCell>{cellProps.row.original.status}</TableCell>,
							accessorKey: 'status',
							size: 70,
						},
					]}
				/>
			</DesktopOnlyView>
			<MobileOrTabletView>
				<StyledTable
					data={escrowData}
					compactPagination
					pageSize={5}
					showPagination
					columnsDeps={columnsDeps}
					columns={[
						{
							header: () => <input type="checkbox" checked={checkAllState} onChange={selectAll} />,
							cell: (cellProps) => (
								<input
									key={cellProps.row.index}
									type="checkbox"
									checked={checkedState[cellProps.row.index]}
									onChange={handleOnChange(cellProps.row.index)}
								/>
							),
							accessorKey: 'selected',
							size: 40,
						},
						{
							header: () => (
								<TableHeader $small>{t('dashboard.stake.tabs.escrow.amount')}</TableHeader>
							),
							cell: (cellProps) => (
								<TableCell>{truncateNumbers(cellProps.row.original.amount, 4)}</TableCell>
							),
							accessorKey: 'amount',
							size: 80,
						},
						{
							header: () => (
								<TableHeader $small>{t('dashboard.stake.tabs.escrow.early-vest-fee')}</TableHeader>
							),
							cell: (cellProps) => (
								<TableCell>{truncateNumbers(cellProps.row.original.fee, 4)}</TableCell>
							),
							accessorKey: 'earlyVestFee',
							size: 80,
						},
						{
							header: () => (
								<TableHeader $small>{t('dashboard.stake.tabs.escrow.status')}</TableHeader>
							),
							cell: (cellProps) => <TableCell>{cellProps.row.original.status}</TableCell>,
							accessorKey: 'status',
							size: 70,
						},
					]}
				/>
			</MobileOrTabletView>
			<EscrowStats>
				<div>
					<div>
						<div className="stat-title">{t('dashboard.stake.tabs.escrow.total')}</div>
						<div className="stat-value">
							{truncateNumbers(totalVestable, 4)}{' '}
							{t('dashboard.stake.tabs.stake-table.kwenta-token')}
						</div>
					</div>
					<div>
						<div className="stat-title">{t('dashboard.stake.tabs.escrow.fee')}</div>
						<div className="stat-value">
							{truncateNumbers(totalFee, 4)} {t('dashboard.stake.tabs.stake-table.kwenta-token')}
						</div>
					</div>
					<VestButton disabled={!vestEnabled} onClick={openConfirmModal}>
						{t('dashboard.stake.tabs.escrow.vest')}
					</VestButton>
				</div>
			</EscrowStats>
			{isConfirmModalOpen && (
				<VestConfirmationModal
					totalFee={totalFee}
					onDismiss={closeConfirmModal}
					handleVest={handleVest}
				/>
			)}
		</EscrowTableContainer>
	)
}

const EscrowTableContainer = styled(StakingCard)`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
`

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
` as typeof Table

const TableCell = styled.div`
	font-size: 11px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
`

const EscrowStats = styled.div`
	display: flex;
	justify-content: flex-end;
	padding: 18px;
	border-top: ${(props) => props.theme.colors.selectedTheme.border};

	.stat-title {
		font-size: 10px;
		color: ${(props) => props.theme.colors.selectedTheme.text.label};
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
`

const VestButton = styled.button`
	border-width: 1px;
	border-style: solid;
	border-color: ${(props) =>
		props.disabled
			? props.theme.colors.selectedTheme.gray
			: props.theme.colors.selectedTheme.yellow};
	height: 24px;
	box-sizing: border-box;
	border-radius: 14px;
	cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
	background-color: transparent;
	color: ${(props) =>
		props.disabled
			? props.theme.colors.selectedTheme.gray
			: props.theme.colors.selectedTheme.yellow};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 12px;
	padding-left: 12px;
	padding-right: 12px;
	text-transform: uppercase;
`

export default EscrowTable
