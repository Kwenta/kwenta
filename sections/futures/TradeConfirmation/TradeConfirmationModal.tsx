import Wei, { wei } from '@synthetixio/wei';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import HelpIcon from 'assets/svg/app/question-mark.svg';
import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import ErrorView from 'components/ErrorView';
import { ButtonLoader } from 'components/Loader/Loader';
import Spacer from 'components/Spacer';
import Tooltip from 'components/Tooltip/Tooltip';
import { MIN_MARGIN_AMOUNT } from 'constants/futures';
import { NO_VALUE } from 'constants/placeholder';
import { PositionSide } from 'sdk/types/futures';
import { OrderNameByType } from 'sdk/utils/futures';
import { submitCrossMarginOrder } from 'state/futures/actions';
import {
	selectLeverageSide,
	selectMarketAsset,
	selectCrossMarginOrderPrice,
	selectOrderType,
	selectPosition,
	selectTradePreview,
	selectLeverageInput,
	selectSlTpTradeInputs,
	selectKeeperDepositExceedsBal,
	selectNewTradeHasSlTp,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import {
	zeroBN,
	formatCurrency,
	formatDollars,
	formatNumber,
	formatPercent,
	stripZeros,
} from 'utils/formatters/number';

import ConfirmSlippage from './ConfirmSlippage';
import TradeConfirmationRow from './TradeConfirmationRow';
import TradeConfirmationSummary from './TradeConfirmationSummary';

type Props = {
	gasFee?: Wei | null;
	keeperFee?: Wei | null;
	executionFee: Wei;
	errorMessage?: string | null | undefined;
	isSubmitting?: boolean;
	allowanceValid?: boolean;
	onApproveAllowance: () => any;
	onDismiss: () => void;
};

export default function TradeConfirmationModal({
	gasFee,
	keeperFee,
	executionFee,
	errorMessage,
	isSubmitting,
	allowanceValid,
	onApproveAllowance,
	onDismiss,
}: Props) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const marketAsset = useAppSelector(selectMarketAsset);
	const potentialTradeDetails = useAppSelector(selectTradePreview);
	const orderType = useAppSelector(selectOrderType);
	const orderPrice = useAppSelector(selectCrossMarginOrderPrice);
	const position = useAppSelector(selectPosition);
	const leverageSide = useAppSelector(selectLeverageSide);
	const leverageInput = useAppSelector(selectLeverageInput);
	const ethBalanceExceeded = useAppSelector(selectKeeperDepositExceedsBal);
	const { stopLossPrice, takeProfitPrice } = useAppSelector(selectSlTpTradeInputs);
	const hasSlTp = useAppSelector(selectNewTradeHasSlTp);
	const [overridePriceProtection, setOverridePriceProtection] = useState(false);

	const onConfirmOrder = useCallback(() => dispatch(submitCrossMarginOrder(true)), [dispatch]);

	const totalFee = useMemo(() => potentialTradeDetails?.fee.add(executionFee) ?? executionFee, [
		potentialTradeDetails?.fee,
		executionFee,
	]);

	const positionSide = useMemo(() => {
		if (potentialTradeDetails?.size.eq(zeroBN)) {
			return position?.position?.side === PositionSide.LONG
				? PositionSide.SHORT
				: PositionSide.LONG;
		}
		return potentialTradeDetails?.size.gte(zeroBN) ? PositionSide.LONG : PositionSide.SHORT;
	}, [potentialTradeDetails?.size, position?.position?.side]);

	const positionDetails = useMemo(() => {
		return potentialTradeDetails
			? {
					...potentialTradeDetails,
					side: positionSide,
					leverage: potentialTradeDetails.margin.eq(zeroBN)
						? zeroBN
						: potentialTradeDetails.size
								.mul(potentialTradeDetails.price)
								.div(potentialTradeDetails.margin)
								.abs(),
			  }
			: null;
	}, [potentialTradeDetails, positionSide]);

	const dataRows = useMemo(
		() => [
			{
				label: 'stop loss',
				value: stopLossPrice ? formatDollars(stopLossPrice) : NO_VALUE,
			},
			{
				label: 'take profit',
				value: takeProfitPrice ? formatDollars(takeProfitPrice) : NO_VALUE,
			},
			{
				label: 'liquidation price',
				color: 'red',
				value: formatDollars(positionDetails?.liqPrice ?? zeroBN, { suggestDecimals: true }),
			},
			{
				label: 'resulting leverage',
				value: `${formatNumber(positionDetails?.leverage ?? zeroBN)}x`,
			},
			{
				label: 'resulting margin',
				value: formatDollars(positionDetails?.margin ?? zeroBN),
			},
			orderType === 'limit' || orderType === 'stop_market'
				? {
						label: OrderNameByType[orderType] + ' order price',
						value: formatDollars(orderPrice, { suggestDecimals: true }),
				  }
				: {
						label: 'fill price',
						value: formatDollars(positionDetails?.price ?? zeroBN, { suggestDecimals: true }),
				  },

			{
				label: 'price impact',
				tooltipContent: t('futures.market.trade.delayed-order.description'),
				value: `${formatPercent(potentialTradeDetails?.priceImpact ?? zeroBN)}`,
				color: positionDetails?.exceedsPriceProtection ? 'red' : '',
			},
			{
				label: 'total fee',
				value: formatDollars(totalFee),
			},
			keeperFee
				? {
						label: 'Keeper ETH deposit',
						value: formatCurrency('ETH', keeperFee, { currencyKey: 'ETH' }),
				  }
				: null,
			gasFee && gasFee.gt(0)
				? {
						label: 'network gas fee',
						value: formatDollars(gasFee),
				  }
				: null,
		],
		[
			t,
			positionDetails,
			keeperFee,
			gasFee,
			totalFee,
			orderType,
			orderPrice,
			potentialTradeDetails,
			stopLossPrice,
			takeProfitPrice,
		]
	);

	const showEthBalWarning = useMemo(() => {
		return ethBalanceExceeded && (orderType !== 'market' || hasSlTp);
	}, [ethBalanceExceeded, orderType, hasSlTp]);

	const ethBalWarningMessage = showEthBalWarning
		? t('futures.market.trade.confirmation.modal.eth-bal-warning')
		: null;

	const disabledReason = useMemo(() => {
		if (showEthBalWarning) {
			return t('futures.market.trade.confirmation.modal.disabled-eth-bal', {
				depositAmount: stripZeros(keeperFee?.toString()),
			});
		}
		if (positionDetails?.exceedsPriceProtection && !overridePriceProtection) {
			return t('futures.market.trade.confirmation.modal.disabled-exceeds-price-protection');
		}
		if (positionDetails?.margin.lt(MIN_MARGIN_AMOUNT))
			return t('futures.market.trade.confirmation.modal.disabled-min-margin');
	}, [
		positionDetails?.margin,
		t,
		showEthBalWarning,
		keeperFee,
		overridePriceProtection,
		positionDetails?.exceedsPriceProtection,
	]);

	const buttonText = allowanceValid
		? t(`futures.market.trade.confirmation.modal.confirm-order.${leverageSide}`)
		: t(`futures.market.trade.confirmation.modal.approve-order`);

	return (
		<StyledBaseModal
			onDismiss={onDismiss}
			isOpen
			title={t(`futures.market.trade.confirmation.modal.confirm-order.${leverageSide}`)}
		>
			<Spacer height={8} />
			<TradeConfirmationSummary
				marketAsset={marketAsset}
				nativeSizeDelta={potentialTradeDetails?.sizeDelta ?? zeroBN}
				leverageSide={leverageSide}
				orderType={orderType}
				leverage={wei(leverageInput || '0')}
			/>
			<RowsContainer>
				{dataRows.map((row, i) => {
					if (!row) return null;
					return (
						<TradeConfirmationRow key={`datarow-${i}`}>
							{row.tooltipContent ? (
								<Tooltip
									height="auto"
									preset="bottom"
									width="300px"
									content={row.tooltipContent}
									style={{ padding: 10, textTransform: 'none', left: '80%' }}
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
								<span className={row.color ? `value ${row.color}` : ''}>{row.value}</span>
							</Value>
						</TradeConfirmationRow>
					);
				})}
			</RowsContainer>
			{positionDetails?.exceedsPriceProtection && (
				<ConfirmSlippage
					checked={overridePriceProtection}
					onChangeChecked={(checked) => setOverridePriceProtection(checked)}
				/>
			)}
			<ConfirmTradeButton
				data-testid="trade-open-position-confirm-order-button"
				variant={isSubmitting ? 'flat' : leverageSide}
				onClick={allowanceValid ? onConfirmOrder : onApproveAllowance}
				className={leverageSide}
				disabled={!positionDetails || isSubmitting || !!disabledReason}
			>
				{isSubmitting ? <ButtonLoader /> : disabledReason || buttonText}
			</ConfirmTradeButton>
			{(errorMessage || ethBalWarningMessage) && (
				<ErrorView
					messageType={ethBalWarningMessage ? 'warn' : 'error'}
					message={errorMessage ?? ethBalWarningMessage}
					containerStyle={{ margin: '16px 0 0 0' }}
				/>
			)}
		</StyledBaseModal>
	);
}

const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}
`;

const RowsContainer = styled.div`
	margin-top: 6px;
`;

const Label = styled.div`
	display: flex;
	align-items: center;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-size: 12px;
	text-transform: capitalize;
`;

const Value = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.primary};
	font-size: 12px;

	.green {
		color: ${(props) => props.theme.colors.selectedTheme.green};
	}

	.red {
		color: ${(props) => props.theme.colors.selectedTheme.yellow};
	}
`;

const ConfirmTradeButton = styled(Button)`
	margin-top: 24px;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
	height: 55px;
	font-size: 15px;
`;

export const MobileConfirmTradeButton = styled(Button)`
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
	height: 45px;
	width: 100%;
	font-size: 15px;
`;

const StyledHelpIcon = styled(HelpIcon)`
	margin-left: 8px;
`;
