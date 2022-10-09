import { FC, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { selectQuoteCurrencyName } from 'state/exchange/selectors';
import { useAppSelector } from 'state/store';

import { useExchangeContext } from 'contexts/ExchangeContext';

import CurrencyCard from '../CurrencyCard';

const QuoteCurrencyCard: FC = memo(() => {
	const { t } = useTranslation();

	const { setOpenModal, onQuoteCurrencyAmountChange, onQuoteBalanceClick } = useExchangeContext();

	const { quoteCurrencyKey, quoteAmount, quoteBalance, quotePriceRate } = useAppSelector(
		({ exchange }) => ({
			quoteCurrencyKey: exchange.quoteCurrencyKey,
			quoteAmount: exchange.quoteAmount,
			quoteBalance: exchange.quoteBalance,
			quotePriceRate: exchange.quotePriceRate,
		})
	);

	const quoteCurrencyName = useAppSelector(selectQuoteCurrencyName);

	const openQuoteModal = useCallback(() => setOpenModal('quote-select'), [setOpenModal]);

	return (
		<CurrencyCard
			side="quote"
			currencyKey={quoteCurrencyKey}
			currencyName={quoteCurrencyName}
			amount={quoteAmount}
			onAmountChange={onQuoteCurrencyAmountChange}
			walletBalance={quoteBalance}
			onBalanceClick={onQuoteBalanceClick}
			onCurrencySelect={openQuoteModal}
			priceRate={quotePriceRate}
			label={t('exchange.common.from')}
		/>
	);
});

export default QuoteCurrencyCard;
