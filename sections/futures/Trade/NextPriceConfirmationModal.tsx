import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import { NO_VALUE } from 'constants/placeholder';
import Connector from 'containers/Connector';
import { useFuturesContext } from 'contexts/FuturesContext';
import useEstimateGasCost from 'hooks/useEstimateGasCost';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import GasPriceSelect from 'sections/shared/components/GasPriceSelect';
import {
	selectMarketAsset,
	selectMarketInfo,
	selectNextPriceDisclaimer,
	selectPosition,
} from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import {
	confirmationModalOpenState,
	leverageSideState,
	futuresTradeInputsState,
} from 'store/futures';
import { FlexDivCol, FlexDivCentered } from 'styles/common';
import { computeNPFee } from 'utils/costCalculations';
import { zeroBN, formatCurrency, formatDollars } from 'utils/formatters/number';

import BaseDrawer from '../MobileTrade/drawers/BaseDrawer';
import { PositionSide } from '../types';
import { MobileConfirmTradeButton } from './TradeConfirmationModal';

const NextPriceConfirmationModal: FC = () => {
	const { t } = useTranslation();
	const { synthsMap } = Connector.useContainer();
	const isDisclaimerDisplayed = useAppSelector(selectNextPriceDisclaimer);
	const { useEthGasPriceQuery } = useSynthetixQueries();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const ethGasPriceQuery = useEthGasPriceQuery();
	const { estimateSnxTxGasCost } = useEstimateGasCost();

	const { nativeSize } = useRecoilValue(futuresTradeInputsState);
	const leverageSide = useRecoilValue(leverageSideState);
	const position = useAppSelector(selectPosition);
	const marketInfo = useAppSelector(selectMarketInfo);
	const marketAsset = useAppSelector(selectMarketAsset);

	const setConfirmationModalOpen = useSetRecoilState(confirmationModalOpenState);

	const { orderTxn } = useFuturesContext();

	const gasPrices = useMemo(
		() => (ethGasPriceQuery.isSuccess ? ethGasPriceQuery?.data ?? undefined : undefined),
		[ethGasPriceQuery.isSuccess, ethGasPriceQuery.data]
	);

	const transactionFee = estimateSnxTxGasCost(orderTxn);

	const positionSize = position?.position?.size ?? zeroBN;

	const orderDetails = useMemo(() => {
		const newSize = leverageSide === PositionSide.LONG ? wei(nativeSize) : wei(nativeSize).neg();

		return { newSize, size: (positionSize ?? zeroBN).add(newSize).abs() };
	}, [leverageSide, nativeSize, positionSize]);

	const { commitDeposit, nextPriceFee } = useMemo(
		() => computeNPFee(marketInfo, wei(orderDetails.newSize)),
		[marketInfo, orderDetails]
	);

	const totalDeposit = useMemo(() => {
		return (commitDeposit ?? zeroBN).add(marketInfo?.keeperDeposit ?? zeroBN);
	}, [commitDeposit, marketInfo?.keeperDeposit]);

	const nextPriceDiscount = useMemo(() => {
		return (nextPriceFee ?? zeroBN).sub(commitDeposit ?? zeroBN);
	}, [commitDeposit, nextPriceFee]);

	const dataRows = useMemo(
		() => [
			{
				label: t('futures.market.user.position.modal.order-type'),
				value: t('futures.market.user.position.modal.next-price-order'),
			},
			{
				label: t('futures.market.user.position.modal.side'),
				value: (leverageSide ?? PositionSide.LONG).toUpperCase(),
			},
			{
				label: t('futures.market.user.position.modal.size'),
				value: formatCurrency(marketAsset || '', orderDetails.newSize.abs() ?? zeroBN, {
					sign: marketAsset ? synthsMap[marketAsset]?.sign : '',
				}),
			},
			{
				label: t('futures.market.user.position.modal.deposit'),
				value: formatDollars(totalDeposit),
			},
			{
				label: t('futures.market.user.position.modal.np-discount'),
				value: !!nextPriceDiscount ? formatDollars(nextPriceDiscount) : NO_VALUE,
			},
			{
				label: t('futures.market.user.position.modal.fee-total'),
				value: formatCurrency(
					selectedPriceCurrency.name,
					totalDeposit.add(nextPriceDiscount ?? zeroBN),
					{
						minDecimals: 2,
						sign: selectedPriceCurrency.sign,
					}
				),
			},
		],
		[
			t,
			orderDetails,
			marketAsset,
			synthsMap,
			leverageSide,
			nextPriceDiscount,
			totalDeposit,
			selectedPriceCurrency.name,
			selectedPriceCurrency.sign,
		]
	);

	const onDismiss = () => {
		setConfirmationModalOpen(false);
	};

	const handleConfirmOrder = async () => {
		orderTxn.mutate();
		onDismiss();
	};

	return (
		<>
			<DesktopOnlyView>
				<StyledBaseModal
					onDismiss={onDismiss}
					isOpen
					title={t('futures.market.trade.confirmation.modal.confirm-order')}
				>
					{dataRows.map(({ label, value }, i) => (
						<Row key={`datarow-${i}`}>
							<Label>{label}</Label>
							<Value>{value}</Value>
						</Row>
					))}
					<NetworkFees>
						<StyledGasPriceSelect {...{ gasPrices, transactionFee }} />
					</NetworkFees>
					{isDisclaimerDisplayed && (
						<Disclaimer>
							{t('futures.market.trade.confirmation.modal.max-leverage-disclaimer')}
						</Disclaimer>
					)}
					<ConfirmTradeButton variant="primary" onClick={handleConfirmOrder}>
						{t('futures.market.trade.confirmation.modal.confirm-order')}
					</ConfirmTradeButton>
				</StyledBaseModal>
			</DesktopOnlyView>
			<MobileOrTabletView>
				<BaseDrawer
					open
					items={dataRows}
					closeDrawer={onDismiss}
					buttons={
						<MobileConfirmTradeButton variant="primary" onClick={handleConfirmOrder}>
							{t('futures.market.trade.confirmation.modal.confirm-order')}
						</MobileConfirmTradeButton>
					}
				/>
			</MobileOrTabletView>
		</>
	);
};

const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}
	.card-body {
		padding: 28px;
	}
`;

const Row = styled(FlexDivCentered)`
	justify-content: space-between;
`;

const Label = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-size: 12px;
	text-transform: capitalize;
	margin-top: 6px;
`;

const Value = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	font-size: 12px;
	margin-top: 6px;
`;

const NetworkFees = styled(FlexDivCol)`
	margin-top: 12px;
`;

const StyledGasPriceSelect = styled(GasPriceSelect)`
	padding: 5px 0;
	display: flex;
	justify-content: space-between;
	width: auto;
	border-bottom: 1px solid ${(props) => props.theme.colors.selectedTheme.border};
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.regular};
	text-transform: capitalize;
	margin-bottom: 8px;
`;

const ConfirmTradeButton = styled(Button)`
	margin-top: 24px;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
	height: 55px;
`;

const Disclaimer = styled.div`
	font-size: 12px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	margin-top: 12px;
	margin-bottom: 12px;
`;

export default NextPriceConfirmationModal;
