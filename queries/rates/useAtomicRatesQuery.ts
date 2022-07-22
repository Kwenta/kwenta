import Wei from '@synthetixio/wei';
import { BigNumber } from 'ethers';
import { useQuery } from 'react-query';
import { useRecoilValue } from 'recoil';

import Connector from 'containers/Connector';
import { appReadyState } from 'store/app';
import { networkState } from 'store/wallet';

import { AtomicExchangeRate } from './types';

const useAtomicRatesQuery = (
	sourceCurrencyKey: string | null,
	sourceAmount: BigNumber | null,
	destinationCurrencyKey: string | null
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const network = useRecoilValue(networkState);
	const { synthetixjs } = Connector.useContainer();

	return useQuery<AtomicExchangeRate>(
		['rates', 'amountsForAtomicExchange', network.id],
		async () => {
			const res = await synthetixjs!.contracts.Exchanger.getAmountsForAtomicExchange(
				sourceAmount,
				sourceCurrencyKey,
				destinationCurrencyKey
			);
			// eslint-disable-next-line no-console
			console.log(
				`getAmountsForAtomicExchange:`,
				Number(sourceAmount) / 1e18,
				sourceCurrencyKey,
				destinationCurrencyKey
			);
			// eslint-disable-next-line no-console
			console.log(`destination amount:`, Number(res.amountReceived) / 1e18);
			// eslint-disable-next-line no-console
			console.log(`exchange fee:`, Number(res.exchangeFeeRate) / 1e18);
			// eslint-disable-next-line no-console
			console.log(`base fee:`, Number(res.fee) / 1e18);
			return res;
		},
		{
			enabled:
				isAppReady &&
				!!synthetixjs &&
				sourceCurrencyKey != null &&
				destinationCurrencyKey != null &&
				sourceAmount?.gte(0),
			refetchInterval: 3000,
		}
	);
};

export default useAtomicRatesQuery;
