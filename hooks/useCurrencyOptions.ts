import { useMemo } from 'react';
import synthetix from 'lib/synthetix';

import { useRecoilValue } from 'recoil';

import { networkState } from 'store/wallet';
import { PRICE_CURRENCIES } from 'store/app';

function useCurrencyOptions() {
	const network = useRecoilValue(networkState);

	const currencyOptions = useMemo(() => {
		if (network != null && synthetix.synthsMap != null) {
			return PRICE_CURRENCIES.filter((currencyKey) => synthetix.synthsMap![currencyKey]).map(
				(currencyKey) => {
					const synth = synthetix.synthsMap![currencyKey];
					return {
						label: synth.asset,
						value: synth,
					};
				}
			);
		}
		return [];
	}, [network]);

	return currencyOptions;
}

export default useCurrencyOptions;
