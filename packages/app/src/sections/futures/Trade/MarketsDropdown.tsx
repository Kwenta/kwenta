import { ZERO_WEI } from '@kwenta/sdk/constants'
import { FuturesMarketAsset } from '@kwenta/sdk/types'
import {
	getDisplayAsset,
	AssetDisplayByAsset,
	MarketKeyByAsset,
	floorNumber,
	formatDollars,
	getMarketName,
} from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import { useRouter } from 'next/router'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import FavoriteIcon from 'assets/svg/futures/favorite-star.svg'
import SelectedIcon from 'assets/svg/futures/selected-fav.svg'
import ColoredPrice from 'components/ColoredPrice'
import CurrencyIcon from 'components/Currency/CurrencyIcon'
import { FlexDivRowCentered } from 'components/layout/flex'
import MarketBadge from 'components/MarketBadge'
import Spacer from 'components/Spacer'
import Table, { TableHeader, TableNoResults } from 'components/Table'
import Search from 'components/Table/Search'
import { Body } from 'components/Text'
import NumericValue from 'components/Text/NumericValue'
import { BANNER_HEIGHT_DESKTOP, BANNER_HEIGHT_MOBILE } from 'constants/announcement'
import ROUTES from 'constants/routes'
import { zIndex } from 'constants/ui'
import useClickOutside from 'hooks/useClickOutside'
import useLocalStorage from 'hooks/useLocalStorage'
import { selectShowBanner } from 'state/app/selectors'
import {
	selectMarketAsset,
	selectMarkets,
	selectMarketsQueryStatus,
	selectFuturesType,
	selectMarketInfo,
	selectMarkPriceInfos,
} from 'state/futures/selectors'
import { useAppSelector } from 'state/hooks'
import { selectPreviousDayPrices } from 'state/prices/selectors'
import { FetchStatus } from 'state/types'
import media from 'styles/media'
import { getSynthDescription } from 'utils/futures'

import {
	MARKETS_DETAILS_HEIGHT_DESKTOP,
	TRADE_PANEL_WIDTH_LG,
	TRADE_PANEL_WIDTH_MD,
} from '../styles'

import MarketsDropdownSelector, { MARKET_SELECTOR_HEIGHT_MOBILE } from './MarketsDropdownSelector'

type MarketsDropdownProps = {
	mobile?: boolean
}

