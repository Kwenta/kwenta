import { ZERO_WEI } from '@kwenta/sdk/constants'
import { FuturesMarginType } from '@kwenta/sdk/types'
import { getDisplayAsset, formatPercent } from '@kwenta/sdk/utils'
import { useRouter } from 'next/router'
import { FC, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import UploadIcon from 'assets/svg/futures/upload-icon.svg'
import Currency from 'components/Currency'
import { FlexDivCol, FlexDivRow, FlexDivRowCentered } from 'components/layout/flex'
import Pill from 'components/Pill'
import Spacer from 'components/Spacer'
import { TableNoResults } from 'components/Table'
import { Body, NumericValue } from 'components/Text'
import { NO_VALUE } from 'constants/placeholder'
import ROUTES from 'constants/routes'
import useIsL2 from 'hooks/useIsL2'
import useNetworkSwitcher from 'hooks/useNetworkSwitcher'
import useWindowSize from 'hooks/useWindowSize'
import PositionType from 'sections/futures/PositionType'
import { setShowPositionModal } from 'state/app/reducer'
import { selectFuturesType, selectMarketAsset } from 'state/futures/common/selectors'
import { selectCrossMarginPositions } from 'state/futures/crossMargin/selectors'
import {
	selectSmartMarginPositions,
	selectMarkets,
	selectMarkPrices,
	selectPositionHistory,
} from 'state/futures/selectors'
import { SharePositionParams } from 'state/futures/types'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { FOOTER_HEIGHT } from 'styles/common'
import media from 'styles/media'

import PositionsTab from '../MobileTrade/UserTabs/PositionsTab'
import ShareModal from '../ShareModal'

import EditPositionButton from './EditPositionButton'
import TableMarketDetails from './TableMarketDetails'

type FuturesPositionTableProps = {
	showCurrentMarket?: boolean
	showEmptyTable?: boolean
}

const PositionsTable: FC<FuturesPositionTableProps> = () => {
	const { t } = useTranslation()
	const router = useRouter()
	const dispatch = useAppDispatch()
	const { switchToL2 } = useNetworkSwitcher()
	const { lessThanWidth } = useWindowSize()

	const isL2 = useIsL2()

	const crossMarginPositions = useAppSelector(selectCrossMarginPositions)
	const smartMarginPositions = useAppSelector(selectSmartMarginPositions)
	const positionHistory = useAppSelector(selectPositionHistory)
	const currentMarket = useAppSelector(selectMarketAsset)
	const futuresMarkets = useAppSelector(selectMarkets)
	const markPrices = useAppSelector(selectMarkPrices)
	const accountType = useAppSelector(selectFuturesType)
	const [showShareModal, setShowShareModal] = useState(false)
	const [sharePosition, setSharePosition] = useState<SharePositionParams | null>(null)

	let data = useMemo(() => {
		const positions =
			accountType === FuturesMarginType.SMART_MARGIN ? smartMarginPositions : crossMarginPositions
		return positions
			.map((position) => {
				const market = futuresMarkets.find((market) => market.asset === position.asset)
				const thisPositionHistory = positionHistory.find((ph) => {
					return ph.isOpen && ph.asset === position.asset
				})
				const markPrice = markPrices[market?.marketKey!] ?? ZERO_WEI
				return {
					market: market!,
					remainingMargin: position.remainingMargin,
					position: position.position!,
					avgEntryPrice: thisPositionHistory?.avgEntryPrice,
					stopLoss: position.stopLoss?.targetPrice,
					takeProfit: position.takeProfit?.targetPrice,
					share: {
						asset: position.asset,
						position: position.position!,
						positionHistory: thisPositionHistory!,
						marketPrice: markPrice,
					},
				}
			})
			.filter(({ position, market }) => !!position && !!market)
			.sort((a) => (a.market.asset === currentMarket ? -1 : 1))
	}, [
		accountType,
		smartMarginPositions,
		crossMarginPositions,
		futuresMarkets,
		positionHistory,
		markPrices,
		currentMarket,
	])

	const handleOpenShareModal = useCallback((share: SharePositionParams) => {
		setSharePosition(share)
		setShowShareModal((s) => !s)
	}, [])

	if (!isL2)
		return (
			<TableContainer>
				<TableNoResults>
					{t('common.l2-cta')}
					<div onClick={switchToL2}>{t('homepage.l2.cta-buttons.switch-l2')}</div>
				</TableNoResults>
			</TableContainer>
		)

	if (!data.length)
		return (
			<TableContainer>
				<TableNoResults>{t('dashboard.overview.futures-positions-table.no-result')}</TableNoResults>
			</TableContainer>
		)

	if (lessThanWidth('xl')) {
		return (
			<TableContainer>
				<PositionsTab />
			</TableContainer>
		)
	}

	return (
		<>
			<HeadersRow>
				<div>Market</div>
				<div>Side</div>
				<div>Size</div>
				<div>Avg. Entry</div>
				<div>Liq. Price</div>
				<div>Market Margin</div>
				<div>uP&L</div>
				<div>Funding</div>
				<div>TP/SL</div>
				<div>Actions</div>
			</HeadersRow>

			<TableContainer>
				{data.map((row) => (
					<PositionRowDesktop key={row.market.asset}>
						<PositionCell>
							<MarketDetailsContainer
								onClick={() =>
									router.push(ROUTES.Markets.MarketPair(row.market.asset, accountType))
								}
							>
								<TableMarketDetails
									marketName={getDisplayAsset(row.market.asset) ?? ''}
									marketKey={row.market.marketKey}
								/>
							</MarketDetailsContainer>
						</PositionCell>
						<PositionCell>
							<PositionType side={row.position.side} />
						</PositionCell>

						<PositionCell>
							<FlexDivRowCentered columnGap="5px">
								<ColWithButton>
									<div>
										<FlexDivRowCentered justifyContent="flex-start" columnGap="5px">
											<Currency.Price price={row.position.size} currencyKey={row.market.asset} />
											{accountType === FuturesMarginType.SMART_MARGIN && (
												<EditPositionButton
													modalType={'futures_edit_position_size'}
													marketKey={row.market.marketKey}
												/>
											)}
										</FlexDivRowCentered>
										<Currency.Price
											price={row.position.notionalValue}
											formatOptions={{ truncateOver: 1e6 }}
											colorType="secondary"
										/>
									</div>
									<Spacer width={5} />
								</ColWithButton>
							</FlexDivRowCentered>
						</PositionCell>
						<PositionCell>
							{!row.avgEntryPrice ? (
								<Body>{NO_VALUE}</Body>
							) : (
								<Currency.Price
									price={row.avgEntryPrice}
									formatOptions={{ suggestDecimals: true }}
								/>
							)}
						</PositionCell>
						<PositionCell>
							<Currency.Price
								price={row.position.liquidationPrice}
								formatOptions={{ suggestDecimals: true }}
								colorType="preview"
							/>
						</PositionCell>
						<PositionCell>
							<FlexDivCol>
								<FlexDivRow justifyContent="flex-start" columnGap="5px">
									<NumericValue value={row.remainingMargin} />
									{accountType === FuturesMarginType.SMART_MARGIN && (
										<EditPositionButton
											modalType={'futures_edit_position_margin'}
											marketKey={row.market.marketKey}
										/>
									)}
								</FlexDivRow>
								<NumericValue value={row.position.leverage} color="secondary" suffix="x" />
							</FlexDivCol>
						</PositionCell>
						<PositionCell>
							<FlexDivRowCentered columnGap="5px">
								<PnlContainer>
									<Currency.Price price={row.position.pnl} colored />
									<NumericValue value={row.position.pnlPct} colored>
										{formatPercent(row.position.pnlPct)}
									</NumericValue>
								</PnlContainer>
							</FlexDivRowCentered>
						</PositionCell>
						<PositionCell>
							<Currency.Price price={row.position.accruedFunding} colored />
						</PositionCell>
						{accountType === FuturesMarginType.SMART_MARGIN && (
							<PositionCell>
								<FlexDivCol>
									<FlexDivRowCentered justifyContent="flex-start" columnGap="5px">
										{row.takeProfit === undefined ? (
											<Body>{NO_VALUE}</Body>
										) : (
											<div>
												<Currency.Price price={row.takeProfit} />
											</div>
										)}
										<EditPositionButton
											modalType={'futures_edit_stop_loss_take_profit'}
											marketKey={row.market.marketKey}
										/>
									</FlexDivRowCentered>
									{row.stopLoss === undefined ? (
										<Body>{NO_VALUE}</Body>
									) : (
										<div>
											<Currency.Price price={row.stopLoss} />
										</div>
									)}
								</FlexDivCol>
							</PositionCell>
						)}

						<PositionCell>
							<FlexDivRowCentered>
								<Pill
									onClick={() =>
										dispatch(
											setShowPositionModal({
												type: 'futures_close_position',
												marketKey: row.market.marketKey,
											})
										)
									}
									color="redGray"
									size="small"
								>
									Close
								</Pill>
								<Spacer width={4} />
								<Pill onClick={() => handleOpenShareModal(row.share)} size="small">
									<FlexDivRowCentered>
										<UploadIcon width={8} />
									</FlexDivRowCentered>
								</Pill>
							</FlexDivRowCentered>
						</PositionCell>
					</PositionRowDesktop>
				))}
			</TableContainer>
			{showShareModal && (
				<ShareModal sharePosition={sharePosition!} setShowShareModal={setShowShareModal} />
			)}
		</>
	)
}

const TableContainer = styled.div`
	overflow: scroll;
	border-top: ${(props) => props.theme.colors.selectedTheme.border};
	height: calc(100% - ${FOOTER_HEIGHT * 2 + 4}px);
	${media.lessThan('xl')`
		height: calc(100% - ${FOOTER_HEIGHT}px);
	`}
`

const PositionRowDesktop = styled.div`
	display: grid;
	grid-template-columns: 75px 60px minmax(130px, 1fr) 1fr 1fr 1.3fr 1fr 1fr 1fr 64px;
	grid-gap: 10px;
	height: 100%;
	height: 54px;
	padding: 0 10px;
	&:nth-child(odd) {
		background-color: ${(props) => props.theme.colors.selectedTheme.table.fill};
	}
	border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
`

const HeadersRow = styled(PositionRowDesktop)`
	height: ${FOOTER_HEIGHT}px;
	padding: 7px 10px 0 10px;
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.secondary};
	border-top: ${(props) => props.theme.colors.selectedTheme.border};
	:not(:last-child) {
		border-bottom: 0;
	}
	&:first-child {
		background-color: transparent;
	}
`

const PositionCell = styled.div`
	display: flex;
	align-items: center;
`

const PnlContainer = styled.div`
	display: flex;
	flex-direction: column;
`

const MarketDetailsContainer = styled.div`
	cursor: pointer;
`

const ColWithButton = styled.div`
	display: flex;
	flex-direction: row;
	align-content: center;
	align-items: center;
	${media.lessThan('xxl')`
		display: block;
	`}
`

export default PositionsTable
