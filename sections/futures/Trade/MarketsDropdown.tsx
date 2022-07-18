import React from 'react';
import styled, { css } from 'styled-components';
import { useRouter } from 'next/router';
import { CurrencyKey } from '@synthetixio/contracts-interface';
import { useTranslation } from 'react-i18next';
import { wei } from '@synthetixio/wei';
import { useRecoilValue } from 'recoil';

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
import {
	FuturesMarketAsset,
	getDisplayAsset,
	getSynthDescription,
	isEurForex,
	MarketKeyByAsset,
} from 'utils/futures';
import { DEFAULT_FIAT_EURO_DECIMALS } from 'constants/defaults';
import useFuturesMarketClosed, { FuturesClosureReason } from 'hooks/useFuturesMarketClosed';
import { currentMarketState } from 'store/futures';

function setLastVisited(baseCurrencyPair: string): void {
	localStorage.setItem('lastVisited', ROUTES.Markets.MarketPair(baseCurrencyPair));
}

export type MarketsCurrencyOption = {
	value: FuturesMarketAsset;
	label: string;
	description: string;
	price?: string;
	change?: string;
	negativeChange: boolean;
	isMarketClosed: boolean;
	closureReason: FuturesClosureReason;
};

type AssetToCurrencyOptionArgs = {
	asset: string;
	description: string;
	price?: string;
	change?: string;
	negativeChange: boolean;
	isMarketClosed: boolean;
	closureReason: FuturesClosureReason;
};

const assetToCurrencyOption = (args: AssetToCurrencyOptionArgs): MarketsCurrencyOption => ({
	value: args.asset as FuturesMarketAsset,
	label: `${getDisplayAsset(args.asset)}-PERP`,
	...args,
});

type MarketsDropdownProps = {
	mobile?: boolean;
};

const MarketsDropdown: React.FC<MarketsDropdownProps> = ({ mobile }) => {
	const futuresMarketsQuery = useGetFuturesMarkets();
	const dailyPriceChangesQuery = useLaggedDailyPrice(
		futuresMarketsQuery?.data?.map(({ asset }) => asset) ?? []
	);

	const dailyPriceChanges = React.useMemo(() => dailyPriceChangesQuery?.data ?? [], [
		dailyPriceChangesQuery,
	]);

	const asset = useRecoilValue(currentMarketState);

	const { isFuturesMarketClosed, futuresClosureReason } = useFuturesMarketClosed(
		MarketKeyByAsset[asset]
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

	const getBasePriceRate = React.useCallback(
		(asset: FuturesMarketAsset) => {
			return Number(
				futureRates?.[
					iStandardSynth(asset as CurrencyKey) ? asset : assetToSynth(asset as CurrencyKey)
				] ?? 0
			);
		},
		[futureRates]
	);

	const getPastPrice = React.useCallback(
		(asset: string) => dailyPriceChanges.find((price: Price) => price.synth === asset),
		[dailyPriceChanges]
	);

	const selectedBasePriceRate = getBasePriceRate(asset);
	const selectedPastPrice = getPastPrice(asset);

	const getMinDecimals = React.useCallback(
		(asset: string) => (isEurForex(asset) ? DEFAULT_FIAT_EURO_DECIMALS : undefined),
		[]
	);

	const options = React.useMemo(() => {
		const markets = futuresMarketsQuery?.data ?? [];

		return markets.map((market) => {
			const pastPrice = getPastPrice(market.asset);
			const basePriceRate = getBasePriceRate(market.asset);

			return assetToCurrencyOption({
				asset: market.asset,
				description: getSynthDescription(market.asset, synthsMap, t),
				price: formatCurrency(selectedPriceCurrency.name, basePriceRate, {
					sign: '$',
					minDecimals: getMinDecimals(market.asset),
				}),
				change: formatPercent(
					basePriceRate && pastPrice?.price
						? wei(basePriceRate).sub(pastPrice?.price).div(basePriceRate)
						: zeroBN
				),
				negativeChange:
					basePriceRate && pastPrice?.price ? wei(basePriceRate).lt(pastPrice?.price) : false,
				isMarketClosed: market.isSuspended,
				closureReason: market.marketClosureReason,
			});
		});
	}, [
		futuresMarketsQuery?.data,
		selectedPriceCurrency.name,
		synthsMap,
		t,
		getBasePriceRate,
		getPastPrice,
		getMinDecimals,
	]);

	return (
		<SelectContainer mobile={mobile}>
			<Select
				instanceId={`markets-dropdown-${asset}`}
				controlHeight={55}
				menuWidth={'100%'}
				onChange={(x) => {
					// Types are not perfect from react-select, this should always be true (just helping typescript)
					if (x && 'value' in x) {
						router.push(ROUTES.Markets.MarketPair(x.value));
						setLastVisited(x.value);
					}
				}}
				value={assetToCurrencyOption({
					asset,
					description: getSynthDescription(asset, synthsMap, t),
					price: mobile
						? formatCurrency(selectedPriceCurrency.name, selectedBasePriceRate, {
								sign: '$',
								minDecimals: getMinDecimals(asset),
						  })
						: undefined,
					change: mobile
						? formatPercent(
								selectedBasePriceRate && selectedPastPrice?.price
									? wei(selectedBasePriceRate)
											.sub(selectedPastPrice?.price)
											.div(selectedBasePriceRate)
									: zeroBN
						  )
						: undefined,
					negativeChange: mobile
						? selectedBasePriceRate && selectedPastPrice?.price
							? wei(selectedBasePriceRate).lt(selectedPastPrice?.price)
							: false
						: false,
					isMarketClosed: isFuturesMarketClosed,
					closureReason: futuresClosureReason,
				})}
				options={options}
				isSearchable={false}
				components={{
					SingleValue: MarketsDropdownSingleValue,
					Option: MarketsDropdownOption,
					DropdownIndicator: !mobile ? MarketsDropdownIndicator : undefined,
				}}
			/>
		</SelectContainer>
	);
};

const SelectContainer = styled.div<{ mobile?: boolean }>`
	margin-bottom: 16px;

	.react-select__dropdown-indicator {
		margin-right: 10px;
	}

	.react-select__option {
		padding: 0;
	}

	${(props) =>
		props.mobile &&
		css`
			position: absolute;
			width: 100%;
			top: 0;
			z-index: 5;

			.react-select__control {
				border-radius: 0;
			}

			.react-select__control::before,
			.react-select__menu,
			.react-select__menu-list {
				border-radius: 0;
			}
		`}
`;

export default MarketsDropdown;
