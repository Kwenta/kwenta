import { FC, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { setMaxQuoteBalance, setOpenModal, setQuoteAmount } from 'state/exchange/reducer';
import {
	selectQuoteBalanceWei,
	selectQuoteCurrencyName,
	selectQuotePriceRateWei,
} from 'state/exchange/selectors';
import { useAppDispatch, useAppSelector } from 'state/store';

import CurrencyCard from '../CurrencyCard';

const QuoteCurrencyCard: FC = memo(() => {
	const { t } = useTranslation();

	const { quoteCurrencyKey, quoteAmount } = useAppSelector(({ exchange }) => ({
		quoteCurrencyKey: exchange.quoteCurrencyKey,
		quoteAmount: exchange.quoteAmount,
	}));

	const quoteBalance = useAppSelector(selectQuoteBalanceWei);
	const quotePriceRate = useAppSelector(selectQuotePriceRateWei);
	const quoteCurrencyName = useAppSelector(selectQuoteCurrencyName);

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

	const openQuoteModal = useCallback(() => dispatch(setOpenModal('quote-select')), [dispatch]);

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
