import { FC, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { setBaseAmount, setMaxBaseBalance, setOpenModal } from 'state/exchange/reducer';
import {
	selectBaseBalanceWei,
	selectBaseCurrencyName,
	selectBasePriceRateWei,
	selectSlippagePercentWei,
} from 'state/exchange/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';

import CurrencyCard from '../CurrencyCard';

const BaseCurrencyCard: FC = memo(() => {
	const { t } = useTranslation();

	const { baseCurrencyKey, baseAmount, txProvider, oneInchQuoteLoading } = useAppSelector(
		({ exchange }) => ({
			baseCurrencyKey: exchange.baseCurrencyKey,
			baseAmount: exchange.baseAmount,
			txProvider: exchange.txProvider,
			oneInchQuoteLoading: exchange.oneInchQuoteLoading,
		})
	);

	const dispatch = useAppDispatch();

	const baseBalance = useAppSelector(selectBaseBalanceWei);
	const basePriceRate = useAppSelector(selectBasePriceRateWei);
	const baseCurrencyName = useAppSelector(selectBaseCurrencyName);
	const slippagePercent = useAppSelector(selectSlippagePercentWei);

	const onBaseCurrencyAmountChange = useCallback(
		(value: string) => {
			dispatch(setBaseAmount({ value }));
		},
		[dispatch]
	);

	const onBaseBalanceClick = useCallback(() => {
		dispatch(setMaxBaseBalance());
	}, [dispatch]);

	const openBaseModal = useCallback(() => dispatch(setOpenModal('base-select')), [dispatch]);

	return (
		<CurrencyCard
			side="base"
			currencyKey={baseCurrencyKey}
			currencyName={baseCurrencyName}
			disabled={txProvider !== 'synthetix'}
			amount={baseAmount}
			onAmountChange={onBaseCurrencyAmountChange}
			walletBalance={baseBalance}
			onBalanceClick={onBaseBalanceClick}
			onCurrencySelect={openBaseModal}
			priceRate={basePriceRate}
			label={t('exchange.common.into')}
			slippagePercent={slippagePercent}
			isLoading={txProvider === '1inch' && oneInchQuoteLoading}
		/>
	);
});

export default BaseCurrencyCard;
