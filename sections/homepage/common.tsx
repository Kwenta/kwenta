import styled from 'styled-components';

import { FlexDivColCentered, FlexDivRow, GridDiv, Paragraph } from 'styles/common';
import media from 'styles/media';

export const SubHeader = styled(Paragraph)`
	font-size: 48px;
	line-height: 120%;
	letter-spacing: 0.2px;
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	${media.lessThan('md')`
		font-size: 32px;
		text-align: center;
	`}
`;

export const LeftSubHeader = styled(SubHeader)`
	text-align: left;
`;

export const CenterSubHeader = styled(SubHeader)`
	text-align: center;
`;

export const StackSection = styled(FlexDivColCentered)`
	width: 100%;
	${(props) => props.theme.animations.show};
`;

export const FlexSection = styled(FlexDivRow)`
	width: 100%;
	${media.lessThan('lg')`
		align-items: center;
		flex-direction: column;
	`}
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
