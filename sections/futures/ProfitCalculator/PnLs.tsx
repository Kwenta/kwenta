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

	// Calculate values for each stat
	if (!entryPrice.eq(0) && !exitPrice.eq(0) && !stopLoss.eq(0)) {
		if (leverageSide === 'long') {
			profit = exitPrice.sub(entryPrice).mul(amountInAsset).toNumber();
			loss = stopLoss.sub(entryPrice).mul(amountInAsset).toNumber();
		} else {
			profit = entryPrice.sub(exitPrice).mul(amountInAsset).toNumber();
			loss = entryPrice.sub(exitPrice).mul(amountInAsset).toNumber();
		}

		const rateOfReturn_ = parseFloat((profit / Math.abs(loss)).toFixed(2));

		if (!isNaN(rateOfReturn_)) rateOfReturn = rateOfReturn_;
	}

	const labelsWithStats: any = {
		'Exit PnL': profit,
		'Stop PnL': loss,
		'R:R': rateOfReturn,
	};

	return (
		<>
			{Object.keys(labelsWithStats).map((label: string, index: number) => (
				<StatWithContainer key={label} label={label} stat={labelsWithStats[label]} type={index} />
			))}
		</>
	);
};

export default PnLs;
