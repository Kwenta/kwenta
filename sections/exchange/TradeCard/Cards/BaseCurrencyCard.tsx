import { FC, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { selectBaseCurrencyName } from 'state/exchange/selectors';
import { useAppSelector } from 'state/store';

import { useExchangeContext } from 'contexts/ExchangeContext';

import CurrencyCard from '../CurrencyCard';

const BaseCurrencyCard: FC = memo(() => {
	const { t } = useTranslation();

	const { setOpenModal, onBaseCurrencyAmountChange, onBaseBalanceClick } = useExchangeContext();

	const {
		baseCurrencyKey,
		baseAmount,
		baseBalance,
		basePriceRate,
		slippagePercent,
		txProvider,
	} = useAppSelector(({ exchange }) => ({
		baseCurrencyKey: exchange.baseCurrencyKey,
		baseAmount: exchange.baseAmount,
		baseBalance: exchange.baseBalance,
		basePriceRate: exchange.basePriceRate,
		slippagePercent: exchange.slippagePercent,
		txProvider: exchange.txProvider,
	}));

	const baseCurrencyName = useAppSelector(selectBaseCurrencyName);

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
