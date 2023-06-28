import { formatCurrency, formatDollars } from '@kwenta/sdk/utils'
import React, { memo } from 'react'

import { InfoBoxRow } from 'components/InfoBox'
import { setOpenModal } from 'state/app/reducer'
import { selectShowModal } from 'state/app/selectors'
import { selectSusdBalance } from 'state/balances/selectors'
import {
	selectCrossMarginBalanceInfo,
	selectAvailableMarginInMarkets,
} from 'state/futures/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'

import PencilButton from '../../../components/Button/PencilButton'

import ManageKeeperBalanceModal from './ManageKeeperBalanceModal'

function MarginInfoBox() {
	const dispatch = useAppDispatch()

	const { keeperEthBal } = useAppSelector(selectCrossMarginBalanceInfo)
	const openModal = useAppSelector(selectShowModal)
	const { freeMargin } = useAppSelector(selectCrossMarginBalanceInfo)
	const idleMarginInMarkets = useAppSelector(selectAvailableMarginInMarkets)
	const walletBal = useAppSelector(selectSusdBalance)

	return (
		<>
			<InfoBoxRow
				title="Account ETH Balance"
				textValue={formatCurrency('ETH', keeperEthBal, { currencyKey: 'ETH' })}
				textValueSpan={
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
			<InfoBoxRow title="Wallet balance" textValue={formatDollars(walletBal)} />
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

export default memo(MarginInfoBox)
