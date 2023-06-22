import styled, { css } from 'styled-components'

import media from 'styles/media'

// base styles for each component that make up the tooltip.

interface BaseTooltipProps {
	preset?: string
	width?: string
	height?: string
	top?: string
	bottom?: string
	left?: string
	right?: string
	position?: string
}

export const BaseTooltip = styled.div<BaseTooltipProps>`
	width: max-content;
	box-sizing: border-box;
	border-radius: 8px;
	padding: 10px;
	margin: 0;
	z-index: 2;

	${(props) => css`
		max-width: ${props.width ?? '472.5px'};
		background: ${props.theme.colors.selectedTheme.button.fill};
		border: ${props.theme.colors.selectedTheme.border};
		position: ${props.position ?? 'absolute'};
		top: ${props.top};
		bottom: ${props.bottom};
		left: ${props.left};
		right: ${props.right};
	`}

	p, span {
		color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	}

	${(props) =>
		props.preset === 'top' &&
		css`
			top: 0;
			left: 50%;
			transform: translate(-50%, -150%);
			display: inline-block;
		`}

	${(props) =>
		props.preset === 'bottom' &&
		css`
			bottom: 0;
			transform: translate(-25%, 125%);
		`}


	${(props) =>
		props.preset === 'left' &&
		css`
			left: 0;
			transform: translate(-105%, -80%);
		`}

	${(props) =>
		props.preset === 'right' &&
		css`
			right: 0;
			transform: translate(105%, -80%);
		`}

	${media.lessThan('sm')`
		max-width: calc(100vw - 32px);

		top: unset;
		right: unset;
		bottom: unset;
		left: unset;

		transform: translate(-20px, 5px);
	`}
`

export const ToolTipWrapper = styled.div`
	position: relative;
	display: inline-block;
`
