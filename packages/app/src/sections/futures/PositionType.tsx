import { PositionSide } from '@kwenta/sdk/types'
import styled, { css } from 'styled-components'

import Body from 'components/Text/Body'

type PositionProps = {
	side: PositionSide
	mobile?: boolean
}

const PositionType: React.FC<PositionProps> = ({ side = PositionSide.LONG, mobile = false }) => {
	return mobile ? (
		<MobileStyledText side={side}>{side}</MobileStyledText>
	) : (
		<StyledText side={side}>{side}</StyledText>
	)
}

const StyledText = styled(Body).attrs({ weight: 'bold', capitalized: true, type: 'span' })<{
	side: PositionSide
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
