import { wei } from '@synthetixio/wei';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import ErrorView from 'components/Error';
import CustomInput from 'components/Input/CustomInput';
import Loader from 'components/Loader';
import SegmentedControl from 'components/SegmentedControl';
import Spacer from 'components/Spacer';
import Connector from 'containers/Connector';
import { useRefetchContext } from 'contexts/RefetchContext';
import { monitorTransaction } from 'contexts/RelayerContext';
import useCrossMarginAccountContracts from 'hooks/useCrossMarginContracts';
import { selectCrossMarginBalanceInfo } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { openOrdersState } from 'store/futures';
import { isUserDeniedError } from 'utils/formatters/error';
import { formatCurrency, zeroBN } from 'utils/formatters/number';
import logError from 'utils/logError';

import {
	StyledBaseModal,
	BalanceContainer,
	BalanceText,
	MaxButton,
	MarginActionButton,
} from '../Trade/TransferIsolatedMarginModal';

type TransferType = 'deposit' | 'withdraw';

type Props = {
	onDismiss(): void;
	defaultType: TransferType;
};

const DEPOSIT_ENABLED = false;

export default function ManageKeeperBalanceModal({ onDismiss, defaultType }: Props) {
	const { t } = useTranslation();
	const { crossMarginAccountContract } = useCrossMarginAccountContracts();
	const { provider, walletAddress } = Connector.useContainer();
	const { refetchUntilUpdate } = useRefetchContext();

	const { keeperEthBal } = useAppSelector(selectCrossMarginBalanceInfo);
	const openOrders = useRecoilValue(openOrdersState);

	const [amount, setAmount] = useState('');
	const [isMax, setMax] = useState(false);
	const [userEthBal, setUserEthBal] = useState(zeroBN);
	const [error, setError] = useState<string | null>(null);
	const [transacting, setTransacting] = useState(false);
	const [transferType, setTransferType] = useState(defaultType === 'deposit' ? 0 : 1);

	const getUserEthBal = useCallback(async () => {
		if (!walletAddress) return;
		try {
			const bal = await provider.getBalance(walletAddress);
			setUserEthBal(wei(bal));
		} catch (err) {
			logError(err);
		}
	}, [walletAddress, provider]);

	useEffect(() => {
		getUserEthBal();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [walletAddress]);

	const onWithdrawKeeperDeposit = useCallback(async () => {
		try {
			if (keeperEthBal.eq(0)) return;
			setTransacting(true);
			setError(null);
			const tx = await crossMarginAccountContract?.withdrawEth(wei(amount).toBN());
			if (tx?.hash) {
				monitorTransaction({
					txHash: tx.hash,
					onTxConfirmed: async () => {
						refetchUntilUpdate('account-margin-change');
						setTransacting(false);
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
	}, [keeperEthBal, crossMarginAccountContract, amount, t, refetchUntilUpdate, onDismiss]);

	const onDepositKeeperDeposit = useCallback(async () => {
		// if (!crossMarginAccountContract || !signer) return;
		// try {
		// 	setTransacting(true);
		// 	setError(null);
		// 	// TODO: Waiting for the function to be added to the smart contract
		// 	const tx = await crossMarginAccountContract?.depositEth(wei(amount).toBN());
		// 	if (tx?.hash) {
		// 		monitorTransaction({
		// 			txHash: tx.hash,
		// 			onTxConfirmed: () => {
		// 				setTransacting(false);
		// 				getUserEthBal();
		// 				onDismiss();
		// 			},
		// 		});
		// 	}
		// } catch (err) {
		// 	setTransacting(false);
		// 	if (!isUserDeniedError(err.message)) {
		// 		setError(t('common.transaction.transaction-failed'));
		// 	}
		// 	logError(err);
		// }
	}, []);

	const exceedsLimit = useMemo(() => {
		const amtWei = wei(amount || 0);
		return transferType === 0 && amtWei.gt(transferType === 0 ? userEthBal : keeperEthBal);
	}, [transferType, amount, userEthBal, keeperEthBal]);

	const isDisabled = useMemo(() => {
		if (!amount || transacting || exceedsLimit) return true;
		return false;
	}, [amount, transacting, exceedsLimit]);

	const handleSetMax = React.useCallback(() => {
		setMax(true);
		setAmount(keeperEthBal.toString());
	}, [keeperEthBal]);

	const onChangeTab = (selection: number) => {
		setTransferType(selection);
		setAmount('');
	};

	return (
		<StyledBaseModal
			title={t('futures.market.trade.orders.manage-keeper-deposit.title')}
			isOpen
			onDismiss={onDismiss}
		>
			<Spacer height={16} />
			{DEPOSIT_ENABLED && (
				<StyledSegmentedControl
					values={['Deposit', 'Withdraw']}
					selectedIndex={transferType}
					onChange={onChangeTab}
				/>
			)}

			<BalanceContainer>
				<BalanceText $gold>{t('futures.market.trade.margin.modal.balance')}:</BalanceText>
				<BalanceText>
					<span>{formatCurrency('ETH', transferType === 0 ? userEthBal : keeperEthBal)}</span> ETH
				</BalanceText>
			</BalanceContainer>

			<CustomInput
				dataTestId="futures-market-trade-withdraw-margin-input"
				placeholder={'0.0'}
				value={amount}
				invalid={exceedsLimit}
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
				onClick={transferType === 0 ? onDepositKeeperDeposit : onWithdrawKeeperDeposit}
			>
				{transacting ? (
					<Loader />
				) : (
					t(
						`futures.market.trade.orders.manage-keeper-deposit.${
							transferType === 0 ? 'deposit' : 'withdraw'
						}`
					)
				)}
			</MarginActionButton>
			{openOrders.length && transferType === 1 && (
				<ErrorView
					containerStyle={{ margin: '16px 0 0 0' }}
					messageType="warn"
					message={t('futures.market.trade.orders.manage-keeper-deposit.withdraw-warning')}
				/>
			)}

			{error && <ErrorView containerStyle={{ margin: '16px 0 0 0' }} message={error} />}
		</StyledBaseModal>
	);
}

const StyledSegmentedControl = styled(SegmentedControl)`
	margin-bottom: 16px;
`;
