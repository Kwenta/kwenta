import { ZERO_WEI } from '@kwenta/sdk/constants'
import { EscrowData } from '@kwenta/sdk/types'
import { truncateNumbers } from '@kwenta/sdk/utils'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CellProps } from 'react-table'
import styled from 'styled-components'

import Badge from 'components/Badge'
import Button from 'components/Button'
import { Checkbox } from 'components/Checkbox'
import { FlexDivCol, FlexDivRowCentered } from 'components/layout/flex'
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'
import Table from 'components/Table'
import { TableCellHead, TableHeader } from 'components/Table'
import { Body } from 'components/Text'
import { StakingCard } from 'sections/dashboard/Stake/card'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { vestEscrowedRewardsV2 } from 'state/staking/actions'
import { selectEscrowData } from 'state/staking/selectors'

import VestConfirmationModal from './VestConfirmationModal'

const EscrowTable = () => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const escrowData = useAppSelector(selectEscrowData)
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
			await dispatch(vestEscrowedRewardsV2(ids))
			setCheckedState(escrowData.map((_) => false))
			setCheckAllState(false)
		}

		setConfirmModalOpen(false)
	}, [dispatch, escrowData, ids, vestEnabled])

	const openConfirmModal = useCallback(() => setConfirmModalOpen(true), [])
	const closeConfirmModal = useCallback(() => setConfirmModalOpen(false), [])

	const EscrowStatsContainer = () => (
		<FlexDivRowCentered columnGap="25px" justifyContent="flex-end">
			<FlexDivCol alignItems="flex-end">
				<Body color="secondary">{t('dashboard.stake.tabs.escrow.total')}</Body>
				<Body color="primary">
					{truncateNumbers(totalVestable, 4)} {t('dashboard.stake.tabs.stake-table.kwenta-token')}
				</Body>
			</FlexDivCol>
			<FlexDivCol alignItems="flex-end">
				<Body color="secondary">{t('dashboard.stake.tabs.escrow.fee')}</Body>
				<Body color="primary">
					{truncateNumbers(totalFee, 4)} {t('dashboard.stake.tabs.stake-table.kwenta-token')}
				</Body>
			</FlexDivCol>
			<Button size="xsmall" isRounded disabled={true} onClick={() => {}}>
				{t('dashboard.stake.tabs.escrow.transfer')}
			</Button>
			<Button size="xsmall" isRounded disabled={true} onClick={() => {}}>
				{t('dashboard.stake.tabs.escrow.delegate')}
			</Button>
			<Button
				variant="yellow"
				size="xsmall"
				isRounded
				disabled={!vestEnabled}
				onClick={openConfirmModal}
			>
				{t('dashboard.stake.tabs.escrow.vest')}
			</Button>
		</FlexDivRowCentered>
	)

	return (
		<EscrowTableContainer $noPadding>
			<DesktopOnlyView>
				{/*@ts-expect-error*/}
				<StyledTable
					data={escrowData}
					compactPagination
					customizePagination={true}
					pageSize={4}
					showPagination
					columnsDeps={columnsDeps}
					children={<EscrowStatsContainer />}
					columns={[
						{
							Header: () => (
								<Checkbox
									id="header"
									label=""
									checked={checkAllState}
									onChange={selectAll}
									variant="table"
									checkSide="right"
								/>
							),
							Cell: (cellProps: CellProps<EscrowData>) => (
								<Checkbox
									id={cellProps.row.index.toString()}
									key={cellProps.row.index}
									checked={checkedState[cellProps.row.index]}
									onChange={handleOnChange(cellProps.row.index)}
									label=""
									variant="table"
									checkSide="right"
								/>
							),
							accessor: 'selected',
							width: 40,
						},
						{
							Header: () => <TableHeader>{t('dashboard.stake.tabs.escrow.date')}</TableHeader>,
							Cell: (cellProps: CellProps<EscrowData>) => (
								<TableCell>{cellProps.row.original.date}</TableCell>
							),
							accessor: 'date',
							width: 65,
						},
						{
							Header: () => <TableHeader>{t('dashboard.stake.tabs.escrow.amount')}</TableHeader>,
							Cell: (cellProps: CellProps<EscrowData>) => (
								<FlexDivRowCentered columnGap="10px">
									<TableCell>{truncateNumbers(cellProps.row.original.amount, 4)}</TableCell>
									<StyledBadge color="yellow" size="small">
										V1
									</StyledBadge>
								</FlexDivRowCentered>
							),
							accessor: 'amount',
							width: 80,
						},
						{
							Header: () => (
								<TableHeader>
									<div>{t('dashboard.stake.tabs.escrow.time-until-vestable')}</div>
								</TableHeader>
							),
							Cell: (cellProps: CellProps<EscrowData>) => (
								<TableCell>{cellProps.row.original.time}</TableCell>
							),
							accessor: 'timeUntilVestable',
							width: 80,
						},
						{
							Header: () => (
								<TableHeader>
									<div>{t('dashboard.stake.tabs.escrow.immediately-vestable')}</div>
								</TableHeader>
							),
							Cell: (cellProps: CellProps<EscrowData>) => (
								<TableCell>{truncateNumbers(cellProps.row.original.vestable, 4)}</TableCell>
							),
							accessor: 'immediatelyVestable',
							width: 80,
						},
						{
							Header: () => (
								<TableHeader>
									<div>{t('dashboard.stake.tabs.escrow.early-vest-fee')}</div>
								</TableHeader>
							),
							Cell: (cellProps: CellProps<EscrowData>) => (
								<TableCell>{truncateNumbers(cellProps.row.original.fee, 4)}</TableCell>
							),
							accessor: 'earlyVestFee',
							width: 80,
						},
						{
							Header: () => <TableHeader>{t('dashboard.stake.tabs.escrow.status')}</TableHeader>,
							Cell: (cellProps: CellProps<EscrowData>) => (
								<TableCell>{cellProps.row.original.status}</TableCell>
							),
							accessor: 'status',
							width: 70,
						},
					]}
				/>
			</DesktopOnlyView>
			<MobileOrTabletView>
				{/*@ts-expect-error*/}
				<StyledTable
					data={escrowData}
					compactPagination
					pageSize={5}
					showPagination
					columnsDeps={columnsDeps}
					columns={[
						{
							Header: () => <input type="checkbox" checked={checkAllState} onChange={selectAll} />,
							Cell: (cellProps: CellProps<EscrowData>) => (
								<input
									key={cellProps.row.index}
									type="checkbox"
									checked={checkedState[cellProps.row.index]}
									onChange={handleOnChange(cellProps.row.index)}
								/>
							),
							accessor: 'selected',
							width: 40,
						},
						{
							Header: () => (
								<TableHeader $small>{t('dashboard.stake.tabs.escrow.amount')}</TableHeader>
							),
							Cell: (cellProps: CellProps<EscrowData>) => (
								<FlexDivRowCentered columnGap="10px">
									<TableCell>{truncateNumbers(cellProps.row.original.amount, 4)}</TableCell>
									<StyledBadge color="yellow" size="small">
										V1
									</StyledBadge>
								</FlexDivRowCentered>
							),
							accessor: 'amount',
							width: 80,
						},
						{
							Header: () => (
								<TableHeader $small>{t('dashboard.stake.tabs.escrow.early-vest-fee')}</TableHeader>
							),
							Cell: (cellProps: CellProps<EscrowData>) => (
								<TableCell>{truncateNumbers(cellProps.row.original.fee, 4)}</TableCell>
							),
							accessor: 'earlyVestFee',
							width: 80,
						},
						{
							Header: () => (
								<TableHeader $small>{t('dashboard.stake.tabs.escrow.status')}</TableHeader>
							),
							Cell: (cellProps: CellProps<EscrowData>) => (
								<TableCell>{cellProps.row.original.status}</TableCell>
							),
							accessor: 'status',
							width: 70,
						},
					]}
				/>
			</MobileOrTabletView>
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

const StyledBadge = styled(Badge)`
	padding: 0 6px;
`

const EscrowTableContainer = styled(StakingCard)`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	margin-bottom: 60px;
	background: transparent;
	border: none;
`

const StyledTable = styled(Table)`
	width: 100%;
	border-bottom-left-radius: 0;
	border-bottom-right-radius: 0;
	border-radius: 15px;
	${TableCellHead} {
		&:first-child {
			padding-left: 18px;
		}
	}
`

const TableCell = styled.div`
	font-size: 13px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
`

export default EscrowTable
