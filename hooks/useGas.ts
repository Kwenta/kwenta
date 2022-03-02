import useSynthetixQueries, { GasPrice, GasPrices } from '@synthetixio/queries';
import { BigNumber } from 'ethers';
import { customGasPriceState, gasSpeedState, isL2State } from 'store/wallet';
import { gasPriceInWei, normalizeGasLimit } from 'utils/network';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

	const [gasConfig, setGasConfig] = useState<GasPrice>(FALLBACK_GAS_PRICE);
	const gasPrices = useMemo(() => ethGasPriceQuery?.data ?? undefined, [ethGasPriceQuery.data]);
	const [gasSpeed, setGasSpeed] = useRecoilState<keyof GasPrices>(gasSpeedState);
	const [customGasPrice, setCustomGasPrice] = useRecoilState(customGasPriceState);
	const isCustomGasPrice: boolean = useMemo(() => customGasPrice !== '', [customGasPrice]);

	const selectedGas: GasPrice = useMemo(() => gasPrices?.[gasSpeed] ?? FALLBACK_GAS_PRICE, [
		gasPrices,
		gasSpeed,
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

	useEffect(() => {
		const maxPriorityFeePerGas = selectedGas.maxPriorityFeePerGas;
		const maxFeePerGasValue = isCustomGasPrice ? gasPriceWei : selectedGas.maxFeePerGas;

		const l1GasConfig = { maxPriorityFeePerGas, maxFeePerGas: maxFeePerGasValue };
		const l2GasConfig = { gasPrice: gasPriceWei };

		const config = isL2 ? l2GasConfig : l1GasConfig;

		setGasConfig(config as GasPrice);
	}, [
		gasPriceWei,
		isCustomGasPrice,
		isL2,
		selectedGas.maxFeePerGas,
		selectedGas.maxPriorityFeePerGas,
	]);

	return {
		gasPrice,
		gasPriceWei,
		getGasLimitEstimate,
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
