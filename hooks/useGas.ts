import { useMemo, useCallback, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { BigNumber } from 'ethers';

import useSynthetixQueries, { GasPrice, GasPrices } from '@synthetixio/queries';
import { customGasPriceState, gasSpeedState } from 'store/wallet';
import { normalizeGasLimit, gasPriceInWei } from 'utils/network';
import { wei } from '@synthetixio/wei';

// TODO add support for 1559. For now use maxFeePerGas (legacy)
export const parseGasPriceObject = (gasPriceObject: GasPrice): number | null => {
	const { gasPrice, maxFeePerGas } = gasPriceObject;
	if (gasPrice) {
		return wei(gasPriceObject.gasPrice, 9).toNumber();
	} else if (maxFeePerGas) {
		return wei(gasPriceObject.maxFeePerGas, 9).toNumber();
	} else {
		return null;
	}
};

const useGas = () => {
	const { useEthGasPriceQuery } = useSynthetixQueries();
	const ethGasPriceQuery = useEthGasPriceQuery();
	const [customGasPrice, setCustomGasPrice] = useRecoilState(customGasPriceState);
	const gasSpeed = useRecoilValue(gasSpeedState);
	const [isCustomGasPrice, setIsCustomGasPrice] = useState(false);

	const gasPrice = useMemo(() => {
		if (customGasPrice !== '') {
			setIsCustomGasPrice(true);
			return Number(customGasPrice);
		} else {
			setIsCustomGasPrice(false);
		}

		return ethGasPriceQuery.data != null
			? parseGasPriceObject(ethGasPriceQuery.data[gasSpeed])
			: null;
	}, [customGasPrice, ethGasPriceQuery.data, gasSpeed]);

	const getGasLimitEstimate = useCallback(async (getGasEstimate: () => Promise<BigNumber>): Promise<
		number | null
	> => {
		try {
			const gasEstimate = await getGasEstimate();
			return normalizeGasLimit(Number(gasEstimate));
		} catch (e) {
			return null;
		}
	}, []);

	return {
		gasPrice,
		getGasLimitEstimate,
		isCustomGasPrice,
		customGasPrice,
		setCustomGasPrice,
		gasPriceWei: !gasPrice ? 0 : gasPriceInWei(gasPrice),
	};
};

export default useGas;
