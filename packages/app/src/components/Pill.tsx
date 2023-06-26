import { FC, memo } from 'react'
import styled, { css } from 'styled-components'

type PillSize = 'small' | 'medium' | 'large'
type PillColor = 'yellow' | 'gray' | 'red' | 'redGray'
type FontWeight = 'regular' | 'bold' | 'black'

type PillProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	size?: PillSize
	color?: PillColor
	outline?: boolean
	fullWidth?: boolean
	roundedCorner?: boolean
	weight?: FontWeight
}

const Pill: FC<PillProps> = memo(
	({
		size = 'small',
		color = 'gray',
		roundedCorner = true,
		weight = 'black',
		outline,
		fullWidth,
		...props
	}) => {
		return (
			<BasePill
				$size={size}
				$color={color}
				$outline={outline}
				$fullWidth={fullWidth}
				$roundedCorner={roundedCorner}
				$weight={weight}
				{...props}
			/>
		)
	}
)

const BasePill = styled.button<{
	$size: PillSize
	$color: PillColor
	$outline?: boolean
	$fullWidth?: boolean
	$roundedCorner?: boolean
	$weight?: FontWeight
}>`
	${(props) => css`
		padding: ${props.$size === 'small'
			? '0 5px'
			: props.$size === 'medium'
			? '3.5px 8px'
			: '10px 15px'};
		height: ${props.$size === 'small' ? '20px' : props.$size === 'medium' ? '24px' : '36px'};
		width: ${props.$fullWidth ? '100%' : props.$size === 'medium' ? '70px' : 'auto'};
		font-size: ${props.$size === 'small' ? 10 : 12}px;
		font-family: ${props.$weight && props.theme.fonts[props.$weight]};
		background: ${props.theme.colors.selectedTheme.newTheme.pill[props.$color].background};
		color: ${props.theme.colors.selectedTheme.newTheme.pill[props.$color].text};
		border: 1px solid ${props.theme.colors.selectedTheme.newTheme.pill[props.$color].border};
		border-radius: ${props.$roundedCorner ? '50' : '8'}px;
		cursor: pointer;
		font-variant: all-small-caps;

		${props.$outline &&
		css`
			background: ${props.theme.colors.selectedTheme.newTheme.pill[props.$color].outline
				.background};
			color: ${props.theme.colors.selectedTheme.newTheme.pill[props.$color].outline.text};
			border: 1px solid
				${props.theme.colors.selectedTheme.newTheme.pill[props.$color].outline.border};
		`}

		&:hover {
			background: ${props.theme.colors.selectedTheme.newTheme.pill[props.$color].hover.background};
			color: ${props.theme.colors.selectedTheme.newTheme.pill[props.$color].hover.text};
		}
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

export default Pill
