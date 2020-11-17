import { CurrencyKey } from 'constants/currency';
import { Synth } from 'lib/synthetix';
import { NumericValue, toBigNumber } from 'utils/formatters/number';

export const numericSort = (
	comparatorMap: Record<CurrencyKey, NumericValue>,
	a: Synth,
	b: Synth
) => {
	const valA = toBigNumber(comparatorMap[a.name] ?? 0);
	const valB = toBigNumber(comparatorMap[b.name] ?? 0);

	return valA.gt(valB) ? -1 : 1;
};
