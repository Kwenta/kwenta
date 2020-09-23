import { FC } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import styled from 'styled-components';

import {
	FlexDivRowCentered,
	numericValueCSS,
	NoTextTransform,
	FlexDivColCentered,
} from 'styles/common';

import { CurrencyKey } from 'constants/currency';

import BaseModal from 'components/BaseModal';
import Currency from 'components/Currency';

import ArrowsIcon from 'assets/inline-svg/app/circle-arrows.svg';

import { formatCurrency } from 'utils/formatters/number';
import { Synth } from 'lib/synthetix';
import { MessageButton } from 'sections/exchange/FooterCard/common';

type TxConfirmationModalProps = {
	onDismiss: () => void;
	txError: boolean;
	attemptRetry: () => void;
	baseCurrencyKey: CurrencyKey;
	baseCurrencyAmount: string;
	quoteCurrencyKey: CurrencyKey;
	quoteCurrencyAmount: string;
	totalTradePrice: number;
	selectedPriceCurrency: Synth;
};

export const TxConfirmationModal: FC<TxConfirmationModalProps> = ({
	onDismiss,
	txError,
	attemptRetry,
	baseCurrencyKey,
	quoteCurrencyKey,
	baseCurrencyAmount,
	quoteCurrencyAmount,
	totalTradePrice,
	selectedPriceCurrency,
}) => {
	const { t } = useTranslation();

	return (
		<StyledBaseModal
			onDismiss={onDismiss}
			isOpen={true}
			title={t('modals.confirm-transaction.title')}
		>
			<Currencies>
				<CurrencyItem>
					<CurrencyItemTitle>{t('exchange.common.from')}</CurrencyItemTitle>
					<Currency.Icon currencyKey={quoteCurrencyKey} width="40px" height="40px" />
				</CurrencyItem>
				<ArrowsIconContainer>
					<ArrowsIcon />
				</ArrowsIconContainer>
				<CurrencyItem>
					<CurrencyItemTitle>{t('exchange.common.into')}</CurrencyItemTitle>
					<Currency.Icon currencyKey={baseCurrencyKey} width="40px" height="40px" />
				</CurrencyItem>
			</Currencies>
			<Subtitle>{t('modals.confirm-transaction.confirm-with-provider')}</Subtitle>
			<Summary>
				<SummaryItem>
					<SummaryItemLabel>
						<Trans
							i18nKey="common.currency.currency-amount"
							values={{ currencyKey: quoteCurrencyKey }}
							components={[<NoTextTransform />]}
						/>
					</SummaryItemLabel>
					<SummaryItemValue>
						{formatCurrency(quoteCurrencyKey, quoteCurrencyAmount)}
					</SummaryItemValue>
				</SummaryItem>
				<SummaryItem>
					<SummaryItemLabel>
						<Trans
							i18nKey="common.currency.currency-amount"
							values={{ currencyKey: baseCurrencyKey }}
							components={[<NoTextTransform />]}
						/>
					</SummaryItemLabel>
					<SummaryItemValue>{formatCurrency(baseCurrencyKey, baseCurrencyAmount)}</SummaryItemValue>
				</SummaryItem>
				<SummaryItem>
					<SummaryItemLabel>
						<Trans
							i18nKey="common.currency.estimated-currency-value"
							values={{ currencyKey: selectedPriceCurrency.asset }}
							components={[<NoTextTransform />]}
						/>
					</SummaryItemLabel>
					<SummaryItemValue>
						{formatCurrency(selectedPriceCurrency.name, totalTradePrice, {
							sign: selectedPriceCurrency.sign,
						})}
					</SummaryItemValue>
				</SummaryItem>
			</Summary>
			{txError && (
				<Actions>
					<Message>{t('common.transaction.error')}</Message>
					<MessageButton onClick={attemptRetry}>{t('common.transaction.reattempt')}</MessageButton>
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
	color: ${(props) => props.theme.colors.white};
`;

const CurrencyItemTitle = styled.div`
	padding-bottom: 8px;
	text-transform: capitalize;
`;

const ArrowsIconContainer = styled.div`
	color: ${(props) => props.theme.colors.purple};
	padding-bottom: 2px;
`;

const Subtitle = styled.div`
	text-align: center;
	color: ${(props) => props.theme.colors.silver};
	padding-bottom: 48px;
`;

const Summary = styled.div``;

const SummaryItem = styled(FlexDivRowCentered)`
	margin-bottom: 8px;
	padding-bottom: 8px;
	border-bottom: 1px solid ${(props) => props.theme.colors.navy};
`;

const SummaryItemLabel = styled.div``;

const SummaryItemValue = styled.div`
	color: ${(props) => props.theme.colors.white};
	${numericValueCSS};
`;

const Actions = styled(FlexDivColCentered)`
	margin: 8px 0px;
`;

const Message = styled.div`
	color: ${(props) => props.theme.colors.white};
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.bold};
	flex-grow: 1;
	text-align: center;
	margin: 16px 0px;
`;

export default TxConfirmationModal;
