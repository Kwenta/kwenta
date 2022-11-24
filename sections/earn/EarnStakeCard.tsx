import { wei } from '@synthetixio/wei';
import { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';
import NumericInput from 'components/Input/NumericInput';
import SegmentedControl from 'components/SegmentedControl';
import { StakingCard } from 'sections/dashboard/Stake/common';
import { approveLPToken, stakeTokens, unstakeTokens } from 'state/earn/actions';
import { setAmount } from 'state/earn/reducer';
import { selectIsApproved } from 'state/earn/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { toWei, truncateNumbers } from 'utils/formatters/number';

const EarnStakeCard: FC = () => {
	const { t } = useTranslation();

	const amount = useAppSelector(({ earn }) => earn.amount);
	const [activeTab, setActiveTab] = useState(0);
	const dispatch = useAppDispatch();
	const { lpTokenBalance, balance } = useAppSelector(({ wallet, earn }) => ({
		walletAddress: wallet.walletAddress,
		lpTokenBalance: earn.lpTokenBalance,
		balance: earn.balance,
	}));
	const isApproved = useAppSelector(selectIsApproved);

	const setMaxBalance = useCallback(() => {
		dispatch(setAmount(activeTab === 0 ? lpTokenBalance : balance));
	}, [dispatch, activeTab, lpTokenBalance, balance]);

	const handleTabChange = useCallback(
		(tabIndex: number) => {
			dispatch(setAmount(''));
			setActiveTab(tabIndex);
		},
		[dispatch]
	);

	const handleAmountChange = useCallback(
		(_: any, newAmount: string) => {
			dispatch(setAmount(newAmount));
		},
		[dispatch]
	);

	const handleSubmit = useCallback(() => {
		if (!isApproved) {
			dispatch(approveLPToken());
		} else if (activeTab === 0) {
			dispatch(stakeTokens());
		} else {
			dispatch(unstakeTokens());
		}
	}, [dispatch, activeTab, isApproved]);

	const balanceValue = useMemo(() => {
		const returnedBalance = activeTab === 0 ? lpTokenBalance : balance;
		return returnedBalance ? truncateNumbers(returnedBalance, 4) : '-';
	}, [activeTab, lpTokenBalance, balance]);

	const disabled = useMemo(() => {
		return (
			!amount || toWei(amount).lte(0) || wei(activeTab === 0 ? lpTokenBalance : balance).lte(0)
		);
	}, [amount, lpTokenBalance, balance, activeTab]);

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
			<div>
				<StakeInputHeader>
					<div>WETH/KWENTA</div>
					<div className="max" onClick={setMaxBalance}>
						Balance: {balanceValue}
					</div>
				</StakeInputHeader>
				<StyledInput value={amount} onChange={handleAmountChange} />
			</div>
			<Button
				fullWidth
				variant="flat"
				size="sm"
				disabled={disabled}
				onClick={handleSubmit}
				style={{ marginTop: '20px' }}
			>
				{!isApproved
					? 'Approve'
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

const StyledInput = styled(NumericInput)`
	font-family: ${(props) => props.theme.fonts.monoBold};
`;

export default EarnStakeCard;
