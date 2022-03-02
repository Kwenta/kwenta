import useSynthetixQueries, { GasPrice, GasPrices } from '@synthetixio/queries';
import { BigNumber } from 'ethers';
import { customGasPriceState, gasSpeedState, isL2State } from 'store/wallet';
import { gasPriceInWei, normalizeGasLimit } from 'utils/network';
import { useCallback, useMemo } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { wei } from '@synthetixio/wei';

export const DEFAULT_PRIORITY_FEE = wei(2, 9).toBN();
export const DEFAULT_MAX_FEE_PER_GAS = wei(20, 9).toBN();

export const FALLBACK_GAS_PRICE: GasPrice = {
	maxFeePerGas: DEFAULT_MAX_FEE_PER_GAS,
	maxPriorityFeePerGas: DEFAULT_PRIORITY_FEE,
	baseFeePerGas: undefined,
};

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
	const isL2 = useRecoilValue(isL2State);
	const { useEthGasPriceQuery } = useSynthetixQueries();
	const ethGasPriceQuery = useEthGasPriceQuery();

	const gasPrices = useMemo(() => ethGasPriceQuery?.data ?? undefined, [ethGasPriceQuery.data]);
	const [gasSpeed, setGasSpeed] = useRecoilState<keyof GasPrices>(gasSpeedState);

	const [customGasPrice, setCustomGasPrice] = useRecoilState(customGasPriceState);
	const isCustomGasPrice = useMemo(() => customGasPrice !== '', [customGasPrice]);

	const selectedGas = useMemo(() => gasPrices?.[gasSpeed] ?? FALLBACK_GAS_PRICE, [
		gasPrices,
		gasSpeed,
	]);

	const maxFeePerGas = useMemo(() => selectedGas.maxFeePerGas, [selectedGas.maxFeePerGas]);
	const maxPriorityFeePerGas = useMemo(() => selectedGas.maxPriorityFeePerGas, [
		selectedGas.maxPriorityFeePerGas,
	]);

	const gasPrice = useMemo(() => {
		return isCustomGasPrice
			? Number(customGasPrice)
			: gasPrices != null
			? parseGasPriceObject(gasPrices[gasSpeed])
			: null;
	}, [customGasPrice, isCustomGasPrice, gasPrices, gasSpeed]);

	const gasPriceWei = useMemo(() => {
		return !gasPrice ? 0 : gasPriceInWei(gasPrice);
	}, [gasPrice]);

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

	const gasConfig = useMemo(() => {
		const maxFeePerGasValue = isCustomGasPrice ? gasPriceWei : maxFeePerGas;
		const l1GasConfig = { maxPriorityFeePerGas, maxFeePerGas: maxFeePerGasValue };
		const l2GasConfig = { gasPrice: gasPriceWei };

		return isL2 ? l2GasConfig : l1GasConfig;
	}, [gasPriceWei, isCustomGasPrice, isL2, maxFeePerGas, maxPriorityFeePerGas]);

	return {
		gasPrice,
		gasPriceWei,
		getGasLimitEstimate,
		maxFeePerGas,
		maxPriorityFeePerGas,
		gasPrices,
		gasSpeed,
		setGasSpeed,
		isCustomGasPrice,
		customGasPrice,
		setCustomGasPrice,
		gasConfig,
	};
};

export default useGas;
