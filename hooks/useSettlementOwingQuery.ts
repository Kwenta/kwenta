import { useQuery, UseQueryOptions } from 'react-query';
import { CurrencyKey } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';
import { SettlementOwingData, SynthetixQueryContext } from '@synthetixio/queries';
import { useContext } from 'react';

export const useSettlementOwingQuery = (
	currencyKey: CurrencyKey,
	walletAddress: string,
	options?: UseQueryOptions<SettlementOwingData>
) => {
	return useQuery<SettlementOwingData>(
		['trades', 'settlementOwing', walletAddress, currencyKey],
		async () => {
			const ctx = useContext(SynthetixQueryContext);
			const [
				rebate,
				reclaim,
				numEntries,
			] = await ctx?.context.snxjs!.contracts.Exchanger.settlementOwing(
				walletAddress,
				ctx.context.snxjs!.utils.formatBytes32String(currencyKey)
			);
			return { rebate: wei(rebate), reclaim: wei(reclaim), numEntries: wei(numEntries) };
		},
		{
			enabled: !!walletAddress,
			...options,
		}
	);
};

export default useSettlementOwingQuery;
