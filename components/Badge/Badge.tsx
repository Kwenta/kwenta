import styled from 'styled-components';

const Badge = styled.span<{ color: 'yellow' | 'red' | 'neon' }>`
	text-transform: uppercase;
	padding: 1.6px 3px 1px 3px;
	text-align: center;
	font-family: ${(props) => props.theme.fonts.black};
	color: ${(props) => props.theme.colors.selectedTheme.badge[props.color].text};
	background: ${(props) => props.theme.colors.selectedTheme.badge[props.color].background};
	border-radius: 100px;
	margin-left: 5px;
	line-height: unset;
	font-size: 10px;
	font-variant: all-small-caps;
	opacity: 1;
	user-select: none;
`;

Badge.displayName = 'Badge';

export default Badge;
