import { toast, ToastContainer } from 'react-toastify';
import styled, { useTheme } from 'styled-components';

import ErrorIcon from 'assets/svg/app/error.svg';
import { truncateString } from 'utils/formatters/string';

export const notifyError = (message: string) => {
	const formatted = formatError(message);
	const truncated = truncateString(formatted);
	toast.error(truncated, {
		position: toast.POSITION.TOP_RIGHT,
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
			closeOnClick
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
		background-color: ${(props) => props.theme.colors.navy};
		border: 1px solid ${(props) => props.theme.colors.green};
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
