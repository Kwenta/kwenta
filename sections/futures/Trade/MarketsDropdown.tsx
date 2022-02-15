import React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { CurrencyKey } from '@synthetixio/contracts-interface';
import { useTranslation } from 'react-i18next';

import Select from 'components/Select';
import Connector from 'containers/Connector';
import ROUTES from 'constants/routes';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';

import MarketsDropdownSingleValue from './MarketsDropdownSingleValue';
import MarketsDropdownOption from './MarketsDropdownOption';
import MarketsDropdownIndicator from './MarketsDropdownIndicator';

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
	const futuresMarketsQuery = useGetFuturesMarkets();
	const router = useRouter();
	const { synthsMap } = Connector.useContainer();
	const { t } = useTranslation();

	const markets = futuresMarketsQuery?.data ?? [];

	const getSynthDescription = React.useCallback(
		(synth: string) => {
			return t('common.currency.synthetic-currency-name', {
				currencyName: synthsMap[synth] ? synthsMap[synth].description : '',
			});
		},
		[t, synthsMap]
	);

	return (
		<SelectContainer>
			<Select
				controlHeight={55}
				menuWidth={'100%'}
				onChange={(x) => {
					// Types are not perfect from react-select, this should always be true (just helping typescript)
					if (x && 'value' in x) {
						router.push(ROUTES.Markets.MarketPair(x.value));
					}
				}}
				value={assetToCurrencyOption(asset, getSynthDescription(asset), DUMMY_PRICE, DUMMY_CHANGE)}
				options={markets.map((x) =>
					assetToCurrencyOption(x.asset, getSynthDescription(x.asset), DUMMY_PRICE, DUMMY_CHANGE)
				)}
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
	margin-top: 5px;
	margin-bottom: 16px;

	.react-select__dropdown-indicator {
		margin-right: 22px;
	}
`;

export default MarketsDropdown;
