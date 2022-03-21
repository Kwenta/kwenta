import React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { CurrencyKey } from '@synthetixio/contracts-interface';
import useSynthetixQueries from '@synthetixio/queries';
import { useTranslation } from 'react-i18next';

import Select from 'components/Select';
import Connector from 'containers/Connector';
import ROUTES from 'constants/routes';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';

import MarketsDropdownSingleValue from './MarketsDropdownSingleValue';
import MarketsDropdownOption from './MarketsDropdownOption';
import MarketsDropdownIndicator from './MarketsDropdownIndicator';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { formatCurrency } from 'utils/formatters/number';
import { getExchangeRatesForCurrencies } from 'utils/currencies';

export type MarketsCurrencyOption = {
	value: CurrencyKey;
	label: string;
	description: string;
	price: string;
	change: string;
};

const assetToCurrencyOption = (
	asset: string,
	description: string,
	price: string,
	change: string
): MarketsCurrencyOption => ({
	value: asset as CurrencyKey,
	label: `${asset}/sUSD`,
	description,
	price,
	change,
});

type Props = {
	asset: string;
};

const DUMMY_PRICE = '42,977.23';
const DUMMY_CHANGE = '+0.68%';

const MarketsDropdown: React.FC<Props> = ({ asset }) => {
	const { useExchangeRatesQuery } = useSynthetixQueries();
	const futuresMarketsQuery = useGetFuturesMarkets();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const router = useRouter();
	const { synthsMap } = Connector.useContainer();
	const { t } = useTranslation();

	const exchangeRates = exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null;

	const getSynthDescription = React.useCallback(
		(synth: string) => {
			return t('common.currency.synthetic-currency-name', {
				currencyName: synthsMap[synth] ? synthsMap[synth].description : '',
			});
		},
		[t, synthsMap]
	);

	const options = React.useMemo(() => {
		const markets = futuresMarketsQuery?.data ?? [];

		return markets.map((market) => {
			const basePriceRate = getExchangeRatesForCurrencies(
				exchangeRates,
				market.asset,
				selectedPriceCurrency.name
			);

			return assetToCurrencyOption(
				market.asset,
				getSynthDescription(market.asset),
				formatCurrency(selectedPriceCurrency.name, basePriceRate, { sign: '$' }),
				DUMMY_CHANGE
			);
		});
	}, [getSynthDescription, selectedPriceCurrency.name, exchangeRates, futuresMarketsQuery?.data]);

	return (
		<SelectContainer>
			<Select
				instanceId={`markets-dropdown-${asset}`}
				controlHeight={55}
				menuWidth={'100%'}
				onChange={(x) => {
					// Types are not perfect from react-select, this should always be true (just helping typescript)
					if (x && 'value' in x) {
						router.push(ROUTES.Markets.MarketPair(x.value));
					}
				}}
				value={assetToCurrencyOption(asset, getSynthDescription(asset), DUMMY_PRICE, DUMMY_CHANGE)}
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
		margin-right: 22px;
	}

	.react-select__option {
		padding: 0;
	}
`;

export default MarketsDropdown;
