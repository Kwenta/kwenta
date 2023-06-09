import Wei, { wei } from '@synthetixio/wei';
import { useMemo } from 'react';

import { Body } from 'components/Text';
import { PositionSide } from 'sdk/types/futures';
import { formatPercent } from 'sdk/utils/number';

type ShowPercentageProps = {
	targetPrice: string;
	isStopLoss?: boolean;
	currentPrice: Wei;
	leverageSide: PositionSide | string | undefined;
	leverageWei: Wei;
};

const ShowPercentage: React.FC<ShowPercentageProps> = ({
	targetPrice,
	isStopLoss = false,
	currentPrice,
	leverageSide,
	leverageWei,
}) => {
	const calculatePercentage = useMemo(() => {
		// eslint-disable-next-line no-console
		console.log(
			`targetPrice: ${targetPrice}, currentPrice: ${currentPrice}, leverageSide: ${leverageSide}`
		);
		if (!targetPrice || !currentPrice || !leverageSide) return '';
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
	}, [currentPrice, isStopLoss, leverageSide, leverageWei, targetPrice]);

	return (
		<Body size="large" mono>
			{calculatePercentage}
		</Body>
	);
};

export default ShowPercentage;
