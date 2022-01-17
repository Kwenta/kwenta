import Select from 'components/Select';
import React from 'react';
import { useRouter } from 'next/router';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import { CurrencyKey } from '@synthetixio/contracts-interface';
import ROUTES from 'constants/routes';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Connector from 'containers/Connector';
import MarketsDropdownSingleValue from './MarketsDropdownSingleValue';
import MarketsDropdownOption from './MarketsDropdownOption';

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
				formatOptionLabel={(option) => <MarketsDropdownOption option={option} />}
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
				components={{ SingleValue: MarketsDropdownSingleValue }}
			/>
		</SelectContainer>
	);
};

const SelectContainer = styled.div`
	margin-top: 5px;
	margin-bottom: 24px;
`;

export default MarketsDropdown;
