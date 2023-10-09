import { formatNumber } from '@kwenta/sdk/utils'
import { useChainModal, useConnectModal } from '@rainbow-me/rainbowkit'
import Wei from '@synthetixio/wei'
import { isAddress } from 'ethers/lib/utils.js'
import { ChangeEvent, FC, memo, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import BaseModal from 'components/BaseModal'
import Button from 'components/Button'
import Input from 'components/Input/Input'
import { FlexDivCol, FlexDivRowCentered } from 'components/layout/flex'
import Spacer from 'components/Spacer'
import { Body } from 'components/Text'
import useENS from 'hooks/useENS'
import useIsL2 from 'hooks/useIsL2'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { bulkTransferEscrowEntries, transferEscrowEntry } from 'state/staking/actions'
import { selectIsTransferring } from 'state/staking/selectors'
import { selectWallet } from 'state/wallet/selectors'
import media from 'styles/media'

type Props = {
	onDismiss(): void
	totalEntries: number[]
	totalAmount: Wei
}

const TransferInputModal: FC<Props> = memo(({ onDismiss, totalEntries, totalAmount }) => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const { openChainModal } = useChainModal()
	const { openConnectModal } = useConnectModal()
	const isL2 = useIsL2()
	const wallet = useAppSelector(selectWallet)
	const isTransferring = useAppSelector(selectIsTransferring)

	const [addressOrName, setAddressOrName] = useState<string>('')

	const onChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => setAddressOrName(e.target.value),
		[]
	)
	const { ensAddress } = useENS(addressOrName)
	const recipient = ensAddress || addressOrName

	const isRecipientValid = useMemo(() => isAddress(recipient), [recipient])

	const handleTransfer = useCallback(() => {
		if (isRecipientValid) {
			if (totalEntries.length > 1) {
				dispatch(bulkTransferEscrowEntries({ recipient, entries: totalEntries }))
			} else if (totalEntries.length === 1) {
				dispatch(transferEscrowEntry({ recipient, entry: totalEntries[0] }))
			}
		}
	}, [isRecipientValid, totalEntries, dispatch, recipient])

	return (
		<StyledBaseModal
			title={t('dashboard.stake.tabs.escrow.transfer-modal.title')}
			isOpen
			onDismiss={onDismiss}
		>
			<Body color="secondary">{t('dashboard.stake.tabs.escrow.transfer-modal.copy')}</Body>
			<Spacer height={30} />
			<Body color="secondary">
				{t('dashboard.stake.tabs.escrow.transfer-modal.recipient-address')}
			</Body>
			<Spacer height={10} />
			<StyledInput value={recipient} onChange={onChange} />
			<Spacer height={30} />
			<FlexDivCol rowGap="8px">
				<FlexDivRowCentered>
					<Body color="secondary">
						{t('dashboard.stake.tabs.escrow.transfer-modal.entries-total')}
					</Body>
					<Body mono color="primary">
						{totalEntries.length}
					</Body>
				</FlexDivRowCentered>
				<FlexDivRowCentered>
					<Body color="secondary">
						{t('dashboard.stake.tabs.escrow.transfer-modal.amount-total')}
					</Body>
					<Body mono color="primary">
						{formatNumber(totalAmount, { suggestDecimals: true })}
					</Body>
				</FlexDivRowCentered>
			</FlexDivCol>
			<Spacer height={30} />
			<TransferButton
				size="small"
				variant="flat"
				disabled={!isRecipientValid}
				loading={isTransferring}
				fullWidth
				onClick={wallet ? (isL2 ? handleTransfer : openChainModal) : openConnectModal}
			>
				{wallet
					? isL2
						? t('dashboard.stake.tabs.escrow.transfer-modal.transfer-escrowed-kwenta')
						: t('homepage.l2.cta-buttons.switch-l2')
					: t('common.wallet.connect-wallet')}
			</TransferButton>
		</StyledBaseModal>
	)
})

const StyledInput = styled(Input)`
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.mono};

	${media.lessThan('md')`
		font-size: 13px;
	`}
`

const TransferButton = styled(Button)`
	height: 50px;
`

const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 440px;
		margin-top: 300px;
	}

	${media.lessThan('md')`
		[data-reach-dialog-content] {
			width: 300px;
			margin-top: 200px;
		}
	`}
`

export default TransferInputModal
