import { FC, useState, useMemo, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { ethers } from 'ethers';
import styled, { css } from 'styled-components';
import { useTranslation } from 'react-i18next';
import Wei, { wei } from '@synthetixio/wei';
import useSynthetixQueries from '@synthetixio/queries';

import TransactionNotifier from 'containers/TransactionNotifier';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import BaseModal from 'components/BaseModal';
import { gasSpeedState } from 'store/wallet';

import { FlexDivCol, FlexDiv, TextButton } from 'styles/common';
import Button from 'components/Button';
import { getTransactionPrice } from 'utils/network';
import { getFuturesMarketContract } from 'queries/futures/utils';

import GasPriceSelect from 'sections/shared/components/GasPriceSelect';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { Synths } from 'constants/currency';
import Connector from 'containers/Connector';
import MarginInput from '../TradeSizeInput';
import { gasPriceInWei } from 'utils/network';

type DepositMarginModalProps = {
	onDismiss: () => void;
	onTxConfirmed: () => void;
	sUSDBalance: Wei;
	market: string | null;
};

enum ACTIONS {
	DEPOSIT = 'deposit',
	WITHDRAW = 'withdraw',
}

const DepositMarginModal: FC<DepositMarginModalProps> = ({
	onDismiss,
	sUSDBalance,
	market,
	onTxConfirmed,
}) => {
	const { t } = useTranslation();
	const { synthetixjs } = Connector.useContainer();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const [amount, setAmount] = useState<string>('');
	const gasSpeed = useRecoilValue(gasSpeedState);
	const [gasLimit, setGasLimit] = useState<number | null>(null);
	const [actionTab, setActionTab] = useState<ACTIONS>(ACTIONS.DEPOSIT);
	const [error, setError] = useState<string | null>(null);
	const { useExchangeRatesQuery, useEthGasPriceQuery } = useSynthetixQueries();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const ethGasPriceQuery = useEthGasPriceQuery(true);
	const exchangeRatesQuery = useExchangeRatesQuery();
	const gasPrices = useMemo(
		() => (ethGasPriceQuery.isSuccess ? ethGasPriceQuery?.data ?? undefined : undefined),
		[ethGasPriceQuery.isSuccess, ethGasPriceQuery.data]
	);

	const exchangeRates = useMemo(
		() => (exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null),
		[exchangeRatesQuery.isSuccess, exchangeRatesQuery.data]
	);

	const ethPriceRate = useMemo(
		() => getExchangeRatesForCurrencies(exchangeRates, Synths.sETH, selectedPriceCurrency.name),
		[exchangeRates, selectedPriceCurrency.name]
	);

	const sUSDPriceRate = useMemo(
		() => getExchangeRatesForCurrencies(exchangeRates, Synths.sUSD, selectedPriceCurrency.name),
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
			if (!amount || !market || !synthetixjs) return;
			try {
				setError(null);
				const FuturesMarketContract: ethers.Contract = getFuturesMarketContract(
					market,
					synthetixjs!.contracts
				);
				const estimate = await FuturesMarketContract.estimateGas.transferMargin(wei(amount).toBN());
				setGasLimit(Number(estimate));
			} catch (e) {
				console.log(e.message);
				setError(e?.data?.message ?? e.message);
			}
		};
		getGasLimit();
	}, [amount, market, synthetixjs]);

	const handleDeposit = async () => {
		if (!amount || !gasLimit || !market || !gasPrice) return;
		try {
			const FuturesMarketContract: ethers.Contract = getFuturesMarketContract(
				market,
				synthetixjs!.contracts
			);
			const tx = await FuturesMarketContract.transferMargin(wei(amount).toBN(), {
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
			setError(e?.data?.message ?? e.message);
		}
	};

	return (
		<StyledBaseModal
			onDismiss={onDismiss}
			isOpen={true}
			title={t('futures.market.trade.margin.modal.title')}
		>
			<ActionTabsRow>
				{[ACTIONS.DEPOSIT, ACTIONS.WITHDRAW].map((tab) => (
					<ActionTab onClick={() => setActionTab(tab)} isSelected={tab === actionTab}>
						{t(`futures.market.trade.margin.modal.actions.${tab}`)}
					</ActionTab>
				))}
			</ActionTabsRow>
			<MarginInput
				amount={amount}
				assetRate={sUSDPriceRate}
				onAmountChange={(value) => setAmount(value)}
				balance={sUSDBalance}
				asset={Synths.sUSD}
				handleOnMax={() => setAmount(sUSDBalance.toString())}
				balanceLabel={t('futures.market.trade.margin.balance')}
			/>
			<FlexDivCol>
				<StyledGasPriceSelect {...{ gasPrices, transactionFee }} />
			</FlexDivCol>
			<DepositMarginButton
				variant="primary"
				isRounded
				size="lg"
				onClick={handleDeposit}
				disabled={!gasLimit || !!error}
			>
				{error ? error : t('futures.market.trade.button.deposit-margin')}
			</DepositMarginButton>
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

const ActionTabsRow = styled(FlexDiv)`
	justify-content: flex-end;
	margin: 12px 0;
	border-bottom: 1px solid ${(props) => props.theme.colors.navy};
`;

const ActionTab = styled(TextButton)<{ isSelected: boolean }>`
	margin-left: 8px;
	padding: 0 2px 2px 2px;
	color: ${(props) => props.theme.colors.blueberry};
	font-family: ${(props) => props.theme.fonts.regular};
	cursor: pointer;
	${(props) =>
		props.isSelected &&
		css`
			color: ${(props) => props.theme.colors.white};
			border-bottom: 2px solid ${(props) => props.theme.colors.goldColors.color2};
		`};
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

const DepositMarginButton = styled(Button)`
	width: 100%;
	margin-top: 24px;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
`;

export default DepositMarginModal;
