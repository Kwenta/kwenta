import { wei } from '@synthetixio/wei';
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import Select from 'components/Select';
import ROUTES from 'constants/routes';
import Connector from 'containers/Connector';
import useFuturesMarketClosed, { FuturesClosureReason } from 'hooks/useFuturesMarketClosed';
import { FuturesMarketAsset, FuturesMarketKey } from 'sdk/types/futures';
import { getDisplayAsset } from 'sdk/utils/futures';
import {
	selectMarketAsset,
	selectMarkets,
	selectMarketsQueryStatus,
	selectFuturesType,
	selectMarkPrices,
} from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { selectPreviousDayPrices } from 'state/prices/selectors';
import { FetchStatus } from 'state/types';
import { formatDollars, formatPercent, zeroBN } from 'utils/formatters/number';
import { getMarketName, getSynthDescription, MarketKeyByAsset } from 'utils/futures';

import MarketsDropdownIndicator, { DropdownLoadingIndicator } from './MarketsDropdownIndicator';
import MarketsDropdownOption from './MarketsDropdownOption';
import MarketsDropdownSingleValue from './MarketsDropdownSingleValue';

export type MarketsCurrencyOption = {
	value: FuturesMarketAsset;
	key: FuturesMarketKey;
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
	key: FuturesMarketKey;
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
	const markPrices = useAppSelector(selectMarkPrices);
	const pastPrices = useAppSelector(selectPreviousDayPrices);
	const accountType = useAppSelector(selectFuturesType);
	const marketAsset = useAppSelector(selectMarketAsset);
	const futuresMarkets = useAppSelector(selectMarkets);
	const marketsQueryStatus = useAppSelector(selectMarketsQueryStatus);

	const { isFuturesMarketClosed, futuresClosureReason } = useFuturesMarketClosed(
		MarketKeyByAsset[marketAsset]
	);

	const router = useRouter();
	const { synthsMap } = Connector.useContainer();
	const { t } = useTranslation();

	const getBasePriceRate = React.useCallback(
		(asset: FuturesMarketAsset) => {
			return Number(markPrices[MarketKeyByAsset[asset]]);
		},
		[markPrices]
	);

	const getPastPrice = React.useCallback(
		(asset: string) => pastPrices.find((price) => price.synth === getDisplayAsset(asset)),
		[pastPrices]
	);

	const selectedBasePriceRate = getBasePriceRate(marketAsset);
	const selectedPastPrice = getPastPrice(marketAsset);

	const options = React.useMemo(() => {
		return futuresMarkets.map((market) => {
			const pastPrice = getPastPrice(market.asset);
			const basePriceRate = getBasePriceRate(market.asset);

			return assetToCurrencyOption({
				asset: market.asset,
				key: market.marketKey,
				description: getSynthDescription(market.asset, synthsMap, t),
				price: formatDollars(basePriceRate, { suggestDecimals: true }),
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
		});
	}, [futuresMarkets, synthsMap, t, getBasePriceRate, getPastPrice]);

	const isFetching = !futuresMarkets.length && marketsQueryStatus.status === FetchStatus.Loading;

	return (
		<SelectContainer mobile={mobile}>
			<Select
				maxMenuHeight={Math.max(window.innerHeight - (mobile ? 135 : 250), 300)}
				instanceId={`markets-dropdown-${marketAsset}`}
				controlHeight={55}
				menuWidth="100%"
				onChange={(x) => {
					// Types are not perfect from react-select, this should always be true (just helping typescript)
					if (x && 'value' in x) {
						router.push(ROUTES.Markets.MarketPair(x.value, accountType));
					}
				}}
				value={assetToCurrencyOption({
					asset: marketAsset,
					key: MarketKeyByAsset[marketAsset],
					description: getSynthDescription(marketAsset, synthsMap, t),
					price: mobile
						? formatDollars(selectedBasePriceRate, { suggestDecimals: true })
						: undefined,
					change: mobile
						? formatPercent(
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
