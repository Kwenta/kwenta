import { wei } from '@synthetixio/wei';
import { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';
import NumericInput from 'components/Input/NumericInput';
import SegmentedControl from 'components/SegmentedControl';
import { DEFAULT_CRYPTO_DECIMALS, DEFAULT_TOKEN_DECIMALS } from 'constants/defaults';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { approveKwentaToken, stakeEscrow, unstakeEscrow } from 'state/staking/actions';
import {
	selectEscrowedKwentaBalance,
	selectIsKwentaTokenApproved,
	selectStakedEscrowedKwentaBalance,
} from 'state/staking/selectors';
import { truncateNumbers, zeroBN } from 'utils/formatters/number';

import { StakingCard } from '../common';

const EscrowInputCard: FC = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const [amount, setAmount] = useState('');
	const [activeTab, setActiveTab] = useState(0);

	const escrowedKwentaBalance = useAppSelector(selectEscrowedKwentaBalance);
	const stakedEscrowedKwentaBalance = useAppSelector(selectStakedEscrowedKwentaBalance);
	const isKwentaTokenApproved = useAppSelector(selectIsKwentaTokenApproved);

	const amountBN = useMemo(() => (amount === '' ? zeroBN : wei(amount)).toString(0, true), [
		amount,
	]);

	const unstakedEscrowedKwentaBalance = useMemo(
		() =>
			escrowedKwentaBalance.gt(0) ? escrowedKwentaBalance.sub(stakedEscrowedKwentaBalance) : zeroBN,
		[escrowedKwentaBalance, stakedEscrowedKwentaBalance]
	);

	const maxBalance = useMemo(
		() => (activeTab === 0 ? wei(unstakedEscrowedKwentaBalance) : wei(stakedEscrowedKwentaBalance)),
		[activeTab, stakedEscrowedKwentaBalance, unstakedEscrowedKwentaBalance]
	);

	const stakeEnabled = useMemo(() => {
		return activeTab === 0 && unstakedEscrowedKwentaBalance.gt(0) && !!parseFloat(amount);
	}, [activeTab, unstakedEscrowedKwentaBalance, amount]);

	const unstakeEnabled = useMemo(() => {
		return activeTab === 1 && stakedEscrowedKwentaBalance.gt(0) && !!parseFloat(amount);
	}, [activeTab, stakedEscrowedKwentaBalance, amount]);

	const handleApprove = useCallback(() => {
		dispatch(approveKwentaToken('kwenta'));
	}, [dispatch]);

	const handleStakeEscrow = useCallback(() => {
		dispatch(stakeEscrow(amountBN));
	}, [dispatch, amountBN]);

	const handleUnstakeEscrow = useCallback(() => {
		dispatch(unstakeEscrow(amountBN));
	}, [dispatch, amountBN]);

	const onMaxClick = useCallback(() => {
		setAmount(truncateNumbers(maxBalance, DEFAULT_TOKEN_DECIMALS));
	}, [maxBalance]);

	const handleTabChange = useCallback((tabIndex: number) => {
		setAmount('');
		setActiveTab(tabIndex);
	}, []);

	const isDisabled = useMemo(() => {
		if (!isKwentaTokenApproved) {
			return false;
		} else if (activeTab === 0) {
			return stakeEnabled;
		} else {
			return unstakeEnabled;
		}
	}, [isKwentaTokenApproved, activeTab, stakeEnabled, unstakeEnabled]);

	const submitEscrow = useCallback(async () => {
		if (!isKwentaTokenApproved) {
			handleApprove();
		} else if (stakeEnabled) {
			handleStakeEscrow();
		} else if (unstakeEnabled) {
			handleUnstakeEscrow();
		}
	}, [
		handleApprove,
		isKwentaTokenApproved,
		handleStakeEscrow,
		handleUnstakeEscrow,
		stakeEnabled,
		unstakeEnabled,
	]);

	const balance = useMemo(() => {
		const b = activeTab === 0 ? unstakedEscrowedKwentaBalance : stakedEscrowedKwentaBalance;
		return truncateNumbers(b, DEFAULT_CRYPTO_DECIMALS);
	}, [activeTab, unstakedEscrowedKwentaBalance, stakedEscrowedKwentaBalance]);

	const handleChange = useCallback((_: any, newValue: string) => {
		if (newValue !== '' && newValue.indexOf('.') === -1) {
			setAmount(parseFloat(newValue).toString());
		} else {
			setAmount(newValue);
		}
	}, []);

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
						{t('dashboard.stake.tabs.stake-table.balance')} {balance}
					</div>
				</StakeInputHeader>
				<StyledInput value={amount} onChange={handleChange} />
			</StakeInputContainer>
			<Button fullWidth variant="flat" size="sm" disabled={isDisabled} onClick={submitEscrow}>
				{!isKwentaTokenApproved
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

const StakeInputContainer = styled.div`
	margin-bottom: 20px;
`;

const StyledInput = styled(NumericInput)`
	font-family: ${(props) => props.theme.fonts.monoBold};
`;

export default EscrowInputCard;
