import React, { memo } from 'react';
import styled from 'styled-components';

import WithdrawArrow from 'assets/svg/futures/withdraw-arrow.svg';
import { InfoBoxContainer, InfoBoxRow } from 'components/InfoBox/InfoBox';
import { setOpenModal } from 'state/app/reducer';
import { selectOpenModal } from 'state/app/selectors';
import { selectCrossMarginBalanceInfo, selectIdleMargin } from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { PillButtonSpan } from 'styles/common';
import { formatCurrency, formatDollars } from 'utils/formatters/number';

import EditLeverageModal from './EditCrossMarginLeverageModal';
import ManageKeeperBalanceModal from './ManageKeeperBalanceModal';

function MarginInfoBox() {
	const dispatch = useAppDispatch();

	const { keeperEthBal } = useAppSelector(selectCrossMarginBalanceInfo);
	const openModal = useAppSelector(selectOpenModal);
	const idleMargin = useAppSelector(selectIdleMargin);

	return (
		<>
			<StyledInfoBox>
				<InfoBoxRow title="Available Margin" value={formatDollars(idleMargin)} />
				<InfoBoxRow
					title="Account ETH Balance"
					value={formatCurrency('ETH', keeperEthBal, { currencyKey: 'ETH' })}
					valueNode={
						<>
							{keeperEthBal.gt(0) && (
								<PillButtonSpan
									padding={'4px 3px 1px 3px'}
									onClick={() => dispatch(setOpenModal('futures_withdraw_keeper_balance'))}
								>
									<WithdrawArrow width="12px" height="9px" />
								</PillButtonSpan>
							)}
						</>
					}
				/>
				{openModal === 'futures_edit_input_leverage' && (
					<EditLeverageModal editMode="new_position" />
				)}
				{openModal === 'futures_withdraw_keeper_balance' && (
					<ManageKeeperBalanceModal defaultType="withdraw" />
				)}
			</StyledInfoBox>
		</>
	);
}

const StyledInfoBox = styled(InfoBoxContainer)`
	margin-bottom: 16px;
`;

export default memo(MarginInfoBox);
