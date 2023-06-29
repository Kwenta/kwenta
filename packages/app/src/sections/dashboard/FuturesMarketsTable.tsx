import { FuturesMarketAsset } from '@kwenta/sdk/types'
import {
	AssetDisplayByAsset,
	MarketKeyByAsset,
	getDisplayAsset,
	formatDollars,
} from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CellProps } from 'react-table'
import styled from 'styled-components'

import ChangePercent from 'components/ChangePercent'
import ColoredPrice from 'components/ColoredPrice'
import Currency from 'components/Currency'
import MarketBadge from 'components/MarketBadge'
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'
import Spacer from 'components/Spacer'
import Table, { TableHeader } from 'components/Table'
import ROUTES from 'constants/routes'
import {
	selectFuturesType,
	selectMarkets,
	selectMarketVolumes,
	selectMarkPrices,
} from 'state/futures/selectors'
import { useAppSelector } from 'state/hooks'
import { selectPreviousDayPrices, selectOffchainPricesInfo } from 'state/prices/selectors'
import { getSynthDescription } from 'utils/futures'

type FuturesMarketsTableProps = {
	search?: string
}

const FuturesMarketsTable: React.FC<FuturesMarketsTableProps> = ({ search }) => {
	const { t } = useTranslation()
	const router = useRouter()

	const futuresMarkets = useAppSelector(selectMarkets)
	const pastRates = useAppSelector(selectPreviousDayPrices)
	const futuresVolumes = useAppSelector(selectMarketVolumes)
	const accountType = useAppSelector(selectFuturesType)
	const pricesInfo = useAppSelector(selectOffchainPricesInfo)
	const markPrices = useAppSelector(selectMarkPrices)

	let data = useMemo(() => {
		const lowerSearch = search?.toLowerCase()
		const markets = lowerSearch
			? futuresMarkets.filter(
					(m) =>
						m.asset.toLowerCase().includes(lowerSearch) ||
						AssetDisplayByAsset[m.asset]?.toLocaleLowerCase().includes(lowerSearch)
			  )
			: futuresMarkets
		return markets.map((market) => {
			const description = getSynthDescription(market.asset, t)
			const volume = futuresVolumes[market.marketKey]?.volume
			const assetPriceInfo = pricesInfo[market.asset]
			const pastPrice = pastRates.find(
				(price) => price.synth === getDisplayAsset(market.asset)?.toUpperCase()
			)
			const marketPrice = markPrices[market.marketKey] ?? wei(0)

			return {
				asset: market.asset,
				market: market.marketName,
				description,
				price: marketPrice,
				priceInfo: assetPriceInfo,
				volume: volume?.toNumber() ?? 0,
				pastPrice: pastPrice?.rate,
				priceChange:
					pastPrice?.rate && marketPrice.gt(0) && marketPrice.sub(pastPrice?.rate).div(marketPrice),
				fundingRate: market.currentFundingRate ?? null,
				openInterest: market.marketSize.mul(marketPrice),
				openInterestNative: market.marketSize,
				longInterest: market.openInterest.longUSD,
				shortInterest: market.openInterest.shortUSD,
				marketSkew: market.marketSkew,
				isSuspended: market.isSuspended,
				marketClosureReason: market.marketClosureReason,
			}
		})
	}, [search, futuresMarkets, t, futuresVolumes, pricesInfo, pastRates, markPrices])

	return (
		<>
			<DesktopOnlyView>
				<TableContainer>
					{/*@ts-expect-error*/}
					<StyledTable
						data={data}
						showPagination
						onTableRowClick={(row) => {
							router.push(ROUTES.Markets.MarketPair(row.original.asset, accountType))
						}}
						highlightRowsOnHover
						sortBy={[{ id: 'dailyVolume', desc: true }]}
						columns={[
							{
								Header: (
									<TableHeader>{t('dashboard.overview.futures-markets-table.market')}</TableHeader>
								),
								accessor: 'market',
								Cell: (cellProps: CellProps<(typeof data)[number]>) => {
									return (
										<MarketContainer>
											<IconContainer>
												<StyledCurrencyIcon
													currencyKey={MarketKeyByAsset[cellProps.row.original.asset]}
												/>
											</IconContainer>
											<StyledText>
												{cellProps.row.original.market}
												<Spacer width={8} />
												<MarketBadge
													currencyKey={cellProps.row.original.asset}
													isFuturesMarketClosed={cellProps.row.original.isSuspended}
													futuresClosureReason={cellProps.row.original.marketClosureReason}
												/>
											</StyledText>
											<StyledValue>{cellProps.row.original.description}</StyledValue>
										</MarketContainer>
									)
								},
								width: 190,
								sortable: true,
							},
							{
								Header: (
									<TableHeader>
										{t('dashboard.overview.futures-markets-table.mark-price')}
									</TableHeader>
								),
								accessor: 'price',
								Cell: (cellProps: CellProps<(typeof data)[number]>) => {
									const formatOptions = {
										suggestDecimals: true,
									}
									return (
										<ColoredPrice priceInfo={cellProps.row.original.priceInfo}>
											{formatDollars(cellProps.row.original.price, formatOptions)}
										</ColoredPrice>
									)
								},
								width: 130,
								sortable: true,
								sortType: useMemo(
									() => (rowA: any, rowB: any) => {
										const rowOne = rowA.original.price ?? wei(0)
										const rowTwo = rowB.original.price ?? wei(0)
										return rowOne.toSortable() > rowTwo.toSortable() ? 1 : -1
									},
									[]
								),
							},
							{
								Header: (
									<TableHeader>
										{t('dashboard.overview.futures-markets-table.daily-change')}
									</TableHeader>
								),
								accessor: 'priceChange',
								Cell: (cellProps: CellProps<(typeof data)[number]>) => {
									return (
										<ChangePercent
											value={cellProps.row.original.priceChange}
											decimals={2}
											className="change-pct"
										/>
									)
								},
								width: 105,
								sortable: true,
								sortType: useMemo(
									() => (rowA: any, rowB: any) => {
										const rowOne = rowA.original.priceChange ?? wei(0)
										const rowTwo = rowB.original.priceChange ?? wei(0)
										return rowOne.toNumber() > rowTwo.toNumber() ? -1 : 1
									},
									[]
								),
							},
							{
								Header: (
									<TableHeader>
										{t('dashboard.overview.futures-markets-table.funding-rate')}
									</TableHeader>
								),
								accessor: 'fundingRate',
								Cell: (cellProps: CellProps<(typeof data)[number]>) => {
									return (
										<ChangePercent
											value={cellProps.row.original.fundingRate}
											decimals={6}
											showArrow={false}
											className="change-pct"
										/>
									)
								},
								sortable: true,
								width: 125,
								sortType: useMemo(
									() => (rowA: any, rowB: any) => {
										const rowOne = rowA.original.fundingRate ?? wei(0)
										const rowTwo = rowB.original.fundingRate ?? wei(0)
										return rowOne.toNumber() > rowTwo.toNumber() ? -1 : 1
									},
									[]
								),
							},
							{
								Header: (
									<TableHeader>
										{t('dashboard.overview.futures-markets-table.open-interest')}
									</TableHeader>
								),
								accessor: 'openInterest',
								Cell: (cellProps: CellProps<(typeof data)[number]>) => {
									return (
										<OpenInterestContainer>
											<Currency.Price
												price={cellProps.row.original.longInterest}
												colorType="positive"
												formatOptions={{ truncateOver: 1e3 }}
											/>
											<Currency.Price
												price={cellProps.row.original.shortInterest}
												colorType="negative"
												formatOptions={{ truncateOver: 1e3 }}
											/>
										</OpenInterestContainer>
									)
								},
								width: 125,
								sortable: true,
								sortType: useMemo(
									() => (rowA: any, rowB: any) => {
										const rowOne =
											rowA.original.longInterest.add(rowA.original.shortInterest) ?? wei(0)
										const rowTwo =
											rowB.original.longInterest.add(rowB.original.shortInterest) ?? wei(0)
										return rowOne.toSortable() > rowTwo.toSortable() ? 1 : -1
									},
									[]
								),
							},
							{
								Header: (
									<TableHeader>
										{t('dashboard.overview.futures-markets-table.daily-volume')}
									</TableHeader>
								),
								accessor: 'dailyVolume',
								Cell: (cellProps: CellProps<(typeof data)[number]>) => {
									return (
										<Currency.Price
											price={cellProps.row.original.volume}
											formatOptions={{ truncateOver: 1e3 }}
										/>
									)
								},
								width: 125,
								sortable: true,
								sortType: useMemo(
									() => (rowA: any, rowB: any) => {
										const rowOne = rowA.original.volume
										const rowTwo = rowB.original.volume
										return rowOne > rowTwo ? 1 : -1
									},
									[]
								),
							},
						]}
					/>
				</TableContainer>
			</DesktopOnlyView>
			<MobileOrTabletView>
				{/*@ts-expect-error*/}
				<StyledMobileTable
					data={data}
					showPagination
					onTableRowClick={(row) => {
						router.push(ROUTES.Markets.MarketPair(row.original.asset, accountType))
					}}
					sortBy={[{ id: 'dailyVolume', desc: true }]}
					columns={[
						{
							Header: () => (
								<div>
									<TableHeader>{t('dashboard.overview.futures-markets-table.market')}</TableHeader>
									<TableHeader>{t('dashboard.overview.futures-markets-table.oracle')}</TableHeader>
								</div>
							),
							accessor: 'market',
							Cell: (cellProps: CellProps<(typeof data)[number]>) => {
								return (
									<div>
										<MarketContainer>
											<IconContainer>
												<StyledCurrencyIcon
													currencyKey={
														MarketKeyByAsset[cellProps.row.original.asset as FuturesMarketAsset]
													}
												/>
											</IconContainer>
											<StyledText>{cellProps.row.original.market}</StyledText>
											<Currency.Price
												price={cellProps.row.original.price}
												formatOptions={{ suggestDecimals: true }}
											/>
										</MarketContainer>
									</div>
								)
							},
							width: 145,
							sortable: true,
						},
						{
							Header: () => (
								<div>
									<TableHeader>
										{t('dashboard.overview.futures-markets-table.open-interest')}
									</TableHeader>
									<TableHeader>
										{t('dashboard.overview.futures-markets-table.funding-rate')}
									</TableHeader>
								</div>
							),
							accessor: 'openInterest',
							Cell: (cellProps: CellProps<(typeof data)[number]>) => {
								return (
									<div>
										<Currency.Price
											price={cellProps.row.original.openInterest}
											formatOptions={{ truncateOver: 1e3 }}
										/>
										<div>
											<ChangePercent
												showArrow={false}
												value={cellProps.row.original.fundingRate}
												decimals={6}
												className="change-pct"
											/>
										</div>
									</div>
								)
							},
							width: 130,
						},
						{
							Header: () => (
								<div>
									<TableHeader>
										{t('dashboard.overview.futures-markets-table.daily-change')}
									</TableHeader>
									<TableHeader>
										{t('dashboard.overview.futures-markets-table.daily-volume')}
									</TableHeader>
								</div>
							),
							accessor: 'dailyVolume',
							Cell: (cellProps: CellProps<(typeof data)[number]>) => {
								return (
									<div>
										<div>
											<ChangePercent
												value={cellProps.row.original.priceChange ?? 0}
												decimals={2}
												className="change-pct"
											/>
										</div>
										<div>
											<Currency.Price
												price={cellProps.row.original.volume ?? 0}
												formatOptions={{ truncateOver: 1e3 }}
											/>
										</div>
									</div>
								)
							},
							sortable: true,
							sortType: useMemo(
								() => (rowA: any, rowB: any) => {
									const rowOne = rowA.original.volume
									const rowTwo = rowB.original.volume
									return rowOne > rowTwo ? 1 : -1
								},
								[]
							),
							width: 120,
						},
					]}
				/>
			</MobileOrTabletView>
		</>
	)
}

const StyledCurrencyIcon = styled(Currency.Icon)`
	width: 30px;
	height: 30px;
	margin-right: 8px;
`

const OpenInterestContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
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

const TableContainer = styled.div`
	margin: 16px 0 40px;

	.paused {
		color: ${(props) => props.theme.colors.selectedTheme.gray};
	}
`

const StyledTable = styled(Table)`
	margin-bottom: 20px;
`

const StyledText = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: -4px;
	grid-column: 2;
	grid-row: 1;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	font-family: ${(props) => props.theme.fonts.bold};
`

const MarketContainer = styled.div`
	display: grid;
	grid-template-rows: auto auto;
	grid-template-columns: auto auto;
	align-items: center;
`

const StyledMobileTable = styled(StyledTable)`
	margin-top: 4px;
	border-radius: initial;
	border-top: none;
	border-left: none;
	border-right: none;
`

export default FuturesMarketsTable
