import React, { FC, memo, useEffect, useMemo } from 'react'
import styled from 'styled-components'

import GridSvg from 'assets/svg/referrals/modal-background.svg'
import BaseModal from 'components/BaseModal'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { checkSelfReferredByCode } from 'state/referrals/action'
import { setStartOnboarding } from 'state/referrals/reducer'
import {
	selectBoostNft,
	selectMintedBoostNft,
	selectStartOnboarding,
	selectUnmintedBoostNft,
} from 'state/referrals/selectors'
import { selectWallet } from 'state/wallet/selectors'

import { MintedNftModal } from './MintedNftModal'
import { MintingModal } from './MintingModal'
import { OnboardModal } from './OnboardModal'
import { ReferralHeader } from './ReferralHeader'

type ReferalModalProps = {
	referralCode: string
	onDismiss(): void
}

const BaseReferralModal: FC<ReferalModalProps> = memo(({ referralCode, onDismiss }) => {
	const dispatch = useAppDispatch()
	const wallet = useAppSelector(selectWallet)
	const isStartOnboarding = useAppSelector(selectStartOnboarding)
	const isBoostNftMinted = useAppSelector(selectMintedBoostNft)
	const unmintedNftTier = useAppSelector(selectUnmintedBoostNft)
	const mintedNftTier = useAppSelector(selectBoostNft)

	useEffect(() => {
		dispatch(setStartOnboarding(false))
	}, [dispatch])

	useEffect(() => {
		if (wallet) {
			dispatch(checkSelfReferredByCode(referralCode))
		}
	}, [dispatch, referralCode, wallet])

	const displayNftTier = useMemo(
		() => (isStartOnboarding && isBoostNftMinted ? mintedNftTier : unmintedNftTier),
		[isBoostNftMinted, isStartOnboarding, mintedNftTier, unmintedNftTier]
	)

	const displayReferralCode = useMemo(
		() => (!isStartOnboarding || !isBoostNftMinted ? referralCode : ''),
		[isBoostNftMinted, isStartOnboarding, referralCode]
	)
	return (
		<StyledBaseModal
			title={<ReferralHeader referralCode={displayReferralCode} boostNftTier={displayNftTier} />}
			headerBackground={<GridSvg className="bg" objectfit="cover" layout="fill" />}
			isOpen
			onDismiss={onDismiss}
		>
			{!isStartOnboarding ? (
				<OnboardModal boostNftTier={unmintedNftTier} />
			) : isBoostNftMinted ? (
				<MintedNftModal onDismiss={onDismiss} boostNftTier={mintedNftTier} />
			) : (
				<MintingModal referralCode={referralCode} boostNftTier={unmintedNftTier} />
			)}
		</StyledBaseModal>
	)
})

const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 448px;
	}
	.card-header {
		margin-top: 15px;
	}
`

export default BaseReferralModal
