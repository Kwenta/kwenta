import styled, { css } from 'styled-components';
import Button from 'components/Button';

import { FixedFooterMixin, GridDivCentered } from 'styles/common';
import media from 'styles/media';

import { zIndex } from 'constants/ui';

export const Title = styled.div`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 14px;
	text-transform: capitalize;
	padding-bottom: 15px;
`;

export const Message = styled.div`
	color: ${(props) => props.theme.colors.white};
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.bold};
	flex-grow: 1;
	text-align: center;
`;

export const MessageContainer = styled(GridDivCentered)<{
	attached?: boolean;
	showProvider?: boolean;
}>`
	display: grid;
	-webkit-box-align: center;
	align-items: center;
	width: 100%;
	border-radius: 4px;
	grid-template-columns: ${(props) => props.showProvider && '.5fr'} 1fr auto;
	background-color: ${(props) => props.theme.colors.elderberry};
	padding: 16px 32px;
	margin: 0 0 20px;

	${(props) =>
		props.attached &&
		css`
			border-radius: 4px;
		`}
	${media.lessThan('md')`
		${FixedFooterMixin};
		box-shadow: 0 -8px 8px 0 ${(props) => props.theme.colors.black};
		justify-content: center;
		display: flex;
		z-index: ${zIndex.BASE};
	`}
`;

export const MessageButton = styled(Button).attrs({
	variant: 'primary',
	size: 'lg',
	isRounded: true,
})``;
