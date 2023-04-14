import React, { memo } from 'react';

import WithdrawArrow from 'assets/svg/futures/withdraw-arrow.svg';
import { InfoBoxRow } from 'components/InfoBox/InfoBox';
import { getDisplayAsset } from 'sdk/utils/futures';
import { setOpenModal } from 'state/app/reducer';
import { selectShowModal } from 'state/app/selectors';
import { selectSusdBalance } from 'state/balances/selectors';
import {
	selectCrossMarginBalanceInfo,
	selectIdleMarginInMarkets,
	selectMarketInfo,
	selectPosition,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { PillButtonSpan } from 'styles/common';
import { formatCurrency, formatDollars } from 'utils/formatters/number';

import ManageKeeperBalanceModal from './ManageKeeperBalanceModal';

function MarginInfoBox() {
	const dispatch = useAppDispatch();

	const { keeperEthBal } = useAppSelector(selectCrossMarginBalanceInfo);
	const openModal = useAppSelector(selectShowModal);
	const position = useAppSelector(selectPosition);
	const { freeMargin } = useAppSelector(selectCrossMarginBalanceInfo);
	const idleMarginInMarkets = useAppSelector(selectIdleMarginInMarkets);
	const marketInfo = useAppSelector(selectMarketInfo);
	const walletBal = useAppSelector(selectSusdBalance);

	return (
		<>
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
			<InfoBoxRow title="Account margin" value={formatDollars(freeMargin)} />
			<InfoBoxRow title="Wallet balance" value={formatDollars(walletBal)} />
			<InfoBoxRow title="Idle in markets" value={formatDollars(idleMarginInMarkets)} />
			{marketInfo?.asset && (
				<InfoBoxRow
					title={`${getDisplayAsset(marketInfo.asset)} Market margin`}
					value={formatDollars(position?.remainingMargin || '0')}
				/>
			)}

			{openModal === 'futures_withdraw_keeper_balance' && (
				<ManageKeeperBalanceModal defaultType="withdraw" />
			)}
		</>
	);
}

export default memo(MarginInfoBox);