const MarketsDropdown: React.FC<MarketsDropdownProps> = ({ mobile }) => {
	const markPrices = useAppSelector(selectMarkPriceInfos)
	const pastPrices = useAppSelector(selectPreviousDayPrices)
	const accountType = useAppSelector(selectFuturesType)
	const marketAsset = useAppSelector(selectMarketAsset)
	const futuresMarkets = useAppSelector(selectMarkets)
	const marketsQueryStatus = useAppSelector(selectMarketsQueryStatus)

	const marketInfo = useAppSelector(selectMarketInfo)
	const [open, setOpen] = useState(false)
	const [search, setSearch] = useState('')
	const [favMarkets, setFavMarkets] = useLocalStorage<string[]>('favorite-markets', [])
	const showBanner = useAppSelector(selectShowBanner)

	const { ref } = useClickOutside(() => setOpen(false))

	const router = useRouter()
	const { t } = useTranslation()

	const onSelectFav = useCallback(
		(asset: string) => {
			const index = favMarkets.indexOf(asset)

			if (index !== -1) {
				favMarkets.splice(index, 1)
			} else {
				favMarkets.push(asset)
			}
			setFavMarkets([...favMarkets])
		},
		[favMarkets, setFavMarkets]
	)

	const getBasePriceRateInfo = useCallback(
		(asset: FuturesMarketAsset) => {
			return markPrices[MarketKeyByAsset[asset]]
		},
		[markPrices]
	)

	const getPastPrice = useCallback(
		(asset: string) =>
			pastPrices.find((price) => price.synth === getDisplayAsset(asset)?.toUpperCase()),
		[pastPrices]
	)

	const onSelectMarket = useCallback(
		(asset: string) => {
			router.push(ROUTES.Markets.MarketPair(asset, accountType))
			setOpen(false)
		},
		[accountType, router]
	)

	const selectedBasePriceRate = getBasePriceRateInfo(marketAsset)
	const selectedPastPrice = getPastPrice(marketAsset)

	const options = useMemo(() => {
		const lowerSearch = search?.toLowerCase()
		const markets = lowerSearch
			? futuresMarkets.filter(
					(m) =>
						m.asset.toLowerCase().includes(lowerSearch) ||
						AssetDisplayByAsset[m.asset]?.toLocaleLowerCase().includes(lowerSearch)
			  )
			: futuresMarkets

		const sortedMarkets = markets
			.filter((m) => favMarkets.includes(m.asset))
			.sort((a, b) =>
				getBasePriceRateInfo(b.asset)
					?.price.sub(getBasePriceRateInfo(a.asset)?.price ?? 0)
					.gt(0)
					? 1
					: -1
			)
			.concat(
				markets
					.filter((m) => !favMarkets.includes(m.asset))
					.sort((a, b) =>
						getBasePriceRateInfo(b.asset)
							?.price.sub(getBasePriceRateInfo(a.asset)?.price ?? 0)
							.gt(0)
							? 1
							: -1
					)
			)

		return sortedMarkets.map((market) => {
			const pastPrice = getPastPrice(market.asset)
			const basePriceRate = getBasePriceRateInfo(market.asset)

			const change =
				basePriceRate && pastPrice?.rate && basePriceRate.price.gt(0)
					? wei(basePriceRate.price).sub(pastPrice?.rate).div(basePriceRate.price)
					: ZERO_WEI

			return {
				value: market.asset,
				label: getMarketName(market.asset),
				asset: market.asset,
				key: market.marketKey,
				description: getSynthDescription(market.asset, t),
				priceNum: basePriceRate?.price.toNumber() ?? 0,
				price: formatDollars(basePriceRate?.price ?? '0', { suggestDecimals: true }),
				change: change.toNumber(),
				priceDirection: basePriceRate?.change ?? null,
				isMarketClosed: market.isSuspended,
				closureReason: market.marketClosureReason,
			}
		})
	}, [search, futuresMarkets, favMarkets, getPastPrice, getBasePriceRateInfo, t])

	const isFetching = !futuresMarkets.length && marketsQueryStatus.status === FetchStatus.Loading

	const tableHeight: number = useMemo(() => {
		const BANNER_HEIGHT = mobile ? BANNER_HEIGHT_MOBILE : BANNER_HEIGHT_DESKTOP
		const OFFSET = mobile ? 159 : 205
		return Math.max(window.innerHeight - OFFSET - Number(showBanner) * BANNER_HEIGHT, 300)
	}, [mobile, showBanner])

	return (
		<SelectContainer mobile={mobile} ref={ref} accountType={accountType}>
			<MarketsDropdownSelector
				onClick={() => setOpen(!open)}
				expanded={open}
				mobile={mobile}
				asset={marketAsset}
				label={getMarketName(marketAsset)}
				description={getSynthDescription(marketAsset, t)}
				isMarketClosed={marketInfo?.isSuspended}
				closureReason={marketInfo?.marketClosureReason}
				priceDetails={{
					oneDayChange:
						selectedBasePriceRate?.price &&
						selectedPastPrice?.rate &&
						selectedBasePriceRate.price.gt(0)
							? wei(selectedBasePriceRate.price)
									.sub(selectedPastPrice.rate)
									.div(selectedBasePriceRate.price)
							: ZERO_WEI,
					priceInfo: selectedBasePriceRate,
				}}
			/>
			{open && (
				<MarketsList mobile={mobile} height={tableHeight}>
					<SearchBarContainer>
						<Search autoFocus onChange={setSearch} value={search} border={false} />
					</SearchBarContainer>
					<TableContainer>
						<StyledTable
							highlightRowsOnHover
							// rowStyle={{ padding: '0' }}
							onTableRowClick={(row) => onSelectMarket(row.original.asset)}
							columns={[
								{
									header: () => (
										<TableHeader>
											<FavoriteIcon height={14} width={14} />
										</TableHeader>
									),
									accessorKey: 'favorite',
									sortingFn: 'basic',
									enableSorting: true,
									cell: ({ row }) => (
										<div
											onClick={(e) => {
												onSelectFav(row.original.asset)
												e.stopPropagation()
											}}
											style={{ cursor: 'pointer', zIndex: 200 }}
										>
											{favMarkets.includes(row.original.asset) ? (
												<SelectedIcon height={14} width={14} />
											) : (
												<FavoriteIcon height={14} width={14} />
											)}
										</div>
									),
									size: 30,
								},
								{
									header: () => <TableHeader>{t('futures.markets-drop-down.market')}</TableHeader>,
									accessorKey: 'label',
									sortingFn: 'basic',
									enableSorting: true,
									cell: ({ row }) => (
										<FlexDivRowCentered>
											<CurrencyIcon currencyKey={row.original.key} width={18} height={18} />
											<Spacer width={10} />
											<Body>{getDisplayAsset(row.original.asset)}</Body>
										</FlexDivRowCentered>
									),
									size: 65,
								},
								{
									header: () => <TableHeader>{t('futures.markets-drop-down.price')}</TableHeader>,
									accessorKey: 'priceNum',
									sortingFn: 'basic',
									enableSorting: true,
									cell: (cellProps) => {
										return (
											<div>
												<ColoredPrice priceChange={cellProps.row.original.priceDirection}>
													{cellProps.row.original.price}
												</ColoredPrice>
											</div>
										)
									},
									size: 100,
								},
								{
									header: () => (
										<TableHeader style={{ width: '70px', textAlign: 'right' }}>
											{t('futures.markets-drop-down.change')}
										</TableHeader>
									),
									cell: ({ row }) => {
										return (
											<div>
												<MarketBadge
													currencyKey={row.original.asset}
													isFuturesMarketClosed={row.original.isMarketClosed}
													futuresClosureReason={row.original.closureReason}
													fallbackComponent={
														<NumericValue
															suffix="%"
															colored
															value={floorNumber(
																row.original.change ? row.original.change * 100 : '0',
																2
															)}
															style={{ textAlign: 'right', width: '60px' }}
														/>
													}
												/>
											</div>
										)
									},
									accessorKey: 'change',
									sortingFn: 'basic',
									enableSorting: true,
									size: 60,
								},
							]}
							data={options}
							isLoading={isFetching}
							noBottom={true}
							noResultsMessage={
								options?.length === 0 ? (
									<TableNoResults>
										<Body color="secondary" size="large">
											{t('futures.markets-drop-down.no-results')}
										</Body>
									</TableNoResults>
								) : undefined
							}
						/>
					</TableContainer>
				</MarketsList>
			)}
		</SelectContainer>
	)
}

