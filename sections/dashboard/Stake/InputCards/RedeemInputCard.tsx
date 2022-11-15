import { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useContractWrite } from 'wagmi';

import Button from 'components/Button';
import { monitorTransaction } from 'contexts/RelayerContext';
import { useStakingContext } from 'contexts/StakingContext';
import { truncateNumbers } from 'utils/formatters/number';

import { StakingCard } from '../common';

type RedeemInputCardProps = {
	inputLabel: string;
	isVKwenta: boolean;
};

const RedeemInputCard: FC<RedeemInputCardProps> = ({ inputLabel, isVKwenta }) => {
	const { t } = useTranslation();
	const {
		vKwentaTokenApproval,
		vKwentaBalance,
		vKwentaApproveConfig,
		vKwentaRedeemConfig,
		veKwentaTokenApproval,
		veKwentaBalance,
		veKwentaApproveConfig,
		veKwentaRedeemConfig,
	} = useStakingContext();

	const { data: vApproveTxn, write: vKwentaApprove } = useContractWrite(vKwentaApproveConfig);
	const { data: vRedeemTxn, write: vKwentaRedeem } = useContractWrite(vKwentaRedeemConfig);
	const { data: veApproveTxn, write: veKwentaApprove } = useContractWrite(veKwentaApproveConfig);
	const { data: veRedeemTxn, write: veKwentaRedeem } = useContractWrite(veKwentaRedeemConfig);

	useEffect(() => {
		if (vApproveTxn?.hash) {
			monitorTransaction({
				txHash: vApproveTxn?.hash,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [vApproveTxn?.hash]);

	useEffect(() => {
		if (vRedeemTxn?.hash) {
			monitorTransaction({
				txHash: vRedeemTxn?.hash,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [vRedeemTxn?.hash]);

	useEffect(() => {
		if (veApproveTxn?.hash) {
			monitorTransaction({
				txHash: veApproveTxn?.hash,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [veApproveTxn?.hash]);

	useEffect(() => {
		if (veRedeemTxn?.hash) {
			monitorTransaction({
				txHash: veRedeemTxn?.hash,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [veRedeemTxn?.hash]);

	return (
		<StakingInputCardContainer>
			<StakeInputContainer>
				<StakeInputHeader>
					<div>{inputLabel}</div>
					<div>
						{t('dashboard.stake.tabs.stake-table.balance')}{' '}
						{isVKwenta ? truncateNumbers(vKwentaBalance, 4) : truncateNumbers(veKwentaBalance, 4)}
					</div>
				</StakeInputHeader>
			</StakeInputContainer>
			<Button
				fullWidth
				variant="flat"
				size="sm"
				disabled={isVKwenta ? vKwentaBalance.eq(0) : veKwentaBalance.eq(0)}
				onClick={() =>
					isVKwenta
						? vKwentaTokenApproval
							? vKwentaApprove?.()
							: vKwentaRedeem?.()
						: veKwentaTokenApproval
						? veKwentaApprove?.()
						: veKwentaRedeem?.()
				}
			>
				{isVKwenta
					? vKwentaTokenApproval
						? t('dashboard.stake.tabs.stake-table.approve')
						: t('dashboard.stake.tabs.stake-table.redeem')
					: veKwentaTokenApproval
					? t('dashboard.stake.tabs.stake-table.approve')
					: t('dashboard.stake.tabs.stake-table.redeem')}
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
		text-transform: uppercase;
		font-family: ${(props) => props.theme.fonts.bold};
		cursor: pointer;
	}
`;

const StakeInputContainer = styled.div``;

export default RedeemInputCard;
