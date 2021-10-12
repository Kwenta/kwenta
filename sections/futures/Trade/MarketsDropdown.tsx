import Select from 'components/Select';
import React from 'react';
import { FlexDivCentered } from 'styles/common';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import { useRouter } from 'next/router';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import { CurrencyKey } from '@synthetixio/contracts-interface';
import ROUTES from 'constants/routes';
import styled from 'styled-components';

const assetToCurrencyOption = (asset: string) =>
	({ value: asset, label: asset } as { value: CurrencyKey; label: CurrencyKey });

type Props = {
	asset: string;
};
const MarketsDropdown: React.FC<Props> = ({ asset }) => {
	const futuresMarketsQuery = useGetFuturesMarkets();
	const router = useRouter();
	const markets = futuresMarketsQuery?.data ?? [];
	return (
		<SelectContainer>
			<Select
				controlHeight={48}
				menuWidth={'100%'}
				formatOptionLabel={(option) => (
					<FlexDivCentered>
						<CurrencyIcon currencyKey={option.value} />
						<CurrencyLabel>{option.value}</CurrencyLabel>
					</FlexDivCentered>
				)}
				onChange={(x) => {
					// Types are not perfect from react-select, this should always be true (just helping typescript)
					if (x && 'value' in x) {
						router.push(ROUTES.Futures.Market.MarketPair(x.value));
					}
				}}
				value={assetToCurrencyOption(asset)}
				options={markets.map((x) => assetToCurrencyOption(x.asset))}
			/>
		</SelectContainer>
	);
};
const SelectContainer = styled.div`
	margin-top: 5px;
	margin-bottom: 24px;
`;

const CurrencyLabel = styled.div`
	color: ${(props) => props.theme.colors.white};
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.bold};
	margin-left: 5px;
`;

export default MarketsDropdown;
