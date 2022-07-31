import * as _ from 'lodash/fp';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { FuturesMarket } from 'queries/futures/types';
import { marketInfoState, marketKeyState } from 'store/futures';
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

const useGetSkewData = (): SkewData => {
	const marketKey = useRecoilValue(marketKeyState);
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
					? 0
					: i.marketSize.sub(i.marketSkew).div('2').mul(marketPrice).toNumber(),
				longValue: i.marketSize.eq(0)
					? 0
					: i.marketSize.add(i.marketSkew).div('2').mul(marketPrice).toNumber(),
			};
		};

		const skewData = marketInfo
			? cleanMarket(marketInfo)
			: {
					short: 0,
					long: 0,
					shortValue: 0,
					longValue: 0,
			  };

		const long = formatCurrency(marketKey, skewData.longValue, { sign: '$' });
		const short = formatCurrency(marketKey, skewData.shortValue, { sign: '$' });

		return [skewData, long, short];
	}, [marketInfo, marketKey]);

	return { data: skewData, long, short };
};

export default useGetSkewData;
