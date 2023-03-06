import { wei } from '@synthetixio/wei';

import { GasPrice } from 'state/app/types';

export const parseGasPriceObject = ({ gasPrice, maxFeePerGas }: GasPrice) => {
	if (gasPrice) {
		return wei(gasPrice, 9).toNumber();
	} else if (maxFeePerGas) {
		return wei(maxFeePerGas, 9).toNumber();
	} else {
		return null;
	}
};
