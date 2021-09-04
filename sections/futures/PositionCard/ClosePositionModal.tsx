import { FC, useMemo, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import useSynthetixQueries from '@synthetixio/queries';

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
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { getTransactionPrice, gasPriceInWei } from 'utils/network';
import { gasSpeedState } from 'store/wallet';
import { FuturesFilledPosition } from 'queries/futures/types';

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
	const { useEthGasPriceQuery, useExchangeRatesQuery } = useSynthetixQueries();
	const ethGasPriceQuery = useEthGasPriceQuery();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const gasSpeed = useRecoilValue(gasSpeedState);
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const [error, setError] = useState<string | null>(null);
	const [gasLimit, setGasLimit] = useState<number | null>(null);
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
		() => getExchangeRatesForCurrencies(exchangeRates, Synths.sETH, selectedPriceCurrency.name),
		[exchangeRates, selectedPriceCurrency.name]
	);

	const gasPrice = ethGasPriceQuery?.data?.[gasSpeed] ?? null;

	const transactionFee = useMemo(() => getTransactionPrice(gasPrice, gasLimit, ethPriceRate), [
		gasPrice,
		gasLimit,
		ethPriceRate,
	]);

	useEffect(() => {
		const getGasLimit = async () => {
			try {
				if (!synthetixjs || !currencyKey) return;
				setError(null);
				const FuturesMarketContract = getFuturesMarketContract(currencyKey, synthetixjs!.contracts);
				const estimate = await FuturesMarketContract.estimateGas.closePosition();
				setGasLimit(Number(estimate));
			} catch (e) {
				console.log(e.message);
				setError(e?.data?.message ?? e.message);
			}
		};
		getGasLimit();
	}, [synthetixjs, currencyKey]);

	const dataRows = useMemo(() => {
		if (!position || !currencyKey) return [];
		return [
			{
				label: t('futures.market.user.position.modal-close.side'),
				value: (position?.side ?? PositionSide.LONG).toUpperCase(),
			},
			{
				label: t('futures.market.user.position.modal-close.size'),
				value: formatCurrency(currencyKey, position?.size ?? zeroBN, { currencyKey }),
			},
			{
				label: t('futures.market.user.position.modal-close.leverage'),
				value: `${formatNumber(position?.leverage ?? zeroBN)}x`,
			},
			{
				label: t('futures.market.user.position.modal-close.ROI'),
				value: formatCurrency(Synths.sUSD, position?.roi ?? zeroBN, { sign: '$' }),
			},
		];
	}, [position, currencyKey, t]);

	const handleClosePosition = async () => {
		if (!gasLimit || !gasPrice) return;
		try {
			const FuturesMarketContract = getFuturesMarketContract(currencyKey, synthetixjs!.contracts);
			const tx = await FuturesMarketContract.closePosition({
				gasLimit,
				gasPrice: gasPriceInWei(gasPrice),
			});
			if (tx) {
				monitorTransaction({
					txHash: tx.hash,
					onTxConfirmed: () => {
						onDismiss();
						onPositionClose();
					},
				});
			}
		} catch (e) {
			console.log(e);
			setError(e?.data?.message ?? e.message);
		}
	};

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
					onClick={handleClosePosition}
					disabled={!gasLimit || !!error}
				>
					{error || t('futures.market.user.position.modal-close.title')}
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
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.blueberry};
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
	width: 100%;
	margin-top: 24px;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
`;

const StyledGasPriceSelect = styled(GasPriceSelect)`
	padding: 5px 0;
	display: flex;
	justify-content: space-between;
	width: auto;
	border-bottom: 1px solid ${(props) => props.theme.colors.navy};
	color: ${(props) => props.theme.colors.blueberry};
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.bold};
	text-transform: capitalize;
	margin-bottom: 8px;
`;
