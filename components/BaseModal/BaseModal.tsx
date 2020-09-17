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
			<StyledCard className="card">
				<StyledCardHeader className="card-header">
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
	background: hsla(0, 0%, 0%, 0.8);
	${media.lessThan('sm')`
		overflow: hidden;
	`}
`;

const StyledDialogContent = styled(DialogContent)`
	padding: 0;
	border: 0;
	background: none;
	${media.lessThan('sm')`
		&&& {		
			width: 100%;
			height: 100%;
			margin: 0;
		}
	`}
`;

const StyledCard = styled(Card)`
	height: 100%;
`;

const StyledCardHeader = styled(Card.Header)`
	justify-content: center;
	height: 45px;
`;

const StyledCardBody = styled(Card.Body)`
	${media.lessThan('sm')`
		&&& {
			max-height: unset;
		}
	`}
`;

const DismissButton = styled.button`
	${resetButtonCSS};
	position: absolute;
	right: 20px;
	color: ${(props) => props.theme.colors.blueberry};
`;

export default BaseModal;
