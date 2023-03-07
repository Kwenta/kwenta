import axios from 'axios';

import { mapPythCandles } from './utils';

export const requestCandlesticks = async (
	currencyKey: string | null,
	minTimestamp: number,
	maxTimestamp = Math.floor(Date.now() / 1000),
	period: number
) => {
	const endpoint = 'https://pyth-api.vintage-orange-muffin.com/tradingview/history';

	const response = await axios
		.get(endpoint, {
			params: {
				from: minTimestamp,
				to: maxTimestamp,
				symbol: `${currencyKey}/USD`,
				resolution: 1,
			},
		})
		.then((response) => {
			return mapPythCandles(response.data);
		});

	return response;
};
