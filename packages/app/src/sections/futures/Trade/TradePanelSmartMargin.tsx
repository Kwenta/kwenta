import { PositionSide } from '@kwenta/sdk/types'
import { FC, memo, useCallback, useState, useEffect } from 'react'
import styled, { css } from 'styled-components'

import Error from 'components/ErrorView'
import Spacer from 'components/Spacer'
import { selectAckedOrdersWarning } from 'state/app/selectors'
import { selectLeverageSide } from 'state/futures/selectors'
import { changeLeverageSide } from 'state/futures/smartMargin/actions'
import { setOrderType } from 'state/futures/smartMargin/reducer'
import { selectOrderType } from 'state/futures/smartMargin/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { selectPricesConnectionError } from 'state/prices/selectors'

import LeverageInput from '../LeverageInput'
import MarginInput from '../MarginInput'
import OrderSizing from '../OrderSizing'
import PositionButtons from '../PositionButtons'

import CloseOnlyPrompt from './CloseOnlyPrompt'
import ManagePosition from './ManagePosition'
import MarketsDropdown from './MarketsDropdown'
import OrderAcknowledgement from './OrderAcknowledgement'
import OrderTypeSelector from './OrderTypeSelector'
import SLTPInputs from './SLTPInputs'
import SmartMarginTradePanelPreview from './SmartMarginTradePanelPreview'
import TradeBalance from './TradeBalanceSmartMargin'
import OrderPriceInput from './TradePanelPriceInput'

type Props = {
	mobile?: boolean
	closeDrawer?: () => void
}

const TradePanelSmartMargin: FC<Props> = memo(({ mobile, closeDrawer }) => {
	const dispatch = useAppDispatch()

	const leverageSide = useAppSelector(selectLeverageSide)
	const orderType = useAppSelector(selectOrderType)
	const pricesConnectionError = useAppSelector(selectPricesConnectionError)
	const hideOrderWarning = useAppSelector(selectAckedOrdersWarning)

	const [showOrderWarning, setShowOrderWarning] = useState(false)

	const handleChangeSide = useCallback(
		(side: PositionSide) => {
			dispatch(changeLeverageSide(side))
		},
		[dispatch]
	)

	useEffect(() => {
		if (hideOrderWarning) return
		setShowOrderWarning(orderType !== 'market')
	}, [orderType, hideOrderWarning])

	return (
		<TradePanelContainer $mobile={mobile}>
			{!mobile && (
				<>
					<MarketsDropdown />
					<TradeBalance />
				</>
			)}

			{process.env.NEXT_PUBLIC_CLOSE_ONLY === 'true' ? (
				<CloseOnlyPrompt $mobile={mobile} />
			) : (
				<>
					<PositionButtons
						selected={leverageSide}
						onSelect={handleChangeSide}
						mobile={mobile}
						closeDrawer={closeDrawer}
					/>

					<MainPanelContent $mobile={mobile}>
						{pricesConnectionError && (
							<Error message="Failed to connect to price feed. Please try disabling any ad blockers and refresh." />
						)}
						<OrderTypeSelector orderType={orderType} setOrderTypeAction={setOrderType} />

						{showOrderWarning ? (
							<>
								<Spacer height={16} />
								<OrderAcknowledgement
									inContainer
									onClick={() => setShowOrderWarning(!showOrderWarning)}
								/>
							</>
						) : (
							<>
								<MarginInput />
								{orderType !== 'market' && (
									<>
										<OrderPriceInput />
										<Spacer height={16} />
									</>
								)}
								<Spacer height={16} />
								<OrderSizing />
								<LeverageInput />
								<SLTPInputs />
								<ManagePosition />
								<SmartMarginTradePanelPreview />
							</>
						)}
					</MainPanelContent>
				</>
			)}
		</TradePanelContainer>
	)
})

const TradePanelContainer = styled.div<{ $mobile?: boolean }>`
	overflow-y: scroll;
	height: 100%;
	scrollbar-width: none;
	border-right: ${(props) => props.theme.colors.selectedTheme.border};
`

const MainPanelContent = styled.div<{ $mobile?: boolean }>`
	padding: 0 15px;

	${(props) =>
		props.$mobile &&
		css`
			padding: 65px 15px 0;
		`}
`

export default TradePanelSmartMargin
