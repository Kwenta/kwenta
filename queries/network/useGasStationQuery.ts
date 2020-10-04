import axios from 'axios';
import { useQuery, QueryConfig } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';

const ETH_GAS_STATION_API_URL = 'https://ethgasstation.info/json/ethgasAPI.json';

type EthGasStationResponse = {
	average: number;
	avgWait: number;
	blockNum: number;
	block_time: number;
	fast: number;
	fastWait: number;
	fastest: number;
	fastestWait: number;
	gasPriceRange: Record<number, number>;
	safeLow: number;
	safeLowWait: number;
	speed: number;
};

export type GasPrices = {
	fast: number;
	average: number;
	slow: number;
};

export type GasSpeed = keyof GasPrices;

export const GAS_SPEEDS: GasSpeed[] = ['slow', 'average', 'fast'];

const useEthGasStationQuery = (options?: QueryConfig<GasPrices>) => {
	return useQuery<GasPrices>(
		QUERY_KEYS.Network.EthGasStation,
		async () => {
			const result = await axios.get<EthGasStationResponse>(ETH_GAS_STATION_API_URL);
			const { safeLow, average, fast } = result.data;

			return {
				fast: fast / 10,
				average: average / 10,
				slow: safeLow / 10,
			};
		},
		options
	);
};

export default useEthGasStationQuery;
