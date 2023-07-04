import { formatCryptoCurrency, formatDollars } from '@kwenta/sdk/utils'
import { useRouter } from 'next/router'
import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import LinkIcon from 'assets/svg/app/link-blue.svg'
import ColoredPrice from 'components/ColoredPrice'
import { GridDivCenteredRow } from 'components/layout/grid'
import Table, { TableHeader, TableNoResults } from 'components/Table'
import { ETH_UNIT } from 'constants/network'
import ROUTES from 'constants/routes'
import { blockExplorer } from 'containers/Connector/Connector'
import useIsL2 from 'hooks/useIsL2'
import useNetworkSwitcher from 'hooks/useNetworkSwitcher'
import PositionType from 'sections/futures/PositionType'
import {
	selectAllTradesForAccountType,
	selectFuturesType,
	selectMarketAsset,
	selectQueryStatuses,
} from 'state/futures/selectors'
import { useAppSelector } from 'state/hooks'
import { FetchStatus } from 'state/types'
import { ExternalLink } from 'styles/common'

import { TradeStatus } from '../types'
import TableMarketDetails from '../UserInfo/TableMarketDetails'

import TimeDisplay from './TimeDisplay'

const Trades = memo(() => {
	const { t } = useTranslation()
	const { switchToL2 } = useNetworkSwitcher()
	const router = useRouter()

	const marketAsset = useAppSelector(selectMarketAsset)
	const accountType = useAppSelector(selectFuturesType)
	const history = useAppSelector(selectAllTradesForAccountType)
	const { trades } = useAppSelector(selectQueryStatuses)

	const isLoading = !history.length && trades.status === FetchStatus.Loading
	const isLoaded = trades.status === FetchStatus.Success

	const isL2 = useIsL2()

	const historyData = useMemo(() => {
		return history.map((trade) => {
			const pnl = trade?.pnl.div(ETH_UNIT)
			const feesPaid = trade?.feesPaid.div(ETH_UNIT)
			const netPnl = pnl.sub(feesPaid)
			return {
				...trade,
				pnl,
				feesPaid,
				netPnl,
				value: Number(trade?.price?.div(ETH_UNIT)),
				amount: Number(trade?.size.div(ETH_UNIT).abs()),
				time: trade?.timestamp * 1000,
				id: trade?.txnHash,
				asset: marketAsset,
				type: trade?.orderType,
				status: trade?.positionClosed ? TradeStatus.CLOSED : TradeStatus.OPEN,
			}
		})
	}, [history, marketAsset])

	const columnsDeps = useMemo(() => [historyData], [historyData])

	return (
		<Table
			highlightRowsOnHover
			rounded={false}
			noBottom={true}
			columns={[
				{
					header: () => (
						<TableHeader>{t('dashboard.overview.futures-positions-table.market')}</TableHeader>
					),
					accessorKey: 'market',
					cell: (cellProps) => {
						return (
							<MarketDetailsContainer
								onClick={() =>
									cellProps.row.original.market
										? router.push(
												ROUTES.Markets.MarketPair(cellProps.row.original.market.asset, accountType)
										  )
										: undefined
								}
							>
								{cellProps.row.original.market ? (
									<TableMarketDetails
										marketName={cellProps.row.original.market?.marketName}
										marketKey={cellProps.row.original.market?.marketKey}
									/>
								) : (
									'-'
								)}
							</MarketDetailsContainer>
						)
					},
					size: 100,
				},
				{
					header: () => <TableHeader>{t('futures.market.user.trades.table.date')}</TableHeader>,
					accessorKey: 'time',
					cell: (cellProps) => (
						<GridDivCenteredRow>
							<TimeDisplay value={cellProps.getValue()} />
						</GridDivCenteredRow>
					),
					size: 90,
					enableSorting: true,
				},
				{
					header: () => <TableHeader>{t('futures.market.user.trades.table.side')}</TableHeader>,
					accessorKey: 'side',
					sortingFn: 'basic',
					cell: (cellProps) => <PositionType side={cellProps.getValue()} />,
					size: 60,
					enableSorting: true,
				},
				{
					header: () => <TableHeader>{t('futures.market.user.trades.table.price')}</TableHeader>,
					accessorKey: 'value',
					sortingFn: 'basic',
					cell: (cellProps) => {
						return <>{formatDollars(cellProps.getValue(), { suggestDecimals: true })}</>
					},
					size: 90,
					enableSorting: true,
				},
				{
					header: () => (
						<TableHeader>{t('futures.market.user.trades.table.trade-size')}</TableHeader>
					),
					accessorKey: 'amount',
					sortingFn: 'basic',
					cell: (cellProps) => (
						<>{formatCryptoCurrency(cellProps.getValue(), { suggestDecimals: true })}</>
					),
					size: 90,
					enableSorting: true,
				},
				{
					header: () => <TableHeader>{t('futures.market.user.trades.table.pnl')}</TableHeader>,
					accessorKey: 'netPnl',
					sortingFn: 'basic',
					cell: (cellProps) => {
						return cellProps.getValue().eq(0) ? (
							'--'
						) : (
							<ColoredPrice
								priceInfo={{
									price: cellProps.getValue(),
									change: cellProps.getValue().gt(0) ? 'up' : 'down',
								}}
							>
								{formatDollars(cellProps.getValue(), { maxDecimals: 2 })}
							</ColoredPrice>
						)
					},
					size: 90,
					enableSorting: true,
				},
				{
					header: () => <TableHeader>{t('futures.market.user.trades.table.fees')}</TableHeader>,
					sortingFn: 'basic',
					accessorKey: 'feesPaid',
					cell: (cellProps) => (
						<>{cellProps.getValue().eq(0) ? '--' : formatDollars(cellProps.getValue())}</>
					),
					size: 90,
					enableSorting: true,
				},
				{
					header: () => (
						<TableHeader>{t('futures.market.user.trades.table.order-type')}</TableHeader>
					),
					accessorKey: 'type',
					sortingFn: 'basic',
					cell: (cellProps) => <>{cellProps.getValue()}</>,
					size: 100,
				},
				{
					accessorKey: 'txnHash',
					cell: (cellProps) => (
						<StyledExternalLink href={blockExplorer.txLink(cellProps.getValue())}>
							<StyledLinkIcon />
						</StyledExternalLink>
					),
					size: 25,
					enableSorting: false,
				},
			]}
			columnsDeps={columnsDeps}
			data={historyData}
			isLoading={isLoading && isLoaded}
			noResultsMessage={
				!isL2 ? (
					<TableNoResults>
						{t('common.l2-cta')}
						<div onClick={switchToL2}>{t('homepage.l2.cta-buttons.switch-l2')}</div>
					</TableNoResults>
				) : isLoaded && historyData?.length === 0 ? (
					<TableNoResults>{t('futures.market.user.trades.table.no-results')}</TableNoResults>
				) : undefined
			}
		/>
	)
})

export default Trades

const StyledExternalLink = styled(ExternalLink)`
	padding: 10px;
	&:hover {
		svg {
			path {
				fill: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
			}
		}
	}
`

const StyledLinkIcon = styled(LinkIcon)`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	width: 14px;
	height: 14px;

	path {
		fill: ${(props) => props.theme.colors.selectedTheme.gray};
	}
`

const MarketDetailsContainer = styled.div`
	cursor: pointer;
`
