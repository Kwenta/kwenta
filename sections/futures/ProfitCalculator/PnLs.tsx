import { ethers } from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';

import StatWithContainer from './StatWithContainer';

export const PnLs = (props: {
	scalar: number;
	entryPrice: BigNumber;
	exitPrice: BigNumber;
	stopLoss: BigNumber;
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
		profit = props.exitPrice.sub(props.entryPrice).toNumber();
		loss = props.stopLoss.sub(props.entryPrice).toNumber();

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
