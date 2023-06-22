import { DialogOverlay, DialogContent } from '@reach/dialog'
import { FC, ReactNode, SyntheticEvent, memo } from 'react'
import styled from 'styled-components'

import { HEADER_HEIGHT, zIndex } from 'constants/ui'

type FullScreenModalProps = {
	title?: ReactNode
	isOpen: boolean
	children: ReactNode
	onDismiss?: (event?: SyntheticEvent<Element, Event> | undefined) => void
}

export const FullScreenModal: FC<FullScreenModalProps> = memo(
	({ title, children, isOpen, onDismiss, ...rest }) => (
		<StyledDialogOverlay isOpen={isOpen} onDismiss={onDismiss} {...rest}>
			<StyledDialogContent aria-label="modal">
				{title && <Title className="title">{title}</Title>}
				<div className="content">{children}</div>
			</StyledDialogContent>
		</StyledDialogOverlay>
	)
)

const StyledDialogOverlay = styled(DialogOverlay)`
	z-index: ${zIndex.DIALOG_OVERLAY};
	background: ${(props) => props.theme.colors.selectedTheme.background};
	top: ${HEADER_HEIGHT};
`

const StyledDialogContent = styled(DialogContent)`
	padding: 0;
	border: 0;
	background: none;
`

const Title = styled.div`
	text-transform: capitalize;
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	font-size: 24px;
	line-height: 24px;
	padding-bottom: 24px;
`

export default FullScreenModal
