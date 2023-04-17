import Wei, { wei } from '@synthetixio/wei';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import HelpIcon from 'assets/svg/app/question-mark.svg';
import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import ErrorView from 'components/ErrorView';
import { ButtonLoader } from 'components/Loader/Loader';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import Spacer from 'components/Spacer';
import Tooltip from 'components/Tooltip/Tooltip';
import { MIN_MARGIN_AMOUNT } from 'constants/futures';
import { NO_VALUE } from 'constants/placeholder';
import { PositionSide } from 'sdk/types/futures';
import { OrderNameByType } from 'sdk/utils/futures';
import {
	selectLeverageSide,
	selectMarketAsset,
	selectCrossMarginOrderPrice,
	selectOrderType,
	selectPosition,
	selectTradePreview,
	selectLeverageInput,
	selectSlTpTradeInputs,
} from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import {
	zeroBN,
	formatCurrency,
	formatDollars,
	formatNumber,
	formatPercent,
} from 'utils/formatters/number';

import BaseDrawer from '../MobileTrade/drawers/BaseDrawer';
import TradeConfirmationRow from './TradeConfirmationRow';
import TradeConfirmationSummary from './TradeConfirmationSummary';

type Props = {
	gasFee?: Wei | null;
	tradeFee: Wei;
	keeperFee?: Wei | null;
	executionFee: Wei;
	errorMessage?: string | null | undefined;
	isSubmitting?: boolean;
	allowanceValid?: boolean;
	onApproveAllowance: () => any;
	onConfirmOrder: () => any;
	onDismiss: () => void;
};

export default function TradeConfirmationModal({
	tradeFee,
	gasFee,
	keeperFee,
	executionFee,
	errorMessage,
	isSubmitting,
	allowanceValid,
	onApproveAllowance,
	onConfirmOrder,
	onDismiss,
}: Props) {
	const { t } = useTranslation();

	const marketAsset = useAppSelector(selectMarketAsset);
	const potentialTradeDetails = useAppSelector(selectTradePreview);
	const orderType = useAppSelector(selectOrderType);
	const orderPrice = useAppSelector(selectCrossMarginOrderPrice);
	const position = useAppSelector(selectPosition);
	const leverageSide = useAppSelector(selectLeverageSide);
	const leverageInput = useAppSelector(selectLeverageInput);
	const { stopLossPrice, takeProfitPrice } = useAppSelector(selectSlTpTradeInputs);

	const totalFee = tradeFee.add(executionFee);

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
				color: potentialTradeDetails?.priceImpact.abs().gt(0.45) // TODO: Make this configurable
					? 'red'
					: '',
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

	const disabledReason = useMemo(() => {
		if (positionDetails?.margin.lt(MIN_MARGIN_AMOUNT))
			return t('futures.market.trade.confirmation.modal.disabled-min-margin');
	}, [positionDetails?.margin, t]);

	const buttonText = allowanceValid
		? t(`futures.market.trade.confirmation.modal.confirm-order.${leverageSide}`)
		: t(`futures.market.trade.confirmation.modal.approve-order`);

	return (
		<>
			<DesktopOnlyView>
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
					<ConfirmTradeButton
						data-testid="trade-open-position-confirm-order-button"
						variant={isSubmitting ? 'flat' : leverageSide}
						onClick={allowanceValid ? onConfirmOrder : onApproveAllowance}
						className={leverageSide}
						disabled={!positionDetails || isSubmitting || !!disabledReason}
					>
						{isSubmitting ? <ButtonLoader /> : disabledReason || buttonText}
					</ConfirmTradeButton>
					{errorMessage && (
						<ErrorContainer>
							<ErrorView message={errorMessage} />
						</ErrorContainer>
					)}
				</StyledBaseModal>
			</DesktopOnlyView>
			<MobileOrTabletView>
				<BaseDrawer
					open
					closeDrawer={onDismiss}
					items={dataRows}
					buttons={
						<MobileConfirmTradeButton
							className={leverageSide}
							onClick={allowanceValid ? onConfirmOrder : onApproveAllowance}
							disabled={!positionDetails || isSubmitting || !!disabledReason}
							variant={isSubmitting ? 'flat' : leverageSide}
						>
							{isSubmitting ? <ButtonLoader /> : disabledReason || buttonText}
						</MobileConfirmTradeButton>
					}
				/>
				{errorMessage && (
					<ErrorContainer>
						<ErrorView message={errorMessage} />
					</ErrorContainer>
				)}
			</MobileOrTabletView>
		</>
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

const ErrorContainer = styled.div`
	margin-top: 20px;
`;

const StyledHelpIcon = styled(HelpIcon)`
	margin-left: 8px;
`;
