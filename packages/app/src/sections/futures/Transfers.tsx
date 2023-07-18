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
import { selectFuturesType } from 'state/futures/common/selectors'
import { selectMarketMarginTransfers, selectQueryStatuses } from 'state/futures/selectors'
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
					header: () => (
						<TableHeader>{t('futures.market.user.transfers.table.action')}</TableHeader>
					),
					accessorKey: 'action',
					cell: (cellProps) => <ActionCell>{cellProps.getValue()}</ActionCell>,
					size: 50,
				},
				{
					header: () => (
						<TableHeader>{t('futures.market.user.transfers.table.amount')}</TableHeader>
					),
					accessorKey: 'amount',
					sortingFn: 'basic',
					cell: (cellProps: any) => {
						const formatOptions = {
							minDecimals: 0,
						}

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
					header: () => <TableHeader>{t('futures.market.user.transfers.table.date')}</TableHeader>,
					accessorKey: 'timestamp',
					cell: (cellProps) => <Body>{timePresentation(cellProps.getValue(), t)}</Body>,
					size: 50,
				},
				{
					header: () => (
						<TableHeader>{t('futures.market.user.transfers.table.transaction')}</TableHeader>
					),
					accessorKey: 'txHash',
					cell: (cellProps) => {
						return (
							<Body>
								<StyledExternalLink href={blockExplorer.txLink(cellProps.getValue())}>
									{truncateAddress(cellProps.getValue())}
								</StyledExternalLink>
							</Body>
						)
					},
					size: 50,
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
