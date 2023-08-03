import { formatDollars } from '@kwenta/sdk/utils'
import React, { memo } from 'react'

import { InfoBoxRow } from 'components/InfoBox'
import { setOpenModal } from 'state/app/reducer'
import { selectShowModal } from 'state/app/selectors'
import { selectSNXUSDBalance } from 'state/balances/selectors'
import { selectSwapDepositBalance } from 'state/futures/selectors'
import {
	selectAvailableMarginInMarkets,
	selectSmartMarginBalanceInfo,
} from 'state/futures/smartMargin/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'

import ManageKeeperBalanceModal from './ManageKeeperBalanceModal'
import SwapDepositTokenSelector from './SwapDepositTokenSelector'

function SmartMarginInfoBox() {
	const dispatch = useAppDispatch()

	const openModal = useAppSelector(selectShowModal)
	const { freeMargin } = useAppSelector(selectSmartMarginBalanceInfo)
	const idleMarginInMarkets = useAppSelector(selectAvailableMarginInMarkets)
	const swapDepositBalance = useAppSelector(selectSwapDepositBalance)

	return (
		<>
			<InfoBoxRow
				title="Wallet balance"
				keyNode={<SwapDepositTokenSelector />}
				textValue={formatDollars(swapDepositBalance)}
			/>
			<InfoBoxRow
				title="Idle Margin"
				textValue={formatDollars(idleMarginInMarkets.add(freeMargin))}
			/>

			{openModal === 'futures_withdraw_keeper_balance' && (
				<ManageKeeperBalanceModal defaultType="withdraw" />
			)}
		</>
	)
}

export default memo(SmartMarginInfoBox)
