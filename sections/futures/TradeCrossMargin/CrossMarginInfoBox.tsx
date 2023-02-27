import React from 'react';
import styled from 'styled-components';

import WithdrawArrow from 'assets/svg/futures/withdraw-arrow.svg';
import InfoBox from 'components/InfoBox';
import { setOpenModal } from 'state/app/reducer';
import { selectOpenModal } from 'state/app/selectors';
import {
	selectCrossMarginBalanceInfo,
	selectIdleMargin,
	selectMarketInfo,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { PillButtonSpan } from 'styles/common';
import { formatCurrency, formatDollars } from 'utils/formatters/number';

import EditLeverageModal from './EditCrossMarginLeverageModal';
import ManageKeeperBalanceModal from './ManageKeeperBalanceModal';

type Props = {
	editingLeverage?: boolean;
};

function MarginInfoBox({ editingLeverage }: Props) {
	const dispatch = useAppDispatch();

	const marketInfo = useAppSelector(selectMarketInfo);
	const { keeperEthBal } = useAppSelector(selectCrossMarginBalanceInfo);
	const openModal = useAppSelector(selectOpenModal);
	const idleMargin = useAppSelector(selectIdleMargin);

	return (
		<>
			<StyledInfoBox
				dataTestId="market-info-box"
				details={{
					'Available Margin': {
						value: formatDollars(idleMargin),
					},
					'Account ETH Balance': !editingLeverage
						? {
								value: formatCurrency('ETH', keeperEthBal, { currencyKey: 'ETH' }),
								valueNode: (
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
								),
						  }
						: null,
				}}
				disabled={marketInfo?.isSuspended}
			/>

			{openModal === 'futures_edit_input_leverage' && <EditLeverageModal editMode="new_position" />}
			{openModal === 'futures_withdraw_keeper_balance' && (
				<ManageKeeperBalanceModal defaultType="withdraw" />
			)}
		</>
	);
}

const StyledInfoBox = styled(InfoBox)`
	margin-bottom: 16px;

	.value {
		font-family: ${(props) => props.theme.fonts.regular};
	}
`;

export default React.memo(MarginInfoBox);
