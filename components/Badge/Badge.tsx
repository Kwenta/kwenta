import styled from 'styled-components';

const Badge = styled.span`
	text-transform: uppercase;
	padding: 1.6px 3px 1px 5px;
	text-align: center;
	font-family: ${(props) => props.theme.fonts.black};
	color: ${(props) => props.theme.colors.selectedTheme.badge.text};
	background: ${(props) => props.theme.colors.selectedTheme.badge.background};
	border-radius: 100px;
	letter-spacing: 1px;
	margin-left: 4px;
	line-height: unset;
	font-size: 10px;
	font-variant: all-small-caps;
	opacity: 1;
	user-select: none;
`;

Badge.displayName = 'Badge';

export default Badge;
