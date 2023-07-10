import { FuturesMarginType } from '@kwenta/sdk/types'
import { formatDollars, truncateAddress } from '@kwenta/sdk/utils'
import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ColoredPrice from 'components/ColoredPrice'
import Table, { TableHeader, TableNoResults } from 'components/Table'
import { Body } from 'components/Text'
import { blockExplorer } from 'containers/Connector/Connector'
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
import { ExternalLink } from 'styles/common'
import { timePresentation } from 'utils/formatters/date'

const Transfers: FC = () => {
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
		return accountType === FuturesMarginType.CROSS_MARGIN
			? marketMarginTransfers
			: idleMarginTransfers
	}, [accountType, marketMarginTransfers, idleMarginTransfers])

	return (
		<Table
			highlightRowsOnHover
			rounded={false}
			noBottom={true}
			columns={[
				{
					Header: <TableHeader>{t('futures.market.user.transfers.table.action')}</TableHeader>,
					accessor: 'action',
					Cell: (cellProps) => <ActionCell>{cellProps.value}</ActionCell>,
					width: 50,
				},
				{
					Header: <TableHeader>{t('futures.market.user.transfers.table.amount')}</TableHeader>,
					accessor: 'amount',
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
				{
					Header: <TableHeader>{t('futures.market.user.transfers.table.transaction')}</TableHeader>,
					accessor: 'txHash',
					Cell: (cellProps: any) => {
						return (
							<Body>
								<StyledExternalLink href={blockExplorer.txLink(cellProps.value)}>
									{truncateAddress(cellProps.value)}
								</StyledExternalLink>
							</Body>
						)
					},
					width: 50,
				},
			]}
			data={marginTransfers}
			columnsDeps={columnsDeps}
			isLoading={marginTransfers.length === 0 && marginTransfersStatus === FetchStatus.Loading}
			noResultsMessage={
				!isL2 ? (
					<TableNoResults>
						{t('common.l2-cta')}
						<div onClick={switchToL2}>{t('homepage.l2.cta-buttons.switch-l2')}</div>
					</TableNoResults>
				) : (
					<TableNoResults>{t('futures.market.user.transfers.table.no-results')}</TableNoResults>
				)
			}
		/>
	)
}

export default Transfers

const ActionCell = styled(Body)`
	text-transform: capitalize;
`

const StyledExternalLink = styled(ExternalLink)`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	text-decoration: underline;
	&:hover {
		text-decoration: underline;
	}
`
