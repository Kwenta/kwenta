import React, { FC, memo } from 'react'
import styled from 'styled-components'

import { FlexDivCentered } from 'components/layout/flex'

export type CardHeaderProps = {
	children: React.ReactNode
	className?: string
	lowercase?: boolean
	noBorder?: boolean
	onClick?: () => void
}

const CardHeader: FC<CardHeaderProps> = memo(
	({ children, lowercase = false, noBorder = false, ...rest }) => (
		<Container lowercase={lowercase} noBorder={noBorder} {...rest}>
			{children}
		</Container>
	)
)

const Container = styled(FlexDivCentered)<{ lowercase: boolean; noBorder: boolean }>`
	position: relative;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	border-bottom: ${(props) => (props.noBorder ? 'none' : props.theme.colors.selectedTheme.border)};
	height: 32px;
	padding: 0 18px;
	justify-content: flex-start;
	text-transform: ${(props) => (props.lowercase ? 'none' : 'capitalize')};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 14px;
	flex-shrink: 0;
`

export default CardHeader
