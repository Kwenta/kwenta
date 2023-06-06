import { wei } from '@synthetixio/wei';
import { useMemo } from 'react';

import { Body } from 'components/Text';
import { formatPercent } from 'sdk/utils/number';
import { selectEditPositionModalInfo, selectMarketPrice } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';

type ShowPercentageProps = {
	targetPrice: string;
	isStopLoss?: boolean;
	isTradePanel?: boolean;
};

const ShowPercentage: React.FC<ShowPercentageProps> = ({
	targetPrice,
	isStopLoss = false,
	isTradePanel = false,
}) => {
	const { marketPrice, position } = useAppSelector(selectEditPositionModalInfo);
	const price = useAppSelector(selectMarketPrice);
	const currentPrice = isTradePanel ? price : marketPrice;
	const leverageSide = position?.position?.side;

	const leverageWei = useMemo(() => {
		return position?.position?.leverage.gt(0) ? wei(position.position.leverage) : wei(1);
	}, [position?.position?.leverage]);

	const calculatePercentage = () => {
		if (!targetPrice || !currentPrice) return '';
		const priceWei = wei(targetPrice);
		const diff =
			leverageSide === 'short'
				? isStopLoss
					? priceWei.sub(currentPrice)
					: currentPrice.sub(priceWei)
				: isStopLoss
				? currentPrice.sub(priceWei)
				: priceWei.sub(currentPrice);

		return formatPercent(diff.div(currentPrice).mul(leverageWei));
	};
	return (
		<Body size="large" mono>
			{calculatePercentage()}
		</Body>
	);
};

export default ShowPercentage;
