import { FuturesMarket, FuturesMarketAsset } from '@kwenta/sdk/types'
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
import styled from 'styled-components'

import ChangePercent from 'components/ChangePercent'
import ColoredPrice from 'components/ColoredPrice'
import Currency from 'components/Currency'
import { FlexDivRowCentered } from 'components/layout/flex'
import MarketBadge from 'components/MarketBadge'
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'
import Spacer from 'components/Spacer'
import Table, { TableHeader } from 'components/Table'
import ROUTES from 'constants/routes'
import { selectFuturesType } from 'state/futures/common/selectors'
import { selectMarkets, selectMarketVolumes, selectMarkPrices } from 'state/futures/selectors'
import { useAppSelector } from 'state/hooks'
import { selectPreviousDayPrices, selectOffchainPricesInfo } from 'state/prices/selectors'
import { getSynthDescription } from 'utils/futures'
import { weiSortingFn } from 'utils/table'

type FuturesMarketsTableProps = {
	search?: string
}

const sortBy = [{ id: 'dailyVolume', desc: true }]

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
		const markets: FuturesMarket[] = lowerSearch
			? (futuresMarkets as FuturesMarket[]).filter(
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
					pastPrice?.rate && marketPrice.gt(0)
						? marketPrice.sub(pastPrice?.rate).div(marketPrice)
						: wei(0),
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
					<StyledTable
						data={data}
						showPagination
						onTableRowClick={(row) => {
							router.push(ROUTES.Markets.MarketPair(row.original.asset, accountType))
						}}
						highlightRowsOnHover
						sortBy={sortBy}
						columns={[
							{
								header: () => (
									<TableHeader>{t('dashboard.overview.futures-markets-table.market')}</TableHeader>
								),
								accessorKey: 'market',
								cell: (cellProps) => {
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
								size: 190,
								enableSorting: true,
							},
							{
								header: () => (
									<TableHeader>
										{t('dashboard.overview.futures-markets-table.mark-price')}
									</TableHeader>
								),
								accessorKey: 'price',
								cell: (cellProps) => {
									return (
										<ColoredPrice priceChange={cellProps.row.original.priceInfo?.change}>
											{formatDollars(cellProps.row.original.price, { suggestDecimals: true })}
										</ColoredPrice>
									)
								},
								size: 130,
								enableSorting: true,
								sortingFn: weiSortingFn('price'),
							},
							{
								header: () => (
									<TableHeader>
										{t('dashboard.overview.futures-markets-table.daily-change')}
									</TableHeader>
								),
								accessorKey: 'priceChange',
								cell: (cellProps) => {
									return (
										<ChangePercent
											value={cellProps.row.original.priceChange}
											decimals={2}
											className="change-pct"
										/>
									)
								},
								size: 105,
								enableSorting: true,
								sortingFn: weiSortingFn('priceChange'),
							},
							{
								header: () => (
									<TableHeader>
										{t('dashboard.overview.futures-markets-table.funding-rate')}
									</TableHeader>
								),
								accessorKey: 'fundingRate',
								cell: (cellProps) => {
									return (
										<ChangePercent
											value={cellProps.row.original.fundingRate}
											decimals={6}
											showArrow={false}
											className="change-pct"
										/>
									)
								},
								enableSorting: true,
								size: 125,
								sortingFn: weiSortingFn('fundingRate'),
							},
							{
								header: () => (
									<TableHeader>
										{t('dashboard.overview.futures-markets-table.open-interest')}
									</TableHeader>
								),
								accessorKey: 'openInterest',
								cell: (cellProps) => {
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
								size: 125,
								enableSorting: true,
								sortingFn: weiSortingFn('openInterest'),
							},
							{
								id: 'dailyVolume',
								header: () => (
									<TableHeader>
										{t('dashboard.overview.futures-markets-table.daily-volume')}
									</TableHeader>
								),
								accessorKey: 'dailyVolume',
								cell: (cellProps) => {
									return (
										<Currency.Price
											price={cellProps.row.original.volume}
											formatOptions={{ truncateOver: 1e3 }}
										/>
									)
								},
								size: 125,
								enableSorting: true,
								sortingFn: weiSortingFn('volume'),
							},
						]}
					/>
				</TableContainer>
			</DesktopOnlyView>
			<MobileOrTabletView>
				<StyledMobileTable
					data={data}
					showPagination
					onTableRowClick={(row) => {
						router.push(ROUTES.Markets.MarketPair(row.original.asset, accountType))
					}}
					sortBy={[{ id: 'dailyVolume', desc: true }]}
					columns={[
						{
							header: () => (
								<div>
									<TableHeader>{t('dashboard.overview.futures-markets-table.market')}</TableHeader>
									<TableHeader>{t('dashboard.overview.futures-markets-table.oracle')}</TableHeader>
								</div>
							),
							accessorKey: 'market',
							cell: (cellProps) => {
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
							size: 145,
							enableSorting: true,
						},
						{
							header: () => (
								<div>
									<TableHeader>
										{t('dashboard.overview.futures-markets-table.open-interest')}
									</TableHeader>
									<TableHeader>
										{t('dashboard.overview.futures-markets-table.funding-rate')}
									</TableHeader>
								</div>
							),
							accessorKey: 'openInterest',
							cell: (cellProps) => {
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
							size: 130,
						},
						{
							header: () => (
								<div>
									<TableHeader>
										{t('dashboard.overview.futures-markets-table.daily-change')}
									</TableHeader>
									<TableHeader>
										{t('dashboard.overview.futures-markets-table.daily-volume')}
									</TableHeader>
								</div>
							),
							accessorKey: 'dailyVolume',
							cell: (cellProps) => {
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
							size: 120,
							enableSorting: true,
							sortingFn: weiSortingFn('volume'),
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
` as typeof Table

const StyledText = styled(FlexDivRowCentered)`
	justify-content: space-between;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	font-family: ${(props) => props.theme.fonts.bold};
`

const MarketContainer = styled.div`
	display: grid;
	grid-template-rows: auto auto;
	grid-template-columns: 40px auto;
	align-items: center;
	width: 200px;
`

const StyledMobileTable = styled(StyledTable)`
	margin-top: 4px;
	border-radius: initial;
	border-top: none;
	border-left: none;
	border-right: none;
` as typeof Table

export default FuturesMarketsTable
