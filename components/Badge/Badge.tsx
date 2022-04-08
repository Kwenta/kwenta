import styled from 'styled-components';

const Badge = styled.span`
	text-transform: uppercase;
	color: ${(props) => props.theme.colors.vampire};
	padding: 2px 6px;
	text-align: center;
	font-weight: bold;
	background: #ef6868;
	border-radius: 100px;
	letter-spacing: 0.105em;
`;

Badge.displayName = 'Badge';

export default Badge;
