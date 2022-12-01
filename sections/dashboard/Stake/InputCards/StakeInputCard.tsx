import { wei } from '@synthetixio/wei';
import _ from 'lodash';
import { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';
import NumericInput from 'components/Input/NumericInput';
import SegmentedControl from 'components/SegmentedControl';
import { DEFAULT_CRYPTO_DECIMALS, DEFAULT_TOKEN_DECIMALS } from 'constants/defaults';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { approveKwentaToken } from 'state/staking/actions';
import { stakeKwenta, unstakeKwenta } from 'state/staking/actions';
import {
	selectIsKwentaTokenApproved,
	selectKwentaBalance,
	selectStakedKwentaBalance,
} from 'state/staking/selectors';
import { toWei, truncateNumbers } from 'utils/formatters/number';

import { StakingCard } from '../common';

const StakeInputCard: FC = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const kwentaBalance = useAppSelector(selectKwentaBalance);
	const stakedKwentaBalance = useAppSelector(selectStakedKwentaBalance);

	const [amount, setAmount] = useState('');
	const [activeTab, setActiveTab] = useState(0);
	const amountBN = useMemo(() => toWei(amount).toBN(), [amount]);

	const handleTabChange = useCallback((tabIndex: number) => {
		setAmount('');
		setActiveTab(tabIndex);
	}, []);

	const maxBalance = useMemo(() => (activeTab === 0 ? kwentaBalance : stakedKwentaBalance), [
		activeTab,
		kwentaBalance,
		stakedKwentaBalance,
	]);

	const onMaxClick = useCallback(() => {
		setAmount(truncateNumbers(maxBalance, DEFAULT_TOKEN_DECIMALS));
	}, [maxBalance]);

	const isKwentaTokenApproved = useAppSelector(selectIsKwentaTokenApproved);

	const handleApprove = useCallback(() => {
		dispatch(approveKwentaToken('kwenta'));
	}, [dispatch]);

	const handleStakeKwenta = useCallback(() => {
		dispatch(stakeKwenta(amountBN));
	}, [dispatch, amountBN]);

	const handleUnstakeKwenta = useCallback(() => {
		dispatch(unstakeKwenta(amountBN));
	}, [dispatch, amountBN]);

	const stakeEnabled = useMemo(() => {
		return activeTab === 0 && kwentaBalance.gt(0) && !!parseFloat(amount);
	}, [activeTab, kwentaBalance, amount]);

	const unstakeEnabled = useMemo(() => {
		return activeTab === 1 && stakedKwentaBalance.gt(0) && !!parseFloat(amount);
	}, [activeTab, stakedKwentaBalance, amount]);

	const isDisabled = useMemo(() => {
		if (!isKwentaTokenApproved) {
			return false;
		} else if (activeTab === 0) {
			return !stakeEnabled;
		} else {
			return !unstakeEnabled;
		}
	}, [isKwentaTokenApproved, activeTab, stakeEnabled, unstakeEnabled]);

	const submitStake = useCallback(async () => {
		if (!isKwentaTokenApproved) {
			handleApprove();
		} else if (activeTab === 0) {
			handleStakeKwenta();
		} else {
			handleUnstakeKwenta();
		}
	}, [activeTab, handleApprove, isKwentaTokenApproved, handleStakeKwenta, handleUnstakeKwenta]);

	const handleChange = useCallback((_: any, value: string) => {
		if (value !== '' && value.indexOf('.') === -1) {
			setAmount(parseFloat(value).toString());
		} else {
			setAmount(value);
		}
	}, []);

	const balance = useMemo(() => {
		const b = activeTab === 0 ? kwentaBalance : stakedKwentaBalance;
		return truncateNumbers(b, DEFAULT_CRYPTO_DECIMALS);
	}, [activeTab, kwentaBalance, stakedKwentaBalance]);

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
					<div>{t('dashboard.stake.tabs.stake-table.kwenta-token')}</div>
					<div className="max" onClick={onMaxClick}>
						{t('dashboard.stake.tabs.stake-table.balance')} {balance}
					</div>
				</StakeInputHeader>
				<StyledInput value={amount} onChange={handleChange} />
			</StakeInputContainer>
			<Button fullWidth variant="flat" size="sm" disabled={isDisabled} onClick={submitStake}>
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

export default StakeInputCard;
