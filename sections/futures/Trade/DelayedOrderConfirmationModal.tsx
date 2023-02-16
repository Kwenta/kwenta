import { FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import HelpIcon from 'assets/svg/app/question-mark.svg';
import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import Error from 'components/ErrorView';
import { FlexDivCentered } from 'components/layout/flex';
import { ButtonLoader } from 'components/Loader/Loader';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import Tooltip from 'components/Tooltip/Tooltip';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { PositionSide } from 'sdk/types/futures';
import { getDisplayAsset, OrderNameByType } from 'sdk/utils/futures';
import { setOpenModal } from 'state/app/reducer';
import { modifyIsolatedPosition } from 'state/futures/actions';
import {
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

	const totalDeposit = useMemo(() => {
		return (potentialTradeDetails?.fee ?? zeroBN).add(marketInfo?.keeperDeposit ?? zeroBN);
	}, [potentialTradeDetails?.fee, marketInfo?.keeperDeposit]);

	const dataRows = useMemo(
		() => [
			{
				label: t('futures.market.user.position.modal.order-type'),
				value: OrderNameByType[orderType],
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
				tooltipContent: t('futures.market.trade.delayed-order.description'),
				value: formatDollars(potentialTradeDetails?.price ?? zeroBN, {
					suggestDecimals: true,
				}),
			},
			{
				label: t('futures.market.user.position.modal.liquidation-price'),
				value: formatDollars(potentialTradeDetails?.liqPrice ?? zeroBN, {
					suggestDecimals: true,
				}),
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
				value: formatCurrency(selectedPriceCurrency.name, potentialTradeDetails?.fee ?? zeroBN, {
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
				tooltipContent: t('futures.market.trade.confirmation.modal.delayed-disclaimer'),
				value: formatDollars(totalDeposit),
			},
		],
		[
			t,
			orderDetails,
			orderType,
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
				offchain: orderType === 'delayed_offchain',
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
							{row.tooltipContent ? (
								<Tooltip
									height="auto"
									width="250px"
									content={row.tooltipContent}
									style={{ textTransform: 'none' }}
								>
									<Label>
										{row.label}
										<StyledHelpIcon />
									</Label>
								</Tooltip>
							) : (
								<Label>{row.label}</Label>
							)}
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

const StyledHelpIcon = styled(HelpIcon)`
	margin-bottom: -1px;
	margin-left: 8px;
`;

export default DelayedOrderConfirmationModal;
