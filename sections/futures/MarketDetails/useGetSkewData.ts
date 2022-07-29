import { Synth } from '@synthetixio/contracts-interface';
import * as _ from 'lodash/fp';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { FuturesMarket } from 'queries/futures/types';
import { currentMarketState } from 'store/futures';
import { formatCurrency } from 'utils/formatters/number';

export type SkewData = {
	data: {
		long: number;
		longValue: number;
		short: number;
		shortValue: number;
	};
	long: string;
	short: string;
};

const useGetSkewData = (
	selectedPriceCurrency: Synth,
	futuresMarkets: FuturesMarket[]
): SkewData => {
	const currencyKey = useRecoilValue(currentMarketState);
	const skewData = useMemo(() => {
		const cleanMarket = (i: FuturesMarket) => {
			const basePriceRate = _.defaultTo(0, Number(i.price));
			return {
				short: i.marketSize.eq(0)
					? 0
					: i.marketSize.sub(i.marketSkew).div('2').div(i.marketSize).toNumber(),
				long: i.marketSize.eq(0)
					? 0
					: i.marketSize.add(i.marketSkew).div('2').div(i.marketSize).toNumber(),
				shortValue: i.marketSize.eq(0)
					? 0
					: i.marketSize.sub(i.marketSkew).div('2').mul(basePriceRate).toNumber(),
				longValue: i.marketSize.eq(0)
					? 0
					: i.marketSize.add(i.marketSkew).div('2').mul(basePriceRate).toNumber(),
			};
		};

		const market = futuresMarkets.find((i: FuturesMarket) => i.asset === currencyKey);

		return market
			? cleanMarket(market)
			: {
					short: 0,
					long: 0,
					shortValue: 0,
					longValue: 0,
			  };
	}, [futuresMarkets, currencyKey]);

	const long = formatCurrency(selectedPriceCurrency.name, skewData.longValue, { sign: '$' });
	const short = formatCurrency(selectedPriceCurrency.name, skewData.shortValue, { sign: '$' });

	return { data: skewData, long, short };
};

export default useGetSkewData;
