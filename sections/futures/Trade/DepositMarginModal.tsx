import React from 'react';
import styled from 'styled-components';
import Wei, { wei } from '@synthetixio/wei';

import BaseModal from 'components/BaseModal';
import { formatCurrency } from 'utils/formatters/number';
import { Synths } from 'constants/currency';
import Button from 'components/Button';
import { FlexDivRowCentered } from 'styles/common';
import useSynthetixQueries from '@synthetixio/queries';
import { useRecoilValue } from 'recoil';
import { gasSpeedState } from 'store/wallet';
import { parseGasPriceObject } from 'hooks/useGas';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { gasPriceInWei, getTransactionPrice } from 'utils/network';
import { NO_VALUE } from 'constants/placeholder';
import Connector from 'containers/Connector';
import { getFuturesMarketContract } from 'queries/futures/utils';
import CustomInput from 'components/Input/CustomInput';
import TransactionNotifier from 'containers/TransactionNotifier';

type DepositMarginModalProps = {
	onDismiss(): void;
	onTxConfirmed(): void;
	sUSDBalance: Wei;
	accessibleMargin: Wei;
	market: string | null;
};

const DepositMarginModal: React.FC<DepositMarginModalProps> = ({
	onDismiss,
	onTxConfirmed,
	sUSDBalance,
	market,
}) => {
	const { synthetixjs } = Connector.useContainer();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const gasSpeed = useRecoilValue(gasSpeedState);
	const { useEthGasPriceQuery, useExchangeRatesQuery } = useSynthetixQueries();
	const [amount, setAmount] = React.useState<string>('0');
	const [error, setError] = React.useState<string | null>(null);
	const [gasLimit, setGasLimit] = React.useState<number | null>(null);

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

	React.useEffect(() => {
		const getGasLimit = async () => {
			if (!market || !synthetixjs) return;
			try {
				setError(null);
				if (!amount) return;
				const FuturesMarketContract = getFuturesMarketContract(market, synthetixjs!.contracts);
				const marginAmount = wei(amount).toBN();
				const estimate = await FuturesMarketContract.estimateGas.transferMargin(
					wei(marginAmount).toBN()
				);
				setGasLimit(Number(estimate));
			} catch (e) {
				// @ts-ignore
				console.log(e.message);
				// @ts-ignore
				setError(e?.data?.message ?? e.message);
			}
		};
		getGasLimit();
	}, [amount, market, synthetixjs]);

	const handleDeposit = async () => {
		if (!amount || !gasLimit || !market || !gasPrice) return;
		try {
			const FuturesMarketContract = getFuturesMarketContract(market, synthetixjs!.contracts);
			const marginAmount = wei(amount).toBN();
			const tx = await FuturesMarketContract.transferMargin(wei(marginAmount).toBN(), {
				gasLimit,
				gasPrice: gasPriceInWei(gasPrice),
			});
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
		setAmount(sUSDBalance.toString());
	}, [sUSDBalance]);

	return (
		<StyledBaseModal title="Deposit Margin" isOpen={true} onDismiss={onDismiss}>
			<BalanceContainer>
				<BalanceText $gold>Balance:</BalanceText>
				<BalanceText>
					<span>{formatCurrency(Synths.sUSD, sUSDBalance, { sign: '$' })}</span> sUSD
				</BalanceText>
			</BalanceContainer>
			<CustomInput
				value={amount}
				onChange={(_, v) => setAmount(v)}
				right={<MaxButton onClick={handleSetMax}>Max</MaxButton>}
			/>
			<MinimumAmountDisclaimer>
				A $100 margin minimum is required to open a position.
			</MinimumAmountDisclaimer>
			<MarginActionButton fullWidth onClick={handleDeposit}>
				Deposit Margin
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

export const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}

	.card-body {
		padding: 28px;
	}
`;

export const BalanceContainer = styled(FlexDivRowCentered)`
	margin-bottom: 8px;
	padding: 0 14px;

	p {
		margin: 0;
	}
`;

export const BalanceText = styled.p<{ $gold?: boolean }>`
	color: ${(props) =>
		props.$gold ? props.theme.colors.common.primaryGold : props.theme.colors.common.secondaryGray};

	span {
		color: ${(props) => props.theme.colors.common.primaryWhite};
	}
`;

export const MarginActionButton = styled(Button)`
	margin-top: 16px;
	height: 55px;
`;

export const MaxButton = styled.button`
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
	color: ${(props) => props.theme.colors.common.primaryWhite};
	text-align: center;
`;

export const ErrorMessage = styled.div`
	margin-top: 16px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
`;

export const GasFeeContainer = styled(FlexDivRowCentered)`
	margin-top: 13px;
	padding: 0 14px;

	p {
		margin: 0;
	}
`;

export default DepositMarginModal;
