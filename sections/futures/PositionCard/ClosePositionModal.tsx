import { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import Error from 'components/ErrorView';
import { FlexDivCentered, FlexDivCol } from 'components/layout/flex';
import { ButtonLoader } from 'components/Loader/Loader';
import { FuturesFilledPosition, PositionSide } from 'sdk/types/futures';
import { getClosePositionOrderFee } from 'state/futures/actions';
import {
	selectClosePositionOrderFee,
	selectClosePositionOrderFeeError,
	selectIsClosingPosition,
	selectMarketAsset,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { formatCurrency, formatDollars, formatNumber, zeroBN } from 'utils/formatters/number';

type ClosePositionModalProps = {
	positionDetails: FuturesFilledPosition | null | undefined;
	disabled?: boolean;
	errorMessage?: string | null | undefined;
	onClosePosition: () => any;
	onDismiss: () => void;
};

function ClosePositionModal({
	positionDetails,
	disabled,
	errorMessage,
	onDismiss,
	onClosePosition,
}: ClosePositionModalProps) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const marketAsset = useAppSelector(selectMarketAsset);
	const isClosing = useAppSelector(selectIsClosingPosition);

	const orderFee = useAppSelector(selectClosePositionOrderFee);
	const error = useAppSelector(selectClosePositionOrderFeeError);

	const positionSize = useMemo(() => positionDetails?.size ?? zeroBN, [positionDetails?.size]);

	useEffect(() => {
		dispatch(getClosePositionOrderFee());
	}, [marketAsset, positionSize, dispatch]);

	const dataRows = useMemo(() => {
		if (!positionDetails || !marketAsset) return [];
		return [
			{
				label: t('futures.market.user.position.modal.order-type'),
				value: t('futures.market.user.position.modal.market-order'),
			},
			{
				label: t('futures.market.user.position.modal.side'),
				value: (positionDetails?.side ?? PositionSide.LONG).toUpperCase(),
			},
			{
				label: t('futures.market.user.position.modal.size'),
				value: formatCurrency(marketAsset, positionDetails?.size ?? zeroBN),
			},
			{
				label: t('futures.market.user.position.modal.leverage'),
				value: `${formatNumber(positionDetails?.leverage ?? zeroBN)}x`,
			},
			{
				label: t('futures.market.user.position.modal.ROI'),
				value: formatDollars(positionDetails?.pnl ?? zeroBN),
			},
			{
				label: t('futures.market.user.position.modal.fee'),
				value: formatDollars(orderFee),
			},
		];
	}, [positionDetails, marketAsset, t, orderFee]);

	return (
		<StyledBaseModal
			onDismiss={onDismiss}
			isOpen
			title={t('futures.market.user.position.modal.title')}
		>
			<>
				{dataRows.map(({ label, value }, i) => (
					<Row key={`datarow-${i}`}>
						<Label>{label}</Label>
						<ValueColumn>
							<Value>{value}</Value>
						</ValueColumn>
					</Row>
				))}
				<StyledButton
					data-testid="trade-close-position-confirm-order-button"
					variant="flat"
					size="large"
					onClick={onClosePosition}
					disabled={!!error || disabled || isClosing}
				>
					{isClosing ? <ButtonLoader /> : t('futures.market.user.position.modal.title')}
				</StyledButton>
				{errorMessage && <Error message={errorMessage} formatter="revert" />}
			</>
		</StyledBaseModal>
	);
}

export default ClosePositionModal;

const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		max-width: 400px;
	}
`;

const Row = styled(FlexDivCentered)`
	justify-content: space-between;
`;

const Label = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
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

const ValueColumn = styled(FlexDivCol)`
	align-items: flex-end;
`;

const StyledButton = styled(Button)`
	margin-top: 24px;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
	height: 55px;
`;
