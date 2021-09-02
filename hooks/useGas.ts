import { useMemo, useCallback } from 'react';
import { useRecoilValue } from 'recoil';
import { BigNumber } from 'ethers';

import useSynthetixQueries from '@synthetixio/queries';
import { customGasPriceState, gasSpeedState } from 'store/wallet';
import { normalizeGasLimit, gasPriceInWei } from 'utils/network';

const useGas = () => {
	const { useEthGasPriceQuery } = useSynthetixQueries();
	const ethGasPriceQuery = useEthGasPriceQuery();
	const customGasPrice = useRecoilValue(customGasPriceState);
	const gasSpeed = useRecoilValue(gasSpeedState);

	const gasPrice = useMemo(
		() =>
			customGasPrice !== ''
				? Number(customGasPrice)
				: ethGasPriceQuery.data != null
				? ethGasPriceQuery.data[gasSpeed]
				: null,
		[customGasPrice, ethGasPriceQuery.data, gasSpeed]
	);

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
		gasPriceWei: !gasPrice ? 0 : gasPriceInWei(gasPrice),
		getGasLimitEstimate,
	};
};

export default useGas;
