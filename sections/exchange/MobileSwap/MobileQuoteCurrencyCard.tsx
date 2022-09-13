import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { useExchangeContext } from 'contexts/ExchangeContext';
import { quoteCurrencyKeyState, quoteCurrencyAmountState } from 'store/exchange';

import MobileCurrencyCard from '../TradeCard/CurrencyCard/MobileCurrencyCard';

const MobileQuoteCurrencyCard: React.FC = React.memo(() => {
	const { t } = useTranslation();
	const quoteCurrencyKey = useRecoilValue(quoteCurrencyKeyState);
	const quoteCurrencyAmount = useRecoilValue(quoteCurrencyAmountState);

	const {
		setOpenModal,
		onQuoteCurrencyAmountChange,
		onQuoteBalanceClick,
		quoteCurrencyBalance,
		quotePriceRate,
	} = useExchangeContext();

	const openQuoteModal = React.useCallback(() => setOpenModal('quote-select'), [setOpenModal]);

	return (
		<MobileCurrencyCard
			currencyKey={quoteCurrencyKey}
			amount={quoteCurrencyAmount}
			onAmountChange={onQuoteCurrencyAmountChange}
			walletBalance={quoteCurrencyBalance}
			onBalanceClick={onQuoteBalanceClick}
			onCurrencySelect={openQuoteModal}
			priceRate={quotePriceRate}
			label={t('exchange.common.from')}
		/>
	);
});

export default MobileQuoteCurrencyCard;
