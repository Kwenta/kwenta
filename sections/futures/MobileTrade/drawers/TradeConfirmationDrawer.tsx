import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import Button from 'components/Button';
import { CurrencyKey } from 'constants/currency';
import Connector from 'containers/Connector';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { PositionSide } from 'sections/futures/types';
import { modifyIsolatedPosition } from 'state/futures/actions';
import { selectMarketAsset, selectModifyIsolatedGasEstimate } from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { futuresTradeInputsState, potentialTradeDetailsState } from 'store/futures';
import { zeroBN, formatDollars, formatCurrency, formatNumber } from 'utils/formatters/number';

import BaseDrawer from './BaseDrawer';

type TradeConfirmationDrawerProps = {
	open: boolean;
	closeDrawer(): void;
};

const TradeConfirmationDrawer: React.FC<TradeConfirmationDrawerProps> = ({ open, closeDrawer }) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const { synthsMap } = Connector.useContainer();
	const marketAsset = useAppSelector(selectMarketAsset);
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const { data: potentialTradeDetails } = useRecoilValue(potentialTradeDetailsState);
	const { nativeSizeDelta } = useRecoilValue(futuresTradeInputsState);

	const gasEstimate = useAppSelector(selectModifyIsolatedGasEstimate);

	const transactionFee = useMemo(() => gasEstimate?.cost ?? zeroBN, [gasEstimate?.cost]);

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
				value: formatCurrency(marketAsset || '', positionDetails?.size ?? zeroBN, {
					sign: marketAsset ? synthsMap[marketAsset]?.sign : '',
				}),
			},
			{ label: 'leverage', value: `${formatNumber(positionDetails?.leverage ?? zeroBN)}x` },
			{
				label: 'current price',
				value: formatDollars(positionDetails?.price ?? zeroBN),
			},
			{
				label: 'liquidation price',
				value: formatDollars(positionDetails?.liqPrice ?? zeroBN),
			},
			{
				label: 'margin',
				value: formatDollars(positionDetails?.margin ?? zeroBN),
			},
			{
				label: 'protocol fee',
				value: formatDollars(positionDetails?.fee ?? zeroBN),
			},
			{
				label: 'network gas fee',
				value: formatCurrency(selectedPriceCurrency.name as CurrencyKey, transactionFee ?? zeroBN, {
					sign: '$',
					minDecimals: 2,
				}),
			},
		],
		[positionDetails, marketAsset, synthsMap, transactionFee, selectedPriceCurrency]
	);

	return (
		<BaseDrawer
			open={open}
			closeDrawer={closeDrawer}
			items={dataRows}
			buttons={
				<ConfirmTradeButton
					variant="primary"
					onClick={() => {
						// TODO: improve transaction status feedback
						dispatch(
							modifyIsolatedPosition({
								sizeDelta: nativeSizeDelta,
								useNextPrice: true,
							})
						);
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
