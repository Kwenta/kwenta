import { wei } from '@synthetixio/wei';
import React from 'react';

import { PositionSide } from 'sdk/types/futures';

import StatWithContainer from './StatWithContainer';

type PnLsProps = {
	stopLoss: string;
	exitPrice: string;
	entryPrice: string;
	amountInAsset: string;
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

	// Calculate values for each stat
	if (leverageSide === 'long') {
		if (entryPrice !== '' && exitPrice !== '' && amountInAsset !== '') {
			labelsWithStats['Exit PnL'] = wei(exitPrice)
				.sub(entryPrice)
				.mul(amountInAsset)
				.toNumber()
				.toFixed(2);
		}

		if (entryPrice !== '' && stopLoss !== '' && amountInAsset !== '') {
			labelsWithStats['Stop PnL'] = wei(stopLoss)
				.sub(entryPrice)
				.mul(amountInAsset)
				.toNumber()
				.toFixed(2);
		}
	} else {
		if (entryPrice !== '' && exitPrice !== '' && amountInAsset !== '') {
			labelsWithStats['Exit PnL'] = wei(entryPrice)
				.sub(exitPrice)
				.mul(amountInAsset)
				.toNumber()
				.toFixed(2);
		}

		if (entryPrice !== '' && stopLoss !== '' && amountInAsset !== '') {
			labelsWithStats['Stop PnL'] = wei(entryPrice)
				.sub(stopLoss)
				.mul(amountInAsset)
				.toNumber()
				.toFixed(2);
		}
	}

	if (wei(labelsWithStats['Exit PnL']).gt(0) && wei(labelsWithStats['Stop PnL']).abs().gt(0)) {
		labelsWithStats['R:R'] = wei(labelsWithStats['Exit PnL'])
			.div(wei(labelsWithStats['Stop PnL']).abs())
			.toNumber()
			.toFixed(2);
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
