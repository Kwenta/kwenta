import { FC, ReactNode } from 'react';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';

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
							<Svg src={CrossIcon} />
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
	background-color: #282626;
	border-radius: 15px;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	box-shadow: inset 0px 1px 0px rgba(255, 255, 255, 0.25);
	height: 100%;
`;

const StyledCardHeader = styled(Card.Header)`
	justify-content: center;
	height: 45px;
	font-size: 16px;
	font-family: ${(props) => props.theme.fonts.bold};
`;

const StyledCardBody = styled(Card.Body)`
	${media.lessThan('sm')`
		&&& {
			max-height: unset;
			height: unset;
		}
	`}
`;

const DismissButton = styled.button`
	${resetButtonCSS};
	position: absolute;
	right: 20px;
	color: ${(props) => props.theme.colors.blueberry};
	&:hover {
		color: ${(props) => props.theme.colors.white};
	}
`;

export default BaseModal;
