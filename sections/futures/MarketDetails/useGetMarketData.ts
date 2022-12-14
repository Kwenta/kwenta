import { wei } from '@synthetixio/wei';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { DEFAULT_CRYPTO_DECIMALS } from 'constants/defaults';
import { NO_VALUE } from 'constants/placeholder';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import {
	selectMarketAsset,
	selectMarketInfo,
	selectMarketKey,
	selectMarketVolumes,
	selectMarketPrices,
	selectLatestMarketPrice,
} from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { pastRatesState } from 'store/futures';
import { isFiatCurrency } from 'utils/currencies';
import { formatCurrency, formatPercent, zeroBN } from 'utils/formatters/number';
import { isDecimalFour } from 'utils/futures';

import { MarketDataKey } from './utils';

type MarketData = Record<string, { value: string | JSX.Element; color?: string }>;

const useGetMarketData = (mobile?: boolean) => {
	const { t } = useTranslation();

	const marketAsset = useAppSelector(selectMarketAsset);
	const marketKey = useAppSelector(selectMarketKey);
	const marketInfo = useAppSelector(selectMarketInfo);

	const pastRates = useRecoilValue(pastRatesState);
	const futuresVolumes = useAppSelector(selectMarketVolumes);
	const marketPrices = useAppSelector(selectMarketPrices);
	const marketPrice = useAppSelector(selectLatestMarketPrice);

	const { selectedPriceCurrency } = useSelectedPriceCurrency();

	const minDecimals =
		isFiatCurrency(selectedPriceCurrency.name) && isDecimalFour(marketKey)
			? DEFAULT_CRYPTO_DECIMALS
			: undefined;

	const pastPrice = pastRates.find((price) => price.synth === marketAsset);

	const oraclePrice = marketPrices.onChain ?? wei(0);

	const data: MarketData = useMemo(() => {
		const fundingValue = marketInfo?.currentFundingRate;

		const marketName = `${marketInfo?.marketName ?? t('futures.market.info.default-market')}`;

		const futuresTradingVolume = marketInfo?.marketKey
			? futuresVolumes[marketInfo.marketKey]?.volume ?? wei(0)
			: wei(0);
		const futuresTradeCount = marketInfo?.marketKey
			? futuresVolumes[marketInfo.marketKey]?.trades.toNumber() ?? 0
			: 0;

		if (mobile) {
			return {
				[marketName]: {
					value: formatCurrency(selectedPriceCurrency.name, marketPrice, {
						sign: '$',
						minDecimals,
						isAssetPrice: true,
					}),
				},
				[MarketDataKey.oraclePrice]: {
					value: formatCurrency(selectedPriceCurrency.name, oraclePrice, {
						sign: '$',
						minDecimals,
						isAssetPrice: true,
					}),
				},
				[MarketDataKey.dailyTrades]: {
					value: `${futuresTradeCount}`,
				},
				[MarketDataKey.openInterest]: {
					value: marketInfo?.marketSize?.mul(marketPrice)
						? formatCurrency(
								selectedPriceCurrency.name,
								marketInfo?.marketSize?.mul(marketPrice).toNumber(),
								{ sign: '$' }
						  )
						: NO_VALUE,
				},
				[MarketDataKey.dailyVolume]: {
					value: formatCurrency(selectedPriceCurrency.name, futuresTradingVolume ?? zeroBN, {
						sign: '$',
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
						marketPrice.gt(0) && pastPrice?.price
							? `${formatCurrency(
									selectedPriceCurrency.name,
									marketPrice.sub(pastPrice.price) ?? zeroBN,
									{ sign: '$', minDecimals, isAssetPrice: true }
							  )} (${formatPercent(marketPrice.sub(pastPrice.price).div(marketPrice) ?? zeroBN)})`
							: NO_VALUE,
					color: pastPrice?.price
						? marketPrice.sub(pastPrice.price).gt(zeroBN)
							? 'green'
							: marketPrice.sub(pastPrice.price).lt(zeroBN)
							? 'red'
							: ''
						: undefined,
				},
			};
		} else {
			return {
				[marketName]: {
					value: formatCurrency(selectedPriceCurrency.name, marketPrice, {
						sign: '$',
						minDecimals,
						isAssetPrice: true,
					}),
				},
				[MarketDataKey.oraclePrice]: {
					value: formatCurrency(selectedPriceCurrency.name, oraclePrice, {
						sign: '$',
						minDecimals,
						isAssetPrice: true,
					}),
				},
				[MarketDataKey.dailyChange]: {
					value:
						marketPrice.gt(0) && pastPrice?.price
							? `${formatCurrency(
									selectedPriceCurrency.name,
									marketPrice.sub(pastPrice.price) ?? zeroBN,
									{ sign: '$', minDecimals, isAssetPrice: true }
							  )} (${formatPercent(marketPrice.sub(pastPrice.price).div(marketPrice) ?? zeroBN)})`
							: NO_VALUE,
					color: pastPrice?.price
						? marketPrice.sub(pastPrice.price).gt(zeroBN)
							? 'green'
							: marketPrice.sub(pastPrice.price).lt(zeroBN)
							? 'red'
							: ''
						: undefined,
				},
				[MarketDataKey.dailyVolume]: {
					value: formatCurrency(selectedPriceCurrency.name, futuresTradingVolume ?? zeroBN, {
						sign: '$',
					}),
				},
				[MarketDataKey.dailyTrades]: {
					value: `${futuresTradeCount}`,
				},
				[MarketDataKey.openInterest]: {
					value: marketInfo?.marketSize?.mul(marketPrice)
						? formatCurrency(selectedPriceCurrency.name, marketInfo?.marketSize?.mul(marketPrice), {
								sign: '$',
						  })
						: NO_VALUE,
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
		marketInfo,
		oraclePrice,
		futuresVolumes,
		selectedPriceCurrency.name,
		pastPrice?.price,
		minDecimals,
		marketPrice,
		t,
	]);

	return data;
};

export default useGetMarketData;
