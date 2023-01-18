import { useMemo } from 'react';

import { PositionSide } from 'queries/futures/types';
import { selectTradePreview } from 'state/futures/selectors';
import { PositionHistory } from 'state/futures/types';
import { useAppSelector } from 'state/hooks';

// Used to calculate the new average entry price of a modified position
const useAverageEntryPrice = (positionHistory?: PositionHistory) => {
	const previewTrade = useAppSelector(selectTradePreview);

	return useMemo(() => {
		if (positionHistory && previewTrade) {
			const { avgEntryPrice, side, size } = positionHistory;
			const currentSize = side === PositionSide.SHORT ? size.neg() : size;

			// If the trade switched sides (long -> short or short -> long), use oracle price
			if (currentSize.mul(previewTrade.size).lt(0)) return previewTrade.price;

			// If the trade reduced position size on the same side, average entry remains the same
			if (previewTrade.size.abs().lt(size)) return avgEntryPrice;

			// If the trade increased position size on the same side, calculate new average
			const existingValue = avgEntryPrice.mul(size);
			const newValue = previewTrade.price.mul(previewTrade.sizeDelta.abs());
			const totalValue = existingValue.add(newValue);
			return totalValue.div(previewTrade.size.abs());
		}
		return null;
	}, [positionHistory, previewTrade]);
};

export default useAverageEntryPrice;
