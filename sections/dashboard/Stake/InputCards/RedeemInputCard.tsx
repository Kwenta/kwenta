import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { useContractWrite } from 'wagmi';

import Button from 'components/Button';
import { useStakingContext } from 'contexts/StakingContext';
import { currentThemeState } from 'store/ui';
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

	const currentTheme = useRecoilValue(currentThemeState);
	const isDarkTheme = useMemo(() => currentTheme === 'dark', [currentTheme]);

	const { write: vKwentaApprove } = useContractWrite(vKwentaApproveConfig);
	const { write: vKwentaRedeem } = useContractWrite(vKwentaRedeemConfig);
	const { write: veKwentaApprove } = useContractWrite(veKwentaApproveConfig);
	const { write: veKwentaRedeem } = useContractWrite(veKwentaRedeemConfig);

	return (
		<StakingInputCardContainer $darkTheme={isDarkTheme}>
			<StakeInputContainer>
				<StakeInputHeader>
					<div>{inputLabel}</div>
					<div>
						{t('dashboard.stake.tabs.stake-table.balance')}{' '}
						{isVKwenta ? truncateNumbers(vKwentaBalance, 2) : truncateNumbers(veKwentaBalance, 2)}
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

export default RedeemInputCard;
