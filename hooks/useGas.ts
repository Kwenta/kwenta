import useSynthetixQueries, { GasPrice, GasPrices } from '@synthetixio/queries';
import { BigNumber } from 'ethers';
import { customGasPriceState, gasSpeedState, isMainnetState } from 'store/wallet';
import { gasPriceInWei, normalizeGasLimit } from 'utils/network';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { wei } from '@synthetixio/wei';

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

type GasConfigL1 = {
	maxPriorityFeePerGas?: BigNumber;
	maxFeePerGas?: BigNumber;
};

type GasConfigL2 = {
	gasPrice?: BigNumber;
};

type GasConfig = GasConfigL1 | GasConfigL2;

const useGas = () => {
	const isMainnet = useRecoilValue(isMainnetState);
	const { useEthGasPriceQuery } = useSynthetixQueries();
	const ethGasPriceQuery = useEthGasPriceQuery();

	const [gasConfig, setGasConfig] = useState<GasConfig>({} as GasConfig);
	const gasPrices = useMemo(() => ethGasPriceQuery?.data ?? undefined, [ethGasPriceQuery.data]);
	const [gasSpeed, setGasSpeed] = useRecoilState<keyof GasPrices>(gasSpeedState);
	const [customGasPrice, setCustomGasPrice] = useRecoilState(customGasPriceState);
	const isCustomGasPrice: boolean = useMemo(() => customGasPrice !== '', [customGasPrice]);

	const selectedGas: GasPrice = useMemo(() => gasPrices?.[gasSpeed] ?? {}, [gasPrices, gasSpeed]);

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

		const config = isMainnet ? l1GasConfig : l2GasConfig;

		setGasConfig(config as GasPrice);
	}, [
		gasPriceWei,
		isCustomGasPrice,
		isMainnet,
		selectedGas.baseFeePerGas,
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
