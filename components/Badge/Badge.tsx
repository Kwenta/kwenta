import { FC } from 'react';
import styled, { css } from 'styled-components';

type BadgeProps = {
	color?: 'yellow' | 'red' | 'gray';
	dark?: boolean;
};

const Badge: FC<BadgeProps> = ({ color = 'yellow', dark, ...props }) => {
	return <BaseBadge $color={color} $dark={dark} {...props} />;
};

const BaseBadge = styled.span<{ $color: 'yellow' | 'red' | 'gray'; $dark?: boolean }>`
	text-transform: uppercase;
	padding: 2px 6px;
	text-align: center;
	${(props) => css`
		font-family: ${props.theme.fonts.black};
		color: ${props.theme.colors.selectedTheme.badge[props.$color].text};
		background: ${props.theme.colors.selectedTheme.badge[props.$color].background};
		${props.$dark &&
		css`
			color: ${props.theme.colors.selectedTheme.newTheme.badge[props.$color].dark.text};
			background: ${props.theme.colors.selectedTheme.newTheme.badge[props.$color].dark.background};
			border: 1px solid ${props.theme.colors.selectedTheme.newTheme.badge[props.$color].dark.border};
		`}
	`}
	border-radius: 100px;
	line-height: unset;
	font-size: 12px;
	font-variant: all-small-caps;
	opacity: 1;
	user-select: none;
`;

export default Badge;
