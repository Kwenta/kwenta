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
	selectIsStakingKwenta,
	selectIsUnstakingKwenta,
	selectKwentaBalance,
	selectStakedKwentaBalance,
} from 'state/staking/selectors';
import { FlexDivRowCentered, numericValueCSS } from 'styles/common';
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
	const isStakingKwenta = useAppSelector(selectIsStakingKwenta);
	const isUnstakingKwenta = useAppSelector(selectIsUnstakingKwenta);

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
		return activeTab === 0 && kwentaBalance.gt(0) && !!parseFloat(amount) && !isStakingKwenta;
	}, [activeTab, kwentaBalance, amount, isStakingKwenta]);

	const unstakeEnabled = useMemo(() => {
		return (
			activeTab === 1 && stakedKwentaBalance.gt(0) && !!parseFloat(amount) && !isUnstakingKwenta
		);
	}, [activeTab, stakedKwentaBalance, amount, isUnstakingKwenta]);

	const isDisabled = useMemo(() => {
		if (!isKwentaTokenApproved) {
			return false;
		} else {
			return activeTab === 0 ? !stakeEnabled : !unstakeEnabled;
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
					<StyledFlexDivRowCentered>
						<div>{t('dashboard.stake.tabs.stake-table.balance')}</div>
						<div className="max" onClick={onMaxClick}>
							{balance}
						</div>
					</StyledFlexDivRowCentered>
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

const StyledFlexDivRowCentered = styled(FlexDivRowCentered)`
	column-gap: 5px;
`;

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
	color: ${(props) => props.theme.colors.selectedTheme.title};
	font-size: 14px;

	.max {
		cursor: pointer;
		color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
		${numericValueCSS};
	}
`;

const StakeInputContainer = styled.div`
	margin-bottom: 20px;
`;

const StyledInput = styled(NumericInput)`
	font-family: ${(props) => props.theme.fonts.monoBold};
`;

export default StakeInputCard;
