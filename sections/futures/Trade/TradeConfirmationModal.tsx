import Wei, { wei } from '@synthetixio/wei';
import { capitalize } from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import ErrorView from 'components/Error';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import {
	currentMarketState,
	futuresOrderPriceState,
	leverageSideState,
	orderTypeState,
	positionState,
	potentialTradeDetailsState,
} from 'store/futures';
import { FlexDivCentered } from 'styles/common';
import { zeroBN, formatCurrency, formatDollars, formatNumber } from 'utils/formatters/number';
import { getDisplayAsset } from 'utils/futures';

import BaseDrawer from '../MobileTrade/drawers/BaseDrawer';
import { PositionSide } from '../types';

type Props = {
	gasFee: Wei;
	tradeFee: Wei;
	keeperFee?: Wei | null;
	errorMessage?: string | null | undefined;
	onConfirmOrder: () => any;
	onDismiss: () => void;
};

export default function TradeConfirmationModal({
	tradeFee,
	gasFee,
	keeperFee,
	errorMessage,
	onConfirmOrder,
	onDismiss,
}: Props) {
	const { t } = useTranslation();

	const market = useRecoilValue(currentMarketState);
	const { data: potentialTradeDetails } = useRecoilValue(potentialTradeDetailsState);
	const orderType = useRecoilValue(orderTypeState);
	const orderPrice = useRecoilValue(futuresOrderPriceState);
	const position = useRecoilValue(positionState);
	const leverageSide = useRecoilValue(leverageSideState);

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
					getDisplayAsset(market) || '',
					positionDetails?.sizeDelta.abs() ?? zeroBN,
					{
						currencyKey: getDisplayAsset(market) ?? '',
					}
				),
			},
			{
				label: 'resulting leverage',
				value: `${formatNumber(positionDetails?.leverage ?? zeroBN)}x`,
			},

			orderType === 'limit' || orderType === 'stop-market'
				? {
						label: orderType + ' order price',
						value: formatDollars(orderPrice),
				  }
				: {
						label: 'current price',
						value: formatDollars(positionDetails?.price ?? zeroBN),
				  },
			{
				label: 'liquidation price',
				value: formatDollars(positionDetails?.liqPrice ?? zeroBN),
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
			{
				label: 'network gas fee',
				value: formatDollars(gasFee ?? zeroBN),
			},
		],
		[positionDetails, market, keeperFee, gasFee, tradeFee, orderType, orderPrice, leverageSide]
	);

	const disabledReason = useMemo(() => {
		if (positionDetails?.margin.lt(wei(50)))
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
								<Label>{row.label}</Label>
								<Value>{row.value}</Value>
							</Row>
						);
					})}
					<ConfirmTradeButton
						data-testid="trade-open-position-confirm-order-button"
						variant="flat"
						onClick={onConfirmOrder}
						disabled={!positionDetails || !!disabledReason}
					>
						{disabledReason || t('futures.market.trade.confirmation.modal.confirm-order')}
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
							disabled={!positionDetails || !!disabledReason}
						>
							{disabledReason || t('futures.market.trade.confirmation.modal.confirm-order')}
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
