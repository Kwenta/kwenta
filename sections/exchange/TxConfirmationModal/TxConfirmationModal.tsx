import { FC } from 'react';
import { Dialog } from '@reach/dialog';

import styled from 'styled-components';

type TxConfirmationModalProps = {
	onDimiss: () => void;
};

export const TxConfirmationModal: FC<TxConfirmationModalProps> = ({ onDimiss }) => {
	return (
		<StyledDialog isOpen={true} onDismiss={onDimiss} aria-label="tx confirmation modal">
			<p>Hello there. I am a dialog</p>
		</StyledDialog>
	);
};

const StyledDialog = styled(Dialog)`
	width: 270px;
	background-color: ${(props) => props.theme.colors.elderberry};
	border-radius: 4px;
`;

export default TxConfirmationModal;
