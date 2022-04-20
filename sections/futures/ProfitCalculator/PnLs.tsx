import { ethers } from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';

import StatWithContainer from './StatWithContainer';
import { PositionSide } from '../types';

export const PnLs = (props: {
	scalar: number;
	stopLoss: BigNumber;
	exitPrice: BigNumber;
	entryPrice: BigNumber;
	amountInAsset: BigNumber;
	leverageSide: PositionSide;
}) => {
	let rateOfReturn: any = 0,
		profit: any = ethers.BigNumber.from(0),
		loss: any = ethers.BigNumber.from(0);

	const labels = ['Exit PnL', 'Stop PnL', 'R:R'];

	if (
		parseFloat(props.entryPrice.toString()) !== 0 &&
		parseFloat(props.exitPrice.toString()) !== 0 &&
		parseFloat(props.stopLoss.toString()) !== 0
	) {
		console.log('eveerageSide: ', props.leverageSide);

		if (props.leverageSide === 'long') {
			profit = props.exitPrice.sub(props.entryPrice).mul(props.amountInAsset).toNumber();
			loss = props.stopLoss.sub(props.entryPrice).mul(props.amountInAsset).toNumber();
		} else {
			profit = props.entryPrice.sub(props.exitPrice).mul(props.amountInAsset).toNumber();
			loss = props.entryPrice.sub(props.exitPrice).mul(props.amountInAsset).toNumber();
		}

		rateOfReturn = (profit / Math.abs(loss)).toFixed(2);
	}

	const returnStateVar = (index: number) => {
		if (index === 0) return (profit / props.scalar).toString();
		if (index === 1) return (loss / props.scalar).toString();
		if (index === 2) return rateOfReturn;
	};

	return (
		<>
			{labels.map((_label: string, index: number) => (
				<StatWithContainer
					key={index}
					label={_label}
					stateVar={returnStateVar(index)}
					type={index}
				/>
			))}
		</>
	);
};

export default PnLs;
