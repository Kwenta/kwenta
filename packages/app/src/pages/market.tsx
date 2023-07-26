import { FuturesMarginType, FuturesMarketAsset } from '@kwenta/sdk/types'
import { MarketKeyByAsset } from '@kwenta/sdk/utils'
import { useRouter } from 'next/router'
import { useEffect, FC, ReactNode, useMemo } from 'react'
import styled from 'styled-components'

import Loader from 'components/Loader'
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'
import Connector from 'containers/Connector'
import useIsL2 from 'hooks/useIsL2'
import useWindowSize from 'hooks/useWindowSize'
import CloseCrossMarginPositionModal from 'sections/futures/ClosePositionModal/CloseCrossMarginPositionModal'
import ClosePositionModal from 'sections/futures/ClosePositionModal/ClosePositionModal'
import CreatePerpsV3AccountModal from 'sections/futures/CreatePerpsV3AccountModal'
import EditPositionMarginModal from 'sections/futures/EditPositionModal/EditPositionMarginModal'
import EditPositionSizeModal from 'sections/futures/EditPositionModal/EditPositionSizeModal'
import EditStopLossAndTakeProfitModal from 'sections/futures/EditPositionModal/EditStopLossAndTakeProfitModal'
import MarketInfo from 'sections/futures/MarketInfo'
import MarketHead from 'sections/futures/MarketInfo/MarketHead'
import MobileTrade from 'sections/futures/MobileTrade/MobileTrade'
import SmartMarginOnboard from 'sections/futures/SmartMarginOnboard'
import { TRADE_PANEL_WIDTH_LG, TRADE_PANEL_WIDTH_MD } from 'sections/futures/styles'
import DepositWithdrawCrossMarginModal from 'sections/futures/Trade/DepositWithdrawCrossMargin'
import FuturesUnsupportedNetwork from 'sections/futures/Trade/FuturesUnsupported'
import TradePanel from 'sections/futures/Trade/TradePanel'
import TradePanelCrossMargin from 'sections/futures/Trade/TradePanelCrossMargin'
import DelayedOrderConfirmationModal from 'sections/futures/TradeConfirmation/CrossMarginOrderConfirmation'
import TradeConfirmationModalCrossMargin from 'sections/futures/TradeConfirmation/TradeConfirmationModalCrossMargin'
import WithdrawSmartMargin from 'sections/futures/TradeSmartMargin/WithdrawSmartMargin'
import AppLayout from 'sections/shared/Layout/AppLayout'
import { setOpenModal } from 'state/app/reducer'
import { selectShowModal, selectShowPositionModal } from 'state/app/selectors'
import { clearTradeInputs } from 'state/futures/actions'
import { selectFuturesType, selectMarketAsset } from 'state/futures/common/selectors'
import { AppFuturesMarginType } from 'state/futures/common/types'
import { selectCrossMarginSupportedNetwork } from 'state/futures/crossMargin/selectors'
import { selectShowCrossMarginOnboard } from 'state/futures/crossMargin/selectors'
import { usePollMarketFuturesData } from 'state/futures/hooks'
import { setFuturesAccountType } from 'state/futures/reducer'
import { setMarketAsset } from 'state/futures/smartMargin/reducer'
import {
	selectShowSmartMarginOnboard,
	selectSmartMarginAccount,
	selectSmartMarginAccountQueryStatus,
} from 'state/futures/smartMargin/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { FetchStatus } from 'state/types'
import { PageContent } from 'styles/common'
import media from 'styles/media'

type MarketComponent = FC & { getLayout: (page: ReactNode) => JSX.Element }

