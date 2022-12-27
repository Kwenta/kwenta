import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';
import Spacer from 'components/Spacer';
import { formatRevert, isUserDeniedError } from 'utils/formatters/error';
import { truncateString } from 'utils/formatters/string';

type MessageType = 'error' | 'warn';

type ErrorProps = {
	message: string;
	messageType?: MessageType;
	formatter?: 'revert' | undefined;
	containerStyle?: Record<string, string>;
	retryButton?: {
		onClick: () => void;
		label: string;
	};
};

export const FRIENDLY_I18N_MESSAGES: Record<string, string> = {
	'Insufficient margin': 'futures.market.errors.insufficient-margin',
};

export const Error: FC<ErrorProps> = ({
	message,
	formatter,
	retryButton,
	containerStyle,
	messageType = 'error',
}) => {
	const { t } = useTranslation();
	const formattedMessage = useMemo(() => {
		if (FRIENDLY_I18N_MESSAGES[message]) return t(FRIENDLY_I18N_MESSAGES[message]);
		switch (formatter) {
			case 'revert':
				return formatRevert(message);
			default:
				return message;
		}
	}, [message, formatter, t]);

	if (isUserDeniedError(message) || !message) return null;

	return (
		<ErrorContainer messageType={messageType} style={containerStyle ?? {}}>
			<div>{truncateString(formattedMessage)}</div>
			{retryButton && (
				<>
					<Spacer height={10} />
					<Button variant="danger" size="xs" onClick={retryButton.onClick}>
						{retryButton.label}
					</Button>
				</>
			)}
		</ErrorContainer>
	);
};

const ErrorContainer = styled.div<{ messageType: MessageType; style: Record<string, string> }>`
	color: ${(props) =>
		props.messageType === 'error'
			? props.theme.colors.selectedTheme.red
			: props.theme.colors.selectedTheme.orange};
	flex: none;
	order: 0;
	flex-grow: 0;
	text-align: center;
	font-size: 12px;
	margin: ${(props) => props.style.margin ?? '0 0 16px 0'};
	padding: 15px;
	border: 1px solid rgba(239, 104, 104, 0.2);
	border-color: ${(props) =>
		props.messageType === 'error'
			? props.theme.colors.selectedTheme.red
			: props.theme.colors.selectedTheme.orange};
	border-radius: 8px;
	cursor: default;

	:first-letter {
		text-transform: uppercase;
	}
`;

export default Error;
