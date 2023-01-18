import { useState, useEffect, memo } from 'react';
import { createPortal } from 'react-dom';
import { ToastContainer } from 'react-toastify';
import styled from 'styled-components';
import 'react-toastify/dist/ReactToastify.css';

const NotificationContainer = memo(() => {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		return () => setMounted(false);
	}, []);

	return mounted
		? createPortal(
				<StyledToastContainer
					enableMultiContainer
					containerId="notifications"
					autoClose={false}
					position="bottom-right"
					closeOnClick={false}
				/>,
				document.body
		  )
		: null;
});

const StyledToastContainer = styled(ToastContainer)`
	.Toastify__toast-container {
		background-color: ${(props) => props.theme.colors.navy};
		border: 1px solid ${(props) => props.theme.colors.green};
		border-radius: 4px;
	}
	.Toastify__toast {
		border: ${(props) => props.theme.colors.selectedTheme.border};
		background: ${(props) => props.theme.colors.selectedTheme.button.background};
		color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	}
	.Toastify__toast-body {
		font-family: ${(props) => props.theme.fonts.regular};
		font-size: 14px;
		line-height: 14px;
	}
	.Toastify__progress-bar {
		background: ${(props) => props.theme.colors.gold};
		box-shadow: 0px 0px 15px rgb(228 179 120 / 60%);
	}
	.Toastify__close-button > svg {
		fill: white;
	}
`;

export default NotificationContainer;
