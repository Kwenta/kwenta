import Tippy from '@tippyjs/react';
import styled, { css } from 'styled-components';

import Button, { border } from 'components/Button';
import NumericInput from 'components/Input/NumericInput';
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

export const GridDivRow = styled(GridDiv)`
	grid-auto-flow: row;
`;

export const GridDivCenteredRow = styled(GridDivCentered)`
	grid-auto-flow: row;
`;

export const GridDivCol = styled(GridDiv)`
	grid-auto-flow: column;
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

export const TextButton = styled.button<{ disabled?: boolean }>`
	${resetButtonCSS};
	background: transparent;
	cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
`;

export const ResetButton = styled.button`
	${resetButtonCSS};
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
`;

export const BoldText = styled.span`
	font-family: ${(props) => props.theme.fonts.bold};
`;

export const BottomShadow = styled.div`
	background: linear-gradient(360deg, #10101e 0%, rgba(16, 16, 30, 0) 100%);
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	height: 16px;
	pointer-events: none;
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

export const Tooltip = styled(Tippy)`
	background-color: ${(props) => props.theme.colors.cellGradient};
	border: 0.5px solid ${(props) => props.theme.colors.navy};
	border-radius: 4px;
`;

export const InfoTooltip = styled(Tippy)`
	font-size: 12px;
	background-color: ${(props) => props.theme.colors.navy};
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	.tippy-arrow {
		color: ${(props) => props.theme.colors.navy};
	}
`;

export const InfoTooltipContent = styled.span`
	display: inline-flex;
	cursor: pointer;
	margin-left: 5px;
`;

export const SolidTooltip = styled(Tooltip).attrs({
	trigger: 'click',
	arrow: false,
	interactive: true,
})`
	width: 150px;
	.tippy-content {
		padding: 0;
	}
`;

export const SolidTooltipContent = styled.div`
	padding: 16px 0 8px 0;
`;

export const SolidTooltipCustomValueContainer = styled.div`
	margin: 0 10px 5px 10px;
`;

export const SolidTooltipCustomValue = styled(NumericInput)`
	width: 100%;
	border: 0;
	font-size: 12px;
	::placeholder {
		font-family: ${(props) => props.theme.fonts.mono};
	}
`;

export const SolidTooltipItemButton = styled(Button)`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-left: 10px;
	padding-right: 10px;
`;

export const IconButton = styled.button`
	${resetButtonCSS};
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
	color: ${(props) => props.theme.colors.common.primaryGold};
	text-transform: uppercase;
	text-align: center;
	letter-spacing: 0.65em;
	margin-bottom: 20px;
	${media.lessThan('sm')`
		font-size: 12px;
		margin-bottom: 12px;
	`}
`;

export const WhiteHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.compressedBlack};
	font-size: 42px;
	line-height: 100%;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	text-transform: uppercase;
	text-align: center;
	text-shadow: 0px 0px 12.83px rgba(255, 255, 255, 0.2);
	letter-spacing: 0.05em;
	width: 550px;
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
