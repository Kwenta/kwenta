import React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { CurrencyKey } from '@synthetixio/contracts-interface';
import { useTranslation } from 'react-i18next';
import { wei } from '@synthetixio/wei';

import Select from 'components/Select';
import Connector from 'containers/Connector';
import ROUTES from 'constants/routes';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import useLaggedDailyPrice from 'queries/rates/useLaggedDailyPrice';

import MarketsDropdownSingleValue from './MarketsDropdownSingleValue';
import MarketsDropdownOption from './MarketsDropdownOption';
import MarketsDropdownIndicator from './MarketsDropdownIndicator';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { formatCurrency, formatPercent, zeroBN } from 'utils/formatters/number';
import { assetToSynth, iStandardSynth } from 'utils/currencies';
import { Price, Rates } from 'queries/rates/types';
import { getSynthDescription, isEurForex } from 'utils/futures';
import { DEFAULT_FIAT_EURO_DECIMALS } from 'constants/defaults';
import useFuturesMarketClosed, { FuturesClosureReason } from 'hooks/useFuturesMarketClosed';

function setLastVisited(baseCurrencyPair: string): void {
	localStorage.setItem('lastVisited', ROUTES.Markets.MarketPair(baseCurrencyPair));
}

export type MarketsCurrencyOption = {
	value: CurrencyKey;
	label: string;
	description: string;
	price: string;
	change: string;
	negativeChange: boolean;
	isFuturesMarketClosed: boolean;
	futuresClosureReason: FuturesClosureReason;
};

const assetToCurrencyOption = (
	asset: string,
	description: string,
	price: string,
	change: string,
	negativeChange: boolean,
	isFuturesMarketClosed: boolean,
	futuresClosureReason: FuturesClosureReason
): MarketsCurrencyOption => ({
	value: asset as CurrencyKey,
	label: `${asset[0] === 's' ? asset.slice(1) : asset}-PERP`,
	description,
	price,
	change,
	negativeChange,
	isFuturesMarketClosed,
	futuresClosureReason,
});

type Props = {
	asset: string;
};

const DUMMY_PRICE = '';
const DUMMY_CHANGE = '';

const MarketsDropdown: React.FC<Props> = ({ asset }) => {
	const futuresMarketsQuery = useGetFuturesMarkets();
	const dailyPriceChangesQuery = useLaggedDailyPrice(
		futuresMarketsQuery?.data?.map(({ asset }) => asset) ?? []
	);

	const { isFuturesMarketClosed, futuresClosureReason } = useFuturesMarketClosed(
		asset as CurrencyKey
	);

	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const router = useRouter();
	const { synthsMap } = Connector.useContainer();
	const { t } = useTranslation();

	const futureRates = futuresMarketsQuery.isSuccess
		? futuresMarketsQuery?.data?.reduce((acc: Rates, { asset, price }) => {
				const currencyKey = iStandardSynth(asset as CurrencyKey)
					? asset
					: assetToSynth(asset as CurrencyKey);
				acc[currencyKey] = price;
				return acc;
		  }, {})
		: null;

	const options = React.useMemo(() => {
		const dailyPriceChanges = dailyPriceChangesQuery?.data ?? [];
		const markets = futuresMarketsQuery?.data ?? [];

		return markets.map((market) => {
			const pastPrice = dailyPriceChanges.find((price: Price) => price.synth === market.asset);

			const basePriceRate =
				Number(
					futureRates?.[
						iStandardSynth(market.asset as CurrencyKey)
							? market.asset
							: assetToSynth(market.asset as CurrencyKey)
					]
				) ?? null;

			const minDecimals = isEurForex(market.asset) ? DEFAULT_FIAT_EURO_DECIMALS : undefined;
			return assetToCurrencyOption(
				market.asset,
				getSynthDescription(market.asset, synthsMap, t),
				formatCurrency(selectedPriceCurrency.name, basePriceRate, { sign: '$', minDecimals }),
				formatPercent(
					basePriceRate && pastPrice?.price
						? wei(basePriceRate).sub(pastPrice?.price).div(basePriceRate)
						: zeroBN
				),
				basePriceRate && pastPrice?.price
					? wei(basePriceRate).lt(pastPrice?.price)
						? true
						: false
					: false,
				market.isSuspended,
				market.marketClosureReason
			);
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		dailyPriceChangesQuery?.data,
		futuresMarketsQuery?.data,
		futureRates,
		selectedPriceCurrency.name,
		synthsMap,
		t,
		isFuturesMarketClosed,
	]);

	return (
		<SelectContainer>
			<Select
				instanceId={`markets-dropdown-${asset}`}
				controlHeight={55}
				menuWidth={'100%'}
				onChange={(x) => {
					// Types are not perfect from react-select, this should always be true (just helping typescript)
					if (x && 'value' in x) {
						setLastVisited(ROUTES.Markets.MarketPair(x.value));
						router.push(ROUTES.Markets.MarketPair(x.value));
					}
				}}
				value={assetToCurrencyOption(
					asset,
					getSynthDescription(asset, synthsMap, t),
					DUMMY_PRICE,
					DUMMY_CHANGE,
					false,
					isFuturesMarketClosed,
					futuresClosureReason
				)}
				options={options}
				isSearchable={false}
				components={{
					SingleValue: MarketsDropdownSingleValue,
					Option: MarketsDropdownOption,
					DropdownIndicator: MarketsDropdownIndicator,
				}}
			/>
		</SelectContainer>
	);
};

const SelectContainer = styled.div`
	margin-bottom: 16px;

	.react-select__dropdown-indicator {
		margin-right: 10px;
	}

	.react-select__option {
		padding: 0;
	}
`;

export default MarketsDropdown;
