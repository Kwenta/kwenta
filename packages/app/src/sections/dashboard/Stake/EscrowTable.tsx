import { ZERO_WEI } from '@kwenta/sdk/constants'
import { formatNumber, formatPercent } from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Badge from 'components/Badge'
import Button from 'components/Button'
import { Checkbox } from 'components/Checkbox'
import { notifyError } from 'components/ErrorNotifier'
import { FlexDivCol, FlexDivRow, FlexDivRowCentered } from 'components/layout/flex'
import { DesktopLargeOnlyView, DesktopSmallOnlyView } from 'components/Media'
import Table, { TableNoResults } from 'components/Table'
import { TableCellHead, TableHeader } from 'components/Table'
import StakingPagination from 'components/Table/StakingPagination'
import { Body } from 'components/Text'
import { STAKING_DISABLED } from 'constants/ui'
import { setOpenModal } from 'state/app/reducer'
import { selectShowModal } from 'state/app/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { vestEscrowedRewards, vestEscrowedRewardsV2 } from 'state/staking/actions'
import {
	selectCanVestBeforeMigration,
	selectEscrowEntries,
	selectStakingV1,
	selectUnstakedEscrowedKwentaBalance,
} from 'state/staking/selectors'
import media from 'styles/media'
import common from 'styles/theme/colors/common'

import TransferInputModal from './TransferInputModal'
import VestConfirmationModal from './VestConfirmationModal'

const TRANSFER_BATCH_SIZE = 200

