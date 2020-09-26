import styled from 'styled-components';

import { FlexDiv, FlexDivCol, FlexDivColCentered, GridDivCentered } from 'styles/common';

import media from 'styles/media';

export const SubHeader = styled.p`
	font-size: 64px;
	font-weight: 400;
	line-height: 120%;
	letter-spacing: 0.2px;
	width: 75%;
	color: ${(props) => props.theme.colors.white};
`;

export const LeftSubHeader = styled(SubHeader)`
	text-align: left;
`;

export const CenterSubHeader = styled(SubHeader)`
	text-align: center;
`;

export const StackSection = styled(FlexDivColCentered)`
	width: 100%;
	margin: 24px 0px;
`;

export const FlexSection = styled(FlexDiv)`
	width: 100%;
	margin: 24px 0px;
	${media.lessThan('lg')`
		flex-direction: column;
	`}
`;

export const GridContainer = styled(GridDivCentered)`
	grid-template-columns: repeat(2, 350px);
	grid-gap: 24px;
`;

export const Col = styled(FlexDivCol)`
	width: 50%;
	margin: 64px;
`;

export const Title = styled.p`
	font-size: 16px;
	font-weight: 700;
	line-height: 64px;
	text-align: left;
	color: ${(props) => props.theme.colors.white};
`;

export const Copy = styled.p`
	font-size: 16px;
	font-style: normal;
	font-weight: 400;
	line-height: 24px;
	letter-spacing: -0.005em;
	text-align: left;
	color: #92969f;
`;

export const Subtext = styled.p`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 32px;
	line-height: 120%;
	text-align: center;
	letter-spacing: 0.2px;
	color: ${(props) => props.theme.colors.white};
`;
