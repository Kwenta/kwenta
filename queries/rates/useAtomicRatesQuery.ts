import { useQuery } from 'react-query';
import { BigNumber } from 'ethers';
import { useRecoilValue } from 'recoil';

import Connector from 'containers/Connector';
import { appReadyState } from 'store/app';
import { networkState } from 'store/wallet';

const useAtomicRatesQuery = (
	sourceCurrencyKey: string | null,
	sourceAmount: BigNumber | null,
	destinationCurrencyKey: string | null
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const network = useRecoilValue(networkState);
	const { synthetixjs } = Connector.useContainer();

	// eslint-disable-next-line no-console
	console.log(
		`sourceCurrencyKey ${sourceCurrencyKey} sourceAmount ${sourceAmount} destKey ${destinationCurrencyKey}`
	);

	return useQuery(
		['rates', 'atomicRates', network.id],
		async () => {
			const [data] = await Promise.all([
				synthetixjs!.contracts.ExchangeRatesWithDexPricing.effectiveAtomicValueAndRates(
					'0x7355534400000000000000000000000000000000000000000000000000000000',
					18611900000000000000,
					'0x7345544800000000000000000000000000000000000000000000000000000000'
				),
			]);
			// eslint-disable-next-line no-console
			console.log(`atomic rate: ${data.value}`);
			return data.value;
		},
		{
			enabled: isAppReady && !!synthetixjs,
			refetchInterval: 60000,
		}
	);
};

export default useAtomicRatesQuery;
