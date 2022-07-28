import Wei, { wei } from '@synthetixio/wei';
import { BigNumber } from 'ethers';
import { useQuery } from 'react-query';
import { useRecoilValue } from 'recoil';

import Connector from 'containers/Connector';
import { appReadyState } from 'store/app';
import { isL2State, networkState } from 'store/wallet';

const useAtomicRatesQuery = (
	sourceCurrencyKey: string | null,
	sourceAmount: BigNumber | null,
	destinationCurrencyKey: string | null
) => {
	const isL2 = useRecoilValue(isL2State);
	const isAppReady = useRecoilValue(appReadyState);
	const network = useRecoilValue(networkState);
	const { synthetixjs } = Connector.useContainer();

	return useQuery<Wei>(
		['rates', 'rateForAtomicExchange', network.id],
		async () => {
			const {
				value,
				systemDestinationRate,
			} = await synthetixjs!.contracts.ExchangeRates.effectiveAtomicValueAndRates(
				sourceCurrencyKey,
				sourceAmount,
				destinationCurrencyKey
			);
			return sourceAmount !== null && sourceAmount.gt(0)
				? wei(value).div(sourceAmount)
				: wei(1e18 / systemDestinationRate);
		},
		{
			enabled:
				!isL2 &&
				isAppReady &&
				!!synthetixjs &&
				sourceCurrencyKey != null &&
				destinationCurrencyKey != null &&
				sourceAmount != null &&
				sourceAmount.gt(0),
			refetchInterval: 60000,
		}
	);
};

export default useAtomicRatesQuery;
