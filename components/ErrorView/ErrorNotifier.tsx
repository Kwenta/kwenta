import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import styled, { useTheme } from 'styled-components';

import ErrorIcon from 'assets/svg/app/error.svg';
import { truncateString } from 'utils/formatters/string';

function ToastContent({ message, errorDetails }: { message: string; errorDetails?: string }) {
	const [expanded, setExpanded] = useState(false);
	if (!errorDetails) return <>{message}</>;
	return (
		<div>
			<div>{message}</div>
			<TextButton onClick={() => setExpanded(!expanded)}>
				{expanded ? 'Hide' : 'Show'} Details
			</TextButton>
			{expanded ? <ErrorDetails>{errorDetails}</ErrorDetails> : null}
		</div>
	);
}

export const notifyError = (message: string, error?: Error) => {
	const friendlyError = formatError(error?.message);
	const truncated = truncateString(message);
	toast.error(<ToastContent message={truncated} errorDetails={friendlyError} />, {
		position: toast.POSITION.TOP_RIGHT,
		toastId: message,
		containerId: 'errors',
	});
};

export default function ErrorNotifier() {
	const theme = useTheme();
	return (
		<StyledToastContainer
			icon={() => <ErrorIcon fill={theme.colors.selectedTheme.red} />}
			enableMultiContainer
			containerId="errors"
			position="top-right"
			autoClose={5000}
			hideProgressBar={false}
			newestOnTop={false}
			closeOnClick={false}
			rtl={false}
			pauseOnFocusLoss
			pauseOnHover
		/>
	);
}

export const ERROR_MESSAGES = {
	ORDER_PENDING: 'Previous order is pending, please wait for it to finish processing or cancel it.',
	INSUFFICIENT_MARGIN: 'Insufficient margin for this order.',
	INSUFFICIENT_ETH_BAL: 'Insufficient eth balance for gas cost',
	CANNOT_CANCEL_ORDER_YET: 'Cannot cancel the order yet',
};

// TODO: Format more errors, especially transaction failures
export const formatError = (message?: string) => {
	if (!message) return '';
	const lowerCaseMessage = message.toLowerCase();
	if (lowerCaseMessage.includes('insufficient funds for intrinsic transaction cost'))
		return ERROR_MESSAGES.INSUFFICIENT_ETH_BAL;
	if (lowerCaseMessage.includes('insufficient margin')) return ERROR_MESSAGES.INSUFFICIENT_MARGIN;
	if (lowerCaseMessage.includes('previous order exists')) return ERROR_MESSAGES.ORDER_PENDING;
	if (lowerCaseMessage.includes('cannot cancel yet')) return ERROR_MESSAGES.CANNOT_CANCEL_ORDER_YET;
	return message;
};

const StyledToastContainer = styled(ToastContainer)`
	.Toastify__toast-container {
		border-radius: 4px;
	}
	.Toastify__toast {
		border: ${(props) => props.theme.colors.selectedTheme.border};
		background: ${(props) => props.theme.colors.selectedTheme.button.fill};
		color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	}
	.Toastify__toast-body {
		font-family: ${(props) => props.theme.fonts.regular};
		font-size: 13px;
		line-height: 13px;
		overflow-wrap: break-word;
		word-break: break-word;
	}
	.Toastify__progress-bar {
		background: ${(props) => props.theme.colors.selectedTheme.red};
	}
	.Toastify__close-button > svg {
		fill: white;
	}
`;

// TODO: Use re-useable component once merged with component refactor

const TextButton = styled.div`
	text-decoration: underline;
	font-size: 13px;
	margin-top: 6px;
	line-height: 11px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	background-color: transparent;
	border: none;
	cursor: pointer;
`;

const ErrorDetails = styled.div`
	margin-top: 8px;
	font-size: 11px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`;
