import { useMemo, FC } from 'react';
import { useRecoilValue } from 'recoil';

import Select from 'components/Select';

import { priceCurrencyState, PRICE_CURRENCIES } from 'store/app';
import { networkState } from 'store/wallet';

import usePersistedRecoilState from 'hooks/usePersistedRecoilState';

import synthetix from 'lib/synthetix';

export const PriceCurrencySelect: FC = () => {
	const [priceCurrency, setPriceCurrency] = usePersistedRecoilState(priceCurrencyState);

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

	return (
		<Select
			inputId="currency-options"
			formatOptionLabel={(option) => (
				<span>
					{option.value.sign} {option.value.asset}
				</span>
			)}
			options={currencyOptions}
			value={{ label: priceCurrency.asset, value: priceCurrency }}
			onChange={(option) => {
				if (option) {
					// @ts-ignore
					setPriceCurrency(option.value);
				}
			}}
		/>
	);
};

export default PriceCurrencySelect;
