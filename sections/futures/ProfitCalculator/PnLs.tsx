import React from 'react';
import Wei from '@synthetixio/wei';

import StatWithContainer from './StatWithContainer';
import { PositionSide } from '../types';

type PnLsProps = {
	stopLoss: Wei;
	exitPrice: Wei;
	entryPrice: Wei;
	amountInAsset: Wei;
	leverageSide: PositionSide;
};

const PnLs: React.FC<PnLsProps> = ({
	stopLoss,
	exitPrice,
	entryPrice,
	amountInAsset,
	leverageSide,
}) => {
	let rateOfReturn: any = 0,
		profit: any = 0,
		loss: any = 0;

	const labelsWithStats: any = {
		'Exit PnL': profit,
		'Stop PnL': loss,
		'R:R': rateOfReturn,
	};

	if (!entryPrice.eq(0) && !exitPrice.eq(0) && !stopLoss.eq(0)) {
		if (leverageSide === 'long') {
			labelsWithStats['Exit PnL'] = exitPrice.sub(entryPrice).mul(amountInAsset).toNumber();
			labelsWithStats['Stop PnL'] = stopLoss.sub(entryPrice).mul(amountInAsset).toNumber();
		} else {
			labelsWithStats['Exit PnL'] = entryPrice.sub(exitPrice).mul(amountInAsset).toNumber();
			labelsWithStats['Stop PnL'] = entryPrice.sub(exitPrice).mul(amountInAsset).toNumber();
		}

		const rateOfReturn_ = parseFloat(
			(labelsWithStats['Exit PnL'] / Math.abs(labelsWithStats['Stop PnL'])).toFixed(2)
		);

		if (!isNaN(rateOfReturn_))
			labelsWithStats['R:R'] = (
				labelsWithStats['Exit PnL'] / Math.abs(labelsWithStats['Stop PnL'])
			).toFixed(2);
	}

	return (
		<>
			{Object.keys(labelsWithStats).map((label: string, index: number) => (
				<StatWithContainer key={label} label={label} stat={labelsWithStats[label]} type={index} />
			))}
		</>
	);
};

export default PnLs;
