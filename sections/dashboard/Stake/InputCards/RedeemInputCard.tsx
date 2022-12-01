import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useContractWrite } from 'wagmi';

import Button from 'components/Button';
import { monitorTransaction } from 'contexts/RelayerContext';
import { useStakingContext } from 'contexts/StakingContext';
import { FlexDivRowCentered, numericValueCSS } from 'styles/common';
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

	const { writeAsync: vKwentaApprove } = useContractWrite(vKwentaApproveConfig);
	const { writeAsync: vKwentaRedeem } = useContractWrite(vKwentaRedeemConfig);
	const { writeAsync: veKwentaApprove } = useContractWrite(veKwentaApproveConfig);
	const { writeAsync: veKwentaRedeem } = useContractWrite(veKwentaRedeemConfig);

	const submitRedeem = useCallback(async () => {
		if (isVKwenta) {
			if (vKwentaTokenApproval) {
				const vApproveTxn = await vKwentaApprove?.();
				monitorTransaction({
					txHash: vApproveTxn?.hash ?? '',
				});
			} else {
				const vRedeemTxn = await vKwentaRedeem?.();
				monitorTransaction({
					txHash: vRedeemTxn?.hash ?? '',
				});
			}
		} else {
			if (veKwentaTokenApproval) {
				const veApproveTxn = await veKwentaApprove?.();
				monitorTransaction({
					txHash: veApproveTxn?.hash ?? '',
				});
			} else {
				const veRedeemTxn = await veKwentaRedeem?.();
				monitorTransaction({
					txHash: veRedeemTxn?.hash ?? '',
				});
			}
		}
	}, [
		isVKwenta,
		vKwentaApprove,
		vKwentaRedeem,
		vKwentaTokenApproval,
		veKwentaApprove,
		veKwentaRedeem,
		veKwentaTokenApproval,
	]);

	return (
		<StakingInputCardContainer>
			<StakeInputContainer>
				<StakeInputHeader>
					<div>{inputLabel}</div>
					<StyledFlexDivRowCentered>
						<div>{t('dashboard.stake.tabs.stake-table.balance')}</div>
						<div className="max">
							{isVKwenta ? truncateNumbers(vKwentaBalance, 4) : truncateNumbers(veKwentaBalance, 4)}
						</div>
					</StyledFlexDivRowCentered>
				</StakeInputHeader>
			</StakeInputContainer>
			<Button
				fullWidth
				variant="flat"
				size="sm"
				disabled={isVKwenta ? vKwentaBalance.eq(0) : veKwentaBalance.eq(0)}
				onClick={submitRedeem}
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
		color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
		${numericValueCSS};
	}
`;

const StakeInputContainer = styled.div``;

export default RedeemInputCard;
