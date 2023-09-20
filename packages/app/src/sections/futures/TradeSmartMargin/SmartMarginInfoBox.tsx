import { formatCurrency, formatDollars } from '@kwenta/sdk/utils'
import React, { memo } from 'react'

import PencilButton from 'components/Button/PencilButton'
import { InfoBoxRow } from 'components/InfoBox'
import { SWAP_DEPOSIT_TRADE_ENABLED } from 'constants/ui'
import { setOpenModal } from 'state/app/reducer'
import { selectShowModal } from 'state/app/selectors'
import { selectSusdBalance } from 'state/balances/selectors'
import { selectSwapDepositBalanceQuote } from 'state/futures/smartMargin/selectors'
import {
	selectAvailableMarginInMarkets,
	selectSmartMarginBalanceInfo,
} from 'state/futures/smartMargin/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'

import ManageKeeperBalanceModal from './ManageKeeperBalanceModal'
import SwapDepositTokenSelector from './SwapDepositTokenSelector'

function SmartMarginInfoBox() {
	const dispatch = useAppDispatch()

	const { keeperEthBal } = useAppSelector(selectSmartMarginBalanceInfo)
	const openModal = useAppSelector(selectShowModal)
	const { freeMargin } = useAppSelector(selectSmartMarginBalanceInfo)
	const idleMarginInMarkets = useAppSelector(selectAvailableMarginInMarkets)
	const walletBal = useAppSelector(selectSusdBalance)
	const quotedBal = useAppSelector(selectSwapDepositBalanceQuote)

	return (
		<>
			<InfoBoxRow
				title="Wallet balance"
				keyNode={SWAP_DEPOSIT_TRADE_ENABLED ? <SwapDepositTokenSelector /> : null}
				textValue={formatDollars(
					SWAP_DEPOSIT_TRADE_ENABLED && quotedBal?.susdQuote ? quotedBal.susdQuote : walletBal
				)}
			/>
			<InfoBoxRow
				title="Idle Margin"
				textValue={formatDollars(idleMarginInMarkets.add(freeMargin))}
			/>

			<InfoBoxRow
				title="Account ETH Balance"
				textValue={formatCurrency('ETH', keeperEthBal, { currencyKey: 'ETH' })}
				textValueIcon={
					<>
						{keeperEthBal.gt(0) && (
							<PencilButton
								width={10}
								height={10}
								onClick={() => dispatch(setOpenModal('futures_withdraw_keeper_balance'))}
								style={{ cursor: 'pointer', marginLeft: '10px' }}
							/>
						)}
					</>
				}
			/>

			{openModal === 'futures_withdraw_keeper_balance' && (
				<ManageKeeperBalanceModal defaultType="withdraw" />
			)}
		</>
	)
}

export default memo(SmartMarginInfoBox)
