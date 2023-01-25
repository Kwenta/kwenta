import i18n from 'i18n';
import React from 'react';
import styled from 'styled-components';

import Failure from 'assets/svg/app/failure.svg';
import Spinner from 'assets/svg/app/spinner.svg';
import Success from 'assets/svg/app/success.svg';
import { FlexDivCentered, FlexDivCol, FlexDivRowCentered } from 'components/layout/flex';

type NotificationProps = {
	closeToast?: Function;
	failureReason?: string;
};

const NotificationPending = () => {
	return (
		<FlexDivCentered>
			<IconContainer>
				<Spinner width={35} height={35} />
			</IconContainer>
			<FlexDivCol>{i18n.t('common.transaction.transaction-sent')}</FlexDivCol>
		</FlexDivCentered>
	);
};

const NotificationSuccess = () => {
	return (
		<FlexDivCentered>
			<IconContainer>
				<Success width={35} height={35} />
			</IconContainer>
			<FlexDivCol>{i18n.t('common.transaction.transaction-confirmed')}</FlexDivCol>
		</FlexDivCentered>
	);
};

const NotificationError = ({ failureReason }: NotificationProps) => {
	return (
		<FlexDivCentered>
			<IconContainer>
				<Failure width={35} />
			</IconContainer>
			<FlexDivCol>
				<div>{i18n.t('common.transaction.transaction-failed')}</div>
				<div>{failureReason}</div>
			</FlexDivCol>
		</FlexDivCentered>
	);
};

const IconContainer = styled(FlexDivRowCentered)`
	width: 35px;
	margin-right: 12px;
`;

export { NotificationPending, NotificationSuccess, NotificationError };
