import { useCallback, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import TVChart from 'components/TVChart';
import { selectMarketAsset, selectPosition } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import {
	potentialTradeDetailsState,
	futuresTradeInputsState,
	positionHistoryState,
	futuresAccountTypeState,
	openOrdersState,
} from 'store/futures';

export default function PositionChart() {
	const marketAsset = useAppSelector(selectMarketAsset);
	const position = useAppSelector(selectPosition);
	const positionHistory = useRecoilValue(positionHistoryState);
	const futuresAccountType = useRecoilValue(futuresAccountTypeState);
	const openOrders = useRecoilValue(openOrdersState);
	const { data: previewTrade } = useRecoilValue(potentialTradeDetailsState);

	const [showOrderLines, setShowOrderLines] = useState(true);
	const [isChartReady, setIsChartReady] = useState(false);

	const subgraphPosition = useMemo(() => {
		return positionHistory[futuresAccountType].find((p) => p.isOpen && p.asset === marketAsset);
	}, [positionHistory, marketAsset, futuresAccountType]);

	const { nativeSize } = useRecoilValue(futuresTradeInputsState);

	const modifiedAverage = useMemo(() => {
		if (subgraphPosition && previewTrade && !!nativeSize) {
			const totalSize = subgraphPosition.size.add(nativeSize);

			const existingValue = subgraphPosition.avgEntryPrice.mul(subgraphPosition.size);
			const newValue = previewTrade.price.mul(nativeSize);
			const totalValue = existingValue.add(newValue);
			return totalValue.div(totalSize);
		}
		return null;
	}, [subgraphPosition, previewTrade, nativeSize]);

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
		setShowOrderLines(!showOrderLines);
	}, [setShowOrderLines, showOrderLines]);

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
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 10px;
	padding: 3px;
	min-height: 450px;
	background: ${(props) => props.theme.colors.selectedTheme.background};
	visibility: ${(props) => (props.visible ? 'visible' : 'hidden')};
`;
