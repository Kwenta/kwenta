import { RATES_ENDPOINTS } from 'queries/rates/constants';

export const getRatesEndpoint = (networkId: number): string => {
	return RATES_ENDPOINTS[networkId] || RATES_ENDPOINTS[10];
};
