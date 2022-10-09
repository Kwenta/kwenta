import { FC, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { selectQuoteCurrencyName } from 'state/exchange/selectors';
import { useAppSelector } from 'state/store';

import { useExchangeContext } from 'contexts/ExchangeContext';
import { quoteCurrencyKeyState, quoteCurrencyAmountState } from 'store/exchange';

import CurrencyCard from '../CurrencyCard';

const QuoteCurrencyCard: FC = memo(() => {
	const { t } = useTranslation();
	const quoteCurrencyKey = useRecoilValue(quoteCurrencyKeyState);
	const quoteCurrencyAmount = useRecoilValue(quoteCurrencyAmountState);

	const { setOpenModal, onQuoteCurrencyAmountChange, onQuoteBalanceClick } = useExchangeContext();

	const { quoteBalance, quotePriceRate } = useAppSelector(({ exchange }) => ({
		quoteBalance: exchange.quoteBalance,
		quotePriceRate: exchange.quotePriceRate,
	}));

	const quoteCurrencyName = useAppSelector(selectQuoteCurrencyName);

	const openQuoteModal = useCallback(() => setOpenModal('quote-select'), [setOpenModal]);

	return (
		<CurrencyCard
			side="quote"
			currencyKey={quoteCurrencyKey}
			currencyName={quoteCurrencyName}
			amount={quoteCurrencyAmount}
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
