import { useMemo, FC } from 'react';

import Select from 'components/Select';
import Connector from 'containers/Connector';
import usePersistedRecoilState from 'hooks/usePersistedRecoilState';
import { priceCurrencyState, PRICE_CURRENCIES } from 'store/app';

export const PriceCurrencySelect: FC = () => {
	const [priceCurrency, setPriceCurrency] = usePersistedRecoilState(priceCurrencyState);

	const { synthsMap, network } = Connector.useContainer();

	const currencyOptions = useMemo(() => {
		if (network != null && synthsMap != null) {
			return PRICE_CURRENCIES.filter((currencyKey) => synthsMap![currencyKey]).map(
				(currencyKey) => {
					const synth = synthsMap![currencyKey]!;
					return { label: synth.asset, value: synth };
				}
			);
		}
		return [];
	}, [network, synthsMap]);

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
