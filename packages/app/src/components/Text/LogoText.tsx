import { memo, FC, ReactNode } from 'react'
import styled, { css } from 'styled-components'

import HelpIcon from 'assets/svg/app/question-mark.svg'
import KwentaLogo from 'assets/svg/earn/KWENTA.svg'
import OptimismLogo from 'assets/svg/providers/optimism.svg'

import Heading from './Heading'

type LogoTextProps = {
	yellow?: boolean
	isToolTip?: boolean
	kwentaIcon?: boolean
	bold?: boolean
	size?: 'medium' | 'large'
	children?: ReactNode
}

export const LogoText: FC<LogoTextProps> = memo(
	({ children, yellow, size = 'large', isToolTip = false, bold = true, kwentaIcon = true }) => {
		return (
			<div style={{ display: 'flex', alignItems: 'center' }}>
				<TitleText $yellow={yellow} $bold={bold} $size={size}>
					{children}
				</TitleText>
				{kwentaIcon ? <KwentaLogo /> : <OptimismLogo height={18} width={18} />}
				{isToolTip && <SpacedHelpIcon />}
			</div>
		)
	}
)

const TitleText = styled(Heading)<{
	$yellow?: boolean
	$mono?: boolean
	$bold?: boolean
	$size?: 'medium' | 'large'
}>`
	font-size: ${(props) => (props.$size === 'large' ? '26' : '16')}px;
	margin-right: 8px;
	font-family: ${(props) => (props.$bold ? props.theme.fonts.monoBold : props.theme.fonts.mono)};

	${(props) =>
		props.$yellow &&
		css`
			color: ${(props) => props.theme.colors.selectedTheme.yellow};
		`}
`

const SpacedHelpIcon = styled(HelpIcon)`
	margin-left: 8px;
`

export default LogoText
