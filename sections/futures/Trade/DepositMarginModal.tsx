import { FC, useState, useMemo, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
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
import { zeroBN } from 'utils/formatters/number';

type DepositMarginModalProps = {
	onDismiss: () => void;
	onTxConfirmed: () => void;
	sUSDBalance: Wei;
	accessibleMargin: Wei;
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
	accessibleMargin,
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
	const ethGasPriceQuery = useEthGasPriceQuery();
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

	const isDeposit = actionTab === ACTIONS.DEPOSIT;

	useEffect(() => {
		const getGasLimit = async () => {
			if (!amount || !market || !synthetixjs) return;
			try {
				setError(null);
				const FuturesMarketContract = getFuturesMarketContract(market, synthetixjs!.contracts);
				const marginAmount = isDeposit ? amount : -amount;
				const estimate = await FuturesMarketContract.estimateGas.transferMargin(
					wei(marginAmount).toBN()
				);
				setGasLimit(Number(estimate));
			} catch (e) {
				console.log(e.message);
				setError(e?.data?.message ?? e.message);
			}
		};
		getGasLimit();
	}, [amount, market, synthetixjs, isDeposit]);

	const handleDeposit = async () => {
		if (!amount || !gasLimit || !market || !gasPrice) return;
		try {
			const FuturesMarketContract = getFuturesMarketContract(market, synthetixjs!.contracts);
			const marginAmount = isDeposit ? amount : -amount;
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
					<ActionTab
						onClick={() => {
							setAmount('');
							setActionTab(tab);
						}}
						isSelected={tab === actionTab}
						disabled={tab === ACTIONS.WITHDRAW && accessibleMargin.eq(zeroBN)}
					>
						{t(`futures.market.trade.margin.modal.actions.${tab}`)}
					</ActionTab>
				))}
			</ActionTabsRow>
			<MarginInput
				amount={amount}
				assetRate={sUSDPriceRate}
				onAmountChange={(value) => setAmount(value)}
				balance={isDeposit ? sUSDBalance : accessibleMargin}
				asset={Synths.sUSD}
				handleOnMax={() =>
					setAmount(isDeposit ? sUSDBalance.toString() : accessibleMargin.toString())
				}
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
				{error
					? error
					: t(
							isDeposit
								? 'futures.market.trade.button.deposit-margin'
								: 'futures.market.trade.button.withdraw-margin'
					  )}
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
	&:disabled {
		opacity: 0.2;
	}
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
