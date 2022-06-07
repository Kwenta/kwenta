import { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivColCentered } from 'styles/common';

import BaseModal from 'components/BaseModal';
import Currency from 'components/Currency';

import { TxProvider } from '../TxConfirmationModal/TxConfirmationModal';

import { MessageButton } from 'sections/exchange/FooterCard/common';

type TxApproveModalProps = {
	onDismiss: () => void;
	txError: string | null;
	attemptRetry: () => void;
	currencyKey: string;
	currencyLabel: ReactNode;
	txProvider?: TxProvider;
};

export const TxApproveModal: FC<TxApproveModalProps> = ({
	onDismiss,
	txError,
	attemptRetry,
	currencyKey,
	currencyLabel,
	txProvider,
}) => {
	const { t } = useTranslation();

	return (
		<StyledBaseModal
			onDismiss={onDismiss}
			isOpen={true}
			title={t('modals.approve-transaction.title')}
		>
			<Currencies>
				<CurrencyItem>
					<CurrencyItemTitle>{currencyLabel}</CurrencyItemTitle>
					<Currency.Icon
						currencyKey={currencyKey}
						width="40px"
						height="40px"
						data-testid="currency-img"
						type={txProvider === '1inch' ? 'token' : 'synth'}
					/>
				</CurrencyItem>
			</Currencies>
			<Subtitle>{t('modals.approve-transaction.confirm-with-provider')}</Subtitle>
			{txError != null && (
				<Actions>
					<Message>{txError}</Message>
					<MessageButton onClick={attemptRetry} data-testid="retry-btn">
						{t('common.transaction.reattempt')}
					</MessageButton>
				</Actions>
			)}
		</StyledBaseModal>
	);
};

const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 270px;
	}
	.card-body {
		padding: 24px;
	}
`;

const Currencies = styled.div`
	display: grid;
	grid-gap: 24px;
	padding-bottom: 24px;
	justify-content: center;
	grid-auto-flow: column;
	align-items: flex-end;
`;

const CurrencyItem = styled.div`
	text-align: center;
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
`;

const CurrencyItemTitle = styled.div`
	padding-bottom: 8px;
	text-transform: capitalize;
`;

const Subtitle = styled.div`
	text-align: center;
	color: ${(props) => props.theme.colors.silver};
	padding-bottom: 24px;
`;

const Actions = styled(FlexDivColCentered)`
	margin: 8px 0px;
`;

const Message = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.bold};
	flex-grow: 1;
	text-align: center;
	margin: 16px 0px;
`;

export default TxApproveModal;
