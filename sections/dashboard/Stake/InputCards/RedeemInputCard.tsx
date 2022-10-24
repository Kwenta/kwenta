import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { useContractWrite } from 'wagmi';

import Button from 'components/Button';
import { useStakingContext } from 'contexts/StakingContext';
import { currentThemeState } from 'store/ui';

import { StakingCard } from '../common';

type RedeemInputCardProps = {
	inputLabel: string;
};

const RedeemInputCard: FC<RedeemInputCardProps> = ({ inputLabel }) => {
	const { t } = useTranslation();
	const {
		vkwentaTokenApproval,
		vKwentaBalance,
		vKwentaApproveConfig,
		redeemConfig,
	} = useStakingContext();

	const currentTheme = useRecoilValue(currentThemeState);
	const isDarkTheme = useMemo(() => currentTheme === 'dark', [currentTheme]);

	const { write: vKwentaApprove } = useContractWrite(vKwentaApproveConfig);
	const { write: redeem } = useContractWrite(redeemConfig);

	return (
		<StakingInputCardContainer $darkTheme={isDarkTheme}>
			<StakeInputContainer>
				<StakeInputHeader>
					<div>{inputLabel}</div>
					<div>
						{t('dashboard.stake.tabs.stake-table.current-balance')}{' '}
						{Number(vKwentaBalance).toFixed(2)}
					</div>
				</StakeInputHeader>
			</StakeInputContainer>
			<Button
				fullWidth
				variant="flat"
				size="sm"
				onClick={() => (vkwentaTokenApproval ? vKwentaApprove?.() : redeem?.())}
			>
				{vkwentaTokenApproval
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
