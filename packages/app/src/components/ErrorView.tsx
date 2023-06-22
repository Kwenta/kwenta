import { truncateString } from '@kwenta/sdk/utils'
import React, { FC, useMemo, memo } from 'react'
import styled from 'styled-components'

import Button from 'components/Button'
import Spacer from 'components/Spacer'
import { formatRevert, isUserDeniedError } from 'utils/formatters/error'

import { formatError } from './ErrorNotifier'

type MessageType = 'error' | 'warn'

type ErrorProps = {
	message: string
	messageType?: MessageType
	formatter?: 'revert' | undefined
	containerStyle?: Record<string, string>
	retryButton?: {
		onClick: () => void
		label: string
	}
}

export const ErrorView: FC<ErrorProps> = memo(
	({ message, formatter, retryButton, containerStyle, messageType = 'error' }) => {
		const formattedMessage = useMemo(() => {
			const formattedError = formatError(message)
			if (formattedError) return formattedError
			switch (formatter) {
				case 'revert':
					return formatRevert(message)
				default:
					return message
			}
		}, [message, formatter])

		if (isUserDeniedError(message) || !message) return null

		return (
			<ErrorContainer messageType={messageType} style={containerStyle ?? {}}>
				<div>{truncateString(formattedMessage)}</div>
				{retryButton && (
					<>
						<Spacer height={10} />
						<Button variant="danger" size="small" onClick={retryButton.onClick}>
							{retryButton.label}
						</Button>
					</>
				)}
			</ErrorContainer>
		)
	}
)

const ErrorContainer = styled.div<{ messageType: MessageType; style: Record<string, string> }>`
	color: ${(props) =>
		props.messageType === 'error'
			? props.theme.colors.selectedTheme.button.red.text
			: props.theme.colors.selectedTheme.button.yellow.text};
	flex: none;
	order: 0;
	flex-grow: 0;
	text-align: center;
	font-size: 13px;
	margin: ${(props) => props.style.margin ?? '0 0 16px 0'};
	padding: 15px;
	border: 1px solid rgba(239, 104, 104, 0);
	background: ${(props) =>
		props.messageType === 'error'
			? props.theme.colors.selectedTheme.button.red.fill
			: props.theme.colors.selectedTheme.button.yellow.fill};
	border-radius: 8px;
	cursor: default;
	white-space: pre-line;

	:first-letter {
		text-transform: uppercase;
	}
`

export default ErrorView
