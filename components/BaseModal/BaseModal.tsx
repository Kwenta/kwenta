import { FC, ReactNode } from 'react';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import styled from 'styled-components';

import CrossIcon from 'assets/svg/app/cross.svg';

import Card from 'components/Card';
import { resetButtonCSS } from 'styles/common';
import { zIndex } from 'constants/ui';
import media from 'styles/media';

type BaseModalProps = {
	title: ReactNode;
	isOpen?: boolean;
	onDismiss: () => void;
	children: ReactNode;
	showCross?: boolean;
	lowercase?: boolean;
};

export const BaseModal: FC<BaseModalProps> = ({
	onDismiss,
	title,
	children,
	isOpen,
	showCross = true,
	lowercase,
	...rest
}) => (
	<StyledDialogOverlay onDismiss={onDismiss} isOpen={isOpen} {...rest}>
		<StyledDialogContent aria-label="modal">
			<StyledCard className="card">
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
		</StyledDialogContent>
	</StyledDialogOverlay>
);

const StyledDialogOverlay = styled(DialogOverlay)`
	z-index: ${zIndex.DIALOG_OVERLAY};
	background: rgba(0, 0, 0, 0.7);
	${media.lessThan('sm')`
		overflow: hidden;
		padding-bottom: 90px;
	`}
`;

const StyledDialogContent = styled(DialogContent)`
	padding: 0;
	border: 0;
	background: none;
	${media.lessThan('sm')`
		&&& {
			width: 100%;
			margin: 0;

			display: flex;
			justify-content: center;
			align-items: center;
		}
	`}
`;

const StyledCard = styled(Card)`
	background-color: ${(props) => props.theme.colors.selectedTheme.background};
	border-radius: 10px;
	position: relative;
	box-shadow: ${(props) => props.theme.colors.selectedTheme.button.shadow};
	border: ${(props) => props.theme.colors.selectedTheme.border};

	${media.lessThan('sm')`
		&&& {
			margin-top: 30px;
		}
	`}
`;

const StyledCardHeader = styled(Card.Header)`
	justify-content: center;
	height: 45px;
	font-size: 16px;
	font-family: ${(props) => props.theme.fonts.bold};
`;

const StyledCardBody = styled(Card.Body)`
	overflow-y: scroll;
`;

const DismissButton = styled.button`
	${resetButtonCSS};
	position: absolute;
	right: 20px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	&:hover {
		color: ${(props) => props.theme.colors.selectedTheme.button.text};
	}
`;

export default BaseModal;
