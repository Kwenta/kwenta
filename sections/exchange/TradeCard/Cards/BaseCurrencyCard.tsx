import { FC, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
	selectBaseBalanceWei,
	selectBaseCurrencyName,
	selectBasePriceRateWei,
	selectSlippagePercentWei,
} from 'state/exchange/selectors';
import { useAppSelector } from 'state/store';

import { useExchangeContext } from 'contexts/ExchangeContext';

import CurrencyCard from '../CurrencyCard';

const BaseCurrencyCard: FC = memo(() => {
	const { t } = useTranslation();

	const { setOpenModal, onBaseCurrencyAmountChange, onBaseBalanceClick } = useExchangeContext();

	const { baseCurrencyKey, baseAmount, txProvider } = useAppSelector(({ exchange }) => ({
		baseCurrencyKey: exchange.baseCurrencyKey,
		baseAmount: exchange.baseAmount,
		txProvider: exchange.txProvider,
	}));

	const baseBalance = useAppSelector(selectBaseBalanceWei);
	const basePriceRate = useAppSelector(selectBasePriceRateWei);

	const baseCurrencyName = useAppSelector(selectBaseCurrencyName);
	const slippagePercent = useAppSelector(selectSlippagePercentWei);

	const openBaseModal = useCallback(() => setOpenModal('base-select'), [setOpenModal]);

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
			isLoading={txProvider === '1inch'} // && oneInchQuoteQuery.isFetching
		/>
	);
});

export default BaseCurrencyCard;
