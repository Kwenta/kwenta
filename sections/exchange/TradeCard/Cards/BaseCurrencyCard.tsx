import { FC, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { selectBaseCurrencyName } from 'state/exchange/selectors';
import { useAppSelector } from 'state/store';

import { useExchangeContext } from 'contexts/ExchangeContext';
import { baseCurrencyKeyState, baseCurrencyAmountState } from 'store/exchange';

import CurrencyCard from '../CurrencyCard';

const BaseCurrencyCard: FC = memo(() => {
	const { t } = useTranslation();
	const baseCurrencyKey = useRecoilValue(baseCurrencyKeyState);
	const baseCurrencyAmount = useRecoilValue(baseCurrencyAmountState);

	const { setOpenModal, onBaseCurrencyAmountChange, onBaseBalanceClick } = useExchangeContext();

	const { baseBalance, basePriceRate, slippagePercent, txProvider } = useAppSelector(
		({ exchange }) => ({
			baseBalance: exchange.baseBalance,
			basePriceRate: exchange.basePriceRate,
			slippagePercent: exchange.slippagePercent,
			txProvider: exchange.txProvider,
		})
	);

	const baseCurrencyName = useAppSelector(selectBaseCurrencyName);

	const openBaseModal = useCallback(() => setOpenModal('base-select'), [setOpenModal]);

	return (
		<CurrencyCard
			side="base"
			currencyKey={baseCurrencyKey}
			currencyName={baseCurrencyName}
			disabled={txProvider !== 'synthetix'}
			amount={baseCurrencyAmount}
			onAmountChange={onBaseCurrencyAmountChange}
			walletBalance={baseBalance}
			onBalanceClick={onBaseBalanceClick}
			onCurrencySelect={openBaseModal}
			priceRate={basePriceRate}
			label={t('exchange.common.into')}
			slippagePercent={slippagePercent}
			isLoading={txProvider === '1inch'} // oneInchQuoteQuery.isFetching
		/>
	);
});

export default BaseCurrencyCard;
