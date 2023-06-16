import { FC, memo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import useDebouncedMemo from 'hooks/useDebouncedMemo';
import { updateBaseAmount, setMaxQuoteBalance } from 'state/exchange/actions';
import { setQuoteAmount } from 'state/exchange/reducer';
import { setOpenModal } from 'state/exchange/reducer';
import {
	selectQuoteBalanceWei,
	selectQuoteCurrencyName,
	selectQuotePriceRateWei,
} from 'state/exchange/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';

import CurrencyCard from '../CurrencyCard';

// TODO: Reconsider consolidating the mobile and desktop currency cards.
// A number of performance considerations have changed, given the move
// away from Recoil to Redux.

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

	const quoteAmountDebounced = useDebouncedMemo(() => quoteAmount, [quoteAmount], 300);

	const onQuoteAmountChange = useCallback(
		(value: string) => {
			dispatch(setQuoteAmount(value));
		},
		[dispatch]
	);

	useEffect(() => {
		dispatch(updateBaseAmount());
	}, [dispatch, quoteAmountDebounced]);

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
			onAmountChange={onQuoteAmountChange}
			walletBalance={quoteBalance}
			onBalanceClick={onQuoteBalanceClick}
			onCurrencySelect={openQuoteModal}
			priceRate={quotePriceRate}
			label={t('exchange.common.from')}
		/>
	);
});

export default QuoteCurrencyCard;