const Market: MarketComponent = () => {
	const router = useRouter()
	const { walletAddress } = Connector.useContainer()
	const dispatch = useAppDispatch()
	const { lessThanWidth } = useWindowSize()
	usePollMarketFuturesData()

	const routerMarketAsset = router.query.asset as FuturesMarketAsset

	const setCurrentMarket = useAppSelector(selectMarketAsset)
	const showOnboard = useAppSelector(selectShowSmartMarginOnboard)
	const showCrossMarginOnboard = useAppSelector(selectShowCrossMarginOnboard)
	const openModal = useAppSelector(selectShowModal)
	const showPositionModal = useAppSelector(selectShowPositionModal)
	const accountType = useAppSelector(selectFuturesType)
	const selectedMarketAsset = useAppSelector(selectMarketAsset)
	const crossMarginSupported = useAppSelector(selectCrossMarginSupportedNetwork)

	const routerAccountType = useMemo(() => {
		if (router.query.accountType === 'cross_margin' && crossMarginSupported) {
			return router.query.accountType as AppFuturesMarginType
		}
		return FuturesMarginType.SMART_MARGIN
	}, [router.query.accountType, crossMarginSupported])

	useEffect(() => {
		if (router.isReady && accountType !== routerAccountType) {
			dispatch(setFuturesAccountType(routerAccountType))
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router.isReady, routerAccountType])

	useEffect(() => {
		dispatch(clearTradeInputs())
		// Clear trade state when switching address
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [walletAddress])

	useEffect(() => {
		if (
			selectedMarketAsset !== routerMarketAsset &&
			routerMarketAsset &&
			MarketKeyByAsset[routerMarketAsset]
		) {
			dispatch(setMarketAsset(routerMarketAsset))
			dispatch(clearTradeInputs())
		}
	}, [router, setCurrentMarket, dispatch, routerMarketAsset, selectedMarketAsset])

	return (
		<>
			<MarketHead />
			<SmartMarginOnboard isOpen={showOnboard} />
			<CreatePerpsV3AccountModal isOpen={showCrossMarginOnboard} />
			<DesktopOnlyView>
				{lessThanWidth('lg') ? (
					<PageContent>
						<TabletContainer>
							<TradePanelDesktop />
							<TabletRightSection>
								<MobileTrade />
							</TabletRightSection>
						</TabletContainer>
					</PageContent>
				) : (
					<PageContent>
						<StyledFullHeightContainer>
							<TradePanelDesktop />
							<MarketInfo />
						</StyledFullHeightContainer>
					</PageContent>
				)}
			</DesktopOnlyView>
			<MobileOrTabletView>
				<MobileTrade />
			</MobileOrTabletView>
			{showPositionModal?.type === 'smart_margin_close_position' && <ClosePositionModal />}
			{showPositionModal?.type === 'cross_margin_close_position' && (
				<CloseCrossMarginPositionModal />
			)}
			{showPositionModal?.type === 'futures_edit_stop_loss_take_profit' && (
				<EditStopLossAndTakeProfitModal />
			)}
			{showPositionModal?.type === 'futures_edit_position_size' && <EditPositionSizeModal />}
			{showPositionModal?.type === 'futures_edit_position_margin' && <EditPositionMarginModal />}
			{openModal === 'futures_deposit_withdraw_cross_margin' && (
				<DepositWithdrawCrossMarginModal
					defaultTab="deposit"
					onDismiss={() => dispatch(setOpenModal(null))}
				/>
			)}
			{openModal === 'futures_withdraw_smart_margin' && (
				<WithdrawSmartMargin onDismiss={() => dispatch(setOpenModal(null))} />
			)}

			{openModal === 'futures_confirm_smart_margin_trade' && <TradeConfirmationModalCrossMargin />}
			{openModal === 'futures_confirm_cross_margin_trade' && <DelayedOrderConfirmationModal />}
		</>
	)
}

function TradePanelDesktop() {
	const router = useRouter()
	const isL2 = useIsL2()
	const { walletAddress } = Connector.useContainer()
	const accountType = useAppSelector(selectFuturesType)
	const queryStatus = useAppSelector(selectSmartMarginAccountQueryStatus)
	const smartMarginAccount = useAppSelector(selectSmartMarginAccount)
	const openModal = useAppSelector(selectShowModal)

	if (walletAddress && !isL2 && openModal !== 'futures_smart_margin_socket') {
		return <FuturesUnsupportedNetwork />
	}

	if (
		!router.isReady ||
		(accountType === FuturesMarginType.SMART_MARGIN &&
			walletAddress &&
			!smartMarginAccount &&
			queryStatus.status === FetchStatus.Idle)
	) {
		return (
			<LoaderContainer>
				<Loader inline />
			</LoaderContainer>
		)
	}

	return accountType === FuturesMarginType.CROSS_MARGIN ? <TradePanelCrossMargin /> : <TradePanel />
}

Market.getLayout = (page) => <AppLayout>{page}</AppLayout>

export default Market

const StyledFullHeightContainer = styled.div`
	border-top: ${(props) => props.theme.colors.selectedTheme.border};
	display: grid;
	grid-gap: 0;
	flex: 1;
	height: calc(100% - 64px);
	width: 100vw;
	grid-template-columns: ${TRADE_PANEL_WIDTH_LG}px 1fr;
	${media.lessThan('xxl')`
		grid-template-columns: ${TRADE_PANEL_WIDTH_MD}px 1fr;
	`}
`

const LoaderContainer = styled.div`
	text-align: center;
	width: 100%;
	padding: 50px;
`

const TabletContainer = styled.div`
	border-top: ${(props) => props.theme.colors.selectedTheme.border};
	display: grid;
	grid-template-columns: ${TRADE_PANEL_WIDTH_MD}px 1fr;
	height: 100%;
`

const TabletRightSection = styled.div`
	overflow-y: scroll;
	height: 100%;
`
