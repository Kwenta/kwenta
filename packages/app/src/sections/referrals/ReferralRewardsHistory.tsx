import { formatDollars, formatNumber } from '@kwenta/sdk/utils'
import { FC, memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'
import Table from 'components/Table'
import { TableHeader } from 'components/Table'
import { Body } from 'components/Text'
import media from 'styles/media'

import { referralGridLayoutTable } from './constants'
import { ReferralTableNoResults } from './ReferralTableNoResults'
import { ReferralsRewardsPerEpoch } from './types'

type ReferralRewardsHistoryProps = {
	data: ReferralsRewardsPerEpoch[]
}

const ReferralRewardsHistory: FC<ReferralRewardsHistoryProps> = memo(({ data }) => {
	const { t } = useTranslation()

	const rewardsHistoryTableProps = useMemo(
		() => ({
			data,
			compactPagination: true,
			pageSize: 4,
			showPagination: true,
			noResultsMessage: <ReferralTableNoResults />,
		}),
		[data]
	)

	return (
		<TableContainer>
			<DesktopOnlyView>
				<StyledTable
					{...rewardsHistoryTableProps}
					columns={[
						{
							header: () => (
								<StyledTableHeader>
									<Body size="large">{t('referrals.table.history.title')}</Body>
									<Body color="secondary" capitalized={false}>
										{t('referrals.table.history.copy')}
									</Body>
								</StyledTableHeader>
							),
							accessorKey: 'title',
							enableSorting: false,
							columns: [
								{
									header: () => <TableHeader>{t('referrals.table.header.epoch')}</TableHeader>,
									cell: (cellProps) => <TableCell>{cellProps.getValue()}</TableCell>,
									accessorKey: 'epoch',
								},
								{
									header: () => (
										<TableHeader>{t('referrals.table.header.total-volume')}</TableHeader>
									),
									cell: (cellProps) => (
										<TableCell>
											{formatDollars(Number(cellProps.getValue()), { maxDecimals: 2 })}
										</TableCell>
									),
									accessorKey: 'referralVolume',
								},
								{
									header: () => (
										<TableHeader>{t('referrals.table.header.traders-referred')}</TableHeader>
									),
									cell: (cellProps) => (
										<TableCell paddingLeft="4px">{cellProps.getValue()}</TableCell>
									),
									accessorKey: 'referredCount',
								},
								{
									header: () => (
										<TableHeader>{t('referrals.table.header.kwenta-earned')}</TableHeader>
									),
									cell: (cellProps) => (
										<TableCell paddingLeft="4px">
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
					{...rewardsHistoryTableProps}
					gridLayout={referralGridLayoutTable}
					columns={[
						{
							header: () => (
								<StyledTableHeader>
									<Body size="large">{t('referrals.table.history.title')}</Body>
								</StyledTableHeader>
							),
							accessorKey: 'title',
							enableSorting: false,
							columns: [
								{
									header: () => null,
									cell: (cellProps) => (
										<TableCell>
											<Body color="secondary">{t('referrals.table.header.epoch')}</Body>
											<Body>{cellProps.getValue()}</Body>
										</TableCell>
									),
									accessorKey: 'epoch',
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
		</TableContainer>
	)
})

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
		padding: 25px 18px;
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
			padding-left: 25px;
		}
	`}
` as typeof Table

const TableCell = styled.div<{ $regular?: boolean; paddingLeft?: string }>`
	font-size: 13px;
	font-family: ${(props) => props.theme.fonts[props.$regular ? 'regular' : 'mono']};
	color: ${(props) => props.color || props.theme.colors.selectedTheme.button.text.primary};
	display: flex;
	flex-direction: column;
	padding-left: ${(props) => props.paddingLeft || 'auto'};
`

const StyledTableHeader = styled(TableHeader)`
	text-transform: none;
`

export default ReferralRewardsHistory
