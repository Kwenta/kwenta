import styled from 'styled-components';

import Button from 'components/Button';
import { GridDivCenteredRow } from 'components/layout/grid';
import { zIndex } from 'constants/ui';
import { FixedFooterMixin } from 'styles/common';
import media from 'styles/media';

export const MessageContainer = styled(GridDivCenteredRow)`
	-webkit-box-align: center;
	width: 100%;
	border-radius: 4px;
	grid-template-rows: 99px 70px;
	margin: 0 0 20px;

	${media.lessThan('md')`
		${FixedFooterMixin};
		box-shadow: 0 -8px 8px 0 ${(props) => props.theme.colors.black};
		justify-content: center;
		display: flex;
		z-index: ${zIndex.BASE};
	`}
`;

export const FixedMessageContainerSpacer = styled.div`
	height: 70px;
`;

export const Message = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.bold};
	flex-grow: 1;
	text-align: center;
`;

export const MessageButton = styled(Button).attrs({
	size: 'large',
	noOutline: true,
	isRounded: true,
	fullWidth: true,
})``;
