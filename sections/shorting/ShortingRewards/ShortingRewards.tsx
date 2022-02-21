import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled from 'styled-components';

import { gasSpeedState, isL2State } from 'store/wallet';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import { CRYPTO_CURRENCY_MAP, Synths } from 'constants/currency';
import { SYNTHS_TO_SHORT, SYNTHS_TO_SHORT_L1 } from '../constants';

import ShortingRewardRow, { GasInfo } from './ShortingRewardRow';

import { getExchangeRatesForCurrencies } from 'utils/currencies';
import { getTransactionPrice } from 'utils/network';

import GasPriceSelect from 'sections/shared/components/GasPriceSelect';

import { Title } from '../common';
import useSynthetixQueries from '@synthetixio/queries';
import { parseGasPriceObject } from 'hooks/useGas';

const ShortingRewards: FC = () => {
	const { t } = useTranslation();
	const isL2 = useRecoilValue(isL2State);

	const [gasInfo, setGasInfo] = useState<GasInfo | null>(null);

	const [gasSpeed] = useRecoilState(gasSpeedState);

	const { useEthGasPriceQuery, useExchangeRatesQuery } = useSynthetixQueries();

	const ethGasPriceQuery = useEthGasPriceQuery();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const exchangeRatesQuery = useExchangeRatesQuery();

	const gasPrices = useMemo(
		() => (ethGasPriceQuery.isSuccess ? ethGasPriceQuery?.data ?? undefined : undefined),
		[ethGasPriceQuery.isSuccess, ethGasPriceQuery.data]
	);

	const gasPrice = useMemo(
		() =>
			ethGasPriceQuery.isSuccess
				? ethGasPriceQuery?.data != null
					? parseGasPriceObject(ethGasPriceQuery.data[gasSpeed])
					: null
				: null,
		[ethGasPriceQuery.isSuccess, ethGasPriceQuery.data, gasSpeed]
	);

	const exchangeRates = useMemo(
		() => (exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null),
		[exchangeRatesQuery.isSuccess, exchangeRatesQuery.data]
	);

	const snxPriceRate = useMemo(
		() =>
			getExchangeRatesForCurrencies(
				exchangeRates,
				CRYPTO_CURRENCY_MAP.SNX,
				selectedPriceCurrency.name
			),
		[exchangeRates, selectedPriceCurrency.name]
	);

	const ethPriceRate = useMemo(
		() => getExchangeRatesForCurrencies(exchangeRates, Synths.sETH, selectedPriceCurrency.name),
		[exchangeRates, selectedPriceCurrency.name]
	);

	const transactionFee = useMemo(
		() => getTransactionPrice(gasPrice, gasInfo?.limit, ethPriceRate, gasInfo?.l1Fee),
		[gasPrice, gasInfo?.limit, gasInfo?.l1Fee, ethPriceRate]
	);

	return (
		<div>
			<Title>{t('shorting.rewards.title')}</Title>
			{(isL2 ? SYNTHS_TO_SHORT : SYNTHS_TO_SHORT_L1).map((currencyKey) => (
				<ShortingRewardRow
					key={currencyKey}
					{...{
						gasPrice,
						setGasInfo,
						currencyKey,
						snxPriceRate,
					}}
				/>
			))}
			<StyledGasPriceSelect {...{ gasPrices, transactionFee }} />
		</div>
	);
};

const StyledGasPriceSelect = styled(GasPriceSelect)`
	padding: 5px 0;
	display: flex;
	justify-content: space-between;
	width: auto;
	border-bottom: 1px solid ${(props) => props.theme.colors.navy};
`;

export default ShortingRewards;
