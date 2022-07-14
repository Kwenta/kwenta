import React, { FC } from 'react';
import styled from 'styled-components';
import { formatRevert } from 'utils/formatters/error';

type ErrorProps = {
	message: string;
	formatError?: (error: string) => string | undefined;
};

export const Error: FC<ErrorProps> = ({ message, formatError = formatRevert }) => {
	return <ErrorContainer>{formatError(message)}</ErrorContainer>;
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
`;

export default Error;
