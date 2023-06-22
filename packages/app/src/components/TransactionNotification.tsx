import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Failure from 'assets/svg/app/failure.svg'
import Spinner from 'assets/svg/app/spinner.svg'
import Success from 'assets/svg/app/success.svg'
import { FlexDivCentered, FlexDivCol, FlexDivRowCentered } from 'components/layout/flex'

type NotificationProps = {
	closeToast?: Function
	failureReason?: string
}

const NotificationPending = () => {
	const { t } = useTranslation()

	return (
		<FlexDivCentered>
			<IconContainer>
				<Spinner width={35} height={35} />
			</IconContainer>
			<FlexDivCol>{t('common.transaction.transaction-sent')}</FlexDivCol>
		</FlexDivCentered>
	)
}

const NotificationSuccess = () => {
	const { t } = useTranslation()

	return (
		<FlexDivCentered>
			<IconContainer>
				<Success width={35} height={35} />
			</IconContainer>
			<FlexDivCol>{t('common.transaction.transaction-confirmed')}</FlexDivCol>
		</FlexDivCentered>
	)
}

const NotificationError = ({ failureReason }: NotificationProps) => {
	const { t } = useTranslation()

	return (
		<FlexDivCentered>
			<IconContainer>
				<Failure width={35} />
			</IconContainer>
			<FlexDivCol>
				<div>{t('common.transaction.transaction-failed')}</div>
				<div>{failureReason}</div>
			</FlexDivCol>
		</FlexDivCentered>
	)
}

const IconContainer = styled(FlexDivRowCentered)`
	width: 35px;
	margin-right: 12px;
`

export { NotificationPending, NotificationSuccess, NotificationError }
