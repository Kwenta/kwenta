import { FC, ReactNode } from 'react';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import styled from 'styled-components';

import Cross from 'assets/svg/app/cross.svg';

import Card from 'components/Card';
import { resetButtonCSS } from 'styles/common';
import { zIndex } from 'constants/ui';

type BaseModalProps = {
	title: ReactNode;
	isOpen?: boolean;
	onDismiss: () => void;
	children: ReactNode;
	showCross?: boolean;
};

export const BaseModal: FC<BaseModalProps> = ({
	onDismiss,
	title,
	children,
	isOpen,
	showCross = true,
	...rest
}) => (
	<StyledDialogOverlay onDismiss={onDismiss} isOpen={isOpen} {...rest}>
		<StyledDialogContent aria-label="modal">
			<Card>
				<StyledCardHeader className="card-header">
					{title}
					{showCross && (
						<DismissButton onClick={onDismiss}>
							<Cross />
						</DismissButton>
					)}
				</StyledCardHeader>
				<Card.Body className="card-body">{children}</Card.Body>
			</Card>
		</StyledDialogContent>
	</StyledDialogOverlay>
);

const StyledDialogOverlay = styled(DialogOverlay)`
	z-index: ${zIndex.DIALOG_OVERLAY};
	background: hsla(0, 0%, 0%, 0.8);
`;

const StyledDialogContent = styled(DialogContent)`
	padding: 0;
	border: 0;
	background: none;
`;

const StyledCardHeader = styled(Card.Header)`
	justify-content: center;
	height: 45px;
`;

const DismissButton = styled.button`
	${resetButtonCSS};
	position: absolute;
	right: 16px;
	color: ${(props) => props.theme.colors.blueberry};
`;

export default BaseModal;
