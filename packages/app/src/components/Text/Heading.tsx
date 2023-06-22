import { ReactNode, memo } from 'react'
import styled, { css } from 'styled-components'

type HeadingProps = {
	variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
	fontSize?: number
	className?: string
	children?: ReactNode
}

const Heading: React.FC<HeadingProps> = memo(({ variant = 'h1', fontSize, ...props }) => {
	return <StyledHeading as={variant} $fontSize={fontSize} $variant={variant} {...props} />
})

const sizes = { h1: 30, h2: 26, h3: 23, h4: 21, h5: 19, h6: 16 } as const

const StyledHeading = styled.h1<{
	$fontSize?: number
	$variant: NonNullable<HeadingProps['variant']>
}>`
	line-height: 1.2;
	margin: 0;
	${(props) => css`
		color: ${props.theme.colors.selectedTheme.text.value};
		font-size: ${props.$fontSize ?? sizes[props.$variant]}px;
	`}
`

export default Heading