const MarketsList = styled.div<{ mobile?: boolean; height: number }>`
	top: 66px;
	z-index: 1000;
	height: ${(props) => props.height}px;
	width: ${TRADE_PANEL_WIDTH_LG}px;
	${media.lessThan('xxl')`
		width: ${TRADE_PANEL_WIDTH_MD}px;
	`}

	${media.lessThan('md')`
		width: 100%;
	`}

	border-top: ${(props) => props.theme.colors.selectedTheme.border};
	background-color: ${(props) =>
		props.theme.colors.selectedTheme.newTheme.containers.primary.background};
	${(props) =>
		props.mobile &&
		css`
			width: 100%;
		`}
`

const TableContainer = styled.div`
	height: 100%;
	overflow: scroll;
	border-top: ${(props) => props.theme.colors.selectedTheme.border};
`

const StyledTable = styled(Table)<{ mobile?: boolean }>`
	border: none;
	cursor: pointer;
	background-color: ${(props) =>
		props.theme.colors.selectedTheme.newTheme.containers.primary.background};
	.table-body-row {
		padding: 0;
	}

	.table-body-row:last-child {
		border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
	}

	.table-body-cell {
		height: 32px;
	}
` as typeof Table

const SearchBarContainer = styled.div`
	font-size: 13px;
	width: 100%;
	height: 38px;
	top: 0;
`

const SelectContainer = styled.div<{ mobile?: boolean; accountType?: string }>`
	z-index: ${zIndex.MARKET_DROPDOWN};
	height: ${MARKETS_DETAILS_HEIGHT_DESKTOP}px;
	position: relative;
	border-bottom: ${(props) => props.theme.colors.selectedTheme.border};

	${(props) =>
		props.mobile &&
		css`
			width: 100%;
			border-bottom: ${props.theme.colors.selectedTheme.border};
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			height: ${MARKET_SELECTOR_HEIGHT_MOBILE + 1}px;
		`}
`

export default MarketsDropdown
