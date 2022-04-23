import React from 'react';
import { wei } from '@synthetixio/wei';

import StatWithContainer from './StatWithContainer';
import { PositionSide } from '../types';

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

	// Calculate values for each stat
	if (entryPrice !== '' && exitPrice !== '' && stopLoss !== '' && amountInAsset !== '') {
		if (leverageSide === 'long') {
			profit = wei(exitPrice).sub(entryPrice).mul(amountInAsset).toNumber().toFixed(2);
			loss = wei(stopLoss).sub(entryPrice).mul(amountInAsset).toNumber().toFixed(2);
		} else {
			profit = wei(entryPrice).sub(exitPrice).mul(amountInAsset).toNumber().toFixed(2);
			loss = wei(entryPrice).sub(exitPrice).mul(amountInAsset).toNumber().toFixed(2);
		}

		if (wei(profit).gt(0) && wei(loss).abs().gt(0)) {
			rateOfReturn = wei(profit).div(wei(loss).abs()).toNumber().toFixed(2);
		}
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
