import { FuturesAccountType } from '@kwenta/sdk/utils'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CellProps } from 'react-table'
import styled from 'styled-components'

import ChangePercent from 'components/ChangePercent'
import Currency from 'components/Currency'
import { FlexDivRowCentered } from 'components/layout/flex'
import MarketBadge from 'components/MarketBadge'
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'
import Table, { TableNoResults } from 'components/Table'
import { Body, NumericValue } from 'components/Text'
import { NO_VALUE } from 'constants/placeholder'
import ROUTES from 'constants/routes'
import useIsL2 from 'hooks/useIsL2'
import useNetworkSwitcher from 'hooks/useNetworkSwitcher'
import PositionType from 'sections/futures/PositionType'
import {
	selectCrossMarginPositions,
	selectIsolatedMarginPositions,
	selectMarkets,
	selectPositionHistory,
} from 'state/futures/selectors'
import { useAppSelector } from 'state/hooks'
import { getSynthDescription } from 'utils/futures'

import MobilePositionRow from './MobilePositionRow'

type FuturesPositionTableProps = {
	accountType: FuturesAccountType
	showCurrentMarket?: boolean
	showEmptyTable?: boolean
}

const FuturesPositionsTable: FC<FuturesPositionTableProps> = ({
	accountType,
	showCurrentMarket = true,
	showEmptyTable = true,
}) => {
	const { t } = useTranslation()
	const router = useRouter()
	const { switchToL2 } = useNetworkSwitcher()

	const isL2 = useIsL2()

	const isolatedPositions = useAppSelector(selectIsolatedMarginPositions)
	const crossMarginPositions = useAppSelector(selectCrossMarginPositions)
	const positionHistory = useAppSelector(selectPositionHistory)
	const futuresMarkets = useAppSelector(selectMarkets)

	let data = useMemo(() => {
		const positions = accountType === 'cross_margin' ? crossMarginPositions : isolatedPositions
		return positions
			.map((position) => {
				const market = futuresMarkets.find((market) => market.asset === position.asset)
				const description = getSynthDescription(position.asset, t)
				const thisPositionHistory = positionHistory.find((ph) => {
					return ph.isOpen && ph.asset === position.asset
				})

				return {
					market: market!,
					position: position.position!,
					description,
					avgEntryPrice: thisPositionHistory?.avgEntryPrice,
					stopLoss: position.stopLoss?.targetPrice,
					takeProfit: position.takeProfit?.targetPrice,
				}
			})
			.filter(({ position, market }) => !!position && !!market)
	}, [accountType, isolatedPositions, crossMarginPositions, futuresMarkets, t, positionHistory])

	return (
		<>
			<DesktopOnlyView>
				<div>
					<Table
						data={data}
						hiddenColumns={accountType === 'isolated_margin' ? ['tp-sl'] : []}
						onTableRowClick={(row) =>
							router.push(ROUTES.Markets.MarketPair(row.original.market.asset, accountType))
						}
						noResultsMessage={
							!isL2 ? (
								<TableNoResults>
									{t('common.l2-cta')}
									<div onClick={switchToL2}>{t('homepage.l2.cta-buttons.switch-l2')}</div>
								</TableNoResults>
							) : (
								<TableNoResults>
									{!showCurrentMarket ? (
										t('dashboard.overview.futures-positions-table.no-result')
									) : (
										<Link href={ROUTES.Markets.Home('cross_margin')}>
											<div>{t('common.perp-cta')}</div>
										</Link>
									)}
								</TableNoResults>
							)
						}
						highlightRowsOnHover
						columns={[
							{
								Header: (
									<TableHeader>
										{t('dashboard.overview.futures-positions-table.market')}
									</TableHeader>
								),
								accessor: 'market',
								// @ts-expect-error
								Cell: (cellProps: CellProps<any>) => {
									return (
										<MarketContainer>
											<IconContainer>
												<StyledCurrencyIcon currencyKey={cellProps.row.original.market.marketKey} />
											</IconContainer>
											<StyledText>
												{cellProps.row.original.market.marketName}
												<MarketBadge
													currencyKey={cellProps.row.original.market.marketKey}
													isFuturesMarketClosed={cellProps.row.original.market.isSuspended}
													futuresClosureReason={cellProps.row.original.market.marketClosureReason}
												/>
											</StyledText>
											<StyledValue>{cellProps.row.original.description}</StyledValue>
										</MarketContainer>
									)
								},
								width: 180,
							},
							{
								Header: (
									<TableHeader>{t('dashboard.overview.futures-positions-table.side')}</TableHeader>
								),
								accessor: 'position',
								// @ts-expect-error
								Cell: (cellProps: CellProps<any>) => {
									return <PositionType side={cellProps.row.original.position.side} />
								},
								width: 70,
							},
							{
								Header: (
									<TableHeader>
										{t('dashboard.overview.futures-positions-table.notionalValue')}
									</TableHeader>
								),
								accessor: 'notionalValue',
								// @ts-expect-error
								Cell: (cellProps: CellProps<any>) => {
									return (
										<Currency.Price
											price={cellProps.row.original.position.notionalValue}
											formatOptions={{ truncateOver: 1e6 }}
										/>
									)
								},
								width: 90,
							},
							{
								Header: (
									<TableHeader>
										{t('dashboard.overview.futures-positions-table.avg-entry')}
									</TableHeader>
								),
								accessor: 'avgEntryPrice',
								// @ts-expect-error
								Cell: (cellProps: CellProps<any>) => {
									const formatOptions = {
										suggestDecimals: true,
									}
									return cellProps.row.original.avgEntryPrice === undefined ? (
										<Body>{NO_VALUE}</Body>
									) : (
										<Currency.Price
											price={cellProps.row.original.avgEntryPrice}
											formatOptions={formatOptions}
										/>
									)
								},
								width: 125,
							},
							{
								Header: (
									<TableHeader>
										{t('dashboard.overview.futures-positions-table.liquidationPrice')}
									</TableHeader>
								),
								accessor: 'liquidationPrice',
								// @ts-expect-error
								Cell: (cellProps: CellProps<any>) => {
									const formatOptions = {
										suggestDecimals: true,
									}
									return (
										<Currency.Price
											price={cellProps.row.original.position.liquidationPrice}
											formatOptions={formatOptions}
										/>
									)
								},
								width: 115,
							},
							{
								Header: (
									<TableHeader>{t('dashboard.overview.futures-positions-table.pnl')}</TableHeader>
								),
								accessor: 'pnl',
								// @ts-expect-error
								Cell: (cellProps: CellProps<any>) => {
									return (
										<PnlContainer>
											<ChangePercent value={cellProps.row.original.position.pnlPct} />
											<div>
												<Currency.Price price={cellProps.row.original.position.pnl} colored />
											</div>
										</PnlContainer>
									)
								},
								width: 125,
							},
							{
								Header: <TableHeader>TP/SL</TableHeader>,
								accessor: 'tp-sl',
								// @ts-expect-error
								Cell: (cellProps: CellProps<(typeof data)[number]>) => {
									return (
										<FlexDivRowCentered>
											<div style={{ marginRight: 10 }}>
												{cellProps.row.original.takeProfit === undefined ? (
													<Body>{NO_VALUE}</Body>
												) : (
													<div>
														<Currency.Price
															price={cellProps.row.original.takeProfit}
															formatOptions={{ suggestDecimals: true }}
														/>
													</div>
												)}
												{cellProps.row.original.stopLoss === undefined ? (
													<Body>{NO_VALUE}</Body>
												) : (
													<div>
														<Currency.Price
															price={cellProps.row.original.stopLoss}
															formatOptions={{ suggestDecimals: true }}
														/>
													</div>
												)}
											</div>
										</FlexDivRowCentered>
									)
								},
								width: 90,
							},
							{
								Header: <TableHeader>Market Margin</TableHeader>,
								accessor: 'margin',
								// @ts-expect-error
								Cell: (cellProps: CellProps<(typeof data)[number]>) => {
									return (
										<FlexDivRowCentered>
											<div style={{ marginRight: 10 }}>
												<NumericValue value={cellProps.row.original.position.initialMargin} />
												<NumericValue
													value={cellProps.row.original.position.leverage}
													color="secondary"
													suffix="x"
												/>
											</div>
										</FlexDivRowCentered>
									)
								},
								width: 115,
							},
						]}
					/>
				</div>
			</DesktopOnlyView>
			<MobileOrTabletView>
				{(showEmptyTable || data.length) && (
					<>
						<OpenPositionsHeader>
							<div>{t('dashboard.overview.futures-positions-table.mobile.market')}</div>
							<OpenPositionsRightHeader>
								<div>{t('dashboard.overview.futures-positions-table.mobile.price')}</div>
								<div>{t('dashboard.overview.futures-positions-table.mobile.pnl')}</div>
							</OpenPositionsRightHeader>
						</OpenPositionsHeader>
						<div style={{ margin: '0 15px' }}>
							{data.length === 0 ? (
								<NoPositionsText>
									<Link href={ROUTES.Markets.Home('cross_margin')}>
										<div>{t('common.perp-cta')}</div>
									</Link>
								</NoPositionsText>
							) : (
								data.map((row) => (
									<MobilePositionRow
										onClick={() =>
											router.push(
												ROUTES.Markets.MarketPair(row.market?.asset ?? 'sETH', accountType)
											)
										}
										key={row.market?.asset}
										row={row}
									/>
								))
							)}
						</div>
					</>
				)}
			</MobileOrTabletView>
		</>
	)
}

