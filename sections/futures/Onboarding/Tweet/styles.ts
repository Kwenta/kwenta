import styled from 'styled-components';

import Button from 'components/Button';
import ConnectionDotBase from 'sections/shared/Layout/AppLayout/Header/ConnectionDot';

export const Root = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`;

export const ConnectionDot = styled(ConnectionDotBase)`
	margin-right: 4px;
`;

export const WalletButton = styled(Button)`
	display: inline-flex;
	align-items: center;
	font-family: ${(props) => props.theme.fonts.mono};
	background-color: ${(props) => props.theme.colors.elderberry};
	border: 1px solid ${(props) => props.theme.colors.navy};
	color: ${(props) => props.theme.colors.white};
	border-radius: 4px;
	height: 28px;
	align-self: end;
	margin-right: 10%;
	margin-top: 12px;
`;

export const Line1 = styled.div`
	background-image: ${(props) => props.theme.colors.gold};
	background-size: 100%;
	font-size: 16px;
	font-weight: 700;
	line-height: 1;
	margin-top: 64px;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
`;

export const Line2 = styled.p`
	color: ${(props) => props.theme.colors.white};
	font-size: 36px;
	font-weight: 700;
`;

export const Line3 = styled.p`
	color: ${(props) => props.theme.colors.silver};
	font-size: 16px;
	font-weight: 400;
	line-height: 1.3;
	margin-bottom: 48px;
	max-width: 80%;
	text-align: center;
`;

export const Line4 = styled.p`
	color: ${(props) => props.theme.colors.silver};
	font-size: 14px;
	font-weight: 400;
	line-height: 1.3;
	margin-bottom: 48px;
	max-width: 80%;
	text-align: center;
`;
