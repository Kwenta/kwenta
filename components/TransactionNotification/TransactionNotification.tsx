import i18n from 'i18n';
import React from 'react';
import styled from 'styled-components';

import Failure from 'assets/svg/app/failure.svg';
import Spinner from 'assets/svg/app/spinner.svg';
import Success from 'assets/svg/app/success.svg';
import { FlexDivCentered, FlexDivCol, FlexDivRowCentered } from 'styles/common';

type NotificationProps = {
	closeToast?: Function;
	failureReason?: string;
};

const NotificationPending = () => {
	return (
		<NotificationContainer>
			<IconContainer>
				<Spinner width={35} height={35} />
			</IconContainer>
			<TransactionInfo>{i18n.t('common.transaction.transaction-sent')}</TransactionInfo>
		</NotificationContainer>
	);
};

const NotificationSuccess = () => {
	return (
		<NotificationContainer>
			<IconContainer>
				<Success width={35} height={35} />
			</IconContainer>
			<TransactionInfo>{i18n.t('common.transaction.transaction-confirmed')}</TransactionInfo>
		</NotificationContainer>
	);
};

const NotificationError = ({ failureReason }: NotificationProps) => {
	return (
		<NotificationContainer>
			<IconContainer>
				<Failure width={35} />
			</IconContainer>
			<TransactionInfo>
				<TransactionInfoBody>{i18n.t('common.transaction.transaction-failed')}</TransactionInfoBody>
				<TransactionInfoBody isFailureMessage>{failureReason}</TransactionInfoBody>
			</TransactionInfo>
		</NotificationContainer>
	);
};

const NotificationContainer = styled(FlexDivCentered)``;

const IconContainer = styled(FlexDivRowCentered)`
	width: 35px;
	margin-right: 12px;
`;

const TransactionInfo = styled(FlexDivCol)``;
const TransactionInfoBody = styled.div<{ isFailureMessage?: boolean }>``;

export { NotificationPending, NotificationSuccess, NotificationError };
