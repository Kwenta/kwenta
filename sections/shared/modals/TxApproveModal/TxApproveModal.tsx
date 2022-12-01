import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import BaseModal from 'components/BaseModal';
import Currency from 'components/Currency';
import { MessageButton } from 'sections/exchange/FooterCard/common';
import { setOpenModal } from 'state/exchange/reducer';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { FlexDivColCentered, NoTextTransform } from 'styles/common';
import { formatRevert } from 'utils/formatters/error';

type TxApproveModalProps = {
	attemptRetry: () => void;
};

export const TxApproveModal: FC<TxApproveModalProps> = ({ attemptRetry }) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const { quoteCurrencyKey, txError } = useAppSelector(({ exchange }) => ({
		quoteCurrencyKey: exchange.quoteCurrencyKey,
		txError: exchange.txError,
	}));

	const onDismiss = useCallback(() => {
		dispatch(setOpenModal(undefined));
	}, [dispatch]);

	if (!quoteCurrencyKey) {
		return null;
	}

	return (
		<StyledBaseModal onDismiss={onDismiss} isOpen title={t('modals.approve-transaction.title')}>
			<Currencies>
				<CurrencyItem>
					<CurrencyItemTitle>
						<NoTextTransform>{quoteCurrencyKey}</NoTextTransform>
					</CurrencyItemTitle>
					<Currency.Icon
						currencyKey={quoteCurrencyKey}
						width="40px"
						height="40px"
						data-testid="currency-img"
					/>
				</CurrencyItem>
			</Currencies>
			<Subtitle>{t('modals.approve-transaction.confirm-with-provider')}</Subtitle>
			{!!txError && (
				<Actions>
					<Message>{formatRevert(txError)}</Message>
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
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
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
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.bold};
	flex-grow: 1;
	text-align: center;
	margin: 16px 0px;
`;

export default TxApproveModal;
