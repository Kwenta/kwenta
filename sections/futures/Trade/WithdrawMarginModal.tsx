import React from 'react';
import Wei, { wei } from '@synthetixio/wei';
import TransactionNotifier from 'containers/TransactionNotifier';
import { useRecoilValue } from 'recoil';
import { gasSpeedState } from 'store/wallet';
import useSynthetixQueries from '@synthetixio/queries';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { newGetExchangeRatesForCurrencies } from 'utils/currencies';
import { Synths } from 'constants/currency';
import { newGetTransactionPrice } from 'utils/network';
import { formatCurrency, zeroBN } from 'utils/formatters/number';
import { NO_VALUE } from 'constants/placeholder';
import CustomInput from 'components/Input/CustomInput';
import {
	StyledBaseModal,
	BalanceContainer,
	BalanceText,
	GasFeeContainer,
	MaxButton,
	ErrorMessage,
	MarginActionButton,
} from './DepositMarginModal';

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
				<BalanceText $gold>Balance:</BalanceText>
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

			<MarginActionButton disabled={disabled} fullWidth onClick={() => withdrawTxn.mutate()}>
				Withdraw Margin
			</MarginActionButton>

			<GasFeeContainer>
				<BalanceText>Gas Fee:</BalanceText>
				<BalanceText>
					<span>
						{transactionFee
							? formatCurrency(Synths.sUSD, transactionFee, { sign: '$', maxDecimals: 1 })
							: NO_VALUE}
					</span>
				</BalanceText>
			</GasFeeContainer>

			{error && <ErrorMessage>{error}</ErrorMessage>}
		</StyledBaseModal>
	);
};

export default WithdrawMarginModal;
