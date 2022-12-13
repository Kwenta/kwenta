import { FC, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import { ButtonLoader } from 'components/Loader/Loader';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import Connector from 'containers/Connector';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { setOpenModal } from 'state/app/reducer';
import { modifyIsolatedPosition, modifyIsolatedPositionEstimateGas } from 'state/futures/actions';
import {
	selectIsModifyingIsolatedPosition,
	selectLeverageSide,
	selectMarketAsset,
	selectMarketInfo,
	selectNextPriceDisclaimer,
	selectOrderType,
	selectPosition,
	selectTradePreview,
	selectTradePreviewStatus,
	selectTradeSizeInputs,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { FetchStatus } from 'state/types';
import { FlexDivCentered } from 'styles/common';
import { computeDelayedOrderFee } from 'utils/costCalculations';
import { zeroBN, formatCurrency, formatDollars, formatPercent } from 'utils/formatters/number';

import BaseDrawer from '../MobileTrade/drawers/BaseDrawer';
import { PositionSide } from '../types';
import { MobileConfirmTradeButton } from './TradeConfirmationModal';
import { getDisplayAsset } from 'sdk/utils/futures';

const NextPriceConfirmationModal: FC = () => {
	const { t } = useTranslation();
	const { synthsMap } = Connector.useContainer();
	const isDisclaimerDisplayed = useAppSelector(selectNextPriceDisclaimer);
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const dispatch = useAppDispatch();

	const { nativeSizeDelta } = useAppSelector(selectTradeSizeInputs);
	const leverageSide = useAppSelector(selectLeverageSide);
	const position = useAppSelector(selectPosition);
	const marketInfo = useAppSelector(selectMarketInfo);
	const marketAsset = useAppSelector(selectMarketAsset);
	const submitting = useAppSelector(selectIsModifyingIsolatedPosition);
	const potentialTradeDetails = useAppSelector(selectTradePreview);
	const previewStatus = useAppSelector(selectTradePreviewStatus);
	const orderType = useAppSelector(selectOrderType);

	useEffect(() => {
		dispatch(
			modifyIsolatedPositionEstimateGas({
				sizeDelta: nativeSizeDelta,
				delayed: true,
				offchain: orderType === 'delayed offchain',
			})
		);
	}, [nativeSizeDelta, orderType, dispatch]);

	const positionSize = position?.position?.size ?? zeroBN;

	const orderDetails = useMemo(() => {
		return { nativeSizeDelta, size: (positionSize ?? zeroBN).add(nativeSizeDelta).abs() };
	}, [nativeSizeDelta, positionSize]);

	// TODO: check these fees
	const { commitDeposit } = useMemo(() => computeDelayedOrderFee(marketInfo, nativeSizeDelta), [
		marketInfo,
		nativeSizeDelta,
	]);

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
				label: t('futures.market.user.position.modal.deposit'),
				value: formatDollars(totalDeposit),
			},
			{
				label: 'estimated fill price',
				value: formatDollars(potentialTradeDetails?.price ?? zeroBN, { isAssetPrice: true }),
			},
			{
				label: 'estimated price impact',
				value: `${formatPercent(potentialTradeDetails?.priceImpact ?? zeroBN)}`,
				color: potentialTradeDetails?.priceImpact.gt(0)
					? 'green'
					: potentialTradeDetails?.priceImpact.lt(0)
					? 'red'
					: '',
			},
			{
				label: 'estimated slippage',
				value: `${formatDollars(potentialTradeDetails?.slippageAmount ?? zeroBN)}`,
				color: potentialTradeDetails?.slippageAmount.gt(0)
					? 'green'
					: potentialTradeDetails?.slippageAmount.lt(0)
					? 'red'
					: '',
			},
			{
				label: t('futures.market.user.position.modal.fee-total'),
				value: formatCurrency(selectedPriceCurrency.name, totalDeposit, {
					minDecimals: 2,
					sign: selectedPriceCurrency.sign,
				}),
			},
		],
		[
			t,
			orderDetails,
			orderType,
			potentialTradeDetails,
			marketAsset,
			synthsMap,
			leverageSide,
			totalDeposit,
			selectedPriceCurrency.name,
			selectedPriceCurrency.sign,
		]
	);

	const onDismiss = useCallback(() => {
		dispatch(setOpenModal(null));
	}, [dispatch]);

	const handleConfirmOrder = async () => {
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
					title={t('futures.market.trade.confirmation.modal.confirm-order')}
				>
					{dataRows.map((row, i) => (
						<Row key={`datarow-${i}`}>
							<Label>{row.label}</Label>
							<Value>
								<span className={row.color ? `value ${row.color}` : ''}>{row.value}</span>
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
						) : (
							t('futures.market.trade.confirmation.modal.confirm-order')
						)}
					</ConfirmTradeButton>
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
