import { ZERO_WEI } from '@kwenta/sdk/constants'
import { formatNumber, formatPercent } from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Badge from 'components/Badge'
import Button from 'components/Button'
import { Checkbox } from 'components/Checkbox'
import { FlexDivCol, FlexDivRow, FlexDivRowCentered } from 'components/layout/flex'
import { DesktopLargeOnlyView, DesktopSmallOnlyView } from 'components/Media'
import Table, { TableNoResults } from 'components/Table'
import { TableCellHead, TableHeader } from 'components/Table'
import StakingPagination from 'components/Table/StakingPagination'
import { Body } from 'components/Text'
import { STAKING_DISABLED } from 'constants/ui'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { vestEscrowedRewards, vestEscrowedRewardsV2 } from 'state/staking/actions'
import { setSelectedEscrowVersion } from 'state/staking/reducer'
import { selectCombinedEscrowData, selectSelectedEscrowVersion } from 'state/staking/selectors'
import media from 'styles/media'
import common from 'styles/theme/colors/common'

import VestConfirmationModal from './VestConfirmationModal'

const EscrowTable = () => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const escrowVersion = useAppSelector(selectSelectedEscrowVersion)
	const escrowData = useAppSelector(selectCombinedEscrowData)

	const [checkedState, setCheckedState] = useState(escrowData.map((_) => false))
	const [checkAllState, setCheckAllState] = useState(false)
	const [isConfirmModalOpen, setConfirmModalOpen] = useState(false)

	const handleOnChange = useCallback(
		(position: number) => {
			checkedState[position] = !checkedState[position]
			setCheckedState([...checkedState])
		},
		[checkedState]
	)

	const handleVersionChange = useCallback(
		(version: number) => {
			dispatch(setSelectedEscrowVersion(version))
			setCheckedState(escrowData.map((_) => false))
			setCheckAllState(false)
		},
		[dispatch, escrowData]
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
		const vestEnabled = ids.length > 0 && !STAKING_DISABLED

		return { ids, vestEnabled }
	}, [escrowData, checkedState])

	const handleVest = useCallback(async () => {
		if (vestEnabled) {
			if (escrowVersion === 1) {
				await dispatch(vestEscrowedRewards(ids))
			} else if (escrowVersion === 2) {
				await dispatch(vestEscrowedRewardsV2(ids))
			}
			setCheckedState(escrowData.map((_) => false))
			setCheckAllState(false)
		}

		setConfirmModalOpen(false)
	}, [dispatch, escrowData, escrowVersion, ids, vestEnabled])

	const openConfirmModal = useCallback(() => setConfirmModalOpen(true), [])
	const closeConfirmModal = useCallback(() => setConfirmModalOpen(false), [])

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
				<ButtonsContainer>
					<StyledButton
						variant={escrowVersion === 1 ? 'staking-button' : 'flat'}
						size="xsmall"
						isRounded
						onClick={() => handleVersionChange(1)}
					>
						{t('dashboard.stake.tabs.escrow.v1')}
					</StyledButton>
					<StyledButton
						variant={escrowVersion === 2 ? 'staking-button' : 'flat'}
						size="xsmall"
						isRounded
						active={escrowVersion === 2}
						onClick={() => handleVersionChange(2)}
					>
						{t('dashboard.stake.tabs.escrow.v2')}
					</StyledButton>
				</ButtonsContainer>
			</Container>
			<StyledButton
				variant="yellow"
				size="xsmall"
				isRounded
				disabled={!vestEnabled}
				onClick={openConfirmModal}
			>
				{escrowVersion === 1
					? t('dashboard.stake.tabs.escrow.vest-v1')
					: t('dashboard.stake.tabs.escrow.vest-v2')}
			</StyledButton>
		</StatsContainer>
	)

	return (
		<EscrowTableContainer>
			<DesktopLargeOnlyView>
				<StyledTable
					data={escrowData}
					compactPagination
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
							size: 80,
						},
						{
							header: () => (
								<TableHeader>
									<div>{t('dashboard.stake.tabs.escrow.time-until-vestable')}</div>
								</TableHeader>
							),
							cell: (cellProps) => <TableCell>{cellProps.row.original.time}</TableCell>,
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
								<TableCell>
									{formatNumber(cellProps.row.original.vestable, { minDecimals: 4 })}
								</TableCell>
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
									<TableCell color={common.palette.yellow.y500}>
										{`${formatNumber(cellProps.row.original.fee, {
											minDecimals: 4,
										})} (${formatPercent(
											cellProps.row.original.amount !== null
												? fee.div(cellProps.row.original.amount)
												: ZERO_WEI,
											{ minDecimals: 0 }
										)})`}
									</TableCell>
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
					compactPagination
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

const StyledButton = styled(Button)`
	padding: 10px 20px;
`
const Container = styled(FlexDivRow)`
	align-items: flex-end;
	${media.lessThan('lg')`
		justify-content: space-between;
		width: 100%;
	`}
`

const ButtonsContainer = styled(FlexDivRowCentered)`
	column-gap: 20px;
	${media.lessThan('sm')`
		column-gap: 10px;
	`}
`

const LabelContainer = styled(FlexDivRow)`
	${media.lessThan('lg')`
		align-items: flex-start;
		justify-content: flex-start;
		flex: 1
	`}

	${media.lessThan('sm')`
		flex: initial;
	`}
`

const LabelContainers = styled(FlexDivCol)`
	${media.lessThan('lg')`
		justify-content: flex-start;
		width: 100%;
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

export default EscrowTable
