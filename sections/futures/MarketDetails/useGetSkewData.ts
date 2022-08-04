import Wei from '@synthetixio/wei';
import * as _ from 'lodash/fp';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { Synths } from 'constants/currency';
import { FuturesMarket } from 'queries/futures/types';
import { marketInfoState } from 'store/futures';
import { formatCurrency, zeroBN } from 'utils/formatters/number';

export type SkewData = {
	data: {
		long: number;
		longValue: Wei;
		short: number;
		shortValue: Wei;
	};
	long: string;
	short: string;
};

const useGetSkewData = (): SkewData => {
	const marketInfo = useRecoilValue(marketInfoState);
	const [skewData, long, short] = useMemo(() => {
		const cleanMarket = (i: FuturesMarket) => {
			const marketPrice = _.defaultTo(0, Number(i.price));
			return {
				short: i.marketSize.eq(0)
					? 0
					: i.marketSize.sub(i.marketSkew).div('2').div(i.marketSize).toNumber(),
				long: i.marketSize.eq(0)
					? 0
					: i.marketSize.add(i.marketSkew).div('2').div(i.marketSize).toNumber(),
				shortValue: i.marketSize.eq(0)
					? zeroBN
					: i.marketSize.sub(i.marketSkew).div('2').mul(marketPrice),
				longValue: i.marketSize.eq(0)
					? zeroBN
					: i.marketSize.add(i.marketSkew).div('2').mul(marketPrice),
			};
		};

		const skewData = marketInfo
			? cleanMarket(marketInfo)
			: {
					short: 0,
					long: 0,
					shortValue: zeroBN,
					longValue: zeroBN,
			  };

		const truncationConfig = { truncation: { divisor: 1e6, unit: 'M' } };

		const long = formatCurrency(Synths.sUSD, skewData.longValue, {
			sign: '$',
			maxDecimals: 2,
			...(skewData.longValue.gt(1e6) ? truncationConfig : {}),
		});

		const short = formatCurrency(Synths.sUSD, skewData.shortValue, {
			sign: '$',
			maxDecimals: 2,
			...(skewData.shortValue.gt(1e6) ? truncationConfig : {}),
		});

		return [skewData, long, short];
	}, [marketInfo]);

	return { data: skewData, long, short };
};

export default useGetSkewData;
