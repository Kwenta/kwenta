import { CurrencyKey } from 'constants/currency';
import { Synth } from 'lib/synthetix';
import { Query } from 'react-query';
import { NumericValue, toBigNumber } from 'utils/formatters/number';

// The function turns react query cached queries into a map (with the currencyKey) as the key to be used in the sorting.
export const toCurrencyKeyMap = (
	query: Query<unknown, unknown>[],
	dataField?: string
): Record<CurrencyKey, number> =>
	query.reduce((acc, query) => {
		// the third item is the currencyKey (according to the queryKeys.ts file)
		const currencyKey = query.queryKey[2] as string;

		if (query.state.data != null) {
			// @ts-ignore
			acc[currencyKey] = dataField ? query.state.data[dataField] : query.state.data;
		}

		return acc;
	}, {});

export const numericSort = (
	comparatorMap: Record<CurrencyKey, NumericValue>,
	a: Synth,
	b: Synth
) => {
	const valA = toBigNumber(comparatorMap[a.name] ?? 0);
	const valB = toBigNumber(comparatorMap[b.name] ?? 0);

	return valA.gt(valB) ? -1 : 1;
};
