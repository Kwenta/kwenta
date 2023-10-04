import { truncateAddress } from '@kwenta/sdk/utils'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import Button from 'components/Button'
import { Checkbox } from 'components/Checkbox'
import { FlexDivCol, FlexDivRow } from 'components/layout/flex'
import Table, { TableCellHead, TableHeader, TableNoResults } from 'components/Table'
import { TableCell } from 'components/Table/TableBodyRow'
import { Body, Heading } from 'components/Text'
import useWindowSize from 'hooks/useWindowSize'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { approveOperator, fetchApprovedOperators } from 'state/staking/actions'
import { selectApprovedOperators, selectIsApprovingOperator } from 'state/staking/selectors'
import media from 'styles/media'

import { StakingCard } from './card'

const DelegationTable = memo(() => {
	const { t } = useTranslation()
	const { lessThanWidth } = useWindowSize()
	const dispatch = useAppDispatch()
	const isApprovingOperator = useAppSelector(selectIsApprovingOperator)
	const approvedOperators = useAppSelector(selectApprovedOperators)

	const [checkedState, setCheckedState] = useState(approvedOperators.map((_) => false))

	const columnsDeps = useMemo(
		() => [approvedOperators, checkedState, lessThanWidth],
		[approvedOperators, checkedState, lessThanWidth]
	)

	useEffect(() => {
		setCheckedState(approvedOperators.map((_) => false))
	}, [approvedOperators])

	useEffect(() => {
		dispatch(fetchApprovedOperators())
	}, [dispatch, approvedOperators.length, isApprovingOperator])

	const handleOnSelectedRow = useCallback(
		(position: number) => {
			setCheckedState([
				...checkedState.map((_, index) => (index === position ? !checkedState[position] : false)),
			])
		},
		[checkedState]
	)

	const handleRevokeOperator = useCallback(
		(delegatedAddress: string) => {
			dispatch(approveOperator({ delegatedAddress, isApproval: false }))
			setCheckedState((data) => data.map((_) => false))
		},
		[dispatch]
	)

	return (
		<CardGridContainer>
			<FlexDivCol rowGap="5px">
				<StyledHeading variant="h4">{t('dashboard.stake.tabs.delegate.manage')}</StyledHeading>
				<Body color="secondary">{t('dashboard.stake.tabs.delegate.manage-copy')}</Body>
			</FlexDivCol>
			<StyledTable
				data={approvedOperators}
				showPagination
				highlightRowsOnHover
				paginationSize={'xs'}
				pageSize={3}
				onTableRowClick={(row) => handleOnSelectedRow(row.index)}
				columnsDeps={columnsDeps}
				noResultsContainerPadding="0px"
				noResultsMessage={
					<TableNoResults>{t('dashboard.stake.tabs.delegate.no-result')}</TableNoResults>
				}
				columns={[
					{
						header: () => <></>,
						cell: (cellProps) => (
							<Checkbox
								id={cellProps.row.index.toString()}
								key={cellProps.row.index}
								checked={checkedState[cellProps.row.index]}
								onChange={() => handleOnSelectedRow(cellProps.row.index)}
								label=""
								variant="fill"
								checkSide="right"
							/>
						),
						accessorKey: 'selected',
						size: 30,
						enableSorting: false,
					},
					{
						header: () => <TableHeader>{t('dashboard.stake.tabs.delegate.address')}</TableHeader>,
						accessorKey: 'address',
						size: 300,
						enableSorting: false,
						cell: (cellProps) => (
							<TableCell>
								{lessThanWidth('md')
									? truncateAddress(cellProps.getValue(), 15, 15)
									: cellProps.getValue()}
							</TableCell>
						),
					},
				]}
			/>
			<FlexDivRow justifyContent="flex-start" columnGap="10px">
				<Button
					variant="yellow"
					size="small"
					textTransform="uppercase"
					isRounded
					loading={isApprovingOperator}
					disabled={checkedState.every((checked) => !checked)}
					onClick={() => {
						handleRevokeOperator(approvedOperators.filter((_, i) => !!checkedState[i])[0].address)
					}}
				>
					{t('dashboard.stake.tabs.delegate.revoke')}
				</Button>
			</FlexDivRow>
		</CardGridContainer>
	)
})

const mobileTableStyle = css`
	${media.lessThan('sm')`
		&:first-child {
			padding-left: 6px;
		}
		&:last-child {
			padding-left: 6px;
		}
	`}
`

const StyledTable = styled(Table)`
	width: 100%;
	border-bottom-left-radius: 0;
	border-bottom-right-radius: 0;
	border-radius: 8px;
	${TableCell} {
		font-size: 12px;
		font-family: ${(props) => props.theme.fonts.mono};
		color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
		height: 16px;
		&:first-child {
			padding-left: 10px;
		}
		${mobileTableStyle}
	}
	${TableCellHead} {
		&:first-child {
			padding-left: 10px;
		}
		padding-left: 12px;
		height: 28px;
		${mobileTableStyle}
	}

	${media.lessThan('sm')`
		max-width: calc(100vw - 80px);
	`}
` as typeof Table

const CardGridContainer = styled(StakingCard)`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	row-gap: 25px;
`

const StyledHeading = styled(Heading)`
	font-weight: 400;
`

export default DelegationTable
