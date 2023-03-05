import { GasPrice } from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';

export const parseGasPriceObject = (gasPriceObject: GasPrice) => {
	const { gasPrice, maxFeePerGas } = gasPriceObject;
	if (gasPrice) {
		return wei(gasPriceObject.gasPrice, 9).toNumber();
	} else if (maxFeePerGas) {
		return wei(gasPriceObject.maxFeePerGas, 9).toNumber();
	} else {
		return null;
	}
};
