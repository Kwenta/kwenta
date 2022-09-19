import { wei } from '@synthetixio/wei';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Error from 'components/Error';
import CustomInput from 'components/Input/CustomInput';
import Loader from 'components/Loader';
import Spacer from 'components/Spacer';
import TransactionNotifier from 'containers/TransactionNotifier';
import useCrossMarginAccountContracts from 'hooks/useCrossMarginContracts';
import useCrossMarginKeeperDeposit from 'hooks/useCrossMarginKeeperEthBal';
import { isUserDeniedError } from 'utils/formatters/error';
import { formatCurrency } from 'utils/formatters/number';
import logError from 'utils/logError';

import {
	StyledBaseModal,
	BalanceContainer,
	BalanceText,
	MaxButton,
	MarginActionButton,
} from '../Trade/DepositMarginModal';

type Props = {
	onDismiss(): void;
};

function WithdrawKeeperDepositModal({ onDismiss }: Props) {
	const { t } = useTranslation();
	const { keeperEthBal, getKeeperEthBal } = useCrossMarginKeeperDeposit();
	const { crossMarginAccountContract } = useCrossMarginAccountContracts();
	const { monitorTransaction } = TransactionNotifier.useContainer();

	const [amount, setAmount] = useState('');
	const [isMax, setMax] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [transacting, setTransacting] = useState(false);

	const onWithdrawKeeperDeposit = useCallback(async () => {
		try {
			if (keeperEthBal.eq(0)) return;
			setTransacting(true);
			setError(null);
			const tx = await crossMarginAccountContract?.withdrawEth(wei(amount).toBN());
			if (tx?.hash) {
				monitorTransaction({
					txHash: tx.hash,
					onTxConfirmed: () => {
						setTransacting(false);
						getKeeperEthBal();
						onDismiss();
					},
				});
			}
		} catch (err) {
			setTransacting(false);
			if (!isUserDeniedError(err.message)) {
				setError(t('common.transaction.transaction-failed'));
			}
			logError(err);
		}
	}, [
		keeperEthBal,
		crossMarginAccountContract,
		amount,
		t,
		onDismiss,
		getKeeperEthBal,
		monitorTransaction,
	]);

	const isDisabled = useMemo(() => {
		if (!amount || transacting) {
			return true;
		}
		const amtWei = wei(amount);
		if (amtWei.eq(0) || amtWei.gt(keeperEthBal)) {
			return true;
		}
		return false;
	}, [amount, keeperEthBal, transacting]);

	const handleSetMax = React.useCallback(() => {
		setMax(true);
		setAmount(keeperEthBal.toString());
	}, [keeperEthBal]);

	return (
		<StyledBaseModal
			title={t('futures.market.trade.orders.withdraw-keeper-deposit.title')}
			isOpen
			onDismiss={onDismiss}
		>
			<Spacer height={16} />
			<BalanceContainer>
				<BalanceText $gold>{t('futures.market.trade.margin.modal.balance')}:</BalanceText>
				<BalanceText>
					<span>{formatCurrency('ETH', keeperEthBal)}</span> ETH
				</BalanceText>
			</BalanceContainer>

			<CustomInput
				dataTestId="futures-market-trade-withdraw-margin-input"
				placeholder={'0.0'}
				value={amount}
				onChange={(_, v) => {
					if (isMax) setMax(false);
					setAmount(v);
				}}
				right={
					<MaxButton data-testid="futures-market-trade-withdraw-max-button" onClick={handleSetMax}>
						{t('futures.market.trade.margin.modal.max')}
					</MaxButton>
				}
			/>
			<Spacer height={20} />

			<MarginActionButton
				data-testid="futures-market-trade-withdraw-margin-button"
				disabled={isDisabled}
				fullWidth
				onClick={onWithdrawKeeperDeposit}
			>
				{transacting ? <Loader /> : t('futures.market.trade.orders.withdraw-keeper-deposit.button')}
			</MarginActionButton>

			{error && <Error message={error} />}
		</StyledBaseModal>
	);
}

export default WithdrawKeeperDepositModal;
