import { FC, useMemo, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import useSynthetixQueries from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';

import TransactionNotifier from 'containers/TransactionNotifier';
import BaseModal from 'components/BaseModal';
import { FlexDivCentered, FlexDivCol } from 'styles/common';
import { PositionSide } from '../types';
import { Synths } from 'constants/currency';
import { formatCurrency, formatNumber, zeroBN } from 'utils/formatters/number';
import GasPriceSelect from 'sections/shared/components/GasPriceSelect';
import { getFuturesMarketContract } from 'queries/futures/utils';
import Connector from 'containers/Connector';
import Button from 'components/Button';
import { newGetExchangeRatesForCurrencies, synthToAsset } from 'utils/currencies';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { newGetTransactionPrice } from 'utils/network';
import { gasSpeedState } from 'store/wallet';
import { FuturesFilledPosition } from 'queries/futures/types';
import { CurrencyKey } from '@synthetixio/contracts-interface';

type ClosePositionModalProps = {
	onDismiss: () => void;
	position: FuturesFilledPosition | null;
	onPositionClose: () => void;
	currencyKey: string;
};

const ClosePositionModal: FC<ClosePositionModalProps> = ({
	onDismiss,
	position,
	currencyKey,
	onPositionClose,
}) => {
	const { t } = useTranslation();
	const { synthetixjs } = Connector.useContainer();
	const { useEthGasPriceQuery, useExchangeRatesQuery, useSynthetixTxn } = useSynthetixQueries();
	const ethGasPriceQuery = useEthGasPriceQuery();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const gasSpeed = useRecoilValue(gasSpeedState);
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const [error, setError] = useState<string | null>(null);
	const [orderFee, setOrderFee] = useState<Wei>(wei(0));
	const { monitorTransaction } = TransactionNotifier.useContainer();

	const exchangeRates = useMemo(
		() => (exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null),
		[exchangeRatesQuery.isSuccess, exchangeRatesQuery.data]
	);

	const gasPrices = useMemo(
		() => (ethGasPriceQuery.isSuccess ? ethGasPriceQuery?.data ?? undefined : undefined),
		[ethGasPriceQuery.isSuccess, ethGasPriceQuery.data]
	);

	const ethPriceRate = useMemo(
		() => newGetExchangeRatesForCurrencies(exchangeRates, Synths.sETH, selectedPriceCurrency.name),
		[exchangeRates, selectedPriceCurrency.name]
	);

	const gasPrice = ethGasPriceQuery.data != null ? ethGasPriceQuery.data[gasSpeed] : null;

	const closeTxn = useSynthetixTxn(
		`FuturesMarket${currencyKey[0] === 's' ? currencyKey.substring(1) : currencyKey}`,
		'closePosition',
		[],
		gasPrice ?? undefined,
		{ enabled: !!currencyKey }
	);

	const transactionFee = useMemo(
		() =>
			newGetTransactionPrice(
				gasPrice,
				closeTxn.gasLimit,
				ethPriceRate,
				closeTxn.optimismLayerOneFee
			),
		[gasPrice, ethPriceRate, closeTxn.gasLimit, closeTxn.optimismLayerOneFee]
	);

	const positionSize = position?.size ?? wei(0);

	useEffect(() => {
		const getOrderFee = async () => {
			try {
				if (!synthetixjs || !currencyKey || !positionSize) return;
				setError(null);
				const FuturesMarketContract = getFuturesMarketContract(currencyKey, synthetixjs!.contracts);
				const size = positionSize.neg();
				const orderFee = await FuturesMarketContract.orderFee(size.toBN());
				setOrderFee(wei(orderFee.fee));
			} catch (e) {
				// @ts-ignore
				console.log(e.message);
				// @ts-ignore
				setError(e?.data?.message ?? e.message);
			}
		};
		getOrderFee();
	}, [synthetixjs, currencyKey, positionSize]);

	const dataRows = useMemo(() => {
		if (!position || !currencyKey) return [];
		return [
			{
				label: t('futures.market.user.position.modal-close.side'),
				value: (position?.side ?? PositionSide.LONG).toUpperCase(),
			},
			{
				label: t('futures.market.user.position.modal-close.size'),
				value: formatCurrency(currencyKey || '', position?.size ?? zeroBN, {
					sign: synthToAsset(currencyKey as CurrencyKey),
				}),
			},
			{
				label: t('futures.market.user.position.modal-close.leverage'),
				value: `${formatNumber(position?.leverage ?? zeroBN)}x`,
			},
			{
				label: t('futures.market.user.position.modal-close.ROI'),
				value: formatCurrency(Synths.sUSD, position?.roi ?? zeroBN, { sign: '$' }),
			},
			{
				label: t('futures.market.user.position.modal-close.fee'),
				value: formatCurrency(Synths.sUSD, orderFee, { sign: '$' }),
			},
		];
	}, [position, currencyKey, t, orderFee]);

	useEffect(() => {
		if (closeTxn.hash) {
			monitorTransaction({
				txHash: closeTxn.hash,
				onTxConfirmed: () => {
					onDismiss();
					onPositionClose();
				},
			});
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [closeTxn.hash]);

	return (
		<StyledBaseModal
			onDismiss={onDismiss}
			isOpen={true}
			title={t('futures.market.user.position.modal-close.title')}
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
				<NetworkFees>
					<StyledGasPriceSelect {...{ gasPrices, transactionFee }} />
				</NetworkFees>
				<StyledButton
					variant="primary"
					isRounded
					size="lg"
					onClick={() => closeTxn.mutate()}
					disabled={!!error || !!closeTxn.errorMessage}
				>
					{error || closeTxn.errorMessage || t('futures.market.user.position.modal-close.title')}
				</StyledButton>
			</>
		</StyledBaseModal>
	);
};

export default ClosePositionModal;

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

const NetworkFees = styled(FlexDivCol)`
	margin-top: 12px;
`;

const Label = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.common.secondaryGray};
	font-size: 12px;
	text-transform: capitalize;
	margin-top: 6px;
`;

const Value = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	color: ${(props) => props.theme.colors.white};
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

const StyledGasPriceSelect = styled(GasPriceSelect)`
	padding: 5px 0;
	display: flex;
	justify-content: space-between;
	width: auto;
	border-bottom: 1px solid ${(props) => props.theme.colors.selectedTheme.border};
	color: ${(props) => props.theme.colors.common.secondaryGray};
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.regular};
	text-transform: capitalize;
	margin-bottom: 8px;
`;
