import styled, { css } from 'styled-components'

import { border } from 'components/Button'
import { FlexDiv, FlexDivRowCentered } from 'components/layout/flex'
import { Body } from 'components/Text'
import { MOBILE_FOOTER_HEIGHT, zIndex } from 'constants/ui'
import media from 'styles/media'

export const linkCSS = css<{ underline?: boolean; hoverUnderline?: boolean }>`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	text-decoration: ${(props) => (props.underline ? 'underline' : 'none')};

	&:hover {
		text-decoration: ${(props) => (props.hoverUnderline ? 'underline' : 'none')};
	}
`

export const ExternalLink = styled.a.attrs<{ underline?: boolean; hoverUnderline?: boolean }>({
	target: '_blank',
	rel: 'noopener noreferrer',
})`
	${linkCSS};
`

export const resetButtonCSS = css`
	border: none;
	background: none;
	outline: none;
	cursor: pointer;
	padding: 0;
`

export const numericValueCSS = css`
	font-family: ${(props) => props.theme.fonts.mono};
`

export const NoTextTransform = styled.span`
	text-transform: none;
`

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
`

export const CapitalizedText = styled.span`
	text-transform: capitalize;
`

export const absoluteCenteredCSS = css`
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
`

export const AbsoluteCenteredDiv = styled.div`
	${absoluteCenteredCSS};
`

export const PageContent = styled.section`
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	${(props) => props.theme.animations.show};
`

export const FixedFooterMixin = `
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	border-radius: 0;
`

export const FullScreenContainer = styled.div`
	width: 100%;
	height: 100%;

	${media.lessThan('sm')`
		padding: 20px 15px 0;
	`};
`

export const MobileScreenContainer = styled.div`
	width: 100%;
	overflow-y: auto;
	height: 100%;
	padding-bottom: ${MOBILE_FOOTER_HEIGHT};
`

export const FullHeightContainer = styled(FlexDiv)`
	justify-content: space-between;
	width: 100%;
	flex-grow: 1;
	gap: 10px;
`

export const MainContent = styled(FlexDiv)`
	flex-grow: 1;
	flex-direction: column;
	margin: 0 auto;
	max-width: 1032px;
`

export const RightSideContent = styled.div`
	background-color: transparent;
	height: auto;
`

export const LeftSideContent = styled.div`
	background-color: transparent;
	height: auto;
`

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
`

export const SmallGoldenHeader = styled(Body).attrs({ weight: 'bold' })`
	font-size: 14px;
	line-height: 100%;
	color: ${(props) => props.theme.colors.common.primaryYellow};
	text-transform: uppercase;
	text-align: center;
	margin-bottom: 10px;
	cursor: default;
	${media.lessThan('sm')`
		font-size: 12px;
		margin-bottom: 12px;
	`}
`

export const WhiteHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 42px;
	line-height: 100%;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	font-variant: all-small-caps;
	text-transform: uppercase;
	text-align: center;
	cursor: default;
	${media.lessThan('sm')`
		font-size: 32px;
		width: 306px;
		text-shadow: none;
	`}
`

export const BorderedPanel = styled.div`
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 10px;
	color: ${(props) => props.theme.colors.selectedTheme.text.value};
`

const PillButtonCss = css<{ padding?: string }>`
	transition: all 0.1s ease-in-out;
	margin-left: 8px;
	cursor: pointer;
	font-size: 11px;
	line-height: 12px;
	font-family: ${(props) => props.theme.fonts.black};
	font-variant: all-small-caps;
	color: ${(props) => props.theme.colors.selectedTheme.button.pill.text};
	border-radius: 10px;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	padding: ${(props) => props.padding ?? '3px 5px'};
	background-color: ${(props) => props.theme.colors.common.darkYellow};

	svg {
		path {
			${(props) =>
				css`
					fill: ${props.theme.colors.common.primaryYellow};
				`}
		}
	}

	&:hover {
		background-color: ${(props) => props.theme.colors.selectedTheme.button.pill.background};
		color: ${(props) => props.theme.colors.common.black};
		svg {
			path {
				${(props) =>
					css`
						fill: ${props.theme.colors.common.black};
					`}
			}
		}
	}
`

export const PillButtonSpan = styled.span<{ padding?: string }>`
	${PillButtonCss}
`

export const YellowIconButton = styled.div`
	transition: all 0.1s ease-in-out;
	cursor: pointer;
	color: ${(props) => props.theme.colors.selectedTheme.yellow};
`

export const FOOTER_HEIGHT = 30
