import { formatDollars } from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ColoredPrice from 'components/ColoredPrice'
import Table, { TableHeader, TableNoResults } from 'components/Table'
import { Body } from 'components/Text'
import useIsL2 from 'hooks/useIsL2'
import useNetworkSwitcher from 'hooks/useNetworkSwitcher'
import {
	selectFuturesType,
	selectIdleMarginTransfers,
	selectMarketMarginTransfers,
	selectQueryStatuses,
} from 'state/futures/selectors'
import { useAppSelector } from 'state/hooks'
import { FetchStatus } from 'state/types'
import { timePresentation } from 'utils/formatters/date'

const TransfersTab: React.FC = () => {
	const { t } = useTranslation()
	const { switchToL2 } = useNetworkSwitcher()

	const isL2 = useIsL2()
	const accountType = useAppSelector(selectFuturesType)
	const marketMarginTransfers = useAppSelector(selectMarketMarginTransfers)
	const idleMarginTransfers = useAppSelector(selectIdleMarginTransfers)

	const {
		marginTransfers: { status: marginTransfersStatus },
	} = useAppSelector(selectQueryStatuses)

	const columnsDeps = useMemo(
		() => [marketMarginTransfers, idleMarginTransfers, marginTransfersStatus],
		[marketMarginTransfers, idleMarginTransfers, marginTransfersStatus]
	)

	const marginTransfers = useMemo(() => {
		return accountType === 'isolated_margin' ? marketMarginTransfers : idleMarginTransfers
	}, [accountType, idleMarginTransfers, marketMarginTransfers])

	return (
		<div>
			{!isL2 ? (
				<TableNoResults style={{ marginTop: '15px' }}>
					{t('common.l2-cta')}
					<div onClick={switchToL2}>{t('homepage.l2.cta-buttons.switch-l2')}</div>
				</TableNoResults>
			) : marginTransfersStatus === FetchStatus.Success && marginTransfers.length === 0 ? (
				<TableNoResults style={{ marginTop: '15px' }}>
					{t('futures.market.user.transfers.table.no-results')}
				</TableNoResults>
			) : (
				<Table
					rounded={false}
					highlightRowsOnHover
					columns={[
						{
							header: () => (
								<TableHeader>{t('futures.market.user.transfers.table.action')}</TableHeader>
							),
							accessorKey: 'action',
							cell: (cellProps: any) => <ActionCell>{cellProps.value}</ActionCell>,
							size: 50,
						},
						{
							header: () => (
								<TableHeader>{t('futures.market.user.transfers.table.amount')}</TableHeader>
							),
							accessorKey: 'size',
							sortingFn: 'basic',
							cell: (cellProps) => {
								const formatOptions = { minDecimals: 0 }

								return (
									<ColoredPrice
										priceChange={cellProps.row.original.action === 'deposit' ? 'up' : 'down'}
									>
										{cellProps.row.original.action === 'deposit' ? '+' : ''}
										{formatDollars(cellProps.row.original.size, formatOptions)}
									</ColoredPrice>
								)
							},
							enableSorting: true,
							size: 50,
						},
						{
							header: () => (
								<TableHeader>{t('futures.market.user.transfers.table.date')}</TableHeader>
							),
							accessorKey: 'timestamp',
							cell: (cellProps: any) => <Body>{timePresentation(cellProps.value, t)}</Body>,
							size: 50,
						},
					]}
					data={marginTransfers}
					columnsDeps={columnsDeps}
					isLoading={marginTransfers.length === 0 && marginTransfersStatus === FetchStatus.Loading}
				/>
			)}
		</div>
	)
}

const ActionCell = styled(Body)`
	text-transform: capitalize;
`

export default TransfersTab
