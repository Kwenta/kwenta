import { FC, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { useExchangeContext } from 'contexts/ExchangeContext';
import { baseCurrencyKeyState, baseCurrencyAmountState } from 'store/exchange';

import CurrencyCard from '../CurrencyCard';

const BaseCurrencyCard: FC = memo(() => {
	const { t } = useTranslation();
	const baseCurrencyKey = useRecoilValue(baseCurrencyKeyState);
	const baseCurrencyAmount = useRecoilValue(baseCurrencyAmountState);

	const {
		txProvider,
		baseCurrencyBalance,
		setOpenModal,
		slippagePercent,
		basePriceRate,
		allTokensMap,
		oneInchQuoteQuery,
		onBaseCurrencyAmountChange,
		onBaseBalanceClick,
	} = useExchangeContext();

	const openBaseModal = useCallback(() => setOpenModal('base-select'), [setOpenModal]);

	return (
		<CurrencyCard
			side="base"
			currencyKey={baseCurrencyKey}
			currencyName={baseCurrencyKey ? allTokensMap[baseCurrencyKey]?.name : null}
			disabled={txProvider !== 'synthetix'}
			amount={baseCurrencyAmount}
			onAmountChange={onBaseCurrencyAmountChange}
			walletBalance={baseCurrencyBalance}
			onBalanceClick={onBaseBalanceClick}
			onCurrencySelect={openBaseModal}
			priceRate={basePriceRate}
			label={t('exchange.common.into')}
			slippagePercent={slippagePercent}
			isLoading={txProvider === '1inch' && oneInchQuoteQuery.isFetching}
		/>
	);
});

export default BaseCurrencyCard;
