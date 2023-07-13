import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import CompleteCheck from 'assets/svg/futures/onboard-complete-check.svg'
import BaseModal from 'components/BaseModal'
import Button from 'components/Button'
import ErrorView from 'components/ErrorView'
import Loader from 'components/Loader'
import ProgressSteps from 'components/ProgressSteps'
import { setOpenModal } from 'state/app/reducer'
import {
	selectCrossMarginAccount,
	selectCrossMarginSupportedNetwork,
} from 'state/futures/crossMargin/selectors'
import { selectSubmittingFuturesTx } from 'state/futures/selectors'
import { approveSmartMargin, createSmartMarginAccount } from 'state/futures/smartMargin/actions'
import {
	selectSmartMarginAccountQueryStatus,
	selectSmartMarginDepositApproved,
	selectTradePreview,
} from 'state/futures/smartMargin/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { FetchStatus } from 'state/types'

import CrossMarginFAQ from './SmartMarginOnboard/SmartMarginFAQ'
import { createPerpsV3Account } from 'state/futures/crossMargin/actions'

type Props = {
	isOpen: boolean
}

export default function CreatePerpsV3AccountModal({ isOpen }: Props) {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const crossMarginAvailable = useAppSelector(selectCrossMarginSupportedNetwork)
	const perpsV3Account = useAppSelector(selectCrossMarginAccount)
	const txProcessing = useAppSelector(selectSubmittingFuturesTx)
	const preview = useAppSelector(selectTradePreview)

	const onClose = () => dispatch(setOpenModal(null))

	const createAccount = useCallback(async () => {
		dispatch(createPerpsV3Account())
	}, [dispatch])

	const renderContent = () => {
		if (!crossMarginAvailable) {
			return <ErrorView message={t('futures.modals.onboard.unsupported-network')} />
		}

		return (
			<>
				<Intro>{t('futures.modals.onboard.step1-intro')}</Intro>
				<StyledButton noOutline onClick={createAccount} disabled={txProcessing}>
					{txProcessing ? <Loader /> : 'Create Account'}
				</StyledButton>
			</>
		)
	}

	return (
		<StyledBaseModal
			onDismiss={onClose}
			isOpen={isOpen}
			title={t('futures.modals.onboard.cm-title')}
		>
			{renderContent()}
		</StyledBaseModal>
	)
}

const StyledBaseModal = styled(BaseModal)`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	[data-reach-dialog-content] {
		width: 400px;
	}
`

const StyledButton = styled(Button)`
	margin-top: 24px;
	height: 50px;
	width: 100%;
`

const FAQHeader = styled.div`
	padding-bottom: 4px;
	border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
	margin-bottom: 5px;
`

const ProgressContainer = styled.div`
	margin-top: 30px;
`

const Intro = styled.div`
	margin-bottom: 30px;
`

const Complete = styled.div`
	padding: 40px;
	text-align: center;
`

const LoaderContainer = styled.div`
	height: 120px;
`
