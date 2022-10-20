import { FC, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { setMaxQuoteBalance, setOpenModal, setQuoteAmount } from 'state/exchange/reducer';
import { selectQuoteBalanceWei } from 'state/exchange/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';

import MobileCurrencyCard from '../TradeCard/CurrencyCard/MobileCurrencyCard';

const MobileQuoteCurrencyCard: FC = memo(() => {
	const { t } = useTranslation();

	const { quoteCurrencyKey, quoteAmount, quotePriceRate } = useAppSelector(({ exchange }) => ({
		quoteCurrencyKey: exchange.quoteCurrencyKey,
		quoteAmount: exchange.quoteAmount,
		quotePriceRate: exchange.quotePriceRate,
	}));

	const dispatch = useAppDispatch();

	const onQuoteCurrencyAmountChange = useCallback(
		(value: string) => {
			dispatch(setQuoteAmount({ value }));
		},
		[dispatch]
	);

	const onQuoteBalanceClick = useCallback(() => {
		dispatch(setMaxQuoteBalance());
	}, [dispatch]);

	const quoteBalance = useAppSelector(selectQuoteBalanceWei);

	const openQuoteModal = useCallback(() => dispatch(setOpenModal('quote-select')), [dispatch]);

	return (
		<MobileCurrencyCard
			currencyKey={quoteCurrencyKey}
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

export default MobileQuoteCurrencyCard;
