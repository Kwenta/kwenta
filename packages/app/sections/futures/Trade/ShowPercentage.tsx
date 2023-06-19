import { PositionSide } from '@kwenta/sdk/types';
import { formatPercent } from '@kwenta/sdk/utils';
import Wei, { wei } from '@synthetixio/wei';
import { useMemo } from 'react';

import { Body } from 'components/Text';

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
