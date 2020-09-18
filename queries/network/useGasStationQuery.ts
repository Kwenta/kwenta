import axios from 'axios';
import { useQuery, BaseQueryOptions } from 'react-query';

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

export type GasSpeed = {
	fast: number;
	average: number;
	slow: number;
};

export type GasSpeeds = keyof GasSpeed;

export const GAS_SPEEDS: GasSpeeds[] = ['slow', 'average', 'fast'];

const useEthGasStationQuery = (options?: BaseQueryOptions) => {
	return useQuery<GasSpeed, any>(
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
