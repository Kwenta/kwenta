import { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import { FlexDivRowCentered } from 'components/layout/flex';
import TVChart from 'components/TVChart';
import {
	selectConditionalOrdersForMarket,
	selectPosition,
	selectPositionPreviewData,
	selectSelectedMarketPositionHistory,
	selectShowHistory,
	selectTradePreview,
} from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import media from 'styles/media';
import { zeroBN } from 'utils/formatters/number';

import TradesHistoryTable from '../TradingHistory/TradesHistoryTable';

type Props = {
	mobile?: boolean;
};

export default function PositionChart({ mobile }: Props) {
	const position = useAppSelector(selectPosition);
	const openOrders = useAppSelector(selectConditionalOrdersForMarket);
	const previewTrade = useAppSelector(selectTradePreview);
	const subgraphPosition = useAppSelector(selectSelectedMarketPositionHistory);
	const positionPreview = useAppSelector(selectPositionPreviewData);
	const showHistory = useAppSelector(selectShowHistory);

	const [showOrderLines, setShowOrderLines] = useState(true);
	const [isChartReady, setIsChartReady] = useState(false);

	const modifiedAverage = positionPreview?.avgEntryPrice ?? zeroBN;

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
			<InnerContainer>
				<ChartContainer>
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
				</ChartContainer>
				{showHistory && !mobile && <TradesHistoryTable />}
			</InnerContainer>
		</Container>
	);
}

const Container = styled.div<{ visible: boolean }>`
		${media.greaterThan('mdUp')`
		height: calc(100vh - 450px);
		`}
		${media.lessThan('md')`
			height: 100%;
		`}
	background: ${(props) => props.theme.colors.selectedTheme.background};
	visibility: ${(props) => (props.visible ? 'visible' : 'hidden')};
	border-bottom: ${(props) => props.theme.colors.selectedTheme.border};

`;

const InnerContainer = styled(FlexDivRowCentered)`
	height: 100%;
`;

const ChartContainer = styled.div`
	flex: 1;
	height: 100%;
`;