const PnlContainer = styled.div`
	display: flex;
	flex-direction: column;
`

const StyledCurrencyIcon = styled(Currency.Icon)`
	width: 30px;
	height: 30px;
	margin-right: 8px;
`

const IconContainer = styled.div`
	grid-column: 1;
	grid-row: 1 / span 2;
`

const StyledValue = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 12px;
	grid-column: 2;
	grid-row: 2;
`

const TableHeader = styled(Body)`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`

const StyledText = styled.div`
	display: flex;
	align-items: center;
	grid-column: 2;
	grid-row: 1;
	margin-bottom: -4px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	font-family: ${(props) => props.theme.fonts.bold};
`

const MarketContainer = styled.div`
	display: grid;
	grid-template-rows: auto auto;
	grid-template-columns: auto auto;
	align-items: center;
`

const OpenPositionsHeader = styled.div`
	display: flex;
	justify-content: space-between;
	margin: 15px 15px 8px;
	padding: 0 10px;

	& > div {
		color: ${(props) => props.theme.colors.selectedTheme.gray};
	}

	& > div:first-child {
		width: 125px;
		margin-right: 30px;
	}
`

const OpenPositionsRightHeader = styled.div`
	display: flex;
	flex: 1;
	justify-content: space-between;
`

const NoPositionsText = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.text.value};
	margin: 20px 0;
	font-size: 16px;
	text-align: center;
	text-decoration: underline;
`

export default FuturesPositionsTable
