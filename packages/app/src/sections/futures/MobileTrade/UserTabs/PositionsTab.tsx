import { FuturesMarginType, FuturesMarketKey, PositionSide } from '@kwenta/sdk/types'
import Router from 'next/router'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { FuturesPositionTablePositionActive } from 'types/futures'

import Currency from 'components/Currency'
import { FlexDiv, FlexDivRow, FlexDivRowCentered } from 'components/layout/flex'
import Pill from 'components/Pill'
import Spacer from 'components/Spacer'
import { TableNoResults } from 'components/Table'
import { Body, NumericValue } from 'components/Text'
import { NO_VALUE } from 'constants/placeholder'
import ROUTES from 'constants/routes'
import useIsL2 from 'hooks/useIsL2'
import useNetworkSwitcher from 'hooks/useNetworkSwitcher'
import PositionType from 'sections/futures/PositionType'
import ShareModal from 'sections/futures/ShareModal'
import EditPositionButton from 'sections/futures/UserInfo/EditPositionButton'
import { setShowPositionModal } from 'state/app/reducer'
import { selectFuturesType, selectMarketAsset } from 'state/futures/common/selectors'
import { selectCrossMarginActivePositions } from 'state/futures/crossMargin/selectors'
import { selectSmartMarginActivePositions } from 'state/futures/smartMargin/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import media from 'styles/media'

