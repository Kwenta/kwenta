import { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import TVChart from 'components/TVChart';
import useAverageEntryPrice from 'hooks/useAverageEntryPrice';
import {
	selectCrossMarginOpenOrders,
	selectPosition,
	selectSelectedMarketPositionHistory,
	selectTradePreview,
} from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';

export default function PositionChart() {
	const position = useAppSelector(selectPosition);
	const openOrders = useAppSelector(selectCrossMarginOpenOrders);
	const previewTrade = useAppSelector(selectTradePreview);
	const subgraphPosition = useAppSelector(selectSelectedMarketPositionHistory);

	const [showOrderLines, setShowOrderLines] = useState(true);
	const [isChartReady, setIsChartReady] = useState(false);

	const modifiedAverage = useAverageEntryPrice(subgraphPosition);

	const activePosition = useMemo(() => {
		if (!position?.position) {
			return null;
		}

		return {
			// As there's often a delay in subgraph sync we use the contract last
			// price until we get average price to keep it snappy on opening a position
			price: subgraphPosition?.avgEntryPrice ?? position.position.lastPrice,
			size: position.position.size,
			liqPrice: position.position?.liquidationPrice,
		};
	}, [subgraphPosition, position]);

	const onToggleLines = useCallback(() => {
		setShowOrderLines((show) => !show);
	}, [setShowOrderLines]);

	return (
		<Container visible={isChartReady}>
			<TVChart
				openOrders={openOrders}
				activePosition={activePosition}
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
					setIsChartReady(true);
				}}
				showOrderLines={showOrderLines}
				onToggleShowOrderLines={onToggleLines}
			/>
		</Container>
	);
}

const Container = styled.div<{ visible: boolean }>`
	height: calc(100% - 315px);
	background: ${(props) => props.theme.colors.selectedTheme.background};
	visibility: ${(props) => (props.visible ? 'visible' : 'hidden')};
	border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
`;
