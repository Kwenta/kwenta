import useSynthetixQueries from '@synthetixio/queries';
import { calculateTimestampForPeriod } from 'utils/formatters/date';
import { PERIOD_IN_HOURS } from 'constants/period';
import Wei, { wei } from '@synthetixio/wei';
import { CurrencyKey } from '@synthetixio/contracts-interface';
import { useQuery, UseQueryOptions } from 'react-query';

declare type HistoricalVolume = Record<CurrencyKey, Wei>;

const useHistoricalVolumeQuery = (exchanges: any) => {
	return useQuery<HistoricalVolume>(
		['rates', 'historicalVolume'], //ctx.networkId, period],
		async () => {
			const synthExchanges = await exchanges.useGetSynthExchanges(
				{
					first: Number.MAX_SAFE_INTEGER,
					where: {
						timestamp_gte: calculateTimestampForPeriod(PERIOD_IN_HOURS.ONE_DAY),
					},
				},
				{
					id: true,
					account: true,
					from: true,
					fromCurrencyKey: true,
					fromAmount: true,
					fromAmountInUSD: true,
					toCurrencyKey: true,
					toAmount: true,
					toAmountInUSD: true,
					feesInUSD: true,
					toAddress: true,
					timestamp: true,
					gasPrice: true,
					block: true,
				}
			);

			console.log('***synthExchanges', synthExchanges);

			return synthExchanges.isSuccess
				? synthExchanges.data?.reduce(
						(totalVol: any, { fromCurrencyKey, toCurrencyKey, fromAmountInUSD, toAmountInUSD }) => {
							if (totalVol[fromCurrencyKey] != null) {
								totalVol[fromCurrencyKey] = totalVol[fromCurrencyKey].add(fromAmountInUSD);
							} else {
								totalVol[fromCurrencyKey] = wei(fromAmountInUSD);
							}
							if (totalVol[toCurrencyKey] != null) {
								totalVol[toCurrencyKey] = totalVol[toCurrencyKey].add(toAmountInUSD);
							} else {
								totalVol[toCurrencyKey] = wei(toAmountInUSD);
							}
							return totalVol;
						},
						{} as HistoricalVolume
				  )
				: [];
		},
		{
			enabled: true, //!!ctx.snxData,
			// ...options,
		}
	);
};

export default useHistoricalVolumeQuery;
