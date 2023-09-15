import { formatDollars, formatNumber } from '@kwenta/sdk/utils'
import { FC, memo, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import CopyCheckIcon from 'assets/svg/referrals/copy-check.svg'
import Button from 'components/Button'
import { FlexDivCol, FlexDivRowCentered } from 'components/layout/flex'
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'
import Table from 'components/Table'
import { TableHeader } from 'components/Table'
import { Body } from 'components/Text'
import { PROD_HOSTNAME } from 'constants/links'
import useIsL2 from 'hooks/useIsL2'
import { setOpenModal } from 'state/app/reducer'
import { selectShowModal } from 'state/app/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { selectIsCreatingReferralCode } from 'state/referrals/selectors'
import { selectWallet } from 'state/wallet/selectors'
import media from 'styles/media'

import { referralGridLayoutTable } from './constants'
import CreateReferralCodeModal from './CreateReferralCodeModal'
import { ReferralTableNoResults } from './ReferralTableNoResults'
import { ReferralsRewardsPerCode } from './types'

type ReferralCodesProps = {
	data: ReferralsRewardsPerCode[]
}
const ReferralCodes: FC<ReferralCodesProps> = memo(({ data }) => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const wallet = useAppSelector(selectWallet)
	const isL2 = useIsL2()
	const isCreatingCode = useAppSelector(selectIsCreatingReferralCode)
	const [copiedStatus, setCopiedStatus] = useState<boolean>(false)
	const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null)
	const openModal = useAppSelector(selectShowModal)

	const referralCodesTableProps = useMemo(
		() => ({
			data,
			compactPagination: true,
			pageSize: 4,
			showPagination: true,
			columnsDeps: [wallet, isCreatingCode, isL2],
			noResultsMessage: <ReferralTableNoResults />,
		}),
		[data, isCreatingCode, isL2, wallet]
	)

	const handleOpenModal = useCallback(() => {
		dispatch(setOpenModal('referrals_create_referral_code'))
	}, [dispatch])

	const handleDismissModal = useCallback(() => {
		dispatch(setOpenModal(null))
	}, [dispatch])

	const handleCopyToClipboard = useCallback((text: string, event: React.MouseEvent) => {
		const x = event.clientX
		const y = event.clientY
		const { protocol, hostname, port } = window.location
		const fullUrl = `${protocol}//${
			process.env.NEXT_PUBLIC_REF_URL_OVERRIDE === 'true' ? PROD_HOSTNAME : hostname
		}${port ? `:${port}` : ``}/?ref=${text}`

		navigator.clipboard.writeText(fullUrl).then(() => {
			setCopiedStatus(true)
			setTooltipPosition({ x, y })

			setTimeout(() => {
				setCopiedStatus(false)
				setTooltipPosition(null)
			}, 1000)
		})
	}, [])

	return (
		<TableContainer>
			<DesktopOnlyView>
				<StyledTable
					{...referralCodesTableProps}
					columns={[
						{
							header: () => (
								<StyledTableHeader>
									<FlexDivCol>
										<Body size="large">{t('referrals.table.codes.title')}</Body>
										<Body color="secondary" capitalized={false}>
											{t('referrals.table.codes.copy')}
										</Body>
									</FlexDivCol>
									<Button
										variant="yellow"
										isRounded
										size="xsmall"
										onClick={handleOpenModal}
										loading={isCreatingCode}
										disabled={!wallet || !isL2}
									>
										{t('referrals.table.codes.create-code-button')}
									</Button>
								</StyledTableHeader>
							),
							accessorKey: 'title',
							enableSorting: false,
							columns: [
								{
									header: () => (
										<TableHeader>{t('referrals.table.header.referral-code')}</TableHeader>
									),
									cell: (cellProps) => {
										return (
											<TableCell>
												<FlexDivRowCentered columnGap="5px">
													{cellProps.getValue()}
													<StyledCopyCheckIcon
														onClick={(event: React.MouseEvent) =>
															handleCopyToClipboard(cellProps.getValue(), event)
														}
													/>
												</FlexDivRowCentered>
											</TableCell>
										)
									},
									accessorKey: 'code',
								},
								{
									header: () => (
										<TableHeader>{t('referrals.table.header.total-volume')}</TableHeader>
									),
									cell: (cellProps) => (
										<TableCell>{formatDollars(cellProps.getValue(), { maxDecimals: 2 })}</TableCell>
									),
									accessorKey: 'referralVolume',
								},
								{
									header: () => (
										<TableHeader>{t('referrals.table.header.traders-referred')}</TableHeader>
									),
									cell: (cellProps) => (
										<TableCell paddingLeft="2px">{cellProps.getValue()}</TableCell>
									),
									accessorKey: 'referredCount',
								},
								{
									header: () => (
										<TableHeader>{t('referrals.table.header.kwenta-earned')}</TableHeader>
									),
									cell: (cellProps) => (
										<TableCell paddingLeft="2px">
											{formatNumber(cellProps.getValue(), { maxDecimals: 2 })}
										</TableCell>
									),
									accessorKey: 'earnedRewards',
								},
							],
						},
					]}
				/>
			</DesktopOnlyView>
			<MobileOrTabletView>
				<StyledTable
					{...referralCodesTableProps}
					gridLayout={referralGridLayoutTable}
					columns={[
						{
							header: () => (
								<StyledTableHeader>
									<FlexDivCol>
										<Body size="large">{t('referrals.table.codes.title')}</Body>
									</FlexDivCol>
									<Button
										variant="yellow"
										isRounded
										size="xsmall"
										onClick={handleOpenModal}
										loading={isCreatingCode}
										disabled={!wallet || !isL2}
									>
										{t('referrals.table.codes.create-code-button')}
									</Button>
								</StyledTableHeader>
							),
							accessorKey: 'title',
							enableSorting: false,
							columns: [
								{
									header: () => null,
									cell: (cellProps) => (
										<TableCell>
											<Body color="secondary">{t('referrals.table.header.referral-code')}</Body>
											<FlexDivRowCentered columnGap="5px">
												<Body>{cellProps.getValue()}</Body>
												<StyledCopyCheckIcon
													onClick={(event: React.MouseEvent) =>
														handleCopyToClipboard(cellProps.getValue(), event)
													}
												/>
											</FlexDivRowCentered>
										</TableCell>
									),
									accessorKey: 'code',
								},
								{
									header: () => null,
									cell: (cellProps) => (
										<TableCell>
											<Body color="secondary">{t('referrals.table.header.total-volume')}</Body>
											<Body>{formatDollars(cellProps.getValue(), { maxDecimals: 2 })}</Body>
										</TableCell>
									),
									accessorKey: 'referralVolume',
								},
								{
									header: () => null,
									cell: (cellProps) => (
										<TableCell>
											<Body color="secondary">{t('referrals.table.header.traders-referred')}</Body>
											<Body>{cellProps.getValue()}</Body>
										</TableCell>
									),
									accessorKey: 'referredCount',
								},
								{
									header: () => null,
									cell: (cellProps) => (
										<TableCell>
											<Body color="secondary">{t('referrals.table.header.kwenta-earned')}</Body>
											<Body>{formatNumber(cellProps.getValue(), { maxDecimals: 2 })}</Body>
										</TableCell>
									),
									accessorKey: 'earnedRewards',
								},
							],
						},
					]}
				/>
			</MobileOrTabletView>
			{openModal === 'referrals_create_referral_code' && (
				<CreateReferralCodeModal onDismiss={handleDismissModal} />
			)}
			{copiedStatus && tooltipPosition && (
				<div>
					<StyledTooltip
						top={`${tooltipPosition.y + 10}px`}
						left={`${tooltipPosition.x + 10}px`}
						padding="5px"
						borderRadius="8px"
					>
						<Body>Code Copied!</Body>
					</StyledTooltip>
				</div>
			)}
		</TableContainer>
	)
})