const EscrowTable = () => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const stakingV1 = useAppSelector(selectStakingV1)
	const canVestBeforeMigration = useAppSelector(selectCanVestBeforeMigration)
	const escrowData = useAppSelector(selectEscrowEntries)
	const unstakedEscrowedKwentaBalance = useAppSelector(selectUnstakedEscrowedKwentaBalance)
	const openModal = useAppSelector(selectShowModal)

	const [checkedState, setCheckedState] = useState(escrowData.map((_) => false))
	const [checkAllState, setCheckAllState] = useState(false)

	useEffect(() => {
		setCheckedState(escrowData.map((_) => false))
		setCheckAllState(false)
	}, [escrowData])

	const handleOnChange = useCallback(
		(position: number) => {
			const newCheckedState = [...checkedState]
			newCheckedState[position] = !newCheckedState[position]
			setCheckedState(newCheckedState)
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

	const columnsDeps = useMemo(() => [checkedState, escrowData], [checkedState, escrowData])

	const { totalVestable, totalFee } = useMemo(
		() =>
			checkedState.reduce(
				(acc, current, index) => {
					if (current && escrowData[index]) {
						acc.totalVestable = acc.totalVestable.add(escrowData[index].vestable)
						acc.totalFee = acc.totalFee.add(escrowData[index].fee)
					}

					return acc
				},
				{ totalVestable: ZERO_WEI, totalFee: ZERO_WEI }
			),
		[checkedState, escrowData]
	)

	const { totalTransferAmount } = useMemo(
		() =>
			checkedState.reduce(
				(acc, current, index) => {
					if (acc.totalCount >= TRANSFER_BATCH_SIZE) {
						return acc
					}

					if (current && escrowData[index]) {
						acc.totalTransferAmount = acc.totalTransferAmount.add(escrowData[index].amount)
						acc.totalCount++
					}

					return acc
				},
				{ totalTransferAmount: ZERO_WEI, totalCount: 0 }
			),
		[checkedState, escrowData]
	)
	const { ids, vestEnabled, transferEnabled } = useMemo(() => {
		const ids = escrowData.filter((_, i) => !!checkedState[i]).map((d) => d.id)
		const vestEnabled = ids.length > 0 && !STAKING_DISABLED
		const transferEnabled =
			ids.length > 0 &&
			!STAKING_DISABLED &&
			!stakingV1 &&
			unstakedEscrowedKwentaBalance.gte(totalTransferAmount)

		return { ids, vestEnabled, transferEnabled }
	}, [escrowData, stakingV1, unstakedEscrowedKwentaBalance, totalTransferAmount, checkedState])

	const handleOpenVestModal = useCallback(() => {
		dispatch(setOpenModal('vest_escrow_entries'))
	}, [dispatch])

	const handleOpenTransferModal = useCallback(() => {
		dispatch(setOpenModal('transfer_escrow_entries'))
	}, [dispatch])

	const handleDismissModal = useCallback(() => {
		dispatch(setOpenModal(null))
	}, [dispatch])

	const handleVest = useCallback(async () => {
		if (vestEnabled) {
			if (stakingV1) {
				if (canVestBeforeMigration) {
					await dispatch(vestEscrowedRewards(ids))
				} else {
					notifyError('Please complete the migration before vesting.')
				}
			} else {
				await dispatch(vestEscrowedRewardsV2(ids))
			}
		}
	}, [canVestBeforeMigration, dispatch, ids, stakingV1, vestEnabled])

	const EscrowStatsContainer = () => (
		<StatsContainer columnGap="25px" justifyContent="flex-end">
			<Container columnGap="25px">
				<LabelContainers columnGap="25px">
					<LabelContainer columnGap="5px">
						<Body color="secondary">{t('dashboard.stake.tabs.escrow.total')}</Body>
						<Body color="primary">{formatNumber(totalVestable, { minDecimals: 4 })} KWENTA</Body>
					</LabelContainer>
					<LabelContainer columnGap="5px">
						<Body color="secondary">{t('dashboard.stake.tabs.escrow.fee')}</Body>
						<Body color="primary">{formatNumber(totalFee, { minDecimals: 4 })} KWENTA</Body>
					</LabelContainer>
				</LabelContainers>
			</Container>
			<ButtonContainer>
				{!stakingV1 && (
					<StyledButton
						variant="flat"
						size="xsmall"
						isRounded
						disabled={!transferEnabled}
						onClick={handleOpenTransferModal}
					>
						{t('dashboard.stake.tabs.escrow.transfer')}
					</StyledButton>
				)}
				<StyledButton
					variant="yellow"
					size="xsmall"
					isRounded
					disabled={!vestEnabled}
					onClick={handleOpenVestModal}
				>
					{t('dashboard.stake.tabs.escrow.vest')}
				</StyledButton>
			</ButtonContainer>
		</StatsContainer>
	)

	return (
		<EscrowTableContainer>
			<DesktopLargeOnlyView>
				<StyledTable
					data={escrowData}
					paginationSize="sm"
					pageSize={4}
					showPagination
					columnsDeps={columnsDeps}
					CustomPagination={StakingPagination}
					paginationExtra={<EscrowStatsContainer />}
					noResultsMessage={
						<TableNoResults>{t('dashboard.stake.tabs.escrow.no-entries')}</TableNoResults>
					}
					columns={[
						{
							header: () => (
								<Checkbox
									id="header"
									label=""
									checked={checkAllState}
									onChange={selectAll}
									variant="fill"
									checkSide="right"
								/>
							),
							cell: (cellProps) => (
								<Checkbox
									id={cellProps.row.index.toString()}
									key={cellProps.row.index}
									checked={checkedState[cellProps.row.index]}
									onChange={() => handleOnChange(cellProps.row.index)}
									label=""
									variant="fill"
									checkSide="right"
								/>
							),
							accessorKey: 'selected',
							size: 40,
							enableSorting: false,
						},
						{
							header: () => <TableHeader>{t('dashboard.stake.tabs.escrow.date')}</TableHeader>,
							cell: (cellProps) => <TableCell>{cellProps.row.original.date}</TableCell>,
							accessorKey: 'date',
							size: 65,
						},
						{
							header: () => <TableHeader>{t('dashboard.stake.tabs.escrow.amount')}</TableHeader>,
							cell: (cellProps) => (
								<FlexDivRowCentered columnGap="10px">
									<StyledTableCell>
										{formatNumber(cellProps.row.original.amount, { minDecimals: 4 })}
									</StyledTableCell>
									{cellProps.row.original.version === 1 ? (
										<StyledBadge color="yellow" size="small">
											V1
										</StyledBadge>
									) : null}
								</FlexDivRowCentered>
							),
							accessorKey: 'amount',
							size: 80,
						},
						{
							header: () => (
								<TableHeader>
									<div>{t('dashboard.stake.tabs.escrow.time-until-vestable')}</div>
								</TableHeader>
							),
							cell: (cellProps) => <StyledTableCell>{cellProps.row.original.time}</StyledTableCell>,
							accessorKey: 'timeUntilVestable',
							size: 80,
						},
						{
							header: () => (
								<TableHeader>
									<div>{t('dashboard.stake.tabs.escrow.immediately-vestable')}</div>
								</TableHeader>
							),
							cell: (cellProps) => (
								<StyledTableCell>
									{formatNumber(cellProps.row.original.vestable, { minDecimals: 4 })}
								</StyledTableCell>
							),
							accessorKey: 'immediatelyVestable',
							size: 80,
						},
						{
							header: () => (
								<TableHeader>
									<div>{t('dashboard.stake.tabs.escrow.early-vest-fee')}</div>
								</TableHeader>
							),
							cell: (cellProps) => {
								const fee = wei(cellProps.row.original.fee)
								return (
									<StyledTableCell color={common.palette.yellow.y500}>
										{`${formatNumber(cellProps.row.original.fee, {
											minDecimals: 4,
										})} (${formatPercent(
											cellProps.row.original.amount !== null
												? fee.div(cellProps.row.original.amount)
												: ZERO_WEI,
											{ minDecimals: 0 }
										)})`}
									</StyledTableCell>
								)
							},
							accessorKey: 'earlyVestFee',
							size: 90,
						},
						{
							header: () => <TableHeader>{t('dashboard.stake.tabs.escrow.status')}</TableHeader>,
							cell: (cellProps) => <TableCell $regular>{cellProps.row.original.status}</TableCell>,
							accessorKey: 'status',
							size: 70,
						},
					]}
				/>
			</DesktopLargeOnlyView>
			<DesktopSmallOnlyView>
				<StyledTable
					data={escrowData}
					paginationSize="sm"
					pageSize={5}
					showPagination
					columnsDeps={columnsDeps}
					paginationExtra={<EscrowStatsContainer />}
					noResultsMessage={
						<TableNoResults>{t('dashboard.stake.tabs.escrow.no-entries')}</TableNoResults>
					}
					columns={[
						{
							header: () => (
								<Checkbox
									id="header"
									label=""
									checked={checkAllState}
									onChange={selectAll}
									variant="fill"
									checkSide="left"
								/>
							),
							cell: (cellProps) => (
								<Checkbox
									id={cellProps.row.index.toString()}
									key={cellProps.row.index}
									checked={checkedState[cellProps.row.index]}
									onChange={() => handleOnChange(cellProps.row.index)}
									label=""
									variant="fill"
									checkSide="left"
								/>
							),
							accessorKey: 'selected',
							size: 30,
							enableSorting: false,
						},
						{
							header: () => <TableHeader>{t('dashboard.stake.tabs.escrow.amount')}</TableHeader>,
							cell: (cellProps) => (
								<FlexDivRowCentered columnGap="10px">
									<TableCell>
										{formatNumber(cellProps.row.original.amount, { minDecimals: 4 })}
									</TableCell>
									{cellProps.row.original.version === 1 ? (
										<StyledBadge color="yellow" size="small">
											V1
										</StyledBadge>
									) : null}
								</FlexDivRowCentered>
							),
							accessorKey: 'amount',
							size: 90,
						},
						{
							header: () => (
								<TableHeader>{t('dashboard.stake.tabs.escrow.early-vest-fee')}</TableHeader>
							),
							cell: (cellProps) => {
								const fee = wei(cellProps.row.original.fee)
								return (
									<TableCell color={common.palette.yellow.y500}>
										<span>{formatNumber(cellProps.row.original.fee, { minDecimals: 4 })}</span>
										<span>
											{formatPercent(
												cellProps.row.original.amount !== null
													? fee.div(cellProps.row.original.amount)
													: ZERO_WEI,
												{ minDecimals: 0 }
											)}
										</span>
									</TableCell>
								)
							},
							accessorKey: 'earlyVestFee',
							size: 100,
						},
						{
							header: () => <TableHeader>{t('dashboard.stake.tabs.escrow.status')}</TableHeader>,
							cell: (cellProps) => <TableCell $regular>{cellProps.row.original.status}</TableCell>,
							accessorKey: 'status',
							size: 50,
						},
					]}
				/>
			</DesktopSmallOnlyView>
			{openModal === 'vest_escrow_entries' && (
				<VestConfirmationModal
					totalFee={totalFee}
					onDismiss={handleDismissModal}
					handleVest={handleVest}
				/>
			)}
			{openModal === 'transfer_escrow_entries' && (
				<TransferInputModal
					onDismiss={handleDismissModal}
					totalAmount={totalTransferAmount}
					totalEntries={ids.slice(0, TRANSFER_BATCH_SIZE)}
				/>
			)}
		</EscrowTableContainer>
	)
}

const ButtonContainer = styled(FlexDivRowCentered)`
	column-gap: 25px;
	${media.lessThan('lg')`
		width: 100%;
		column-gap: 15px;
	`}
`

const StyledButton = styled(Button)`
	padding: 10px 20px;
	${media.lessThan('lg')`
		width: 100%;
	`}
`
const Container = styled(FlexDivRow)`
	align-items: flex-end;
	${media.lessThan('lg')`
		justify-content: space-between;
		width: 100%;
	`}
`

const LabelContainer = styled(FlexDivCol)`
	align-items: flex-end;
	${media.lessThan('lg')`
		align-items: flex-start;
		justify-content: flex-start;
		flex: 1
	`}

	${media.lessThan('md')`
		justify-content: space-between;
	`}
`

const LabelContainers = styled(FlexDivRow)`
	${media.lessThan('lg')`
		justify-content: flex-start;
		width: 100%;
	`}
	${media.lessThan('md')`
		flex: initial;
	`}
`

const StatsContainer = styled(FlexDivRowCentered)`
	${media.lessThan('lg')`
		flex-direction: column;
		row-gap: 25px;
		padding: 15px 15px;
		background: ${(props) => props.theme.colors.selectedTheme.newTheme.containers.cards.background};
		border-bottom-left-radius: 10px;
		border-bottom-right-radius: 10px;
		align-items: flex-end;
	`}
`

const StyledBadge = styled(Badge)`
	padding: 0 6px;
`

const EscrowTableContainer = styled.div`
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
` as typeof Table

const TableCell = styled.div<{ $regular?: boolean }>`
	font-size: 13px;
	font-family: ${(props) => props.theme.fonts[props.$regular ? 'regular' : 'mono']};
	color: ${(props) => props.color || props.theme.colors.selectedTheme.button.text.primary};
	display: flex;
	flex-direction: column;
`

const StyledTableCell = styled(TableCell)`
	padding-left: 4px;
`

export default EscrowTable
