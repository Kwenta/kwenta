import { FC, ReactNode } from 'react'
import styled, { css } from 'styled-components'

type BadgeProps = {
	color?: 'yellow' | 'red' | 'gray' | 'primary'
	size?: 'small' | 'regular'
	font?: 'regular' | 'black'
	dark?: boolean
	children?: ReactNode
	textTransform?: boolean
}

const Badge: FC<BadgeProps> = ({
	color = 'yellow',
	size = 'regular',
	font = 'black',
	dark,
	textTransform = true,
	...props
}) => {
	return (
		<BaseBadge
			$color={color}
			$dark={dark}
			$size={size}
			$font={font}
			$textTransform={textTransform}
			{...props}
		/>
	)
}

const BaseBadge = styled.span<{
	$color: 'yellow' | 'red' | 'gray' | 'primary'
	$size: 'small' | 'regular'
	$font?: 'regular' | 'black'
	$dark?: boolean
	$textTransform?: boolean
}>`
	border-radius: 6px;
	${(props) => css`
		padding: ${props.$size === 'small' ? '2px 4px' : '2px 6px'};
		font-size: ${props.$size === 'small' ? 10 : 12}px;
		font-family: ${props.$font === 'black' ? props.theme.fonts.black : props.theme.fonts.regular};
		color: ${props.theme.colors.selectedTheme.newTheme.badge[props.$color].text};
		background: ${props.theme.colors.selectedTheme.newTheme.badge[props.$color].background};
		${props.$dark &&
		css`
			color: ${props.theme.colors.selectedTheme.newTheme.badge[props.$color].dark.text};
			background: ${props.theme.colors.selectedTheme.newTheme.badge[props.$color].dark.background};
			border: 1px solid ${props.theme.colors.selectedTheme.newTheme.badge[props.$color].dark.border};
		`}
	`}
	${(props) =>
		!!props.$textTransform &&
		css`
			text-transform: uppercase;
			font-variant: all-small-caps;
			border-radius: 100px;
		`}
	text-align: center;
	line-height: unset;
	opacity: 1;
	user-select: none;
	display: flex;
	align-items: center;
`

export default Badge
