import { PositionSide } from '@kwenta/sdk/types'
import { FC, memo, useCallback } from 'react'
import styled, { css } from 'styled-components'

import Error from 'components/ErrorView'
import { changeCrossMarginLeverageSide } from 'state/futures/crossMargin/actions'
import { selectLeverageSide } from 'state/futures/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { selectPricesConnectionError } from 'state/prices/selectors'

import LeverageInput from '../LeverageInput'
import OrderSizing from '../OrderSizing'
import PositionButtons from '../PositionButtons'

import CloseOnlyPrompt from './CloseOnlyPrompt'
import CrossMarginTradePanelPreview from './CrossMarginTradePanelPreview'
import MarketsDropdown from './MarketsDropdown'
import SubmitCrossMarginTradeButton from './SubmitCrossMarginTrade'
import TradeBalanceCrossMargin from './TradeBalanceCrossMargin'

type Props = {
	mobile?: boolean
	closeDrawer?: () => void
}

const TradePanelCrossMargin: FC<Props> = memo(({ mobile, closeDrawer }) => {
	const dispatch = useAppDispatch()

	const leverageSide = useAppSelector(selectLeverageSide)
	const pricesConnectionError = useAppSelector(selectPricesConnectionError)

	const handleChangeSide = useCallback(
		(side: PositionSide) => {
			dispatch(changeCrossMarginLeverageSide(side))
		},
		[dispatch]
	)

	return (
		<TradePanelContainer $mobile={mobile} data-testid="cross-margin-trade-panel">
			{!mobile && (
				<>
					<MarketsDropdown />
					<TradeBalanceCrossMargin />
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
						{
							// TODO: Share across trade panels
							pricesConnectionError && (
								<Error message="Failed to connect to price feed. Please try disabling any ad blockers and refresh." />
							)
						}

						<OrderSizing />
						<LeverageInput />
						<SubmitCrossMarginTradeButton />
						<CrossMarginTradePanelPreview />
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

export default TradePanelCrossMargin
