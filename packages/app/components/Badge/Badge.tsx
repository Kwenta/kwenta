import { FC, ReactNode } from 'react';
import styled, { css } from 'styled-components';

type BadgeProps = {
	color?: 'yellow' | 'red' | 'gray';
	size?: 'small' | 'regular';
	dark?: boolean;
	children?: ReactNode;
};

const Badge: FC<BadgeProps> = ({ color = 'yellow', size = 'regular', dark, ...props }) => {
	return <BaseBadge $color={color} $dark={dark} $size={size} {...props} />;
};

const BaseBadge = styled.span<{
	$color: 'yellow' | 'red' | 'gray';
	$dark?: boolean;
	$size: 'small' | 'regular';
}>`
	text-transform: uppercase;
	text-align: center;
	${(props) => css`
		padding: 2px 6px;
		padding: ${props.$size === 'small' ? '2px 4px' : '2px 6px'};
		font-size: ${props.$size === 'small' ? 10 : 12}px;
		font-family: ${props.theme.fonts.black};
		color: ${props.theme.colors.selectedTheme.newTheme.badge[props.$color].text};
		background: ${props.theme.colors.selectedTheme.newTheme.badge[props.$color].background};
		${props.$dark &&
		css`
			color: ${props.theme.colors.selectedTheme.newTheme.badge[props.$color].dark.text};
			background: ${props.theme.colors.selectedTheme.newTheme.badge[props.$color].dark.background};
			border: 1px solid ${props.theme.colors.selectedTheme.newTheme.badge[props.$color].dark.border};
		`}
	`}
	border-radius: 100px;
	line-height: unset;
	font-variant: all-small-caps;
	opacity: 1;
	user-select: none;
	display: flex;
	align-items: center;
`;

export default Badge;
