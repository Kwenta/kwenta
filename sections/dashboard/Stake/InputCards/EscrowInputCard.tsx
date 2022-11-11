import { wei } from '@synthetixio/wei';
import _ from 'lodash';
import { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { useContractWrite, usePrepareContractWrite } from 'wagmi';

import Button from 'components/Button';
import CustomNumericInput from 'components/Input/CustomNumericInput';
import SegmentedControl from 'components/SegmentedControl';
import { useStakingContext } from 'contexts/StakingContext';
import { currentThemeState } from 'store/ui';
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
	} = useStakingContext();

	const [amount, setAmount] = useState('0');
	const [activeTab, setActiveTab] = useState(0);
	const currentTheme = useRecoilValue(currentThemeState);

	const amountBN = useMemo(() => (_.isNil(amount) ? '0' : wei(amount ?? '0').toString(0, true)), [
		amount,
	]);

	const isDarkTheme = useMemo(() => currentTheme === 'dark', [currentTheme]);
	const unstakedEscrowedKwentaBalance = useMemo(
		() =>
			!_.isNil(escrowedBalance) && escrowedBalance.gt(0)
				? escrowedBalance.sub(stakedEscrowedBalance ?? zeroBN) ?? zeroBN
				: zeroBN,
		[escrowedBalance, stakedEscrowedBalance]
	);

	const handleTabChange = (tabIndex: number) => {
		setActiveTab(tabIndex);
	};

	const { config: stakedEscrowKwentaConfig } = usePrepareContractWrite({
		...rewardEscrowContract,
		functionName: 'stakeEscrow',
		args: [amountBN],
		enabled: unstakedEscrowedKwentaBalance.gt(0) && wei(amount).gt(0),
	});

	const { config: unstakedEscrowKwentaConfig } = usePrepareContractWrite({
		...rewardEscrowContract,
		functionName: 'unstakeEscrow',
		args: [amountBN],
		enabled: stakedEscrowedBalance.gt(0) && wei(amount).gt(0),
	});

	const { write: kwentaApprove } = useContractWrite(kwentaApproveConfig);
	const { write: stakeEscrowKwenta } = useContractWrite(stakedEscrowKwentaConfig);
	const { write: unstakeEscrowKwenta } = useContractWrite(unstakedEscrowKwentaConfig);

	const maxBalance = useMemo(
		() =>
			activeTab === 0
				? wei(unstakedEscrowedKwentaBalance ?? zeroBN)
				: wei(stakedEscrowedBalance ?? zeroBN),
		[activeTab, stakedEscrowedBalance, unstakedEscrowedKwentaBalance]
	);

	const onMaxClick = useCallback(async () => {
		setAmount(truncateNumbers(maxBalance, 2));
	}, [maxBalance]);

	return (
		<StakingInputCardContainer $darkTheme={isDarkTheme}>
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
							? truncateNumbers(unstakedEscrowedKwentaBalance, 2)
							: truncateNumbers(stakedEscrowedBalance, 2)}
					</div>
				</StakeInputHeader>
				<StyledInput
					value={amount}
					suffix=""
					onChange={(_, newValue) => {
						setAmount(newValue);
					}}
				/>
			</StakeInputContainer>
			<Button
				fullWidth
				variant="flat"
				size="sm"
				disabled={wei(amount).eq(0)}
				onClick={() =>
					kwentaTokenApproval
						? kwentaApprove?.()
						: activeTab === 0
						? stakeEscrowKwenta?.()
						: unstakeEscrowKwenta?.()
				}
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

const StakingInputCardContainer = styled(StakingCard)<{ $darkTheme: boolean }>`
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

const StyledInput = styled(CustomNumericInput)`
	font-family: ${(props) => props.theme.fonts.monoBold};
`;

export default EscrowInputCard;
