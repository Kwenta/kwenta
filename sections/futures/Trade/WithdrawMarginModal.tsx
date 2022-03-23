import React from 'react';
import Wei, { wei } from '@synthetixio/wei';
import TransactionNotifier from 'containers/TransactionNotifier';
import Connector from 'containers/Connector';
import { useRecoilValue } from 'recoil';
import { gasSpeedState } from 'store/wallet';
import useSynthetixQueries from '@synthetixio/queries';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import { Synths } from 'constants/currency';
import { parseGasPriceObject } from 'hooks/useGas';
import { gasPriceInWei, getTransactionPrice } from 'utils/network';
import { formatCurrency } from 'utils/formatters/number';
import { getFuturesMarketContract } from 'queries/futures/utils';
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

const WithdrawMarginModal: React.FC<WithdrawMarginModalProps> = ({
	onDismiss,
	onTxConfirmed,
	accessibleMargin,
	market,
}) => {
	const { synthetixjs } = Connector.useContainer();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const gasSpeed = useRecoilValue(gasSpeedState);
	const { useEthGasPriceQuery, useExchangeRatesQuery } = useSynthetixQueries();
	const [amount, setAmount] = React.useState<string>('0');
	const [error, setError] = React.useState<string | null>(null);
	const [gasLimit, setGasLimit] = React.useState<number | null>(null);
	const [isMax, setMax] = React.useState(false);

	const ethGasPriceQuery = useEthGasPriceQuery();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();

	const exchangeRates = React.useMemo(
		() => (exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null),
		[exchangeRatesQuery.isSuccess, exchangeRatesQuery.data]
	);

	const ethPriceRate = React.useMemo(
		() => getExchangeRatesForCurrencies(exchangeRates, Synths.sETH, selectedPriceCurrency.name),
		[exchangeRates, selectedPriceCurrency.name]
	);

	const gasPrice = ethGasPriceQuery?.data?.[gasSpeed]
		? parseGasPriceObject(ethGasPriceQuery?.data?.[gasSpeed])
		: null;

	const transactionFee = React.useMemo(
		() => getTransactionPrice(gasPrice, gasLimit, ethPriceRate),
		[gasPrice, gasLimit, ethPriceRate]
	);

	const computeAmount = React.useCallback(() => {
		return amount === accessibleMargin.toString()
			? accessibleMargin.mul(wei(-1)).toBN()
			: wei(-amount).toBN();
	}, [amount, accessibleMargin]);

	React.useEffect(() => {
		const getGasLimit = async () => {
			if (!market || !synthetixjs) return;
			try {
				setError(null);
				if (!amount) return;
				const FuturesMarketContract = getFuturesMarketContract(market, synthetixjs!.contracts);
				const marginAmount = computeAmount();

				let estimate;

				if (isMax) {
					estimate = await FuturesMarketContract.estimateGas.withdrawAllMargin();
				} else {
					estimate = await FuturesMarketContract.estimateGas.transferMargin(
						wei(marginAmount).toBN()
					);
				}

				setGasLimit(Number(estimate));
			} catch (e) {
				// @ts-ignore
				console.log(e.message);
				// @ts-ignore
				setError(e?.data?.message ?? e.message);
			}
		};
		getGasLimit();
	}, [amount, market, synthetixjs, computeAmount, isMax]);

	const handleWithdraw = async () => {
		if (!amount || !gasLimit || !market || !gasPrice) return;
		try {
			const FuturesMarketContract = getFuturesMarketContract(market, synthetixjs!.contracts);

			let tx;

			if (isMax) {
				tx = await FuturesMarketContract.withdrawAllMargin({
					gasLimit,
					gasPrice,
				});
			} else {
				const marginAmount = computeAmount();

				tx = await FuturesMarketContract.transferMargin(wei(marginAmount).toBN(), {
					gasLimit,
					gasPrice: gasPriceInWei(gasPrice),
				});
			}

			if (tx != null) {
				monitorTransaction({
					txHash: tx.hash,
					onTxConfirmed: () => {
						onTxConfirmed();
						onDismiss();
					},
				});
			}
		} catch (e) {
			console.log(e);
			// @ts-ignore
			setError(e?.data?.message ?? e.message);
		}
	};

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
				value={amount}
				onChange={(_, v) => {
					if (isMax) setMax(false);
					setAmount(v);
				}}
				right={<MaxButton onClick={handleSetMax}>Max</MaxButton>}
			/>

			<MarginActionButton fullWidth onClick={handleWithdraw}>
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
