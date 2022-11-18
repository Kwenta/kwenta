import { wei } from '@synthetixio/wei';
import { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { stakeTokens, unstakeTokens } from 'state/earn/actions';
import { setAmount } from 'state/earn/reducer';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import styled from 'styled-components';

import Button from 'components/Button';
import NumericInput from 'components/Input/NumericInput';
import SegmentedControl from 'components/SegmentedControl';
import { StakingCard } from 'sections/dashboard/Stake/common';
import { toWei, truncateNumbers } from 'utils/formatters/number';

const EarnStakeCard: FC = () => {
	const { t } = useTranslation();

	const amount = useAppSelector(({ earn }) => earn.amount);
	const [activeTab, setActiveTab] = useState(0);
	const dispatch = useAppDispatch();
	const { balance } = useAppSelector(({ wallet, earn }) => ({
		walletAddress: wallet.walletAddress,
		balance: earn.balance,
	}));

	const setMaxBalance = useCallback(() => {
		dispatch(setAmount(balance));
	}, [dispatch, balance]);

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
		if (activeTab === 0) {
			dispatch(stakeTokens());
		} else {
			dispatch(unstakeTokens());
		}
	}, [dispatch, activeTab]);

	const balanceValue = useMemo(() => (balance ? truncateNumbers(balance, 4) : '-'), [balance]);

	const disabled = useMemo(() => {
		return !amount || toWei(amount).lte(0) || wei(balance).lte(0);
	}, [amount, balance]);

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
				{activeTab === 0
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