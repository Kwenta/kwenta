import { wei } from '@synthetixio/wei';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getColorFromPriceInfo } from 'components/ColoredPrice/ColoredPrice';
import { DEFAULT_CRYPTO_DECIMALS } from 'constants/defaults';
import { NO_VALUE } from 'constants/placeholder';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { getDisplayAsset } from 'sdk/utils/futures';
import {
	selectMarketAsset,
	selectMarketInfo,
	selectMarketKey,
	selectMarketVolumes,
	selectMarketPrices,
	selectMarketPriceInfo,
	selectSkewAdjustedPriceInfo,
} from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { selectPreviousDayPrices } from 'state/prices/selectors';
import { isFiatCurrency } from 'utils/currencies';
import { formatCurrency, formatDollars, formatPercent, zeroBN } from 'utils/formatters/number';
import { isDecimalFour } from 'utils/futures';

import { MarketDataKey } from './utils';

type MarketData = Record<string, { value: string | JSX.Element; color?: string }>;

const useGetMarketData = (mobile?: boolean) => {
	const { t } = useTranslation();

	const marketAsset = useAppSelector(selectMarketAsset);
	const marketKey = useAppSelector(selectMarketKey);
	const marketInfo = useAppSelector(selectMarketInfo);

	const pastRates = useAppSelector(selectPreviousDayPrices);
	const futuresVolumes = useAppSelector(selectMarketVolumes);
	const marketPrices = useAppSelector(selectMarketPrices);
	const markPrice = useAppSelector(selectSkewAdjustedPriceInfo);
	const indexPrice = useAppSelector(selectMarketPriceInfo);

	const { selectedPriceCurrency } = useSelectedPriceCurrency();

	const minDecimals =
		isFiatCurrency(selectedPriceCurrency.name) && isDecimalFour(marketKey)
			? DEFAULT_CRYPTO_DECIMALS
			: undefined;

	const pastPrice = pastRates.find((price) => price.synth === getDisplayAsset(marketAsset));

	const rawPrice = marketPrices.offChain ?? wei(0);

	const data: MarketData = useMemo(() => {
		const fundingValue = marketInfo?.currentFundingRate;

		const futuresTradingVolume = marketInfo?.marketKey
			? futuresVolumes[marketInfo.marketKey]?.volume ?? wei(0)
			: wei(0);

		const oiCap = marketInfo?.marketLimit
			? formatDollars(marketInfo?.marketLimit, { truncate: true })
			: null;

		const longOi = marketInfo?.openInterest.longUSD
			? `${formatDollars(marketInfo?.openInterest.longUSD, { truncate: true })} / ${oiCap}`
			: NO_VALUE;
		const shortOi = marketInfo?.openInterest.shortUSD
			? `${formatDollars(marketInfo?.openInterest.shortUSD, { truncate: true })} / ${oiCap}`
			: NO_VALUE;

		const indexPriceWei = indexPrice?.price ?? zeroBN;

		if (mobile) {
			return {
				[MarketDataKey.indexPrice]: {
					value: indexPrice ? formatDollars(indexPrice.price) : NO_VALUE,
					color: getColorFromPriceInfo(indexPrice),
				},
				[MarketDataKey.marketPrice]: {
					value: markPrice ? formatDollars(markPrice.price) : NO_VALUE,
					color: getColorFromPriceInfo(markPrice),
				},
				[MarketDataKey.openInterestLong]: {
					value: longOi,
				},
				[MarketDataKey.openInterestShort]: {
					value: shortOi,
				},
				[MarketDataKey.dailyVolume]: {
					value: formatDollars(futuresTradingVolume ?? zeroBN, {
						truncate: true,
					}),
				},
				[t('futures.market.info.hourly-funding')]: {
					value: fundingValue
						? formatPercent(fundingValue ?? zeroBN, { minDecimals: 6 })
						: NO_VALUE,
					color: fundingValue?.gt(zeroBN) ? 'green' : fundingValue?.lt(zeroBN) ? 'red' : undefined,
				},
				[MarketDataKey.dailyChange]: {
					value:
						indexPriceWei.gt(0) && pastPrice?.rate
							? `${formatCurrency(
									selectedPriceCurrency.name,
									indexPriceWei.sub(pastPrice.rate) ?? zeroBN,
									{ sign: '$', minDecimals, isAssetPrice: true }
							  )} (${formatPercent(
									indexPriceWei.sub(pastPrice.rate).div(indexPriceWei) ?? zeroBN
							  )})`
							: NO_VALUE,
					color: pastPrice?.rate
						? indexPriceWei.sub(pastPrice.rate).gt(zeroBN)
							? 'green'
							: indexPriceWei.sub(pastPrice.rate).lt(zeroBN)
							? 'red'
							: ''
						: undefined,
				},
			};
		} else {
			return {
				[MarketDataKey.indexPrice]: {
					value: indexPrice ? formatDollars(indexPrice.price) : NO_VALUE,
					color: getColorFromPriceInfo(indexPrice),
				},
				[MarketDataKey.marketPrice]: {
					value: markPrice ? formatDollars(markPrice.price) : NO_VALUE,
					color: getColorFromPriceInfo(markPrice),
				},
				[MarketDataKey.dailyChange]: {
					value:
						indexPriceWei.gt(0) && pastPrice?.rate
							? `${formatDollars(indexPriceWei.sub(pastPrice.rate) ?? zeroBN)} (${formatPercent(
									indexPriceWei.sub(pastPrice.rate).div(indexPriceWei) ?? zeroBN
							  )})`
							: NO_VALUE,
					color: pastPrice?.rate
						? indexPriceWei.sub(pastPrice.rate).gt(zeroBN)
							? 'green'
							: indexPriceWei.sub(pastPrice.rate).lt(zeroBN)
							? 'red'
							: ''
						: undefined,
				},
				[MarketDataKey.dailyVolume]: {
					value: formatDollars(futuresTradingVolume ?? zeroBN, {
						truncate: true,
					}),
				},
				[MarketDataKey.openInterestLong]: {
					value: longOi,
				},
				[MarketDataKey.openInterestShort]: {
					value: shortOi,
				},
				[t('futures.market.info.hourly-funding')]: {
					value: fundingValue
						? formatPercent(fundingValue ?? zeroBN, { minDecimals: 6 })
						: NO_VALUE,
					color: fundingValue?.gt(zeroBN) ? 'green' : fundingValue?.lt(zeroBN) ? 'red' : undefined,
				},
			};
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		marketAsset,
		markPrice,
		marketInfo,
		rawPrice,
		futuresVolumes,
		selectedPriceCurrency.name,
		pastPrice?.rate,
		minDecimals,
		indexPrice,
		t,
	]);

	return data;
};

export default useGetMarketData;
