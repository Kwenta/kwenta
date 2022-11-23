import { NetworkId } from '@synthetixio/contracts-interface';
import Wei from '@synthetixio/wei';
import request, { gql } from 'graphql-request';
import { useTranslation } from 'react-i18next';
import { useQuery, UseQueryOptions } from 'react-query';
import { useSetRecoilState } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import { Period, PERIOD_IN_SECONDS } from 'sdk/constants/period';
import { selectMarketAssets, selectMarkets } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { fundingRatesState } from 'store/futures';
import { FuturesMarketKey, MarketKeyByAsset } from 'utils/futures';
import logError from 'utils/logError';

import { FundingRateUpdate } from './types';
import { getFuturesEndpoint, calculateFundingRate } from './utils';

type FundingRateInput = {
	marketAddress: string | undefined;
	marketKey: FuturesMarketKey;
	price: Wei | undefined;
	currentFundingRate: Wei | undefined;
};

export type FundingRateResponse = {
	asset: FuturesMarketKey;
	fundingTitle: string;
	fundingRate: Wei | null;
};

const useGetAverageFundingRateForMarkets = (
	period: Period,
	options?: UseQueryOptions<any | null>
) => {
	const { t } = useTranslation();
	const { network } = Connector.useContainer();

	const futuresMarkets = useAppSelector(selectMarkets);
	const marketAssets = useAppSelector(selectMarketAssets);
	const futuresEndpoint = getFuturesEndpoint(network?.id as NetworkId);
	const setFundingRates = useSetRecoilState(fundingRatesState);

	const fundingRateInputs: FundingRateInput[] = futuresMarkets.map(
		({ asset, market, price, currentFundingRate }) => {
			return {
				marketAddress: market,
				marketKey: MarketKeyByAsset[asset],
				price: price,
				currentFundingRate: currentFundingRate,
			};
		}
	);

	const periodLength = PERIOD_IN_SECONDS[period];

	const periodTitle =
		period === Period.ONE_HOUR
			? t('futures.market.info.hourly-funding')
			: t('futures.market.info.fallback-funding');

	return useQuery<any>(
		QUERY_KEYS.Futures.FundingRates(network?.id as NetworkId, periodLength, marketAssets),
		async () => {
			const minTimestamp = Math.floor(Date.now() / 1000) - periodLength;

			const fundingRateQueries = fundingRateInputs.map(({ marketAddress, marketKey }) => {
				return gql`
						# last before timestamp
						${marketKey}_first: fundingRateUpdates(
							first: 1
							where: { market: "${marketAddress}", timestamp_lt: $minTimestamp }
							orderBy: sequenceLength
							orderDirection: desc
						) {
							timestamp
							funding
						}

						# first after timestamp
						${marketKey}_next: fundingRateUpdates(
							first: 1
							where: { market: "${marketAddress}", timestamp_gt: $minTimestamp }
							orderBy: sequenceLength
							orderDirection: asc
						) {
							timestamp
							funding
						}

						# latest update
						${marketKey}_latest: fundingRateUpdates(
							first: 1
							where: { market: "${marketAddress}" }
							orderBy: sequenceLength
							orderDirection: desc
						) {
							timestamp
							funding
						}
					`;
			});

			try {
				const marketFundingResponses: Record<string, FundingRateUpdate[]> = await request(
					futuresEndpoint,
					gql`
					query fundingRateUpdates($minTimestamp: BigInt!) {
						${fundingRateQueries.reduce((acc: string, curr: string) => {
							return acc + curr;
						})}
					}
				`,
					{ minTimestamp: minTimestamp }
				);

				const fundingRateResponses = fundingRateInputs.map(
					({ marketKey, currentFundingRate, price }) => {
						if (!price) return null;
						const marketResponses = [
							marketFundingResponses[`${marketKey}_first`],
							marketFundingResponses[`${marketKey}_next`],
							marketFundingResponses[`${marketKey}_latest`],
						];

						const responseFilt = marketResponses
							.filter((value: FundingRateUpdate[]) => value.length > 0)
							.map((entry: FundingRateUpdate[]): FundingRateUpdate => entry[0])
							.sort((a: FundingRateUpdate, b: FundingRateUpdate) => a.timestamp - b.timestamp);

						const fundingRate =
							responseFilt && !!currentFundingRate
								? calculateFundingRate(
										minTimestamp,
										periodLength,
										responseFilt,
										price,
										currentFundingRate
								  )
								: currentFundingRate ?? null;

						const fundingPeriod =
							responseFilt && !!currentFundingRate
								? periodTitle
								: t('futures.markets.info.instant-funding');

						const fundingRateResponse: FundingRateResponse = {
							asset: marketKey,
							fundingTitle: fundingPeriod,
							fundingRate: fundingRate,
						};
						return fundingRateResponse;
					}
				);

				const fundingRates: FundingRateResponse[] = fundingRateResponses.filter(
					(funding): funding is FundingRateResponse => !!funding
				);

				setFundingRates(fundingRates);
			} catch (e) {
				logError(e);
				return null;
			}
		},
		{
			enabled: futuresMarkets.length > 0 && futuresMarkets.length === marketAssets.length,
			...options,
		}
	);
};

export default useGetAverageFundingRateForMarkets;
