import React, { useMemo } from 'react';
import styled from 'styled-components';

import FullScreenModal from 'components/FullScreenModal';
import { Synths, CurrencyKey } from '@synthetixio/contracts-interface';
import useSynthetixQueries from '@synthetixio/queries';
import Connector from 'containers/Connector';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useGetFuturesPotentialTradeDetails from 'queries/futures/useGetFuturesPotentialTradeDetails';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { currentMarketState } from 'store/futures';
import { gasSpeedState } from 'store/wallet';
import { newGetExchangeRatesForCurrencies } from 'utils/currencies';
import { zeroBN, formatCurrency, formatNumber } from 'utils/formatters/number';
import { newGetTransactionPrice } from 'utils/network';
import { PositionSide } from '../types';
import Wei from '@synthetixio/wei';
import { GasLimitEstimate } from 'constants/network';

type MobileTradeConfirmationModalProps = {
	open: boolean;
	gasLimit: GasLimitEstimate;
	l1Fee: Wei | null;
};

const MobileTradeConfirmationModal: React.FC<MobileTradeConfirmationModalProps> = ({
	open,
	gasLimit,
	l1Fee,
}) => {
	const { t } = useTranslation();
	const { synthsMap } = Connector.useContainer();
	const gasSpeed = useRecoilValue(gasSpeedState);
	const market = useRecoilValue(currentMarketState);
	const { useExchangeRatesQuery, useEthGasPriceQuery } = useSynthetixQueries();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const ethGasPriceQuery = useEthGasPriceQuery();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const { data: potentialTradeDetails } = useGetFuturesPotentialTradeDetails();

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
		<StyledModal isOpen={open}>
			<Foreground>
				{dataRows.map(({ label, value }) => (
					<Row key={label}>
						<div className="key">{label}</div>
						<div className="value">{value}</div>
					</Row>
				))}
			</Foreground>
		</StyledModal>
	);
};

const StyledModal = styled(FullScreenModal)`
	background-color: transparent;
	top: initial;
	bottom: 74px;

	& > div {
		margin: 0;
		width: 100%;
	}
`;

const Foreground = styled.div`
	background: linear-gradient(180deg, #1e1d1d 0%, #161515 100%);
	padding: 15px;
	border-radius: 8px 8px 0 0;
`;

const Row = styled.div`
	display: flex;
	box-sizing: border-box;
	justify-content: space-between;
	padding-bottom: 11.5px;

	.key {
		text-transform: capitalize;
		color: ${(props) => props.theme.colors.common.secondaryGray};
	}

	.value {
		color: ${(props) => props.theme.colors.common.primaryWhite};
	}

	&:not(:first-of-type) {
		padding-top: 11.5px;
	}

	&:not(:last-of-type) {
		border-bottom: 1px solid #2b2a2a;
	}
`;

export default MobileTradeConfirmationModal;
