import styled, { css, keyframes } from 'styled-components';
import Tippy from '@tippyjs/react';

import Button from 'components/Button';
import NumericInput from 'components/Input/NumericInput';

import { SPACING_FROM_HEADER, zIndex } from 'constants/ui';

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

export const fadeInAnimation = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const fadeOutAnimation = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
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

export const TextButton = styled.button`
	${resetButtonCSS};
	background: transparent;
`;

export const SelectableCurrencyRow = styled(FlexDivRowCentered)<{ isSelectable: boolean }>`
	padding: 5px 0;
	${(props) =>
		props.isSelectable
			? css`
					cursor: pointer;
					&:hover {
						background-color: ${(props) => props.theme.colors.black};
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
	margin: 0 auto;
	padding: 0 20px;
	width: 100%;
	flex-grow: 1;
	${(props) => props.theme.animations.show};
`;

export const FixedFooterMixin = `
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	border-radius: 0;	
`;

export const MobileContainerMixin = `
	padding-top: 55px;
	margin: 0 auto;
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
	height: 100vh;
	position: relative;
`;

export const SwapCurrenciesButton = styled.button`
	${resetButtonCSS};
	background-color: ${(props) => props.theme.colors.elderberry};
	color: ${(props) => props.theme.colors.white};
	height: 32px;
	width: 32px;
	border-radius: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: ${zIndex.BASE};
`;

export const Tooltip = styled(Tippy)`
	background: ${(props) => props.theme.colors.elderberry};
	border: 0.5px solid ${(props) => props.theme.colors.navy};
	border-radius: 4px;
`;

export const InfoTooltip = styled(Tooltip)`
	font-size: 12px;
	.tippy-content {
		padding: 5px;
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

export const CenteredMessage = styled.div`
	${absoluteCenteredCSS};
	font-size: 14px;
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.bold};
	text-align: center;
	display: grid;
	grid-gap: 10px;
`;

export const FullHeightContainer = styled(FlexDiv)`
	justify-content: space-between;
	width: 100%;
	flex-grow: 1;
	height: 100vh;
	position: relative;
`;

export const MainContent = styled(FlexDivCol)`
	flex-grow: 1;
	max-width: 1000px;
	position: relative;
	overflow: auto;
	margin: ${SPACING_FROM_HEADER} auto 0 auto;
`;

export const RightSideContent = styled(FlexDivCol)`
	width: 380px;
	background-color: ${(props) => props.theme.colors.elderberry};
	padding: ${SPACING_FROM_HEADER} 0 5px 0;
	margin-right: -20px;
	flex-shrink: 0;
	position: relative;
	margin-left: 20px;
	height: 100%;
`;

export const Table = styled.table.attrs({
	cellSpacing: 0,
	cellPadding: 0,
})`
	width: 100%;
	border-collapse: collapse;
	border: 0;
`;

export const CurrencyCardsSelector = styled.div`
	position: absolute;
	padding: 6px;
	border-radius: 4px;
	background: ${(props) => props.theme.colors.elderberry};
	border: 2px solid ${(props) => props.theme.colors.black};
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);

	${media.lessThan('md')`
		margin-top: -14px;
	`}
`;

export const DropdownSelection = styled.span.attrs({
	role: 'button',
})<{
	tooltipOpened: boolean;
}>`
	user-select: none;
	display: inline-flex;
	align-items: center;
	font-family: ${(props) => props.theme.fonts.bold};
	padding-left: 5px;
	cursor: pointer;
	color: ${(props) => props.theme.colors.white};
	text-transform: uppercase;
	svg {
		color: ${(props) => props.theme.colors.goldColors.color3};
		width: 10px;
		margin-left: 5px;
		transition: transform 0.2s ease-in-out;
		${(props) =>
			props.tooltipOpened &&
			css`
				transform: rotate(-180deg);
			`};
	}
`;

export const ExchangeCardsWithSelector = styled.div`
	position: relative;
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-gap: 2px;
	padding-bottom: 2px;
	width: 100%;
	margin: 0 auto;
	${media.lessThan('md')`
		grid-template-columns: unset;
		grid-template-rows: auto auto;
		padding-bottom: 24px;
	`}

	.currency-card {
		padding: 0 14px;
		${media.lessThan('md')`
			padding: unset;
		`}
		.currency-wallet-container {
			width: 90%;
			${media.lessThan('md')`
				width: 100%;
			`}
		}
	}
	.currency-card-base {
		.currency-wallet-container {
			width: 100%;
		}
		.currency-card-body {
			position: relative;
			padding-left: 61px;
			${media.lessThan('md')`
				padding-left: 18px;
			`}
		}
	}
`;
