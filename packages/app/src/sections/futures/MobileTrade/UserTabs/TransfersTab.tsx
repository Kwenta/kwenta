import { FuturesMarginType } from '@kwenta/sdk/types'
import { formatDollars } from '@kwenta/sdk/utils'
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
	selectMarketMarginTransfers,
	selectQueryStatuses,
} from 'state/futures/selectors'
import { selectIdleMarginTransfers } from 'state/futures/smartMargin/selectors'
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

	// TODO: Move to selector
	const marginTransfers = useMemo(() => {
		return accountType === FuturesMarginType.CROSS_MARGIN
			? marketMarginTransfers
			: idleMarginTransfers
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
							Header: <TableHeader>{t('futures.market.user.transfers.table.action')}</TableHeader>,
							accessor: 'action',
							Cell: (cellProps: any) => <ActionCell>{cellProps.value}</ActionCell>,
							width: 50,
						},
						{
							Header: <TableHeader>{t('futures.market.user.transfers.table.amount')}</TableHeader>,
							accessor: 'size',
							sortType: 'basic',
							Cell: (cellProps: any) => {
								const formatOptions = {
									minDecimals: 0,
								}

								return (
									<ColoredPrice
										priceInfo={{
											price: cellProps.row.original.size,
											change: cellProps.row.original.action === 'deposit' ? 'up' : 'down',
										}}
									>
										{cellProps.row.original.action === 'deposit' ? '+' : ''}
										{formatDollars(cellProps.row.original.size, formatOptions)}
									</ColoredPrice>
								)
							},
							sortable: true,
							width: 50,
						},
						{
							Header: <TableHeader>{t('futures.market.user.transfers.table.date')}</TableHeader>,
							accessor: 'timestamp',
							Cell: (cellProps: any) => <Body>{timePresentation(cellProps.value, t)}</Body>,
							width: 50,
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
