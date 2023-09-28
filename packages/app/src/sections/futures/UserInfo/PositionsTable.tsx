import { ZERO_WEI } from '@kwenta/sdk/constants'
import { FuturesMarginType } from '@kwenta/sdk/types'
import { getDisplayAsset, formatPercent } from '@kwenta/sdk/utils'
import { useRouter } from 'next/router'
import { FC, memo, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { FuturesPositionTablePositionActive } from 'types/futures'

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
import { selectCrossMarginActivePositions } from 'state/futures/crossMargin/selectors'
import { selectMarkPrices } from 'state/futures/selectors'
import { selectSmartMarginActivePositions } from 'state/futures/smartMargin/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { selectOffchainPricesInfo } from 'state/prices/selectors'
import { FOOTER_HEIGHT } from 'styles/common'
import media from 'styles/media'

import PositionsTab from '../MobileTrade/UserTabs/PositionsTab'
import ShareModal from '../ShareModal'

import EditPositionButton from './EditPositionButton'
import TableMarketDetails from './TableMarketDetails'

type Props = {
	positions: FuturesPositionTablePositionActive[]
}

const PositionsTable: FC<Props> = memo(({ positions }: Props) => {
	const { t } = useTranslation()
	const router = useRouter()
	const dispatch = useAppDispatch()
	const { switchToL2 } = useNetworkSwitcher()
	const { lessThanWidth } = useWindowSize()

	const isL2 = useIsL2()

	const currentMarket = useAppSelector(selectMarketAsset)
	const markPrices = useAppSelector(selectMarkPrices)
	const pricesInfo = useAppSelector(selectOffchainPricesInfo)
	const accountType = useAppSelector(selectFuturesType)
	const [showShareModal, setShowShareModal] = useState(false)
	const [sharePosition, setSharePosition] = useState<FuturesPositionTablePositionActive | null>(
		null
	)

	let data = useMemo(() => {
		return positions
			.map((p) => ({
				...p,
				marketPrice: markPrices[p.market.marketKey] ?? ZERO_WEI,
				priceInfo: pricesInfo[p.market.asset],
			}))
			.sort((a) => (a.market.asset === currentMarket ? -1 : 1))
	}, [positions, markPrices, pricesInfo, currentMarket])

	const handleOpenShareModal = useCallback((share: FuturesPositionTablePositionActive) => {
		setSharePosition(share)
		setShowShareModal((s) => !s)
	}, [])

	if (!isL2)
		return (
			<EmptyTableContainer>
				<TableNoResults>
					{t('common.l2-cta')}
					<div onClick={switchToL2}>{t('homepage.l2.cta-buttons.switch-l2')}</div>
				</TableNoResults>
			</EmptyTableContainer>
		)

	if (!data.length)
		return (
			<EmptyTableContainer>
				<TableNoResults>{t('dashboard.overview.futures-positions-table.no-result')}</TableNoResults>
			</EmptyTableContainer>
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
			<TableContainer>
				<HeadersRow>
					<div>Market</div>
					<div>Side</div>
					<div>Size</div>
					<div>Avg. Entry/Liq. Price</div>
					<div>Market Margin</div>
					<div>uP&L</div>
					<div>Funding</div>
					<div>TP/SL</div>
					<div>Actions</div>
				</HeadersRow>
				{data.map((row) => (
					<PositionRowDesktop key={row.market.asset}>
						<PositionCell>
							<MarketDetailsContainer
								onClick={() =>
									router.push(ROUTES.Markets.MarketPair(row.market.asset, accountType))
								}
							>
								<TableMarketDetails
									marketAsset={row.market.asset}
									marketName={getDisplayAsset(row.market.asset) ?? ''}
									marketKey={row.market.marketKey}
									price={row.marketPrice}
									priceInfo={row.priceInfo}
								/>
							</MarketDetailsContainer>
						</PositionCell>
						<PositionCell>
							<PositionType side={row.activePosition.side} />
						</PositionCell>

						<PositionCell>
							<FlexDivRowCentered columnGap="5px">
								<ColWithButton>
									<div>
										<FlexDivRowCentered justifyContent="flex-start" columnGap="5px">
											<Currency.Price
												price={row.activePosition.size}
												currencyKey={row.market.asset}
											/>
											{accountType === FuturesMarginType.SMART_MARGIN && (
												<EditPositionButton
													modalType={'futures_edit_position_size'}
													marketKey={row.market.marketKey}
												/>
											)}
										</FlexDivRowCentered>
										<Currency.Price
											price={row.activePosition.notionalValue}
											formatOptions={{ truncateOver: 1e6 }}
											colorType="secondary"
										/>
									</div>
									<Spacer width={5} />
								</ColWithButton>
							</FlexDivRowCentered>
						</PositionCell>
						<PositionCell>
							{!row.activePosition.details?.avgEntryPrice ? (
								<Body>{NO_VALUE}</Body>
							) : (
								<FlexDivCol>
									<Currency.Price
										price={row.activePosition.details.avgEntryPrice}
										formatOptions={{ suggestDecimals: true }}
									/>
									<Currency.Price
										price={row.activePosition.liquidationPrice}
										formatOptions={{ suggestDecimals: true }}
										colorType="preview"
									/>
								</FlexDivCol>
							)}
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
								<NumericValue value={row.activePosition.leverage} color="secondary" suffix="x" />
							</FlexDivCol>
						</PositionCell>
						<PositionCell>
							<FlexDivRowCentered columnGap="5px">
								<PnlContainer>
									<Currency.Price price={row.activePosition.pnl} colored />
									<NumericValue value={row.activePosition.pnlPct} colored>
										{formatPercent(row.activePosition.pnlPct)}
									</NumericValue>
								</PnlContainer>
							</FlexDivRowCentered>
						</PositionCell>
						<PositionCell>
							<Currency.Price price={row.activePosition.accruedFunding} colored />
						</PositionCell>
						{accountType === FuturesMarginType.SMART_MARGIN && (
							<PositionCell>
								<FlexDivCol>
									<FlexDivRowCentered justifyContent="flex-start" columnGap="5px">
										{!row.takeProfit ? (
											<Body>{NO_VALUE}</Body>
										) : (
											<div>
												<Currency.Price price={row.takeProfit.targetPrice} />
											</div>
										)}
										<EditPositionButton
											modalType={'futures_edit_stop_loss_take_profit'}
											marketKey={row.market.marketKey}
										/>
									</FlexDivRowCentered>
									{!row.stopLoss ? (
										<Body>{NO_VALUE}</Body>
									) : (
										<div>
											<Currency.Price price={row.stopLoss.targetPrice} />
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
												type:
													row.market.version === 3
														? 'cross_margin_close_position'
														: 'smart_margin_close_position',
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
								<Pill onClick={() => handleOpenShareModal(row)} size="small">
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
})

export const CrossMarginPostitionsTable = memo(() => {
	const crossMarginPositions = useAppSelector(selectCrossMarginActivePositions)

	return <PositionsTable positions={crossMarginPositions} />
})

export const SmartMarginPostitionsTable = memo(() => {
	const smartMarginPositions = useAppSelector(selectSmartMarginActivePositions)

	return <PositionsTable positions={smartMarginPositions} />
})

const SelectedPositionsTable = memo(() => {
	const type = useAppSelector(selectFuturesType)
	return type === FuturesMarginType.CROSS_MARGIN ? (
		<CrossMarginPostitionsTable />
	) : (
		<SmartMarginPostitionsTable />
	)
})

export default SelectedPositionsTable

const EmptyTableContainer = styled.div`
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	border-top: ${(props) => props.theme.colors.selectedTheme.border};
`

const TableContainer = styled.div`
	overflow: auto;
	border-top: ${(props) => props.theme.colors.selectedTheme.border};
	height: calc(100% - ${FOOTER_HEIGHT}px);
	${media.lessThan('xl')`
		height: 100%;
		grid-template-columns: initial;
	`}
	display: grid;
	grid-template-columns: 2fr 1fr 2fr 2fr 2fr 2fr 2fr 2fr 2fr;
	align-content: flex-start;
`

const PositionCell = styled.div`
	display: flex;
	align-items: center;
	height: 54px;
	padding: 0 10px;
	border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
`

const PositionRowDesktop = styled.div`
	display: contents;
	&:nth-child(even) > ${PositionCell} {
		background-color: ${(props) => props.theme.colors.selectedTheme.table.fill};
	}
`

const HeadersRow = styled.div`
	display: contents;
	& > div {
		display: flex;
		align-items: center;
		padding: 0 10px;
		height: ${FOOTER_HEIGHT}px;
		color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.secondary};
		border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
	}
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
