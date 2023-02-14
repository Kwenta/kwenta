import { FC } from 'react';
import styled, { css } from 'styled-components';

type BadgeProps = {
	color?: 'yellow' | 'red' | 'gray';
};

const Badge: FC<BadgeProps> = ({ color = 'yellow' }) => {
	return <BaseBadge $color={color} />;
};

const BaseBadge = styled.div<{ $color: 'yellow' | 'red' | 'gray' }>`
	text-transform: uppercase;
	padding: 2px 6px;
	text-align: center;
	${(props) => css`
		font-family: ${props.theme.fonts.black};
		color: ${props.theme.colors.selectedTheme.badge[props.$color].text};
		background: ${props.theme.colors.selectedTheme.badge[props.$color].background};
	`}
	border-radius: 100px;
	line-height: unset;
	font-size: 12px;
	font-variant: all-small-caps;
	opacity: 1;
	user-select: none;
`;

export default Badge;
