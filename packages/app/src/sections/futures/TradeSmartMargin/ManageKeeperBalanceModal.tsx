import { ZERO_WEI } from '@kwenta/sdk/constants'
import { formatCurrency } from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from 'components/Button'
import { notifyError } from 'components/ErrorNotifier'
import ErrorView from 'components/ErrorView'
import NumericInput from 'components/Input/NumericInput'
import Loader from 'components/Loader'
import SegmentedControl from 'components/SegmentedControl'
import Spacer from 'components/Spacer'
import Connector from 'containers/Connector'
import { setOpenModal } from 'state/app/reducer'
import { selectSubmittingFuturesTx } from 'state/futures/selectors'
import { withdrawAccountKeeperBalance } from 'state/futures/smartMargin/actions'
import {
	selectConditionalOrdersForMarket,
	selectSmartMarginBalanceInfo,
} from 'state/futures/smartMargin/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import logError from 'utils/logError'

import {
	StyledBaseModal,
	BalanceContainer,
	BalanceText,
	MaxButton,
} from '../Trade/TransferIsolatedMarginModal'

type TransferType = 'deposit' | 'withdraw'

type Props = {
	defaultType: TransferType
}

const DEPOSIT_ENABLED = false

export default function ManageKeeperBalanceModal({ defaultType }: Props) {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const { provider, walletAddress } = Connector.useContainer()

	const { keeperEthBal } = useAppSelector(selectSmartMarginBalanceInfo)
	const openOrders = useAppSelector(selectConditionalOrdersForMarket)
	const isSubmitting = useAppSelector(selectSubmittingFuturesTx)

	const [amount, setAmount] = useState('')
	const [isMax, setMax] = useState(false)
	const [userEthBal, setUserEthBal] = useState(ZERO_WEI)
	const [transferType, setTransferType] = useState(defaultType === 'deposit' ? 0 : 1)

	const getUserEthBal = useCallback(async () => {
		if (!walletAddress) return
		try {
			const bal = await provider.getBalance(walletAddress)
			setUserEthBal(wei(bal))
		} catch (err) {
			notifyError('Failed to read ETH balance', err)
			logError(err)
		}
	}, [walletAddress, provider])

	useEffect(() => {
		getUserEthBal()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [walletAddress])

	const onWithdrawKeeperDeposit = useCallback(() => {
		if (keeperEthBal.eq(0)) return
		dispatch(withdrawAccountKeeperBalance(wei(amount)))
	}, [dispatch, amount, keeperEthBal])

	const onDepositKeeperDeposit = useCallback(async () => {
		// 	// TODO: Waiting for the function to be added to the smart contract
	}, [])

	const exceedsLimit = useMemo(() => {
		const amtWei = wei(amount || 0)
		return transferType === 0 && amtWei.gt(transferType === 0 ? userEthBal : keeperEthBal)
	}, [transferType, amount, userEthBal, keeperEthBal])

	const isDisabled = useMemo(() => {
		if (!amount || isSubmitting || exceedsLimit) return true
		return false
	}, [amount, isSubmitting, exceedsLimit])

	const handleSetMax = React.useCallback(() => {
		setMax(true)
		setAmount(keeperEthBal.toString())
	}, [keeperEthBal])

	const onChangeTab = (selection: number) => {
		setTransferType(selection)
		setAmount('')
	}

	return (
		<StyledBaseModal
			title={t('futures.market.trade.orders.manage-keeper-deposit.title')}
			isOpen
			onDismiss={() => dispatch(setOpenModal(null))}
		>
			<Spacer height={16} />
			{DEPOSIT_ENABLED && (
				<StyledSegmentedControl
					values={['Deposit', 'Withdraw']}
					selectedIndex={transferType}
					onChange={onChangeTab}
				/>
			)}

			<BalanceContainer>
				<BalanceText $gold>{t('futures.market.trade.margin.modal.balance')}:</BalanceText>
				<BalanceText>
					<span>{formatCurrency('ETH', transferType === 0 ? userEthBal : keeperEthBal)}</span> ETH
				</BalanceText>
			</BalanceContainer>

			<NumericInput
				dataTestId="futures-market-trade-withdraw-margin-input"
				placeholder={'0.0'}
				value={amount}
				invalid={exceedsLimit}
				onChange={(_, v) => {
					if (isMax) setMax(false)
					setAmount(v)
				}}
				right={
					<MaxButton data-testid="futures-market-trade-withdraw-max-button" onClick={handleSetMax}>
						{t('futures.market.trade.margin.modal.max')}
					</MaxButton>
				}
			/>
			<Spacer height={20} />

			<Button
				data-testid="futures-market-trade-withdraw-margin-button"
				disabled={isDisabled}
				fullWidth
				onClick={transferType === 0 ? onDepositKeeperDeposit : onWithdrawKeeperDeposit}
			>
				{isSubmitting ? (
					<Loader />
				) : (
					t(
						`futures.market.trade.orders.manage-keeper-deposit.${
							transferType === 0 ? 'deposit' : 'withdraw'
						}`
					)
				)}
			</Button>
			{openOrders.length && transferType === 1 ? (
				<ErrorView
					containerStyle={{ margin: '16px 0 0 0' }}
					messageType="warn"
					message={t('futures.market.trade.orders.manage-keeper-deposit.withdraw-warning')}
				/>
			) : null}
		</StyledBaseModal>
	)
}

const StyledSegmentedControl = styled(SegmentedControl)`
	margin-bottom: 16px;
`
