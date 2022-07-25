import React, { FC, useMemo } from 'react';
import styled from 'styled-components';

import { formatRevert, isMMUserDeniedError } from 'utils/formatters/error';

type ErrorProps = {
	message: string;
	formatter?: 'revert' | undefined;
};

export const Error: FC<ErrorProps> = ({ message, formatter }) => {
	const formattedMessage = useMemo(() => {
		switch (formatter) {
			case 'revert':
				return formatRevert(message);
			default:
				return message;
		}
	}, [message, formatter]);

	if (isMMUserDeniedError(message) || !message) return null;

	return <ErrorContainer>{formattedMessage}</ErrorContainer>;
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
