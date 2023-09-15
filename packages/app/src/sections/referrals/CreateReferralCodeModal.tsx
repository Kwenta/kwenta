import { useChainModal, useConnectModal } from '@rainbow-me/rainbowkit'
import { ChangeEvent, FC, memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import BaseModal from 'components/BaseModal'
import Button from 'components/Button'
import Input from 'components/Input/Input'
import Spacer from 'components/Spacer'
import { Body } from 'components/Text'
import useIsL2 from 'hooks/useIsL2'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { createNewReferralCode } from 'state/referrals/action'
import { selectIsCreatingReferralCode } from 'state/referrals/selectors'
import { selectWallet } from 'state/wallet/selectors'

type Props = {
	onDismiss(): void
}

const CreateReferralCodeModal: FC<Props> = memo(({ onDismiss }) => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const { openChainModal } = useChainModal()
	const { openConnectModal } = useConnectModal()
	const isL2 = useIsL2()
	const wallet = useAppSelector(selectWallet)
	const isCreatingCode = useAppSelector(selectIsCreatingReferralCode)

	const [value, setValue] = useState<string>('')

	const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value), [])

	const handleCreateReferralCode = useCallback(() => {
		const lowerCaseCode = value.toLowerCase()
		dispatch(createNewReferralCode(lowerCaseCode))
	}, [dispatch, value])

	return (
		<StyledBaseModal
			title={t('referrals.affiliates.modal.create-referral-code.title')}
			isOpen
			onDismiss={onDismiss}
		>
			<Spacer height={10} />
			<Body size="small" color="secondary">
				{t('referrals.affiliates.modal.create-referral-code.label')}
			</Body>
			<Spacer height={10} />
			<Input
				value={value}
				onChange={onChange}
				placeholder={t('referrals.affiliates.modal.create-referral-code.input-placeholder')}
			/>
			<Spacer height={30} />
			<Button
				data-testid="referrals.affiliates.modal.create-referral-code.create-referral-button"
				size="small"
				variant="flat"
				disabled={!value}
				loading={isCreatingCode}
				fullWidth
				onClick={wallet ? (isL2 ? handleCreateReferralCode : openChainModal) : openConnectModal}
			>
				{wallet
					? isL2
						? t('referrals.affiliates.modal.create-referral-code.create-referral-button')
						: t('homepage.l2.cta-buttons.switch-l2')
					: t('common.wallet.connect-wallet')}
			</Button>
		</StyledBaseModal>
	)
})

const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 400px;
		margin-top: 300px;
	}
`

export default CreateReferralCodeModal
