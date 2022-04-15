import styled from 'styled-components';

const Badge = styled.span`
	text-transform: uppercase;
	color: ${(props) => props.theme.colors.black};
	padding: 2px 3px 1px 5px;
	text-align: center;
	font-weight: bold;
	font-family: ${(props) => props.theme.fonts.black};
	background: ${(props) => props.theme.colors.common.primaryRed};
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
