import { CurrencyKey } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import Select from 'components/Select';
import { DEFAULT_CRYPTO_DECIMALS } from 'constants/defaults';
import ROUTES from 'constants/routes';
import Connector from 'containers/Connector';
import useFuturesMarketClosed, { FuturesClosureReason } from 'hooks/useFuturesMarketClosed';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { Rates } from 'queries/rates/types';
import { LatestRate } from 'sdk/types/prices';
import {
	selectMarketAsset,
	selectMarkets,
	selectMarketsQueryStatus,
	selectFuturesType,
} from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { selectPreviousDayRates, selectPrices } from 'state/prices/selectors';
import { FetchStatus } from 'state/types';
import { assetToSynth, iStandardSynth } from 'utils/currencies';
import { formatCurrency, formatPercent, zeroBN } from 'utils/formatters/number';
import {
	FuturesMarketAsset,
	getMarketName,
	getSynthDescription,
	isDecimalFour,
	MarketKeyByAsset,
} from 'utils/futures';

import MarketsDropdownIndicator, { DropdownLoadingIndicator } from './MarketsDropdownIndicator';
import MarketsDropdownOption from './MarketsDropdownOption';
import MarketsDropdownSingleValue from './MarketsDropdownSingleValue';

export type MarketsCurrencyOption = {
	value: FuturesMarketAsset;
	label: string;
	description: string;
	price?: string | JSX.Element;
	change?: string;
	negativeChange: boolean;
	isMarketClosed: boolean;
	closureReason: FuturesClosureReason;
};

type AssetToCurrencyOptionArgs = {
	asset: FuturesMarketAsset;
	description: string;
	price?: string | JSX.Element;
	change?: string;
	negativeChange: boolean;
	isMarketClosed: boolean;
	closureReason: FuturesClosureReason;
};

const assetToCurrencyOption = (args: AssetToCurrencyOptionArgs): MarketsCurrencyOption => ({
	value: args.asset,
	label: getMarketName(args.asset),
	...args,
});

type MarketsDropdownProps = {
	mobile?: boolean;
};

const MarketsDropdown: React.FC<MarketsDropdownProps> = ({ mobile }) => {
	const pastRates = useAppSelector(selectPreviousDayRates);
	const accountType = useAppSelector(selectFuturesType);
	const marketAsset = useAppSelector(selectMarketAsset);
	const futuresMarkets = useAppSelector(selectMarkets);
	const marketsQueryStatus = useAppSelector(selectMarketsQueryStatus);
	const prices = useAppSelector(selectPrices);

	const { isFuturesMarketClosed, futuresClosureReason } = useFuturesMarketClosed(
		MarketKeyByAsset[marketAsset]
	);

	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const router = useRouter();
	const { synthsMap } = Connector.useContainer();
	const { t } = useTranslation();

	const futureRates =
		futuresMarkets?.reduce((acc: Rates, { asset }) => {
			const price = prices[asset]?.offChain ?? prices[asset]?.onChain ?? wei(0);
			const currencyKey = iStandardSynth(asset as CurrencyKey)
				? asset
				: assetToSynth(asset as CurrencyKey);
			acc[currencyKey] = price;
			return acc;
		}, {}) ?? null;

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
		(asset: string) => pastRates.find((price: LatestRate) => price.synth === asset),
		[pastRates]
	);

	const selectedBasePriceRate = getBasePriceRate(marketAsset);
	const selectedPastPrice = getPastPrice(marketAsset);

	const getMinDecimals = React.useCallback(
		(asset: string) => (isDecimalFour(asset) ? DEFAULT_CRYPTO_DECIMALS : undefined),
		[]
	);

	const options = React.useMemo(() => {
		return (
			futuresMarkets?.map((market) => {
				const pastPrice = getPastPrice(market.asset);
				const basePriceRate = getBasePriceRate(market.asset);

				return assetToCurrencyOption({
					asset: market.asset,
					description: getSynthDescription(market.asset, synthsMap, t),
					price: formatCurrency(selectedPriceCurrency.name, basePriceRate, {
						sign: '$',
						minDecimals: getMinDecimals(market.asset),
						isAssetPrice: true,
					}),
					change: formatPercent(
						basePriceRate && pastPrice?.rate
							? wei(basePriceRate).sub(pastPrice?.rate).div(basePriceRate)
							: zeroBN
					),
					negativeChange:
						basePriceRate && pastPrice?.rate ? wei(basePriceRate).lt(pastPrice?.rate) : false,
					isMarketClosed: market.isSuspended,
					closureReason: market.marketClosureReason,
				});
			}) ?? []
		);
	}, [
		futuresMarkets,
		selectedPriceCurrency.name,
		synthsMap,
		t,
		getBasePriceRate,
		getPastPrice,
		getMinDecimals,
	]);

	const isFetching = !futuresMarkets.length && marketsQueryStatus.status === FetchStatus.Loading;

	return (
		<SelectContainer mobile={mobile}>
			<Select
				instanceId={`markets-dropdown-${marketAsset}`}
				controlHeight={55}
				menuWidth={'100%'}
				onChange={(x) => {
					// Types are not perfect from react-select, this should always be true (just helping typescript)
					if (x && 'value' in x) {
						router.push(ROUTES.Markets.MarketPair(x.value, accountType));
					}
				}}
				value={assetToCurrencyOption({
					asset: marketAsset,
					description: getSynthDescription(marketAsset, synthsMap, t),
					price: mobile ? (
						marketAsset === 'DebtRatio' ? (
							<DeprecatedBanner>
								{t('exchange.market-details-card.deprecated-info')}
							</DeprecatedBanner>
						) : (
							formatCurrency(selectedPriceCurrency.name, selectedBasePriceRate, {
								sign: '$',
								minDecimals: getMinDecimals(marketAsset),
								isAssetPrice: true,
							})
						)
					) : undefined,
					change: mobile
						? marketAsset === 'DebtRatio'
							? undefined
							: formatPercent(
									selectedBasePriceRate && selectedPastPrice?.rate
										? wei(selectedBasePriceRate)
												.sub(selectedPastPrice?.rate)
												.div(selectedBasePriceRate)
										: zeroBN
							  )
						: undefined,
					negativeChange: mobile
						? selectedBasePriceRate && selectedPastPrice?.rate
							? wei(selectedBasePriceRate).lt(selectedPastPrice?.rate)
							: false
						: false,
					isMarketClosed: isFuturesMarketClosed,
					closureReason: futuresClosureReason,
				})}
				options={options}
				isSearchable={false}
				variant="flat"
				components={{
					SingleValue: MarketsDropdownSingleValue,
					Option: MarketsDropdownOption,
					DropdownIndicator: !mobile
						? isFetching
							? DropdownLoadingIndicator
							: MarketsDropdownIndicator
						: undefined,
				}}
			/>
		</SelectContainer>
	);
};

const DeprecatedBanner = styled.div`
	font-size: 10px;
	margin-left: 25px;
	padding: 5px 10px;
	white-space: pre-wrap;
	background-color: ${(props) => props.theme.colors.red};
	color: ${(props) => props.theme.colors.white};
`;

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
