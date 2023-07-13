import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import Button from 'components/Button'
import { Checkbox } from 'components/Checkbox'
import Input from 'components/Input/Input'
import { FlexDivCol, FlexDivRow } from 'components/layout/flex'
import Table, { TableCellHead, TableHeader, TableNoResults } from 'components/Table'
import { TableCell } from 'components/Table/TableBodyRow'
import { Body, Heading } from 'components/Text'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { approveOperator } from 'state/staking/actions'
import { selectApprovedOperators, selectIsApprovingOperator } from 'state/staking/selectors'
import media from 'styles/media'

type DelegateActions = 'approve' | 'revoke'

const DelegationTab = () => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const isApprovingOperator = useAppSelector(selectIsApprovingOperator)
	const approvedOperators = useAppSelector(selectApprovedOperators)
	// eslint-disable-next-line no-console
	console.log(`approvedOperators: ${approvedOperators}`)
	const [delegateAction, setDelegateAction] = useState<DelegateActions>('approve')
	const [delegatedAddress, setdelegatedAddress] = useState('')
	// TODO: Replace with real data
	const [data, setData] = useState<Record<string, string>[]>(
		approvedOperators.map((o) => ({ address: o }))
	)

	const [checkedState, setCheckedState] = useState(data.map((_) => false))
	const columnsDeps = useMemo(() => [checkedState], [checkedState])

	const handleOnSelectedRow = useCallback(
		(position: number) => {
			setCheckedState([
				...checkedState.map((_, index) => (index === position ? !checkedState[position] : false)),
			])
		},
		[checkedState]
	)

	const onInputChange = useCallback((text: string) => {
		setdelegatedAddress(text.toLowerCase().trim())
	}, [])

	const handleApproveOperator = useCallback(
		(delegatedAddress: string, action: DelegateActions) => {
			setDelegateAction(action)
			dispatch(
				approveOperator({ delegatedAddress, isApproval: action === 'approve' ? true : false })
			)
			// TODO: Only for testing
			if (action === 'approve') {
				setData((oldData) => [
					...oldData,
					{
						address: delegatedAddress,
					},
				])
				setCheckedState((prevCheckedState) => [...prevCheckedState, false])
			} else {
				const index = data.findIndex((item) => item.address === delegatedAddress)
				setData((data) => data.filter((_) => _.address !== delegatedAddress))
				setCheckedState((prevCheckedState) => {
					const newCheckedState = [...prevCheckedState]
					newCheckedState.splice(index, 1)
					return newCheckedState
				})
			}
			setCheckedState((data) => data.map((_) => false))
		},
		[data, dispatch]
	)

	return (
		<DelegationContainer>
			<CardGridContainer>
				<FlexDivCol rowGap="5px">
					<StyledHeading variant="h4">{t('dashboard.stake.tabs.delegate.title')}</StyledHeading>
					<Body color="secondary">{t('dashboard.stake.tabs.delegate.copy')}</Body>
				</FlexDivCol>
				<FlexDivCol rowGap="10px" style={{ marginBottom: '10px' }}>
					<Body color="secondary">{t('dashboard.stake.tabs.delegate.address')}</Body>
					<InputBarContainer>
						<InputBar>
							<AddressInput
								autoFocus={true}
								value={delegatedAddress}
								onChange={(e) => onInputChange(e.target.value)}
								placeholder="Type the address..."
							/>
						</InputBar>
					</InputBarContainer>
				</FlexDivCol>
				<Button
					fullWidth
					variant="flat"
					size="small"
					loading={isApprovingOperator && delegateAction === 'approve'}
					disabled={delegatedAddress.length !== 42}
					onClick={() => handleApproveOperator(delegatedAddress, 'approve')}
				>
					{t('dashboard.stake.tabs.delegate.title')}
				</Button>
			</CardGridContainer>
			<CardGridContainer>
				<FlexDivCol rowGap="5px">
					<StyledHeading variant="h4">{t('dashboard.stake.tabs.delegate.manage')}</StyledHeading>
					<Body color="secondary">{t('dashboard.stake.tabs.delegate.manage-copy')}</Body>
				</FlexDivCol>
				<TableContainer>
					<StyledTable
						data={data}
						showPagination
						highlightRowsOnHover
						compactPagination
						pageSize={3}
						onTableRowClick={(row) => handleOnSelectedRow(row.index)}
						columnsDeps={columnsDeps}
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
										onChange={() => {}}
										label=""
										variant="table"
										checkSide="left"
									/>
								),
								accessorKey: 'selected',
								size: 10,
								enableSorting: false,
							},
							{
								header: () => (
									<TableHeader>{t('dashboard.stake.tabs.delegate.address')}</TableHeader>
								),
								accessorKey: 'delegatedAddress',
								size: 360,
								enableSorting: false,
								cell: (cellProps) => <TableCell>{cellProps.row.original.address}</TableCell>,
							},
						]}
					/>
				</TableContainer>
				<FlexDivRow justifyContent="flex-start" columnGap="10px">
					<Button
						variant="yellow"
						size="small"
						textTransform="uppercase"
						isRounded
						loading={isApprovingOperator && delegateAction === 'revoke'}
						disabled={checkedState.every((checked) => !checked)}
						onClick={() => {
							handleApproveOperator(data.filter((_, i) => !!checkedState[i])[0].address, 'revoke')
						}}
					>
						{t('dashboard.stake.tabs.delegate.revoke')}
					</Button>
				</FlexDivRow>
			</CardGridContainer>
		</DelegationContainer>
	)
}

const DelegationContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	column-gap: 15px;

	${media.lessThan('lg')`
		display: grid;
		grid-template-columns: 1fr;
		row-gap: 25px;
	`}
`

const AddressInput = styled(Input)`
	position: relative;
	height: 38px;
	border-radius: 8px;
	padding: 10px 0px;
	font-size: 14px;
	background: ${(props) => props.theme.colors.selectedTheme.input.background};
	border: none;

	${media.lessThan('sm')`
		font-size: 13px;
	`}
`

const InputBar = styled.div`
	width: 100%;
	overflow-x: auto;
	position: relative;
	display: flex;
	align-items: center;
	padding-left: 18px;
	background: ${(props) => props.theme.colors.selectedTheme.input.background};
	border-radius: 8px;
	border: ${(props) => props.theme.colors.selectedTheme.input.border};
`

const InputBarContainer = styled.div`
	display: flex;
	height: 100%;
	width: 100%;
`

const TableContainer = styled.div`
	${media.lessThan('sm')`
		max-width: 310px;
	`}
`

const mobileTableStyle = css`
	${media.lessThan('sm')`
		font-size: 11px;
		&:first-child {
			padding-left: 10px;
		}
		&:last-child {
			padding-left: 4px;
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
		font-family: ${(props) => props.theme.fonts.regular};
		color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
		height: 16px;
		${mobileTableStyle}
	}

	${TableCellHead} {
		padding-left: 18px;
		height: 28px;
		${mobileTableStyle}
	}
` as typeof Table

const StyledHeading = styled(Heading)`
	font-weight: 400;
`

const CardGridContainer = styled(FlexDivCol)`
	background: ${(props) => props.theme.colors.selectedTheme.newTheme.containers.cards.background};
	padding: 25px;
	border-radius: 15px;
	border: 1px solid ${(props) => props.theme.colors.selectedTheme.newTheme.border.color};
	justify-content: space-between;
	row-gap: 25px;
	${media.lessThan('lg')`
		justify-content: flex-start;
	`}
`

export default DelegationTab
