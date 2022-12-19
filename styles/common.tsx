import styled, { css } from 'styled-components';

import { border } from 'components/Button';
import { zIndex } from 'constants/ui';
import media from 'styles/media';

export const FlexDiv = styled.div`
	display: flex;
`;

export const FlexDivCentered = styled(FlexDiv)`
	align-items: center;
`;

export const FlexDivCol = styled(FlexDiv)`
	flex-direction: column;
`;

export const FlexDivColCentered = styled(FlexDivCol)`
	align-items: center;
`;

export const FlexDivRow = styled(FlexDiv)`
	justify-content: space-between;
`;

export const FlexDivRowCentered = styled(FlexDivRow)`
	align-items: center;
`;

export const linkCSS = css`
	text-decoration: none;
	&:hover {
		text-decoration: none;
	}
`;

export const ExternalLink = styled.a.attrs({
	target: '_blank',
	rel: 'noopener noreferrer',
})`
	${linkCSS};
`;

export const resetButtonCSS = css`
	border: none;
	background: none;
	outline: none;
	cursor: pointer;
	padding: 0;
`;

export const GridDiv = styled.div`
	display: grid;
`;

export const GridDivCentered = styled(GridDiv)`
	align-items: center;
`;

export const GridDivCenteredRow = styled(GridDivCentered)`
	grid-auto-flow: row;
`;

export const GridDivCenteredCol = styled(GridDivCentered)`
	grid-auto-flow: column;
`;

export const numericValueCSS = css`
	font-family: ${(props) => props.theme.fonts.mono};
`;

export const NumericValue = styled.span`
	${numericValueCSS};
`;

export const NoTextTransform = styled.span`
	text-transform: none;
`;

export const SelectableCurrencyRow = styled(FlexDivRowCentered)<{ isSelectable: boolean }>`
	padding: 5px 0;
	${(props) =>
		props.isSelectable
			? css`
					cursor: pointer;
					&:hover {
						background-color: ${(props) => props.theme.colors.selectedTheme.cell.hover};
					}
			  `
			: css`
					cursor: default;
			  `}
`;

export const CapitalizedText = styled.span`
	text-transform: capitalize;
`;

export const absoluteCenteredCSS = css`
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
`;

export const AbsoluteCenteredDiv = styled.div`
	${absoluteCenteredCSS};
`;

export const PageContent = styled.section`
	position: relative;
	width: 100%;
	${(props) => props.theme.animations.show};
`;

export const FixedFooterMixin = `
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	border-radius: 0;
`;

export const Paragraph = styled.p`
	margin: 0;
	cursor: default;
`;

export const BoldText = styled.span`
	font-family: ${(props) => props.theme.fonts.bold};
`;

export const FullScreenContainer = styled(FlexDiv)`
	flex-flow: column;
	width: 100%;
	height: auto;
	position: relative;
	overflow-y: visible;
	padding: 25px 25px 0;
	margin: 0 auto;

	${media.lessThan('sm')`
		padding: 20px 15px 0;
	`};
`;

export const MobileScreenContainer = styled.div`
	width: 100%;
	height: 100vh;
	overflow-y: scroll;
	padding-bottom: 80px;
`;

export const FullHeightContainer = styled(FlexDiv)`
	justify-content: space-between;
	width: 100%;
	flex-grow: 1;
	height: auto;
	position: relative;
	gap: 10px;
`;

export const MainContent = styled(FlexDiv)`
	position: relative;
	flex-grow: 1;
	flex-direction: column;
	margin: 0 auto;
	max-width: 1032px;
`;

export const RightSideContent = styled.div`
	background-color: transparent;
	position: relative;
	height: auto;
`;

export const LeftSideContent = styled.div`
	background-color: transparent;
	position: relative;
	height: auto;
`;

export const SwapCurrenciesButton = styled.button`
	${resetButtonCSS};
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	height: 32px;
	width: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: ${zIndex.BASE};
	border-radius: 50%;
	box-sizing: border-box;
	cursor: pointer;
	${border}
	transition-duration: 0.1s;
	transition-property: all;
	transition-timing-function: ease-in-out;

	&:before {
		border-radius: 50%;
	}
	&:hover {
		background: ${(props) => props.theme.colors.selectedTheme.button.hover};
		transform: scale(1.07);
		transition-duration: 0.12s;
		transition-timing-function: ease-in-out;
	}

	&:hover .arrow {
		transform: rotate(180deg);
		transition-duration: 0.12s;
		transition-timing-function: ease-in-out;
		path {
			fill: ${(props) => props.theme.colors.selectedTheme.white};
		}
	}

	.arrow {
		transition-property: all;
		width: 15px;
		height: auto;
		transition-duration: 0.12s;
		transition-timing-function: ease-in-out;
		z-index: 1;
		path {
			fill: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
		}
	}
`;

export const SmallGoldenHeader = styled(Paragraph)`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 14px;
	line-height: 100%;
	color: ${(props) => props.theme.colors.common.primaryYellow};
	text-transform: uppercase;
	text-align: center;
	letter-spacing: 0.65em;
	margin-bottom: 10px;
	cursor: default;
	${media.lessThan('sm')`
		font-size: 12px;
		margin-bottom: 12px;
	`}
`;

export const WhiteHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 42px;
	line-height: 100%;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	font-variant: all-small-caps;
	text-transform: uppercase;
	text-align: center;
	letter-spacing: 6px;
	cursor: default;
	${media.lessThan('sm')`
		font-size: 32px;
		width: 306px;
		text-shadow: none;
	`}
`;

export const BorderedPanel = styled.div`
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 10px;
	color: ${(props) => props.theme.colors.selectedTheme.text.value};
`;

const PillButtonCss = css<{ padding?: string }>`
	transition: all 0.1s ease-in-out;
	margin-left: 8px;
	cursor: pointer;
	font-size: 10px;
	line-height: 12px;
	font-family: ${(props) => props.theme.fonts.black};
	font-variant: all-small-caps;
	border: 1px solid ${(props) => props.theme.colors.selectedTheme.yellow};
	color: ${(props) => props.theme.colors.selectedTheme.button.pill.background};
	border-radius: 10px;
	padding: ${(props) => props.padding ?? '3px 5px'};
	svg {
		path {
			${(props) =>
				css`
					fill: ${props.theme.colors.selectedTheme.yellow};
				`}
		}
	}
	&:hover {
		background-color: ${(props) => props.theme.colors.selectedTheme.button.pill.background};
		color: ${(props) => props.theme.colors.selectedTheme.button.pill.hover};
		opacity: 0.7;
		svg {
			path {
				${(props) =>
					css`
						fill: ${props.theme.colors.selectedTheme.button.pill.hover};
					`}
			}
		}
	}
`;

export const PillButtonSpan = styled.span<{ padding?: string }>`
	${PillButtonCss}
`;

export const PillButtonDiv = styled.div<{ padding?: string }>`
	${PillButtonCss}
`;

export const YellowIconButton = styled.div`
	transition: all 0.1s ease-in-out;
	cursor: pointer;
	color: ${(props) => props.theme.colors.selectedTheme.yellow};
	svg {
		path {
			${(props) =>
				css`
					fill: ${props.theme.colors.selectedTheme.yellow};
				`}
		}
	}
	&:hover {
		opacity: 0.7;
	}
`;
