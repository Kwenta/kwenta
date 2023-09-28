import { ZERO_WEI } from '@kwenta/sdk/constants'
import { FuturesMarginType } from '@kwenta/sdk/types'
import { formatDollars } from '@kwenta/sdk/utils'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ChangePercent from 'components/ChangePercent'
import ColoredPrice from 'components/ColoredPrice'
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
import { AppFuturesMarginType } from 'state/futures/common/types'
import { selectCrossMarginActivePositions } from 'state/futures/crossMargin/selectors'
import { selectMarkPrices } from 'state/futures/selectors'
import { selectSmartMarginActivePositions } from 'state/futures/smartMargin/selectors'
import { useAppSelector } from 'state/hooks'
import { selectOffchainPricesInfo } from 'state/prices/selectors'
import { getSynthDescription } from 'utils/futures'

import MobilePositionRow from './MobilePositionRow'

type FuturesPositionTableProps = {
	accountType: AppFuturesMarginType
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

	const crossMarginPositions = useAppSelector(selectCrossMarginActivePositions)
	const smartMarginPositions = useAppSelector(selectSmartMarginActivePositions)
	const pricesInfo = useAppSelector(selectOffchainPricesInfo)
	const markPrices = useAppSelector(selectMarkPrices)

	let data = useMemo(() => {
		const positions =
			accountType === FuturesMarginType.SMART_MARGIN ? smartMarginPositions : crossMarginPositions
		return positions.map((position) => {
			const description = getSynthDescription(position.market.asset, t)
			const priceInfo = pricesInfo[position.market.asset]
			const marketPrice = markPrices[position.market.marketKey] ?? ZERO_WEI
			return {
				...position,
				description,
				marketPrice,
				priceInfo,
			}
		})
	}, [accountType, crossMarginPositions, markPrices, pricesInfo, smartMarginPositions, t])

	return (
		<>
			<DesktopOnlyView>
				<div>
					<Table
						data={data}
						columnVisibility={{ 'tp-sl': accountType === FuturesMarginType.SMART_MARGIN }}
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
										<Link href={ROUTES.Markets.Home(FuturesMarginType.SMART_MARGIN)}>
											<div>{t('common.perp-cta')}</div>
										</Link>
									)}
								</TableNoResults>
							)
						}
						highlightRowsOnHover
						columns={[
							{
								header: () => (
									<TableHeader>
										{t('dashboard.overview.futures-positions-table.market')}
									</TableHeader>
								),
								accessorKey: 'market',
								cell: (cellProps) => {
									return (
										<MarketContainer>
											<IconContainer>
												<StyledCurrencyIcon currencyKey={cellProps.row.original.market.marketKey} />
											</IconContainer>
											<CellContainer>
												<StyledText>
													{cellProps.row.original.market.marketName}
													<MarketBadge
														currencyKey={cellProps.row.original.market.marketKey}
														isFuturesMarketClosed={cellProps.row.original.market.isSuspended}
														futuresClosureReason={cellProps.row.original.market.marketClosureReason}
													/>
												</StyledText>
												<StyledValue>
													<ColoredPrice priceChange={cellProps.row.original.priceInfo?.change}>
														{formatDollars(cellProps.row.original.marketPrice, {
															suggestDecimalsForAsset: cellProps.row.original.market.asset,
														})}
													</ColoredPrice>
												</StyledValue>
											</CellContainer>
										</MarketContainer>
									)
								},
								size: 180,
							},
							{
								header: () => (
									<TableHeader>{t('dashboard.overview.futures-positions-table.side')}</TableHeader>
								),
								accessorKey: 'position',
								cell: (cellProps) => {
									return <PositionType side={cellProps.row.original.activePosition.side} />
								},
								size: 70,
							},
							{
								header: () => (
									<TableHeader>
										{t('dashboard.overview.futures-positions-table.notionalValue')}
									</TableHeader>
								),
								accessorKey: 'notionalValue',
								cell: (cellProps) => {
									return (
										<Currency.Price
											price={cellProps.row.original.activePosition.notionalValue}
											formatOptions={{ truncateOver: 1e6 }}
										/>
									)
								},
								size: 90,
							},
							{
								header: () => (
									<TableHeader>
										{t('dashboard.overview.futures-positions-table.avg-entry')}
									</TableHeader>
								),
								accessorKey: 'avgEntryPrice',
								cell: (cellProps) => {
									return cellProps.row.original.activePosition.details?.avgEntryPrice ===
										undefined ? (
										<Body>{NO_VALUE}</Body>
									) : (
										<CellContainer>
											<Currency.Price
												price={cellProps.row.original.activePosition.details?.avgEntryPrice}
												formatOptions={{ suggestDecimals: true }}
											/>
											<Currency.Price
												price={cellProps.row.original.activePosition.liquidationPrice}
												formatOptions={{ suggestDecimals: true }}
												colorType="preview"
											/>
										</CellContainer>
									)
								},
								size: 125,
							},
							{
								header: () => (
									<TableHeader>{t('dashboard.overview.futures-positions-table.pnl')}</TableHeader>
								),
								accessorKey: 'pnl',
								cell: (cellProps) => {
									return (
										<CellContainer>
											<ChangePercent value={cellProps.row.original.activePosition.pnlPct} />
											<div>
												<Currency.Price price={cellProps.row.original.activePosition.pnl} colored />
											</div>
										</CellContainer>
									)
								},
								size: 125,
							},
							{
								header: () => <TableHeader>TP/SL</TableHeader>,
								accessorKey: 'tp-sl',
								cell: (cellProps) => {
									return (
										<FlexDivRowCentered>
											<div style={{ marginRight: 10 }}>
												{cellProps.row.original.takeProfit === undefined ? (
													<Body>{NO_VALUE}</Body>
												) : (
													<div>
														<Currency.Price
															price={cellProps.row.original.takeProfit.targetPrice}
															formatOptions={{ suggestDecimals: true }}
														/>
													</div>
												)}
												{cellProps.row.original.stopLoss === undefined ? (
													<Body>{NO_VALUE}</Body>
												) : (
													<div>
														<Currency.Price
															price={cellProps.row.original.stopLoss.targetPrice}
															formatOptions={{ suggestDecimals: true }}
														/>
													</div>
												)}
											</div>
										</FlexDivRowCentered>
									)
								},
								size: 90,
							},
							{
								header: () => <TableHeader>Market Margin</TableHeader>,
								accessorKey: 'margin',
								cell: (cellProps) => {
									return (
										<FlexDivRowCentered>
											<div style={{ marginRight: 10 }}>
												<NumericValue value={cellProps.row.original.activePosition.initialMargin} />
												<NumericValue
													value={cellProps.row.original.activePosition.leverage}
													color="secondary"
													suffix="x"
												/>
											</div>
										</FlexDivRowCentered>
									)
								},
								size: 115,
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
									<Link href={ROUTES.Markets.Home(FuturesMarginType.SMART_MARGIN)}>
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
										position={row}
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

const MarketContainer = styled.div`
	display: flex;
	flex-direction: row;
`

const CellContainer = styled.div`
	display: flex;
	flex-direction: column;
	row-gap: 4px;
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
