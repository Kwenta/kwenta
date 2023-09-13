import { DialogOverlay, DialogContent } from '@reach/dialog'
import { FC, memo, ReactNode } from 'react'
import { Rnd, Props } from 'react-rnd'
import styled from 'styled-components'

import CrossIcon from 'assets/svg/app/cross.svg'
import Card, { CardHeader, CardBody } from 'components/Card'
import { zIndex } from 'constants/ui'
import { resetButtonCSS } from 'styles/common'
import media from 'styles/media'

type BaseModalProps = {
	title: ReactNode
	isOpen?: boolean
	onDismiss: () => void
	children: ReactNode
	showCross?: boolean
	lowercase?: boolean
	rndProps?: Props
	headerBackground?: ReactNode
}

type ModalContentWrapperProps = {
	children: ReactNode
	rndProps?: Props
}

const ModalContentWrapper: FC<ModalContentWrapperProps> = memo(({ children, rndProps }) => {
	if (rndProps?.disableDragging) {
		return <>{children}</>
	} else {
		return <Rnd {...rndProps}>{children}</Rnd>
	}
})

export const BaseModal: FC<BaseModalProps> = memo(
	({
		onDismiss,
		title,
		children,
		isOpen,
		showCross = true,
		lowercase,
		rndProps = { disableDragging: true, enableResizing: false },
		headerBackground,
		...rest
	}) => (
		<StyledDialogOverlay onDismiss={onDismiss} isOpen={isOpen} {...rest}>
			<StyledDialogContent aria-label="modal">
				<ModalContentWrapper rndProps={rndProps}>
					<StyledCard className="card">
						{headerBackground}
						<StyledCardHeader lowercase={lowercase} noBorder className="card-header">
							{title}
							{showCross && (
								<DismissButton onClick={onDismiss}>
									<CrossIcon />
								</DismissButton>
							)}
						</StyledCardHeader>
						<StyledCardBody className="card-body">{children}</StyledCardBody>
					</StyledCard>
				</ModalContentWrapper>
			</StyledDialogContent>
		</StyledDialogOverlay>
	)
)

const StyledDialogOverlay = styled(DialogOverlay)`
	z-index: ${zIndex.DIALOG_OVERLAY};
	background: rgba(0, 0, 0, 0.7);
	${media.lessThan('md')`
		z-index: ${zIndex.MOBILE_FOOTER};
		overflow: scroll;
		display: flex;
		align-items: flex-end;
	`}
`

const StyledDialogContent = styled(DialogContent)`
	padding: 0;
	border: 0;
	background: none;

	${media.lessThan('md')`
		&&& {
			/*width: 80%;*/
			display: flex;
			justify-content: center;
			align-items: center;
		}
	`}

	${media.lessThan('sm')`
		&&& {
			width: 100%;
			margin: 0;
		}
	`}
`

const StyledCard = styled(Card)`
	background-color: ${(props) => props.theme.colors.selectedTheme.background};
	border-radius: 10px;
	position: relative;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	${media.lessThan('md')`
		&&& {
			width: 100%;
			border-radius: 10px 10px 0 0;
		}
		svg.bg {
			margin-left: -16px;
		}
	`}
	overflow: hidden;
	svg.bg {
		margin-bottom: -120px;
	}
`

const StyledCardHeader = styled(CardHeader)`
	height: 45px;
	font-size: 16px;
	font-family: ${(props) => props.theme.fonts.regular};
	padding: 20px;
`

const StyledCardBody = styled(CardBody)`
	overflow-y: scroll;
	padding: 0 20px;
	padding-bottom: 20px;
`

const DismissButton = styled.button`
	${resetButtonCSS};
	position: absolute;
	right: 20px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	&:hover {
		color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	}
`

export default BaseModal
