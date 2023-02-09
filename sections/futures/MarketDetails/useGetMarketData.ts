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
	selectSkewAdjustedPrice,
	selectMarketPriceInfo,
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
	const marketPrice = useAppSelector(selectSkewAdjustedPrice);
	const marketPriceInfo = useAppSelector(selectMarketPriceInfo);

	const { selectedPriceCurrency } = useSelectedPriceCurrency();

	const minDecimals =
		isFiatCurrency(selectedPriceCurrency.name) && isDecimalFour(marketKey)
			? DEFAULT_CRYPTO_DECIMALS
			: undefined;

	const pastPrice = pastRates.find((price) => price.synth === getDisplayAsset(marketAsset));

	const oraclePrice = marketPrices.onChain ?? wei(0);

	const data: MarketData = useMemo(() => {
		const fundingValue = marketInfo?.currentFundingRate;

		const marketName = `${marketInfo?.marketName ?? t('futures.market.info.default-market')}`;

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

		if (mobile) {
			return {
				[marketName]: {
					value: formatDollars(marketPrice, { isAssetPrice: true }),
					color: getColorFromPriceInfo(marketPriceInfo),
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
						marketPrice.gt(0) && pastPrice?.rate
							? `${formatCurrency(
									selectedPriceCurrency.name,
									marketPrice.sub(pastPrice.rate) ?? zeroBN,
									{ sign: '$', minDecimals, isAssetPrice: true }
							  )} (${formatPercent(marketPrice.sub(pastPrice.rate).div(marketPrice) ?? zeroBN)})`
							: NO_VALUE,
					color: pastPrice?.rate
						? marketPrice.sub(pastPrice.rate).gt(zeroBN)
							? 'green'
							: marketPrice.sub(pastPrice.rate).lt(zeroBN)
							? 'red'
							: ''
						: undefined,
				},
			};
		} else {
			return {
				[marketName]: {
					value: formatDollars(marketPrice),
					color: getColorFromPriceInfo(marketPriceInfo),
				},
				[MarketDataKey.dailyChange]: {
					value:
						marketPrice.gt(0) && pastPrice?.rate
							? `${formatDollars(marketPrice.sub(pastPrice.rate) ?? zeroBN)} (${formatPercent(
									marketPrice.sub(pastPrice.rate).div(marketPrice) ?? zeroBN
							  )})`
							: NO_VALUE,
					color: pastPrice?.rate
						? marketPrice.sub(pastPrice.rate).gt(zeroBN)
							? 'green'
							: marketPrice.sub(pastPrice.rate).lt(zeroBN)
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
		marketPriceInfo,
		marketInfo,
		oraclePrice,
		futuresVolumes,
		selectedPriceCurrency.name,
		pastPrice?.rate,
		minDecimals,
		marketPrice,
		t,
	]);

	return data;
};

export default useGetMarketData;
