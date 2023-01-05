import styled from 'styled-components';

import { FlexDivColCentered, GridDiv, Paragraph } from 'styles/common';
import media from 'styles/media';

export const StackSection = styled(FlexDivColCentered)`
	width: 100%;
	${(props) => props.theme.animations.show};
`;

export const GridContainer = styled(GridDiv)`
	grid-template-columns: repeat(2, 280px);
	grid-gap: 24px;
	justify-content: center;
	${media.lessThan('md')`
		grid-template-columns: repeat(2, auto);
	`}
	${media.lessThan('sm')`
		grid-template-columns: 1fr;
	`}
`;

export const Title = styled(Paragraph)`
	font-size: 16px;
	font-family: ${(props) => props.theme.fonts.bold};
	text-align: left;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
`;

export const Copy = styled(Paragraph)`
	font-size: 16px;
	font-style: normal;
	line-height: 24px;
	text-align: left;
	color: ${(props) => props.theme.colors.silver};
`;
