import Button from 'components/Button';
import styled from 'styled-components';

import { FlexDivCentered } from 'styles/common';

export const RoundedContainer = styled(FlexDivCentered)`
	border-radius: 1000px;
	background-color: ${(props) => props.theme.colors.elderberry};
	padding: 16px 32px;
	max-width: 680px;
	margin: 0 auto;
`;

export const Message = styled.div`
	color: ${(props) => props.theme.colors.white};
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.bold};
	flex-grow: 1;
	text-align: center;
`;

export const MessageButton = styled(Button).attrs({
	variant: 'primary',
	size: 'lg',
	isRounded: true,
})``;
