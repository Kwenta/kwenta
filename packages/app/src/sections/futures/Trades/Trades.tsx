import { FuturesTrade } from '@kwenta/sdk/types'
import { formatCryptoCurrency, formatDollars } from '@kwenta/sdk/utils'
import { useRouter } from 'next/router'
import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CellProps } from 'react-table'
import styled from 'styled-components'

import LinkIcon from 'assets/svg/app/link-blue.svg'
import ColoredPrice from 'components/ColoredPrice'
import { GridDivCenteredRow } from 'components/layout/grid'
import Table, { TableHeader, TableNoResults } from 'components/Table'
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
			const pnl = trade?.pnl
			const feesPaid = trade?.feesPaid
			const netPnl = pnl.sub(feesPaid)

			return {
				...trade,
				pnl,
				feesPaid,
				netPnl,
				value: Number(trade?.price),
				funding: Number(trade?.fundingAccrued),
				amount: Number(trade?.size),
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
					Header: (
						<TableHeader>{t('dashboard.overview.futures-positions-table.market')}</TableHeader>
					),
					accessor: 'market',
					// @ts-expect-error
					Cell: (cellProps: CellProps<typeof historyData[number]>) => {
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
					width: 100,
				},
				{
					Header: <TableHeader>{t('futures.market.user.trades.table.date')}</TableHeader>,
					accessor: 'time',
					// @ts-expect-error
					Cell: (cellProps: CellProps<FuturesTrade>) => (
						<GridDivCenteredRow>
							<TimeDisplay value={cellProps.value} />
						</GridDivCenteredRow>
					),
					width: 90,
					sortable: true,
				},
				{
					Header: <TableHeader>{t('futures.market.user.trades.table.side')}</TableHeader>,
					accessor: 'side',
					sortType: 'basic',
					// @ts-expect-error
					Cell: (cellProps: CellProps<FuturesTrade>) => <PositionType side={cellProps.value} />,
					width: 60,
					sortable: true,
				},
				{
					Header: <TableHeader>{t('futures.market.user.trades.table.price')}</TableHeader>,
					accessor: 'value',
					sortType: 'basic',
					// @ts-expect-error
					Cell: (cellProps: CellProps<FuturesTrade>) => {
						const formatOptions = {
							suggestDecimals: true,
						}
						return <>{formatDollars(cellProps.value, formatOptions)}</>
					},
					width: 90,
					sortable: true,
				},
				{
					Header: <TableHeader>{t('futures.market.user.trades.table.trade-size')}</TableHeader>,
					accessor: 'amount',
					sortType: 'basic',
					// @ts-expect-error
					Cell: (cellProps: CellProps<FuturesTrade>) => (
						<>{formatCryptoCurrency(cellProps.value, { suggestDecimals: true })}</>
					),
					width: 90,
					sortable: true,
				},
				{
					Header: <TableHeader>{t('futures.market.user.trades.table.pnl')}</TableHeader>,
					accessor: 'netPnl',
					sortType: 'basic',
					// @ts-expect-error
					Cell: (cellProps: CellProps<FuturesTrade>) => {
						const formatOptions = {
							maxDecimals: 2,
						}
						return cellProps.value.eq(0) ? (
							'--'
						) : (
							<ColoredPrice
								priceInfo={{
									price: cellProps.value,
									change: cellProps.value.gt(0) ? 'up' : 'down',
								}}
							>
								{formatDollars(cellProps.value, formatOptions)}
							</ColoredPrice>
						)
					},
					width: 90,
					sortable: true,
				},
				{
					Header: <TableHeader>{t('futures.market.user.trades.table.fees')}</TableHeader>,
					sortType: 'basic',
					accessor: 'feesPaid',
					// @ts-expect-error
					Cell: (cellProps: CellProps<FuturesTrade>) => (
						<>{cellProps.value.eq(0) ? '--' : formatDollars(cellProps.value)}</>
					),
					width: 90,
					sortable: true,
				},
				{
					Header: <TableHeader>{t('futures.market.history.accrued-funding')}</TableHeader>,
					sortType: 'basic',
					accessor: 'funding',
					// @ts-expect-error
					Cell: (cellProps: CellProps<FuturesTrade>) => (
						<ColoredPrice
							priceInfo={{
								price: cellProps.value,
								change: cellProps.value > 0 ? 'up' : 'down',
							}}
						>
							{formatDollars(cellProps.value, { suggestDecimals: true })}
						</ColoredPrice>
					),
					width: 100,
				},
				{
					Header: <TableHeader>{t('futures.market.user.trades.table.order-type')}</TableHeader>,
					accessor: 'type',
					sortType: 'basic',
					// @ts-expect-error
					Cell: (cellProps: CellProps<FuturesTrade>) => <>{cellProps.value}</>,
					width: 100,
				},
				{
					accessor: 'txnHash',
					// @ts-expect-error
					Cell: (cellProps: CellProps<FuturesTrade>) => (
						<StyledExternalLink href={blockExplorer.txLink(cellProps.value)}>
							<StyledLinkIcon />
						</StyledExternalLink>
					),
					width: 25,
					sortable: false,
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