const StyledCopyCheckIcon = styled(CopyCheckIcon)`
	cursor: pointer;
`

const StyledTooltip = styled.div<{
	top?: string
	left?: string
	padding?: string
	borderRadius?: string
}>`
	position: fixed;
	top: ${(props) => props.top};
	left: ${(props) => props.left};
	padding: ${(props) => props.padding};
	border-radius: ${(props) => props.borderRadius};
	background: ${(props) => props.theme.colors.selectedTheme.button.fill};
	border: ${(props) => props.theme.colors.selectedTheme.border};
	box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
	transition: opacity 0.3s;
	opacity: 1;
`

const TableContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	margin: 30px 0 60px;
	background: transparent;
	border: none;
`

const StyledTable = styled(Table)`
	border-bottom-left-radius: 0;
	border-bottom-right-radius: 0;
	border-radius: 15px;
	.table-row:first-of-type div:first-child {
		padding: 12.5px 9px;
		height: 100%;
	}

	${media.lessThan('lg')`
		.table-row > div:first-child {
			width: auto !important;
		}
		.table-row:nth-child(2) {
			display: none;
		}
		.table-row:first-of-type div:first-child {
			padding-left: 12.5px;
		}
	`}
` as typeof Table

const TableCell = styled.div<{ $regular?: boolean; paddingLeft?: string }>`
	font-size: 13px;
	font-family: ${(props) => props.theme.fonts[props.$regular ? 'regular' : 'mono']};
	color: ${(props) => props.color || props.theme.colors.selectedTheme.button.text.primary};
	display: flex;
	flex-direction: column;
	padding-left: ${(props) => props.paddingLeft || 'initial'};
`

const StyledTableHeader = styled(TableHeader)`
	width: 100%;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	padding-right: 9px;
	text-transform: none;
`

export default ReferralCodes
