import { wei } from '@synthetixio/wei';
import _ from 'lodash';
import { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useContractWrite, usePrepareContractWrite } from 'wagmi';

import Button from 'components/Button';
import NumericInput from 'components/Input/NumericInput';
import SegmentedControl from 'components/SegmentedControl';
import { DEFAULT_CRYPTO_DECIMALS, DEFAULT_TOKEN_DECIMALS } from 'constants/defaults';
import { monitorTransaction } from 'contexts/RelayerContext';
import { useStakingContext } from 'contexts/StakingContext';
import { truncateNumbers, zeroBN } from 'utils/formatters/number';

import { StakingCard } from '../common';

const EscrowInputCard: FC = () => {
	const { t } = useTranslation();
	const {
		stakedEscrowedBalance,
		escrowedBalance,
		kwentaApproveConfig,
		kwentaTokenApproval,
		rewardEscrowContract,
		resetStakingState,
	} = useStakingContext();

	const [amount, setAmount] = useState('');
	const [activeTab, setActiveTab] = useState(0);

	const amountBN = useMemo(
		() => (amount === '' ? zeroBN.toString(0, true) : wei(amount).toString(0, true)),
		[amount]
	);

	const unstakedEscrowedKwentaBalance = useMemo(
		() =>
			!_.isNil(escrowedBalance) && escrowedBalance.gt(0)
				? escrowedBalance.sub(stakedEscrowedBalance ?? zeroBN) ?? zeroBN
				: zeroBN,
		[escrowedBalance, stakedEscrowedBalance]
	);

	const handleTabChange = useCallback((tabIndex: number) => {
		setAmount('');
		setActiveTab(tabIndex);
	}, []);

	const maxBalance = useMemo(
		() =>
			activeTab === 0
				? wei(unstakedEscrowedKwentaBalance ?? zeroBN)
				: wei(stakedEscrowedBalance ?? zeroBN),
		[activeTab, stakedEscrowedBalance, unstakedEscrowedKwentaBalance]
	);

	const onMaxClick = useCallback(async () => {
		setAmount(truncateNumbers(maxBalance, DEFAULT_TOKEN_DECIMALS));
	}, [maxBalance]);

	const { config: stakedEscrowKwentaConfig } = usePrepareContractWrite({
		...rewardEscrowContract,
		functionName: 'stakeEscrow',
		args: [amountBN],
		overrides: {
			gasLimit: 200000,
		},
		enabled: activeTab === 0 && unstakedEscrowedKwentaBalance.gt(0) && !!parseFloat(amount),
	});

	const { config: unstakedEscrowKwentaConfig } = usePrepareContractWrite({
		...rewardEscrowContract,
		functionName: 'unstakeEscrow',
		args: [amountBN],
		enabled: activeTab === 1 && stakedEscrowedBalance.gt(0) && !!parseFloat(amount),
	});

	const { writeAsync: kwentaApprove } = useContractWrite(kwentaApproveConfig);
	const { writeAsync: stakeEscrowKwenta } = useContractWrite(stakedEscrowKwentaConfig);
	const { writeAsync: unstakeEscrowKwenta } = useContractWrite(unstakedEscrowKwentaConfig);

	const submitEscrow = useCallback(async () => {
		if (kwentaTokenApproval) {
			const approveTxn = await kwentaApprove?.();
			monitorTransaction({
				txHash: approveTxn?.hash ?? '',
				onTxConfirmed: () => {
					resetStakingState();
				},
			});
		} else if (activeTab === 0) {
			const stakeTxn = await stakeEscrowKwenta?.();
			monitorTransaction({
				txHash: stakeTxn?.hash ?? '',
				onTxConfirmed: () => {
					setAmount('');
					resetStakingState();
				},
			});
		} else {
			const unstakeTxn = await unstakeEscrowKwenta?.();
			monitorTransaction({
				txHash: unstakeTxn?.hash ?? '',
				onTxConfirmed: () => {
					setAmount('');
					resetStakingState();
				},
			});
		}
	}, [
		activeTab,
		kwentaApprove,
		kwentaTokenApproval,
		resetStakingState,
		stakeEscrowKwenta,
		unstakeEscrowKwenta,
	]);

	return (
		<StakingInputCardContainer>
			<SegmentedControl
				values={[
					t('dashboard.stake.tabs.stake-table.stake'),
					t('dashboard.stake.tabs.stake-table.unstake'),
				]}
				onChange={handleTabChange}
				selectedIndex={activeTab}
				style={{ marginBottom: '20px' }}
			/>
			<StakeInputContainer>
				<StakeInputHeader>
					<div>{t('dashboard.stake.tabs.stake-table.ekwenta-token')}</div>
					<div className="max" onClick={onMaxClick}>
						{t('dashboard.stake.tabs.stake-table.balance')}{' '}
						{activeTab === 0
							? truncateNumbers(unstakedEscrowedKwentaBalance, DEFAULT_CRYPTO_DECIMALS)
							: truncateNumbers(stakedEscrowedBalance, DEFAULT_CRYPTO_DECIMALS)}
					</div>
				</StakeInputHeader>
				<StyledInput
					value={amount}
					onChange={(_, newValue) => {
						newValue !== '' && newValue.indexOf('.') === -1
							? setAmount(parseFloat(newValue).toString())
							: setAmount(newValue);
					}}
				/>
			</StakeInputContainer>
			<Button
				fullWidth
				variant="flat"
				size="sm"
				disabled={
					kwentaTokenApproval
						? !kwentaApprove
						: activeTab === 0
						? !stakeEscrowKwenta
						: !unstakeEscrowKwenta
				}
				onClick={submitEscrow}
				style={{ marginTop: '20px' }}
			>
				{kwentaTokenApproval
					? t('dashboard.stake.tabs.stake-table.approve')
					: activeTab === 0
					? t('dashboard.stake.tabs.stake-table.stake')
					: t('dashboard.stake.tabs.stake-table.unstake')}
			</Button>
		</StakingInputCardContainer>
	);
};

const StakingInputCardContainer = styled(StakingCard)`
	min-height: 125px;
	max-height: 250px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
`;

const StakeInputHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10px;
	color: ${(props) => props.theme.colors.selectedTheme.text.label};
	font-size: 14px;

	.max {
		cursor: pointer;
	}
`;

const StakeInputContainer = styled.div``;

const StyledInput = styled(NumericInput)`
	font-family: ${(props) => props.theme.fonts.monoBold};
`;

export default EscrowInputCard;
