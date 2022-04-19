import styled from 'styled-components';

// base styles for each component that make up the tooltip.

interface ToolTipStyleProps {
	preset?: string;
	top?: string;
	bottom?: string;
	left?: string;
	right?: string;
}

export const Tooltip = styled.div<ToolTipStyleProps>`
		height: 50px;
		width: 189px;
		background: linear-gradient(180deg, #1E1D1D 0%, #161515 100%);
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-sizing: border-box;
		box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.1), inset 0px 0px 20px rgba(255, 255, 255, 0.03);
		border-radius: 10px;
		padding: 1em;
		position: absolute;
		top: ${(props) => props.top};
		bottom: ${(props) => props.bottom};
		left: ${(props) => props.left};
		right: ${(props) => props.right};

		p, span {
			margin: auto;
			font-size: 12px;
			text-align: left;
			font-family: ${(props) => props.theme.fonts.mono};
			font-style: normal;
			font-weight: 400;
			line-height: 125%;
			white-space: pre-line;
			color: ${(props) => props.theme.colors.white};
		}

		${(props) =>
			props.preset === 'top' &&
			`
				top: 0;
				left: 50%;
				transform: translate(-50%, -150%);
				text-align: center;
				display: inline-block;
			`}

		${(props) =>
			props.preset === 'bottom' &&
			`
				bottom: 0;
				transform: translate(-25%, 125%);
			`}

		${(props) =>
			props.preset === 'left' &&
			`
				left: 0;
				transform: translate(-105%, -80%);
			`}

		${(props) =>
			props.preset === 'right' &&
			`
				right: 0;
				transform: translate(105%, -80%);
			`}
		`;

export const ToolTipWrapper = styled.div`
	position: relative;
	display: inline-block;
`;
