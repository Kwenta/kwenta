import React from 'react';
import styled from 'styled-components';
import Wei, { wei } from '@synthetixio/wei';
import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import InfoBox from 'components/InfoBox';
import TransactionNotifier from 'containers/TransactionNotifier';
import { useRecoilValue } from 'recoil';
import { gasSpeedState } from 'store/wallet';
import useSynthetixQueries from '@synthetixio/queries';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { newGetExchangeRatesForCurrencies } from 'utils/currencies';
import { Synths } from 'constants/currency';
import { newGetTransactionPrice } from 'utils/network';
import { formatCurrency, zeroBN } from 'utils/formatters/number';
import { FlexDivRowCentered } from 'styles/common';
import { NO_VALUE } from 'constants/placeholder';
import CustomInput from 'components/Input/CustomInput';

type WithdrawMarginModalProps = {
	onDismiss(): void;
	onTxConfirmed(): void;
	sUSDBalance: Wei;
	accessibleMargin: Wei;
	market: string | null;
};

const PLACEHOLDER = '$0.00';
const ZERO_WEI = wei(0);

const WithdrawMarginModal: React.FC<WithdrawMarginModalProps> = ({
	onDismiss,
	onTxConfirmed,
	accessibleMargin,
	market,
}) => {
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const gasSpeed = useRecoilValue(gasSpeedState);
	const { useEthGasPriceQuery, useExchangeRatesQuery, useSynthetixTxn } = useSynthetixQueries();
	const [amount, setAmount] = React.useState<string>('');
	const [disabled, setDisabled] = React.useState<boolean>(true);
	const [error, setError] = React.useState<string | null>(null);
	const [isMax, setMax] = React.useState(false);

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

	const computedAmount = React.useMemo(
		() =>
			accessibleMargin.eq(!!amount ? wei(amount) : zeroBN)
				? accessibleMargin.mul(wei(-1)).toBN()
				: wei(-amount).toBN(),
		[amount, accessibleMargin]
	);

	const withdrawTxn = useSynthetixTxn(
		`FuturesMarket${market?.substring(1)}`,
		isMax ? 'withdrawAllMargin' : 'transferMargin',
		isMax ? [] : [computedAmount],
		gasPrice || undefined,
		{ enabled: !!market && !!amount }
	);

	const transactionFee = React.useMemo(
		() =>
			newGetTransactionPrice(
				gasPrice,
				withdrawTxn.gasLimit,
				ethPriceRate,
				withdrawTxn.optimismLayerOneFee
			),
		[gasPrice, ethPriceRate, withdrawTxn.gasLimit, withdrawTxn.optimismLayerOneFee]
	);

	React.useEffect(() => {
		if (withdrawTxn.hash) {
			monitorTransaction({
				txHash: withdrawTxn.hash,
				onTxConfirmed: () => {
					onTxConfirmed();
					onDismiss();
				},
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [withdrawTxn.hash]);

	React.useEffect(() => {
		if (withdrawTxn.errorMessage) {
			console.log(withdrawTxn.errorMessage);
			setError(withdrawTxn.errorMessage);
		}
	}, [withdrawTxn.errorMessage]);

	React.useEffect(() => {
		if (!amount) {
			setDisabled(true);
			return;
		}

		const amtWei = wei(amount);

		if (amtWei.gt(ZERO_WEI) && amtWei.lte(accessibleMargin)) {
			setDisabled(false);
		} else {
			setDisabled(true);
		}
	}, [amount, disabled, accessibleMargin, setDisabled]);

	const handleSetMax = React.useCallback(() => {
		setMax(true);
		setAmount(accessibleMargin.toString());
	}, [accessibleMargin]);

	return (
		<StyledBaseModal title="Withdraw Margin" isOpen={true} onDismiss={onDismiss}>
			<BalanceContainer>
				<BalanceText>Balance:</BalanceText>
				<BalanceText>
					<span>{formatCurrency(Synths.sUSD, accessibleMargin, { sign: '$' })}</span> sUSD
				</BalanceText>
			</BalanceContainer>
			<CustomInput
				placeholder={PLACEHOLDER}
				value={amount}
				onChange={(_, v) => {
					if (isMax) setMax(false);
					setAmount(v);
				}}
				right={<MaxButton onClick={handleSetMax}>Max</MaxButton>}
			/>

			<StyledInfoBox
				details={{
					'Gas Fee': transactionFee
						? formatCurrency(Synths.sUSD, transactionFee, { sign: '$' })
						: NO_VALUE,
				}}
			/>
			<DepositMarginButton disabled={disabled} fullWidth onClick={() => withdrawTxn.mutate()}>
				Withdraw Margin
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

const ErrorMessage = styled.div`
	font-size: 12px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
`;

export default WithdrawMarginModal;
