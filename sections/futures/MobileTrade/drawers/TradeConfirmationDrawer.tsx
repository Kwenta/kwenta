import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import useSynthetixQueries from '@synthetixio/queries';
import Wei from '@synthetixio/wei';

import Connector from 'containers/Connector';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { currentMarketState, potentialTradeDetailsState } from 'store/futures';
import { gasSpeedState } from 'store/wallet';
import { newGetExchangeRatesForCurrencies } from 'utils/currencies';
import { zeroBN, formatCurrency, formatNumber } from 'utils/formatters/number';
import { newGetTransactionPrice } from 'utils/network';
import { PositionSide } from 'sections/futures/types';
import { GasLimitEstimate } from 'constants/network';
import { Synths, CurrencyKey } from 'constants/currency';
import BaseDrawer from './BaseDrawer';
import Button from 'components/Button';

type TradeConfirmationDrawerProps = {
	open: boolean;
	closeDrawer(): void;
	gasLimit: GasLimitEstimate;
	l1Fee: Wei | null;
	onConfirmOrder(): void;
};

const TradeConfirmationDrawer: React.FC<TradeConfirmationDrawerProps> = ({
	open,
	closeDrawer,
	gasLimit,
	l1Fee,
	onConfirmOrder,
}) => {
	const { t } = useTranslation();
	const { synthsMap } = Connector.useContainer();
	const gasSpeed = useRecoilValue(gasSpeedState);
	const market = useRecoilValue(currentMarketState);
	const { useExchangeRatesQuery, useEthGasPriceQuery } = useSynthetixQueries();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const ethGasPriceQuery = useEthGasPriceQuery();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const potentialTradeDetails = useRecoilValue(potentialTradeDetailsState);

	const exchangeRates = useMemo(
		() => (exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null),
		[exchangeRatesQuery.isSuccess, exchangeRatesQuery.data]
	);

	const ethPriceRate = useMemo(
		() => newGetExchangeRatesForCurrencies(exchangeRates, Synths.sETH, selectedPriceCurrency.name),
		[exchangeRates, selectedPriceCurrency.name]
	);

	const gasPrice = ethGasPriceQuery.data != null ? ethGasPriceQuery.data[gasSpeed] : null;

	const transactionFee = useMemo(
		() => newGetTransactionPrice(gasPrice, gasLimit, ethPriceRate, l1Fee),
		[gasPrice, gasLimit, ethPriceRate, l1Fee]
	);

	const positionDetails = useMemo(() => {
		return potentialTradeDetails
			? {
					...potentialTradeDetails,
					size: potentialTradeDetails.size.abs(),
					side: potentialTradeDetails.size.gte(zeroBN) ? PositionSide.LONG : PositionSide.SHORT,
					leverage: potentialTradeDetails.margin.eq(zeroBN)
						? zeroBN
						: potentialTradeDetails.size
								.mul(potentialTradeDetails.price)
								.div(potentialTradeDetails.margin)
								.abs(),
			  }
			: null;
	}, [potentialTradeDetails]);

	const dataRows = useMemo(
		() => [
			{ label: 'side', value: (positionDetails?.side ?? PositionSide.LONG).toUpperCase() },
			{
				label: 'size',
				value: formatCurrency(market || '', positionDetails?.size ?? zeroBN, {
					sign: market ? synthsMap[market]?.sign : '',
				}),
			},
			{ label: 'leverage', value: `${formatNumber(positionDetails?.leverage ?? zeroBN)}x` },
			{
				label: 'current price',
				value: formatCurrency(Synths.sUSD, positionDetails?.price ?? zeroBN, { sign: '$' }),
			},
			{
				label: 'liquidation price',
				value: formatCurrency(Synths.sUSD, positionDetails?.liqPrice ?? zeroBN, {
					sign: '$',
				}),
			},
			{
				label: 'margin',
				value: formatCurrency(Synths.sUSD, positionDetails?.margin ?? zeroBN, { sign: '$' }),
			},
			{
				label: 'protocol fee',
				value: formatCurrency(Synths.sUSD, positionDetails?.fee ?? zeroBN, { sign: '$' }),
			},
			{
				label: 'network gas fee',
				value: formatCurrency(selectedPriceCurrency.name as CurrencyKey, transactionFee ?? zeroBN, {
					sign: '$',
					minDecimals: 2,
				}),
			},
		],
		[positionDetails, market, synthsMap, transactionFee, selectedPriceCurrency]
	);

	return (
		<BaseDrawer
			open={open}
			closeDrawer={closeDrawer}
			items={dataRows}
			buttons={
				<ConfirmTradeButton
					variant="primary"
					isRounded
					onClick={() => {
						onConfirmOrder();
						closeDrawer();
					}}
					disabled={!positionDetails}
				>
					{t('futures.market.trade.confirmation.modal.confirm-order')}
				</ConfirmTradeButton>
			}
		/>
	);
};

const ConfirmTradeButton = styled(Button)`
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
	height: 45px;
	width: 100%;
`;

export default TradeConfirmationDrawer;
