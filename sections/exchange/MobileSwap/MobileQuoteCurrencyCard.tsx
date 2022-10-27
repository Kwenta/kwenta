import { FC, memo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { updateBaseAmount } from 'state/exchange/actions';
import { setQuoteAmount, setMaxQuoteBalance, setOpenModal } from 'state/exchange/reducer';
import { selectQuoteBalanceWei } from 'state/exchange/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';

import useDebouncedMemo from 'hooks/useDebouncedMemo';

import MobileCurrencyCard from '../TradeCard/CurrencyCard/MobileCurrencyCard';

const MobileQuoteCurrencyCard: FC = memo(() => {
	const { t } = useTranslation();

	const { quoteCurrencyKey, quoteAmount, quotePriceRate } = useAppSelector(({ exchange }) => ({
		quoteCurrencyKey: exchange.quoteCurrencyKey,
		quoteAmount: exchange.quoteAmount,
		quotePriceRate: exchange.quotePriceRate,
	}));

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

	const quoteBalance = useAppSelector(selectQuoteBalanceWei);

	const openQuoteModal = useCallback(() => dispatch(setOpenModal('quote-select')), [dispatch]);

	return (
		<MobileCurrencyCard
			currencyKey={quoteCurrencyKey}
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

export default MobileQuoteCurrencyCard;
