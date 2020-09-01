import { FC, ReactNode } from 'react';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import styled from 'styled-components';

import Card from 'components/Card';

type BaseModalProps = {
	title: ReactNode;
	isOpen?: boolean;
	onDismiss: () => void;
	children: ReactNode;
};

export const BaseModal: FC<BaseModalProps> = ({ onDismiss, title, children, isOpen, ...rest }) => (
	<StyledDialogOverlay onDismiss={onDismiss} isOpen={isOpen} {...rest}>
		<StyledDialogContent aria-label="modal">
			<Card>
				<StyledCardHeader className="card-header">{title}</StyledCardHeader>
				<Card.Body className="card-body">{children}</Card.Body>
			</Card>
		</StyledDialogContent>
	</StyledDialogOverlay>
);

const StyledDialogOverlay = styled(DialogOverlay)`
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

export default BaseModal;
