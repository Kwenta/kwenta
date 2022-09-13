import Wei, { wei } from '@synthetixio/wei';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import ErrorView from 'components/Error';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import { CurrencyKey } from 'constants/currency';
import Connector from 'containers/Connector';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { currentMarketState, potentialTradeDetailsState } from 'store/futures';
import { FlexDivCentered } from 'styles/common';
import { zeroBN, formatCurrency, formatDollars, formatNumber } from 'utils/formatters/number';

import BaseDrawer from '../MobileTrade/drawers/BaseDrawer';
import { PositionSide } from '../types';

type Props = {
	gasFee: Wei;
	tradeFee: Wei;
	errorMessage?: string | null | undefined;
	onConfirmOrder: () => any;
	onDismiss: () => void;
};

export default function TradeConfirmationModal({
	tradeFee,
	gasFee,
	errorMessage,
	onConfirmOrder,
	onDismiss,
}: Props) {
	const { t } = useTranslation();
	const { synthsMap } = Connector.useContainer();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();

	const market = useRecoilValue(currentMarketState);
	const { data: potentialTradeDetails } = useRecoilValue(potentialTradeDetailsState);

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
				value: formatDollars(tradeFee),
			},
			{
				label: 'network gas fee',
				value: formatCurrency(selectedPriceCurrency.name as CurrencyKey, gasFee ?? zeroBN, {
					sign: '$',
					minDecimals: 2,
				}),
			},
		],
		[positionDetails, market, synthsMap, gasFee, selectedPriceCurrency, tradeFee]
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
					{dataRows.map(({ label, value }, i) => (
						<Row key={`datarow-${i}`}>
							<Label>{label}</Label>
							<Value>{value}</Value>
						</Row>
					))}
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
							variant="primary"
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
