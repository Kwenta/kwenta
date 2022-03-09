import React from 'react';
import styled from 'styled-components';
import Wei from '@synthetixio/wei';
import BaseModal from 'components/BaseModal';

type WithdrawMarginModalProps = {
	onDismiss(): void;
	onTxConfirmed(): void;
	sUSDBalance: Wei;
	accessibleMargin: Wei;
	market: string | null;
};

const WithdrawMarginModal: React.FC<WithdrawMarginModalProps> = ({
	onDismiss,
	onTxConfirmed,
	sUSDBalance,
	accessibleMargin,
	market,
}) => {
	return (
		<StyledBaseModal title="Withdraw Margin" isOpen={true} onDismiss={onDismiss}>
			<div></div>
		</StyledBaseModal>
	);
};

const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}

	.card-body {
		padding: 28px;
	}
`;
export default WithdrawMarginModal;
