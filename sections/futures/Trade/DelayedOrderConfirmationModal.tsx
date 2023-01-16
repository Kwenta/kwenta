import { FC, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import Error from 'components/Error';
import { FlexDivCentered } from 'components/layout/flex';
import { ButtonLoader } from 'components/Loader/Loader';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { getDisplayAsset } from 'sdk/utils/futures';
import { setOpenModal } from 'state/app/reducer';
import { modifyIsolatedPosition, modifyIsolatedPositionEstimateGas } from 'state/futures/actions';
import {
	selectDelayedOrderFee,
	selectIsModifyingIsolatedPosition,
	selectLeverageSide,
	selectMarketAsset,
	selectMarketInfo,
	selectModifyPositionError,
	selectNextPriceDisclaimer,
	selectOrderType,
	selectPosition,
	selectTradePreview,
	selectTradePreviewStatus,
	selectTradeSizeInputs,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { FetchStatus } from 'state/types';
import { getKnownError } from 'utils/formatters/error';
import {
	zeroBN,
	formatCurrency,
	formatDollars,
	formatPercent,
	formatNumber,
} from 'utils/formatters/number';

import BaseDrawer from '../MobileTrade/drawers/BaseDrawer';
import { PositionSide } from '../types';
import { MobileConfirmTradeButton } from './TradeConfirmationModal';

const DelayedOrderConfirmationModal: FC = () => {
	const { t } = useTranslation();
	const isDisclaimerDisplayed = useAppSelector(selectNextPriceDisclaimer);
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const dispatch = useAppDispatch();

	const { nativeSizeDelta } = useAppSelector(selectTradeSizeInputs);
	const txError = useAppSelector(selectModifyPositionError);
	const leverageSide = useAppSelector(selectLeverageSide);
	const position = useAppSelector(selectPosition);
	const marketInfo = useAppSelector(selectMarketInfo);
	const marketAsset = useAppSelector(selectMarketAsset);
	const submitting = useAppSelector(selectIsModifyingIsolatedPosition);
	const potentialTradeDetails = useAppSelector(selectTradePreview);
	const previewStatus = useAppSelector(selectTradePreviewStatus);
	const orderType = useAppSelector(selectOrderType);
	const { commitDeposit } = useAppSelector(selectDelayedOrderFee);

	useEffect(() => {
		dispatch(
			modifyIsolatedPositionEstimateGas({
				sizeDelta: nativeSizeDelta,
				delayed: true,
				offchain: orderType === 'delayed offchain',
			})
		);
	}, [nativeSizeDelta, orderType, dispatch]);

	const positionSize = useMemo(() => {
		const positionDetails = position?.position;
		return positionDetails
			? positionDetails.size.mul(positionDetails.side === PositionSide.LONG ? 1 : -1)
			: zeroBN;
	}, [position]);

	const orderDetails = useMemo(() => {
		return { nativeSizeDelta, size: (positionSize ?? zeroBN).add(nativeSizeDelta).abs() };
	}, [nativeSizeDelta, positionSize]);

	const isClosing = useMemo(() => {
		return orderDetails.size.eq(zeroBN);
	}, [orderDetails]);

	// TODO: check this deposit
	const totalDeposit = useMemo(() => {
		return (commitDeposit ?? zeroBN).add(marketInfo?.keeperDeposit ?? zeroBN);
	}, [commitDeposit, marketInfo?.keeperDeposit]);

	const dataRows = useMemo(
		() => [
			{
				label: t('futures.market.user.position.modal.order-type'),
				value: orderType,
			},
			{
				label: t('futures.market.user.position.modal.side'),
				value: (leverageSide ?? PositionSide.LONG).toUpperCase(),
			},
			{
				label: t('futures.market.user.position.modal.size'),
				value: formatCurrency(
					getDisplayAsset(marketAsset) || '',
					orderDetails.nativeSizeDelta.abs() ?? zeroBN,
					{
						currencyKey: getDisplayAsset(marketAsset) ?? '',
					}
				),
			},
			{
				label: t('futures.market.user.position.modal.estimated-fill'),
				value: formatDollars(potentialTradeDetails?.price ?? zeroBN, { isAssetPrice: true }),
			},
			{
				label: t('futures.market.user.position.modal.time-delay'),
				value: `${formatNumber(marketInfo?.settings.offchainDelayedOrderMinAge ?? zeroBN, {
					maxDecimals: 0,
				})} sec`,
			},
			{
				label: t('futures.market.user.position.modal.estimated-price-impact'),
				value: `${formatPercent(potentialTradeDetails?.priceImpact ?? zeroBN)}`,
				color: potentialTradeDetails?.priceImpact.abs().gt(0.45) // TODO: Make this configurable
					? 'red'
					: '',
			},
			{
				label: t('futures.market.user.position.modal.fee-estimated'),
				value: formatCurrency(selectedPriceCurrency.name, commitDeposit ?? zeroBN, {
					minDecimals: 2,
					sign: selectedPriceCurrency.sign,
				}),
			},
			{
				label: t('futures.market.user.position.modal.keeper-deposit'),
				value: formatCurrency(selectedPriceCurrency.name, marketInfo?.keeperDeposit ?? zeroBN, {
					minDecimals: 2,
					sign: selectedPriceCurrency.sign,
				}),
			},
			{
				label: t('futures.market.user.position.modal.deposit'),
				value: formatDollars(totalDeposit),
			},
		],
		[
			t,
			orderDetails,
			orderType,
			commitDeposit,
			potentialTradeDetails,
			marketAsset,
			leverageSide,
			totalDeposit,
			marketInfo?.keeperDeposit,
			marketInfo?.settings.offchainDelayedOrderMinAge,
			selectedPriceCurrency.name,
			selectedPriceCurrency.sign,
		]
	);

	const onDismiss = useCallback(() => {
		dispatch(setOpenModal(null));
	}, [dispatch]);

	const handleConfirmOrder = () => {
		dispatch(
			modifyIsolatedPosition({
				sizeDelta: nativeSizeDelta,
				delayed: true,
				offchain: orderType === 'delayed offchain',
			})
		);
	};

	return (
		<>
			<DesktopOnlyView>
				<StyledBaseModal
					onDismiss={onDismiss}
					isOpen
					title={
						isClosing
							? t('futures.market.trade.confirmation.modal.close-order')
							: t('futures.market.trade.confirmation.modal.confirm-order')
					}
				>
					{dataRows.map((row, i) => (
						<Row key={`datarow-${i}`}>
							<Label>{row.label}</Label>
							<Value>
								<span className={`value ${row.color ?? ''}`}>{row.value}</span>
							</Value>
						</Row>
					))}
					{isDisclaimerDisplayed && (
						<Disclaimer>
							{t('futures.market.trade.confirmation.modal.max-leverage-disclaimer')}
						</Disclaimer>
					)}
					<ConfirmTradeButton disabled={submitting} variant="flat" onClick={handleConfirmOrder}>
						{submitting ? (
							<ButtonLoader />
						) : isClosing ? (
							t('futures.market.trade.confirmation.modal.close-order')
						) : (
							t('futures.market.trade.confirmation.modal.confirm-order')
						)}
					</ConfirmTradeButton>
					<Disclaimer>{t('futures.market.trade.confirmation.modal.delayed-disclaimer')}</Disclaimer>
					{txError && <Error message={getKnownError(txError)} formatter="revert" />}
				</StyledBaseModal>
			</DesktopOnlyView>
			<MobileOrTabletView>
				<BaseDrawer
					open
					items={dataRows}
					closeDrawer={onDismiss}
					buttons={
						<MobileConfirmTradeButton
							disabled={submitting || previewStatus.status !== FetchStatus.Success}
							variant="primary"
							onClick={handleConfirmOrder}
						>
							{submitting ? (
								<ButtonLoader />
							) : isClosing ? (
								t('futures.market.trade.confirmation.modal.close-order')
							) : (
								t('futures.market.trade.confirmation.modal.confirm-order')
							)}
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
	text-transform: capitalize;

	.value {
		font-family: ${(props) => props.theme.fonts.mono};
		font-size: 13px;
		color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	}

	.green {
		color: ${(props) => props.theme.colors.selectedTheme.green};
	}

	.red {
		color: ${(props) => props.theme.colors.selectedTheme.red};
	}
`;

const ConfirmTradeButton = styled(Button)`
	margin-top: 24px;
	margin-bottom: 12px;
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

export default DelayedOrderConfirmationModal;
