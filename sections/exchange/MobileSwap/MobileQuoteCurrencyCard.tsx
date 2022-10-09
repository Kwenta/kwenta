import { FC, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { useAppSelector } from 'state/store';

import { useExchangeContext } from 'contexts/ExchangeContext';
import { quoteCurrencyKeyState, quoteCurrencyAmountState } from 'store/exchange';

import MobileCurrencyCard from '../TradeCard/CurrencyCard/MobileCurrencyCard';

const MobileQuoteCurrencyCard: FC = memo(() => {
	const { t } = useTranslation();
	const quoteCurrencyKey = useRecoilValue(quoteCurrencyKeyState);
	const quoteCurrencyAmount = useRecoilValue(quoteCurrencyAmountState);

	const { setOpenModal, onQuoteCurrencyAmountChange, onQuoteBalanceClick } = useExchangeContext();

	const { quoteBalance, quotePriceRate } = useAppSelector(({ exchange }) => ({
		quoteBalance: exchange.quoteBalance,
		quotePriceRate: exchange.quotePriceRate,
	}));

	const openQuoteModal = useCallback(() => setOpenModal('quote-select'), [setOpenModal]);

	return (
		<MobileCurrencyCard
			currencyKey={quoteCurrencyKey}
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

export default MobileQuoteCurrencyCard;
