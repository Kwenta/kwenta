import Button from 'components/Button';
import styled from 'styled-components';

import { GridDivCentered } from 'styles/common';
import media from 'styles/media';

export const MessageContainer = styled(GridDivCentered)`
	border-radius: 1000px;
	grid-template-columns: 1fr auto;
	background-color: ${(props) => props.theme.colors.elderberry};
	padding: 16px 32px;
	max-width: 680px;
	margin: 0 auto;
	${media.lessThan('md')`
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		border-radius: 0;
		box-shadow: 0 -8px 8px 0 ${(props) => props.theme.colors.black};
		justify-content: center;
		display: flex;
	`}
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
