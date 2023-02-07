import Wei from '@synthetixio/wei';
import { capitalize } from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import HelpIcon from 'assets/svg/app/question-mark.svg';
import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import ErrorView from 'components/ErrorView';
import { FlexDivCentered } from 'components/layout/flex';
import { ButtonLoader } from 'components/Loader/Loader';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import Tooltip from 'components/Tooltip/Tooltip';
import { MIN_MARGIN_AMOUNT } from 'constants/futures';
import { PositionSide } from 'sdk/types/futures';
import {
	selectLeverageSide,
	selectMarketAsset,
	selectCrossMarginOrderPrice,
	selectOrderType,
	selectPosition,
	selectTradePreview,
} from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import {
	zeroBN,
	formatCurrency,
	formatDollars,
	formatNumber,
	formatPercent,
} from 'utils/formatters/number';
import { getDisplayAsset } from 'utils/futures';

import BaseDrawer from '../MobileTrade/drawers/BaseDrawer';

type Props = {
	gasFee?: Wei | null;
	tradeFee: Wei;
	keeperFee?: Wei | null;
	errorMessage?: string | null | undefined;
	isSubmitting?: boolean;
	onConfirmOrder: () => any;
	onDismiss: () => void;
};

export default function TradeConfirmationModal({
	tradeFee,
	gasFee,
	keeperFee,
	errorMessage,
	isSubmitting,
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

	const positionSide = useMemo(() => {
		if (potentialTradeDetails?.size.eq(zeroBN)) {
			return position?.position?.side === PositionSide.LONG
				? PositionSide.SHORT
				: PositionSide.LONG;
		}
		return potentialTradeDetails?.size.gte(zeroBN) ? PositionSide.LONG : PositionSide.SHORT;
	}, [potentialTradeDetails, position?.position?.side]);

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
			{ label: 'side', value: leverageSide.toUpperCase() },
			{ label: 'order Type', value: capitalize(orderType) },
			{
				label: 'size',
				value: formatCurrency(
					getDisplayAsset(marketAsset) || '',
					positionDetails?.sizeDelta.abs() ?? zeroBN,
					{
						currencyKey: getDisplayAsset(marketAsset) ?? '',
					}
				),
			},
			{
				label: 'resulting leverage',
				value: `${formatNumber(positionDetails?.leverage ?? zeroBN)}x`,
			},
			orderType === 'limit' || orderType === 'stop_market'
				? {
						label: orderType + ' order price',
						value: formatDollars(orderPrice, { isAssetPrice: true }),
				  }
				: {
						label: 'fill price',
						value: formatDollars(positionDetails?.price ?? zeroBN, { isAssetPrice: true }),
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
				label: 'liquidation price',
				value: formatDollars(positionDetails?.liqPrice ?? zeroBN, { isAssetPrice: true }),
			},
			{
				label: 'resulting margin',
				value: formatDollars(positionDetails?.margin ?? zeroBN),
			},
			{
				label: 'protocol fee',
				value: formatDollars(tradeFee),
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
			marketAsset,
			keeperFee,
			gasFee,
			tradeFee,
			orderType,
			orderPrice,
			leverageSide,
			potentialTradeDetails,
		]
	);

	const disabledReason = useMemo(() => {
		if (positionDetails?.margin.lt(MIN_MARGIN_AMOUNT))
			return t('futures.market.trade.confirmation.modal.disabled-min-margin');
	}, [positionDetails?.margin, t]);

	return (
		<>
			<DesktopOnlyView>
				<StyledBaseModal
					onDismiss={onDismiss}
					isOpen
					title={t('futures.market.trade.confirmation.modal.confirm-order')}
				>
					{dataRows.map((row, i) => {
						if (!row) return null;
						return (
							<Row key={`datarow-${i}`}>
								{row.tooltipContent ? (
									<Tooltip
										height="auto"
										preset="bottom"
										width="300px"
										content={row.tooltipContent}
										style={{ padding: 10, textTransform: 'none' }}
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
							</Row>
						);
					})}
					<ConfirmTradeButton
						data-testid="trade-open-position-confirm-order-button"
						variant="flat"
						onClick={onConfirmOrder}
						disabled={!positionDetails || isSubmitting || !!disabledReason}
					>
						{isSubmitting ? (
							<ButtonLoader />
						) : (
							disabledReason || t('futures.market.trade.confirmation.modal.confirm-order')
						)}
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
							variant="flat"
							onClick={onConfirmOrder}
							disabled={!positionDetails || isSubmitting || !!disabledReason}
						>
							{isSubmitting ? (
								<ButtonLoader />
							) : (
								disabledReason || t('futures.market.trade.confirmation.modal.confirm-order')
							)}
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
