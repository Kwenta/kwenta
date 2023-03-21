import axios from 'axios';

import { getSupportedResolution } from 'components/TVChart/utils';
import logError from 'utils/logError';

import { mapPythCandles } from './utils';

export const requestCandlesticks = async (
	currencyKey: string | null,
	minTimestamp: number,
	maxTimestamp = Math.floor(Date.now() / 1000),
	period: number
) => {
	const endpoint = 'https://pyth-api.vintage-orange-muffin.com/chart-lib/history';

	const response = await axios
		.get(endpoint, {
			params: {
				from: minTimestamp,
				to: maxTimestamp,
				symbol: `${currencyKey}/USD`,
				resolution: getSupportedResolution(period),
			},
		})
		.then((response) => {
			return mapPythCandles(response.data);
		})
		.catch((err) => {
			logError(err);
			return [];
		});

	return response;
};
