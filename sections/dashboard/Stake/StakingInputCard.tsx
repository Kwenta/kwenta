import { wei } from '@synthetixio/wei';
import { ethers } from 'ethers';
import { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { erc20ABI, useContractReads, useContractWrite, usePrepareContractWrite } from 'wagmi';

import Button from 'components/Button';
import CustomNumericInput from 'components/Input/CustomNumericInput';
import SegmentedControl from 'components/SegmentedControl';
import Connector from 'containers/Connector';
import rewardEscrowABI from 'lib/abis/RewardEscrow.json';
import stakingRewardsABI from 'lib/abis/StakingRewards.json';
import vKwentaRedeemerABI from 'lib/abis/vKwentaRedeemer.json';
import { currentThemeState } from 'store/ui';
import { zeroBN } from 'utils/formatters/number';
import logError from 'utils/logError';

import { StakingCard } from './common';

type StakingInputCardProps = {
	inputLabel: string;
	tableType: 'stake' | 'escrow' | 'redeem';
};

const vKwentaTokenContract = {
	addressOrName: '0xb897D76bC9F7efB66Fb94970371ef17998c296b6',
	contractInterface: erc20ABI,
};

const kwentaTokenContract = {
	addressOrName: '0xDA0C33402Fc1e10d18c532F0Ed9c1A6c5C9e386C',
	contractInterface: erc20ABI,
};

const stakingRewardsContract = {
	addressOrName: '0x1653a3a3c4ccee0538685f1600a30df5e3ee830a',
	contractInterface: stakingRewardsABI,
};

const rewardEscrowContract = {
	addressOrName: '0xaFD87d1a62260bD5714C55a1BB4057bDc8dFA413',
	contractInterface: rewardEscrowABI,
};

const vKwentaRedeemerContract = {
	addressOrName: '0x03c3E61D624F279243e1c8b43eD0fCF6790D10E9',
	contractInterface: vKwentaRedeemerABI,
};

const StakingInputCard: FC<StakingInputCardProps> = ({ inputLabel, tableType }) => {
	const { t } = useTranslation();
	const { walletAddress } = Connector.useContainer();
	const [vKwentaBalance, setVKwentaBalance] = useState(zeroBN);
	const [kwentaBalance, setKwentaBalance] = useState(zeroBN);
	const [stakedNonEscrowedBalance, setStakedNonEscrowedBalance] = useState(zeroBN);
	const [escrowedBalance, setEscrowedBalance] = useState(zeroBN);
	const [stakedEscrowedBalance, setStakedEscrowedBalance] = useState(zeroBN);
	const [amount, setAmount] = useState('0');
	const [vKwentaAllowance, setVKwentaAllowance] = useState(zeroBN);
	const [kwentaAllowance, setKwentaAllowance] = useState(zeroBN);
	const amountBN = Math.trunc(Number(wei(amount ?? 0).mul(1e18))).toString();

	useContractReads({
		contracts: [
			{
				...kwentaTokenContract,
				functionName: 'balanceOf',
				args: [walletAddress ?? undefined],
			},
			{
				...stakingRewardsContract,
				functionName: 'nonEscrowedBalanceOf',
				args: [walletAddress ?? undefined],
			},
			{
				...rewardEscrowContract,
				functionName: 'balanceOf',
				args: [walletAddress ?? undefined],
			},
			{
				...stakingRewardsContract,
				functionName: 'escrowedBalanceOf',
				args: [walletAddress ?? undefined],
			},
			{
				...vKwentaTokenContract,
				functionName: 'balanceOf',
				args: [walletAddress ?? undefined],
			},
			{
				...vKwentaTokenContract,
				functionName: 'allowance',
				args: [walletAddress ?? undefined, vKwentaRedeemerContract.addressOrName],
			},
			{
				...kwentaTokenContract,
				functionName: 'allowance',
				args: [walletAddress ?? undefined, stakingRewardsContract.addressOrName],
			},
		],
		cacheOnBlock: true,
		enabled: !!walletAddress,
		onSettled(data, error) {
			if (error) logError(error);
			if (data) {
				setKwentaBalance(wei(data[0] ?? zeroBN));
				setStakedNonEscrowedBalance(wei(data[1] ?? zeroBN));
				setEscrowedBalance(wei(data[2] ?? zeroBN));
				setStakedEscrowedBalance(wei(data[3] ?? zeroBN));
				setVKwentaBalance(wei(data[4] ?? zeroBN));
				setVKwentaAllowance(wei(data[5] ?? zeroBN));
				setKwentaAllowance(wei(data[6] ?? zeroBN));
			}
		},
	});

	const needApproval = useMemo(
		() =>
			tableType === 'redeem'
				? vKwentaBalance.gt(vKwentaAllowance)
				: kwentaBalance.gt(kwentaAllowance),
		[tableType, vKwentaBalance, vKwentaAllowance, kwentaBalance, kwentaAllowance]
	);
	const currentTheme = useRecoilValue(currentThemeState);
	const isDarkTheme = useMemo(() => currentTheme === 'dark', [currentTheme]);

	const [activeTab, setActiveTab] = useState(0);

	const handleTabChange = (tabIndex: number) => {
		setActiveTab(tabIndex);
	};

	const { config: vKwentaApproving } = usePrepareContractWrite({
		...vKwentaTokenContract,
		functionName: 'approve',
		args: [vKwentaRedeemerContract.addressOrName, ethers.constants.MaxUint256],
		enabled: !!walletAddress && tableType === 'redeem' && needApproval,
		cacheTime: 5000,
	});

	const { config: kwentaApproving } = usePrepareContractWrite({
		...kwentaTokenContract,
		functionName: 'approve',
		args: [stakingRewardsContract.addressOrName, ethers.constants.MaxUint256],
		enabled: !!walletAddress && tableType !== 'redeem' && needApproval,
		cacheTime: 5000,
	});

	const { config: stakedKwenta } = usePrepareContractWrite({
		...stakingRewardsContract,
		functionName: 'stake',
		args: [amountBN],
		enabled: !!walletAddress && tableType === 'stake' && wei(amount).gt(0),
		cacheTime: 5000,
	});

	const { config: unstakedKwenta } = usePrepareContractWrite({
		...stakingRewardsContract,
		functionName: 'unstake',
		args: [amountBN],
		enabled: !!walletAddress && tableType === 'stake' && wei(amount).gt(0),
		cacheTime: 5000,
	});

	const { config: stakedEscrowKwenta } = usePrepareContractWrite({
		...rewardEscrowContract,
		functionName: 'stakeEscrow',
		args: [amountBN],
		enabled: !!walletAddress && tableType === 'escrow' && wei(amount).gt(0),
		cacheTime: 5000,
	});

	const { config: unstakedEscrowKwenta } = usePrepareContractWrite({
		...rewardEscrowContract,
		functionName: 'unstakeEscrow',
		args: [amountBN],
		enabled: !!walletAddress && tableType === 'escrow' && wei(amount).gt(0),
		cacheTime: 5000,
	});

	const { config: redeemption } = usePrepareContractWrite({
		...vKwentaRedeemerContract,
		functionName: 'redeem',
		enabled: !!walletAddress && tableType === 'redeem' && wei(vKwentaBalance).gt(0),
		cacheTime: 5000,
	});

	const { write: vKwentaApprove } = useContractWrite(vKwentaApproving);
	const { write: kwentaApprove } = useContractWrite(kwentaApproving);
	const { write: stakingKwenta } = useContractWrite(stakedKwenta);
	const { write: unstakingKwenta } = useContractWrite(unstakedKwenta);
	const { write: stakingEscrowKwenta } = useContractWrite(stakedEscrowKwenta);
	const { write: unstakingEscrowKwenta } = useContractWrite(unstakedEscrowKwenta);
	const { write: redeem } = useContractWrite(redeemption);

	const maxBalance =
		tableType === 'stake'
			? activeTab === 0
				? wei(kwentaBalance ?? zeroBN)
				: wei(stakedNonEscrowedBalance ?? zeroBN)
			: activeTab === 0
			? wei(escrowedBalance ?? zeroBN)
			: wei(stakedEscrowedBalance ?? zeroBN);

	const onMaxClick = useCallback(async () => {
		setAmount(Number(maxBalance).toFixed(4));
	}, [maxBalance]);

	return (
		<StakingInputCardContainer $darkTheme={isDarkTheme}>
			{(tableType === 'stake' || tableType === 'escrow') && (
				<SegmentedControl
					values={[
						t('dashboard.stake.tabs.stake-table.stake'),
						t('dashboard.stake.tabs.stake-table.unstake'),
					]}
					onChange={handleTabChange}
					selectedIndex={activeTab}
					style={{ marginBottom: '20px' }}
				/>
			)}
			<StakeInputContainer>
				<StakeInputHeader>
					<div>{inputLabel}</div>
					{tableType !== 'redeem' && (
						<div className="max" onClick={onMaxClick}>
							{t('dashboard.stake.tabs.stake-table.max')}
						</div>
					)}
					{tableType === 'redeem' && (
						<div>
							{t('dashboard.stake.tabs.redemption.current-balance')}{' '}
							{Number(vKwentaBalance).toFixed(2)}
						</div>
					)}
				</StakeInputHeader>
				{tableType !== 'redeem' && (
					<StyledInput
						value={amount}
						suffix=""
						onChange={(_, newValue) => {
							setAmount(newValue);
						}}
					/>
				)}
			</StakeInputContainer>
			{tableType === 'stake' ? (
				<Button
					fullWidth
					variant="flat"
					size="sm"
					onClick={() =>
						needApproval
							? kwentaApprove?.()
							: activeTab === 0
							? stakingKwenta?.()
							: unstakingKwenta?.()
					}
					style={{ marginTop: '20px' }}
				>
					{activeTab === 0
						? t('dashboard.stake.tabs.stake-table.stake')
						: t('dashboard.stake.tabs.stake-table.unstake')}
				</Button>
			) : tableType === 'escrow' ? (
				<Button
					fullWidth
					variant="flat"
					size="sm"
					disabled={activeTab === 0 ? !stakingEscrowKwenta : !unstakingEscrowKwenta}
					onClick={() => (activeTab === 0 ? stakingEscrowKwenta?.() : unstakingEscrowKwenta?.())}
					style={{ marginTop: '20px' }}
				>
					{activeTab === 0
						? t('dashboard.stake.tabs.stake-table.stake')
						: t('dashboard.stake.tabs.stake-table.unstake')}
				</Button>
			) : (
				<Button
					fullWidth
					variant="flat"
					size="sm"
					onClick={() => (needApproval ? vKwentaApprove?.() : redeem?.())}
				>
					{needApproval
						? t('dashboard.stake.tabs.stake-table.approve')
						: t('dashboard.stake.tabs.stake-table.redeem')}
				</Button>
			)}
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
		text-transform: uppercase;
		font-family: ${(props) => props.theme.fonts.bold};
		cursor: pointer;
	}
`;

const StakeInputContainer = styled.div``;

const StyledInput = styled(CustomNumericInput)`
	font-family: ${(props) => props.theme.fonts.monoBold};
`;

export default StakingInputCard;