const PositionsTab = () => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const { switchToL2 } = useNetworkSwitcher()

	const isL2 = useIsL2()

	const crossMarginPositions = useAppSelector(selectCrossMarginActivePositions)
	const smartMarginPositions = useAppSelector(selectSmartMarginActivePositions)
	const currentMarket = useAppSelector(selectMarketAsset)
	const accountType = useAppSelector(selectFuturesType)
	const [showShareModal, setShowShareModal] = useState(false)
	const [sharePosition, setSharePosition] = useState<FuturesPositionTablePositionActive | null>(
		null
	)

	let data = useMemo(() => {
		const positions =
			accountType === FuturesMarginType.SMART_MARGIN ? smartMarginPositions : crossMarginPositions
		return positions.sort((a) => (a.market.asset === currentMarket ? -1 : 1))
	}, [accountType, smartMarginPositions, crossMarginPositions, currentMarket])

	const handleOpenPositionCloseModal = useCallback(
		(marketKey: FuturesMarketKey) => () => {
			dispatch(
				setShowPositionModal({
					type: 'smart_margin_close_position',
					marketKey,
				})
			)
		},
		[dispatch]
	)

	const handleOpenShareModal = useCallback((share: FuturesPositionTablePositionActive) => {
		setSharePosition(share)
		setShowShareModal((s) => !s)
	}, [])

	return (
		<div>
			{data.length === 0 ? (
				!isL2 ? (
					<TableNoResults>
						{t('common.l2-cta')}
						<div onClick={switchToL2}>{t('homepage.l2.cta-buttons.switch-l2')}</div>
					</TableNoResults>
				) : (
					<TableNoResults>
						{t('dashboard.overview.futures-positions-table.no-result')}
					</TableNoResults>
				)
			) : (
				data.map((row) => (
					<PositionItem key={row.market.asset}>
						<PositionMeta
							$side={row.activePosition.side}
							onClick={() => Router.push(ROUTES.Markets.MarketPair(row.market.asset, accountType))}
						>
							<FlexDiv>
								<div className="position-side-bar" />
								<div>
									<Body>{row.market.marketName}</Body>
									<Body capitalized color="secondary">
										{accountType === FuturesMarginType.CROSS_MARGIN
											? 'Cross Margin'
											: 'Smart Margin'}
									</Body>
								</div>
							</FlexDiv>
							<FlexDivRowCentered style={{ columnGap: '5px' }}>
								<Pill size="medium" onClick={handleOpenPositionCloseModal(row.market.marketKey)}>
									Close
								</Pill>
								<Pill size="medium" onClick={() => handleOpenShareModal(row)}>
									<FlexDivRowCentered>Share</FlexDivRowCentered>
								</Pill>
							</FlexDivRowCentered>
						</PositionMeta>
						<PositionRow>
							<PositionCell>
								<Body color="secondary">Size</Body>
								<div>
									<FlexDivRow justifyContent="start">
										<Currency.Price
											price={row.activePosition.size}
											currencyKey={row.market.asset}
										/>
										{accountType === FuturesMarginType.SMART_MARGIN && (
											<>
												<Spacer width={5} />
												<EditPositionButton
													modalType={'futures_edit_position_size'}
													marketKey={row.market.marketKey}
												/>
											</>
										)}
									</FlexDivRow>
									<Spacer width={5} />
									<Currency.Price
										price={row.activePosition.notionalValue}
										formatOptions={{ truncateOver: 1e6 }}
										colorType="secondary"
									/>
								</div>
							</PositionCell>
							<PositionCell>
								<Body color="secondary">Side</Body>
								<FlexDivRow>
									<PositionType side={row.activePosition.side} />
								</FlexDivRow>
							</PositionCell>
							<PositionCell>
								<Body color="secondary">Avg. Entry</Body>
								{row.activePosition?.details?.avgEntryPrice === undefined ? (
									<Body>{NO_VALUE}</Body>
								) : (
									<Currency.Price
										price={row.activePosition?.details.avgEntryPrice}
										formatOptions={{ suggestDecimals: true }}
									/>
								)}
							</PositionCell>
							<PositionCell>
								<Body color="secondary">Market Margin</Body>
								<FlexDivRow justifyContent="start">
									<NumericValue value={row.remainingMargin} />
									{accountType === FuturesMarginType.SMART_MARGIN && (
										<>
											<Spacer width={5} />
											<EditPositionButton
												modalType={'futures_edit_position_margin'}
												marketKey={row.market.marketKey}
											/>
										</>
									)}
								</FlexDivRow>
							</PositionCell>
							<PositionCell>
								<Body color="secondary">Leverage</Body>
								<FlexDivRowCentered>
									<NumericValue value={row.activePosition.leverage} suffix="x" />
								</FlexDivRowCentered>
							</PositionCell>
							<PositionCell>
								<Body color="secondary">Liquidation</Body>
								<Currency.Price
									price={row.activePosition.liquidationPrice}
									formatOptions={{ suggestDecimals: true }}
									colorType="preview"
								/>
							</PositionCell>
							<PositionCell>
								<Body color="secondary">Unrealized PnL</Body>
								<Currency.Price price={row.activePosition.pnl} colored />
							</PositionCell>
							<PositionCell>
								<Body color="secondary">TP/SL</Body>
								<FlexDivRow justifyContent="start">
									{row.takeProfit === undefined ? (
										<Body>{NO_VALUE}</Body>
									) : (
										<Currency.Price price={row.takeProfit} />
									)}
									<Body>/</Body>
									{row.stopLoss === undefined ? (
										<Body color="secondary">{NO_VALUE}</Body>
									) : (
										<Currency.Price price={row.stopLoss} colorType="secondary" />
									)}
									{accountType === FuturesMarginType.SMART_MARGIN && (
										<>
											<Spacer width={5} />
											<EditPositionButton
												modalType={'futures_edit_stop_loss_take_profit'}
												marketKey={row.market.marketKey}
											/>
										</>
									)}
								</FlexDivRow>
							</PositionCell>
							<PositionCell>
								<Body color="secondary">Funding</Body>
								<Currency.Price price={row.activePosition.accruedFunding} colored />
							</PositionCell>
						</PositionRow>
					</PositionItem>
				))
			)}
			{showShareModal && (
				<ShareModal sharePosition={sharePosition!} setShowShareModal={setShowShareModal} />
			)}
		</div>
	)
}

const PositionMeta = styled.div<{ $side: PositionSide }>`
	display: flex;
	justify-content: space-between;
	margin-bottom: 20px;

	.position-side-bar {
		height: 100%;
		width: 4px;
		margin-right: 8px;
		background-color: ${(props) =>
			props.theme.colors.selectedTheme.newTheme.text[
				props.$side === PositionSide.LONG ? 'positive' : 'negative'
			]};
	}
`

const PositionItem = styled.div`
	margin: 0 20px;
	padding: 20px 0;
	${media.greaterThan('md')`
		padding: 16px 0;
	`}

	${media.greaterThan('lg')`
	padding: 8px 0;
`}

	&:not(:last-of-type) {
		border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
	}
`

const PositionRow = styled.div`
	min-height: 22px;
	grid-template-columns: 1fr 1fr;
	display: grid;
	grid-gap: 10px;

	${media.greaterThan('md')`
		grid-template-columns: 1fr 1fr 1fr;
	`}

	${media.greaterThan('lg')`
		grid-template-columns: 1fr 1fr 1fr 1fr;
	`}

	&:not(:last-of-type) {
		margin-bottom: 10px;
	}
`

const PositionCell = styled.div``

export default PositionsTab
