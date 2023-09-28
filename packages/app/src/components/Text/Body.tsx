import { ComponentType, memo } from 'react'
import styled, { css } from 'styled-components'

export type FontSize = 'xsmall' | 'small' | 'medium' | 'large'

export type BodyProps = React.HTMLAttributes<HTMLParagraphElement> & {
	size?: FontSize
	weight?: 'regular' | 'bold' | 'black'
	color?: 'primary' | 'secondary' | 'tertiary' | 'positive' | 'negative' | 'preview'
	type?: 'p' | 'span'
	className?: string
	fontSize?: number
	mono?: boolean
	capitalized?: boolean
	inline?: boolean
	as?: keyof JSX.IntrinsicElements | ComponentType<any>
}

const Body: React.FC<BodyProps> = memo(
	({
		size = 'medium',
		weight = 'regular',
		color = 'primary',
		type = 'p',
		fontSize,
		mono,
		capitalized,
		inline,
		...props
	}) =>
		type === 'p' ? (
			<StyledBody
				$size={size}
				$weight={weight}
				$fontSize={fontSize}
				$mono={mono}
				$capitalized={capitalized}
				$inline={inline}
				$color={color}
				{...props}
			/>
		) : (
			<StyledBodySpan
				$size={size}
				$weight={weight}
				$fontSize={fontSize}
				$mono={mono}
				$capitalized={capitalized}
				$inline={inline}
				$color={color}
				{...props}
			/>
		)
)

export const fontSizeMap = { xsmall: 10, small: 12, medium: 13, large: 15 } as const

const getFontFamily = (weight: NonNullable<BodyProps['weight']>, mono?: boolean) => {
	return mono ? (weight !== 'regular' ? 'monoBold' : 'mono') : weight
}

type StyledBodyProps = {
	$size: NonNullable<BodyProps['size']>
	$weight: NonNullable<BodyProps['weight']>
	$color: NonNullable<BodyProps['color']>
	$fontSize?: number
	$mono?: boolean
	$capitalized?: boolean
	$inline?: boolean
}

const BODY_STYLE = css<StyledBodyProps>`
	line-height: 1.2;
	margin: 0;

	${(props) => css`
		color: ${props.theme.colors.selectedTheme.newTheme.text[props.$color]};
		font-size: ${props.$fontSize ?? fontSizeMap[props.$size]}px;
		font-family: ${props.theme.fonts[getFontFamily(props.$weight, props.$mono)]};
		${props.$capitalized &&
		css`
			font-variant: all-small-caps;
		`}
		${props.$inline &&
		css`
			display: inline;
		`}
	`}
`

const StyledBody = styled.p<StyledBodyProps>`
	${BODY_STYLE}
`

const StyledBodySpan = styled.span<StyledBodyProps>`
	${BODY_STYLE}
`

export default Body
