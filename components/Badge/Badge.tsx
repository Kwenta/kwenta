import styled, { css } from 'styled-components';

const Badge = styled.span<{ color: 'yellow' | 'red' | 'gray' }>`
	text-transform: uppercase;
	padding: 1.6px 3px 1px 3px;
	text-align: center;
	${(props) => css`
		font-family: ${props.theme.fonts.black};
		color: ${props.theme.colors.selectedTheme.badge[props.color].text};
		background: ${props.theme.colors.selectedTheme.badge[props.color].background};
	`}
	border-radius: 100px;
	margin-left: 5px;
	line-height: unset;
	font-size: 10px;
	font-variant: all-small-caps;
	opacity: 1;
	user-select: none;
`;

export default Badge;
