import React, { FC, useMemo } from 'react';
import styled from 'styled-components';

import Button from 'components/Button';
import Spacer from 'components/Spacer';
import { formatRevert, isUserDeniedError } from 'utils/formatters/error';
import { truncateString } from 'utils/formatters/string';

type ErrorProps = {
	message: string;
	formatter?: 'revert' | undefined;
	retryButton?: {
		onClick: () => void;
		label: string;
	};
};

export const Error: FC<ErrorProps> = ({ message, formatter, retryButton }) => {
	const formattedMessage = useMemo(() => {
		switch (formatter) {
			case 'revert':
				return formatRevert(message);
			default:
				return message;
		}
	}, [message, formatter]);

	if (isUserDeniedError(message) || !message) return null;

	return (
		<ErrorContainer>
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

const ErrorContainer = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.red};
	flex: none;
	order: 0;
	flex-grow: 0;
	text-align: center;
	font-size: 12px;
	margin-bottom: 16px;
	padding: 15px;
	border: 1px solid rgba(239, 104, 104, 0.2);
	border-radius: 8px;
	cursor: default;

	:first-letter {
		text-transform: uppercase;
	}
`;

export default Error;
