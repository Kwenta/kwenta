import { PositionSide } from '@kwenta/sdk/types'
import styled, { css } from 'styled-components'

import Body from 'components/Text/Body'

type PositionProps = {
	side: PositionSide
	mobile?: boolean
	variant?: 'badge' | 'text'
}

const PositionType: React.FC<PositionProps> = ({
	side = PositionSide.LONG,
	mobile = false,
	variant = 'badge',
}) => {
	return mobile ? (
		<MobileStyledText side={side}>{side}</MobileStyledText>
	) : (
		<StyledText side={side} variant={variant}>
			{side}
		</StyledText>
	)
}

const StyledText = styled(Body).attrs({ weight: 'bold', capitalized: true, type: 'span' })<{
	side: PositionSide
	variant: 'badge' | 'text'
}>`
	padding: 3px 5px;
	border-radius: 4px;

	${(props) =>
		props.side === PositionSide.LONG
			? css`
					color: ${props.theme.colors.selectedTheme.green};
					background: rgba(127, 212, 130, 0.1);
			  `
			: css`
					color: ${props.theme.colors.selectedTheme.red};
					background: rgba(239, 104, 104, 0.1);
			  `};
	};

	${(props) =>
		props.variant === 'text' &&
		css`
			padding: 0;
			background: transparent;
		`}
`

const MobileStyledText = styled.p<{ side: PositionSide }>`
	margin: 0;
	text-transform: uppercase;
	${(props) => css`
		font-family: ${props.theme.fonts.bold};
		color: ${props.theme.colors.common[
			props.side === PositionSide.LONG ? 'primaryGreen' : 'primaryRed'
		]};
	`}
`

export default PositionType
