import { FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { approveKwentaToken, redeemToken } from 'state/staking/actions';
import {
	selectIsVeKwentaTokenApproved,
	selectIsVKwentaTokenApproved,
	selectVeKwentaBalance,
	selectVKwentaBalance,
} from 'state/staking/selectors';
import { truncateNumbers } from 'utils/formatters/number';

import { StakingCard } from '../common';

type RedeemInputCardProps = {
	inputLabel: string;
	isVKwenta: boolean;
};

const RedeemInputCard: FC<RedeemInputCardProps> = ({ inputLabel, isVKwenta }) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const vKwentaBalance = useAppSelector(selectVKwentaBalance);
	const veKwentaBalance = useAppSelector(selectVeKwentaBalance);
	const isVKwentaApproved = useAppSelector(selectIsVKwentaTokenApproved);
	const isVeKwentaApproved = useAppSelector(selectIsVeKwentaTokenApproved);

	const isApproved = useMemo(() => (isVKwenta ? isVKwentaApproved : isVeKwentaApproved), [
		isVKwenta,
		isVKwentaApproved,
		isVeKwentaApproved,
	]);

	const balance = useMemo(() => (isVKwenta ? vKwentaBalance : veKwentaBalance), [
		isVKwenta,
		vKwentaBalance,
		veKwentaBalance,
	]);

	const buttonTranslationKey = useMemo(() => {
		return isApproved
			? 'dashboard.stake.tabs.stake-table.redeem'
			: 'dashboard.stake.tabs.stake-table.approve';
	}, [isApproved]);

	const submitRedeem = useCallback(async () => {
		const token = isVKwenta ? 'vKwenta' : 'veKwenta';

		if (!isApproved) {
			dispatch(approveKwentaToken(token));
		} else {
			dispatch(redeemToken(token));
		}
	}, [dispatch, isApproved, isVKwenta]);

	return (
		<StakingInputCardContainer>
			<StakeInputContainer>
				<StakeInputHeader>
					<div>{inputLabel}</div>
					<div>
						{t('dashboard.stake.tabs.stake-table.balance')} {truncateNumbers(balance, 4)}
					</div>
				</StakeInputHeader>
			</StakeInputContainer>
			<Button fullWidth variant="flat" size="sm" disabled={balance.eq(0)} onClick={submitRedeem}>
				{t(buttonTranslationKey)}
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
