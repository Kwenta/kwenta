import { CurrencyKey } from '@synthetixio/contracts-interface';
import Wei, { wei } from '@synthetixio/wei';
import { useMemo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import Error from 'components/Error';
import Connector from 'containers/Connector';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { getFuturesMarketContract } from 'queries/futures/utils';
import { FuturesFilledPosition } from 'sdk/types/futures';
import { selectMarketAsset } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { FlexDivCentered, FlexDivCol } from 'styles/common';
import { formatCurrency, formatDollars, formatNumber, zeroBN } from 'utils/formatters/number';

import { PositionSide } from '../types';

type ClosePositionModalProps = {
	gasFee: Wei | null;
	positionDetails: FuturesFilledPosition | null | undefined;
	disabled?: boolean;
	errorMessage?: string | null | undefined;
	onClosePosition: () => any;
	onDismiss: () => void;
};

function ClosePositionModal({
	gasFee,
	positionDetails,
	disabled,
	errorMessage,
	onDismiss,
	onClosePosition,
}: ClosePositionModalProps) {
	const { t } = useTranslation();
	const { defaultSynthetixjs: synthetixjs, synthsMap } = Connector.useContainer();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();

	const marketAsset = useAppSelector(selectMarketAsset);

	const [orderFee, setOrderFee] = useState<Wei>(wei(0));
	const [error, setError] = useState<null | string>(null);

	const positionSize = useMemo(() => positionDetails?.size ?? zeroBN, [positionDetails?.size]);

	useEffect(() => {
		const getOrderFee = async () => {
			try {
				if (!synthetixjs || !marketAsset || !positionSize) return;
				setError(null);
				const FuturesMarketContract = getFuturesMarketContract(marketAsset, synthetixjs!.contracts);
				const size = positionSize.neg();
				const orderFee = await FuturesMarketContract.orderFee(size.toBN());
				setOrderFee(wei(orderFee.fee));
			} catch (e) {
				// @ts-ignore
				logError(e.message);
				// @ts-ignore
				setError(e?.data?.message ?? e.message);
			}
		};
		getOrderFee();
	}, [synthetixjs, marketAsset, positionSize]);

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
				value: formatCurrency(marketAsset || '', positionDetails?.size ?? zeroBN, {
					sign: marketAsset ? synthsMap[marketAsset]?.sign : '',
				}),
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
			{
				label: t('futures.market.user.position.modal.gas-fee'),
				value: formatCurrency(selectedPriceCurrency.name as CurrencyKey, gasFee ?? zeroBN, {
					sign: '$',
				}),
			},
		];
	}, [positionDetails, marketAsset, t, orderFee, gasFee, selectedPriceCurrency, synthsMap]);

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
					size="lg"
					onClick={onClosePosition}
					disabled={!!error || disabled}
				>
					{t('futures.market.user.position.modal.title')}
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
	margin-bottom: 16px;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
	height: 55px;
`;
