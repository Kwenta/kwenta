import { FC, ReactNode, memo } from 'react'
import styled, { css } from 'styled-components'

import { ButtonLoader } from 'components/Loader'

// TODO: Clean up these styles
export type ButtonVariant =
	| 'primary'
	| 'secondary'
	| 'flat'
	| 'alt'
	| 'success'
	| 'danger'
	| 'text'
	| 'select'
	| 'yellow'
	| 'long'
	| 'short'
	| 'staking-button'

type BaseButtonProps = {
	$size: 'xsmall' | 'small' | 'medium' | 'large'
	$variant: ButtonVariant
	isActive?: boolean
	isRounded?: boolean
	fullWidth?: boolean
	noOutline?: boolean
	textColor?: 'yellow'
	outlineColor?: 'yellow'
	textTransform?: 'none' | 'uppercase' | 'capitalize' | 'lowercase'
	$active?: boolean
	$mono?: boolean
	$fontSize?: number
	$capitalized?: boolean
	$bold?: boolean
}

export const border = css`
	background: ${(props) => props.theme.colors.selectedTheme.newTheme.button.default.background};
	border: none;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		border-radius: 8px;
		padding: 1px;
		background: ${(props) => props.theme.colors.selectedTheme.newTheme.button.default.borderColor};
		-webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask-image: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
		mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
		mask-composite: exclude;
	}
`

const sizeMap = {
	xsmall: {
		paddingVertical: 6,
		paddingHorizontal: 12,
		height: 32,
		fontSize: 12,
	},
	small: {
		paddingVertical: 8,
		paddingHorizontal: 16,
		height: 40,
		fontSize: 13,
	},
	medium: {
		paddingVertical: 14,
		paddingHorizontal: 26,
		height: 47,
		fontSize: 15,
	},
	large: {
		paddingVertical: 16,
		paddingHorizontal: 36,
		height: 55,
		fontSize: 16,
	},
} as const

const BaseButton = styled.button<BaseButtonProps>`
	display: flex;
	justify-content: center;
	align-items: center;

	height: auto;
	cursor: pointer;
	position: relative;
	border-radius: ${(props) => (props.isRounded ? '50px' : '8px')};
	box-sizing: border-box;
	text-transform: ${(props) => props.textTransform ?? 'capitalize'};
	outline: none;
	white-space: nowrap;
	color: ${(props) => props.theme.colors.selectedTheme.button.text[props.textColor ?? 'primary']};
	transition: all 0.1s ease-in-out;
	${border}
	&:hover {
		background: ${(props) => props.theme.colors.selectedTheme.button.hover};
	}

	${(props) =>
		props.$variant === 'primary' &&
		css`
			background: ${props.theme.colors.selectedTheme.newTheme.button.default.background};
			text-shadow: ${props.theme.colors.selectedTheme.button.primary.textShadow};
			&:hover {
				background: ${props.theme.colors.selectedTheme.button.primary.hover};
			}
		`}

	${(props) =>
		(props.noOutline || props.$variant === 'flat') &&
		css`
			background: ${props.theme.colors.selectedTheme.newTheme.button.default.background};
			border: ${props.theme.colors.selectedTheme.border};
			&:hover {
				background: ${props.theme.colors.selectedTheme.button.fillHover};
			}
			&::before {
				display: none;
			}
		`}

	${(props) =>
		props.$variant === 'long' &&
		css`
			color: ${(props) =>
				props.theme.colors.selectedTheme.newTheme.button.position.long.active.color};
			background: ${(props) =>
				props.theme.colors.selectedTheme.newTheme.button.position.long.active.background};
			&:hover {
				background: ${(props) =>
					props.theme.colors.selectedTheme.newTheme.button.position.long.hover.background};
			}
		`}

	${(props) =>
		props.$variant === 'short' &&
		css`
			color: ${(props) =>
				props.theme.colors.selectedTheme.newTheme.button.position.short.active.color};
			background: ${(props) =>
				props.theme.colors.selectedTheme.newTheme.button.position.short.active.background};
			&:hover {
				background: ${(props) =>
					props.theme.colors.selectedTheme.newTheme.button.position.short.hover.background};
			}
		`}
	
	${(props) =>
		(props.$variant === 'yellow' || props.$variant === 'staking-button') &&
		css`
			background: ${props.theme.colors.selectedTheme.button.yellow.fill};
			border: 1px solid ${props.theme.colors.selectedTheme.button.yellow.border};
			color: ${props.theme.colors.selectedTheme.button.yellow.text};

			box-shadow: none;
			&:hover {
				background: ${props.theme.colors.selectedTheme.button.yellow.fillHover};
			}
			&::before {
				display: none;
			}

			${props.$variant === 'staking-button' &&
			css`
				border: 1px solid ${props.theme.colors.selectedTheme.button.yellow.text};
			`}
		`}

	font-family: ${(props) =>
		props.theme.fonts[props.$mono ? 'mono' : props.$bold ? 'bold' : 'regular']};

	${(props) =>
		props.$capitalized &&
		css`
			font-variant: all-small-caps;
		`}

	${(props) =>
		props.$variant === 'secondary' &&
		css`
			color: ${props.theme.colors.selectedTheme.button.secondary.text};
		`}

	${(props) =>
		props.$variant === 'danger' &&
		css`
			color: ${props.theme.colors.selectedTheme.red};
		`}

	${(props) => css`
		height: ${sizeMap[props.$size].height}px;
		padding: ${sizeMap[props.$size].paddingVertical}px ${sizeMap[props.$size].paddingHorizontal}px;
		font-size: ${sizeMap[props.$size].fontSize}px;
	`}

	${(props) =>
		props.fullWidth &&
		css`
			width: 100%;
		`};

	${(props) =>
		props.$fontSize &&
		css`
			font-size: ${props.$fontSize}px;
		`}

	&:disabled {
		color: ${(props) => props.theme.colors.selectedTheme.button.disabled.text};
		background: transparent;
		box-shadow: none;
		text-shadow: none;
		border: ${(props) => props.theme.colors.selectedTheme.border};
		cursor: not-allowed;
		&::before {
			display: none;
		}
	}
`

type ButtonProps = {
	children?: ReactNode
	loading?: boolean
	active?: boolean
	mono?: boolean
	className?: string
	left?: ReactNode
	right?: ReactNode
	size?: 'xsmall' | 'small' | 'medium' | 'large'
	variant?: ButtonVariant
	fullWidth?: boolean
	noOutline?: boolean
	textColor?: 'yellow'
	outlineColor?: 'yellow'
	textTransform?: 'none' | 'uppercase' | 'capitalize' | 'lowercase'
	style?: React.CSSProperties
	disabled?: boolean
	onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined
	isRounded?: boolean
	fontSize?: number
	capitalized?: boolean
	bold?: boolean
}

const Button: FC<ButtonProps> = memo(
	({
		loading,
		children,
		mono,
		left,
		right,
		fontSize,
		active = true,
		noOutline = true,
		size = 'medium',
		variant = 'flat',
		capitalized,
		bold = true,
		...props
	}) => {
		return (
			<BaseButton
				$active={active}
				$mono={mono}
				$size={size}
				$variant={variant}
				$fontSize={fontSize}
				noOutline={noOutline}
				$capitalized={capitalized}
				$bold={bold}
				{...props}
			>
				{loading ? (
					<ButtonLoader />
				) : (
					<>
						{left}
						<>{children}</>
						{right}
					</>
				)}
			</BaseButton>
		)
	}
)

export default Button
