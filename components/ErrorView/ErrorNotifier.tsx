import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import styled, { useTheme } from 'styled-components';

import ErrorIcon from 'assets/svg/app/error.svg';
import { truncateString } from 'utils/formatters/string';

function ToastContent({ message, error }: { message: string; error?: Error }) {
	const [expanded, setExpanded] = useState(false);
	if (!error) return <>{message}</>;
	return (
		<div>
			<div>{message}</div>
			<TextButton onClick={() => setExpanded(!expanded)}>
				{expanded ? 'Hide' : 'Show'} Details
			</TextButton>
			{expanded ? <ErrorDetails>{error.message}</ErrorDetails> : null}
		</div>
	);
}

export const notifyError = (message: string, error?: Error) => {
	const formatted = formatError(message);
	const truncated = truncateString(formatted);
	toast.error(<ToastContent message={truncated} error={error} />, {
		position: toast.POSITION.TOP_RIGHT,
		toastId: truncated,
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

const formatError = (message: string) => {
	if (!message) return '';
	if (message.includes('insufficient funds for intrinsic transaction cost'))
		return 'Insufficient ETH balance for gas cost';
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
