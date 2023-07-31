import { ZERO_WEI } from '@kwenta/sdk/constants'
import { useCallback, useMemo, useState } from 'react'
import styled, { css } from 'styled-components'

import { FlexDiv } from 'components/layout/flex'
import TVChart from 'components/TVChart'
import {
	selectConditionalOrdersForMarket,
	selectMarketIndexPrice,
	selectPosition,
	selectPositionPreviewData,
	selectSelectedMarketPositionHistory,
	selectTradePreview,
} from 'state/futures/selectors'
import { useAppSelector } from 'state/hooks'

type PositionChartProps = {
	display?: boolean
}

export default function PositionChart({ display = true }: PositionChartProps) {
	const position = useAppSelector(selectPosition)
	const openOrders = useAppSelector(selectConditionalOrdersForMarket)
	const previewTrade = useAppSelector(selectTradePreview)
	const subgraphPosition = useAppSelector(selectSelectedMarketPositionHistory)
	const positionPreview = useAppSelector(selectPositionPreviewData)
	const initialPrice = useAppSelector(selectMarketIndexPrice)

	const [showOrderLines, setShowOrderLines] = useState(true)
	const [isChartReady, setIsChartReady] = useState(false)

	const modifiedAverage = positionPreview?.avgEntryPrice ?? ZERO_WEI

	const activePosition = useMemo(() => {
		if (!position?.position) {
			return null
		}

		return {
			// As there's often a delay in subgraph sync we use the contract last
			// price until we get average price to keep it snappy on opening a position
			price: subgraphPosition?.avgEntryPrice ?? position.position.lastPrice,
			size: position.position.size,
			liqPrice: position.position?.liquidationPrice,
		}
	}, [subgraphPosition, position])

	const onToggleLines = useCallback(() => {
		setShowOrderLines((show) => !show)
	}, [setShowOrderLines])

	return (
		<Container $visible={isChartReady} $display={display}>
			<TVChart
				openOrders={openOrders}
				activePosition={activePosition}
				initialPrice={initialPrice.toString()}
				potentialTrade={
					previewTrade
						? {
								price: modifiedAverage || previewTrade.price,
								liqPrice: previewTrade.liqPrice,
								size: previewTrade.size,
						  }
						: null
				}
				onChartReady={() => {
					setIsChartReady(true)
				}}
				showOrderLines={showOrderLines}
				onToggleShowOrderLines={onToggleLines}
			/>
		</Container>
	)
}

const Container = styled(FlexDiv)<{ $visible: boolean; $display?: boolean }>`
	flex: 1;
	height: 100%;
	width: 100%;
	visibility: ${(props) => (props.$visible ? 'visible' : 'hidden')};
	${(props) =>
		!props.$display &&
		css`
			display: none;
		`}
`
