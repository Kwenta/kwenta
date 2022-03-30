import React from 'react';
import styled from 'styled-components';
import Wei, { wei } from '@synthetixio/wei';

import BaseModal from 'components/BaseModal';
import { formatCurrency } from 'utils/formatters/number';
import { Synths } from 'constants/currency';
import InfoBox from 'components/InfoBox';
import Button from 'components/Button';
import { FlexDivRowCentered } from 'styles/common';
import useSynthetixQueries from '@synthetixio/queries';
import { useRecoilValue } from 'recoil';
import { gasSpeedState } from 'store/wallet';
import { newGetExchangeRatesForCurrencies } from 'utils/currencies';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { newGetTransactionPrice } from 'utils/network';
import { NO_VALUE } from 'constants/placeholder';
import CustomInput from 'components/Input/CustomInput';
import TransactionNotifier from 'containers/TransactionNotifier';

type DepositMarginModalProps = {
	onDismiss(): void;
	onTxConfirmed(): void;
	sUSDBalance: Wei;
	accessibleMargin: Wei;
	market: string | null;
};

const PLACEHOLDER = '$0.00';
const MIN_DEPOSIT_AMOUNT = wei('50');

const DepositMarginModal: React.FC<DepositMarginModalProps> = ({
	onDismiss,
	onTxConfirmed,
	sUSDBalance,
	market,
}) => {
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const gasSpeed = useRecoilValue(gasSpeedState);
	const { useEthGasPriceQuery, useExchangeRatesQuery, useSynthetixTxn } = useSynthetixQueries();
	const [amount, setAmount] = React.useState<string>('');
	const [disabled, setDisabled] = React.useState<boolean>(true);
	const [error, setError] = React.useState<string | null>(null);

	const ethGasPriceQuery = useEthGasPriceQuery();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();

	const exchangeRates = React.useMemo(
		() => (exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null),
		[exchangeRatesQuery.isSuccess, exchangeRatesQuery.data]
	);

	const ethPriceRate = React.useMemo(
		() => newGetExchangeRatesForCurrencies(exchangeRates, Synths.sETH, selectedPriceCurrency.name),
		[exchangeRates, selectedPriceCurrency.name]
	);

	const gasPrice = ethGasPriceQuery.data != null ? ethGasPriceQuery.data[gasSpeed] : null;

	const depositTxn = useSynthetixTxn(
		`FuturesMarket${market?.substring(1)}`,
		'transferMargin',
		[wei(!!amount ? amount : 0).toBN()],
		gasPrice || undefined,
		{ enabled: !!market && !!amount && !disabled }
	);

	const transactionFee = React.useMemo(
		() =>
			newGetTransactionPrice(
				gasPrice,
				depositTxn.gasLimit,
				ethPriceRate,
				depositTxn.optimismLayerOneFee
			),
		[gasPrice, ethPriceRate, depositTxn.gasLimit, depositTxn.optimismLayerOneFee]
	);

	React.useEffect(() => {
		if (depositTxn.errorMessage) {
			setError(depositTxn.errorMessage);
		}
	}, [depositTxn.errorMessage]);

	React.useEffect(() => {
		if (!amount) {
			setDisabled(true);
			return;
		}

		const amtWei = wei(amount);

		if (amtWei.gte(MIN_DEPOSIT_AMOUNT) && amtWei.lte(sUSDBalance)) {
			setDisabled(false);
		} else {
			setDisabled(true);
		}
	}, [amount, disabled, sUSDBalance, setDisabled]);

	React.useEffect(() => {
		if (depositTxn.hash) {
			monitorTransaction({
				txHash: depositTxn.hash,
				onTxConfirmed: () => {
					onTxConfirmed();
					onDismiss();
				},
			});
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [depositTxn.hash]);

	const handleSetMax = React.useCallback(() => {
		setAmount(sUSDBalance.toString());
	}, [sUSDBalance]);

	return (
		<StyledBaseModal title="Deposit Margin" isOpen={true} onDismiss={onDismiss}>
			<BalanceContainer>
				<BalanceText>Balance:</BalanceText>
				<BalanceText>
					<span>{formatCurrency(Synths.sUSD, sUSDBalance, { sign: '$' })}</span> sUSD
				</BalanceText>
			</BalanceContainer>
			<CustomInput
				placeholder={PLACEHOLDER}
				value={amount}
				onChange={(_, v) => setAmount(v)}
				right={<MaxButton onClick={handleSetMax}>Max</MaxButton>}
			/>
			<MinimumAmountDisclaimer>
				Note: Placing an order requires a minimum deposit of 50 sUSD.
			</MinimumAmountDisclaimer>
			<StyledInfoBox
				details={{
					'Gas Fee': transactionFee
						? formatCurrency(Synths.sUSD, transactionFee, { sign: '$', maxDecimals: 1 })
						: NO_VALUE,
				}}
			/>
			<DepositMarginButton disabled={disabled} fullWidth onClick={() => depositTxn.mutate()}>
				Deposit Margin
			</DepositMarginButton>

			{error && <ErrorMessage>{error}</ErrorMessage>}
		</StyledBaseModal>
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

const BalanceContainer = styled(FlexDivRowCentered)`
	margin-bottom: 8px;
	padding: 0 14px;

	p {
		margin: 0;
	}
`;

const BalanceText = styled.p`
	color: ${(props) => props.theme.colors.common.secondaryGray};
	span {
		color: ${(props) => props.theme.colors.common.primaryWhite};
	}
`;

const StyledInfoBox = styled(InfoBox)`
	margin-top: 15px;
	margin-bottom: 15px;
`;

const DepositMarginButton = styled(Button)`
	height: 55px;
`;

const MaxButton = styled.button`
	height: 22px;
	padding: 4px 10px;
	background: ${(props) => props.theme.colors.selectedTheme.button.background};
	border-radius: 11px;
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 13px;
	line-height: 13px;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	color: ${(props) => props.theme.colors.common.primaryWhite};
	cursor: pointer;
`;

const MinimumAmountDisclaimer = styled.div`
	font-size: 12px;
	margin-top: 8px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
`;

const ErrorMessage = styled.div`
	margin-top: 16px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
`;

export default DepositMarginModal;
