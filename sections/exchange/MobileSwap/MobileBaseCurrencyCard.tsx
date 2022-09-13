import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { useExchangeContext } from 'contexts/ExchangeContext';
import { baseCurrencyKeyState, baseCurrencyAmountState } from 'store/exchange';

import MobileCurrencyCard from '../TradeCard/CurrencyCard/MobileCurrencyCard';

const MobileBaseCurrencyCard: React.FC = React.memo(() => {
	const { t } = useTranslation();
	const baseCurrencyKey = useRecoilValue(baseCurrencyKeyState);
	const baseCurrencyAmount = useRecoilValue(baseCurrencyAmountState);

	const {
		txProvider,
		baseCurrencyBalance,
		setOpenModal,
		basePriceRate,
		onBaseCurrencyAmountChange,
		onBaseBalanceClick,
	} = useExchangeContext();

	const openBaseModal = React.useCallback(() => setOpenModal('base-select'), [setOpenModal]);

	return (
		<MobileCurrencyCard
			currencyKey={baseCurrencyKey}
			disabled={txProvider !== 'synthetix'}
			amount={baseCurrencyAmount}
			onAmountChange={onBaseCurrencyAmountChange}
			walletBalance={baseCurrencyBalance}
			onBalanceClick={onBaseBalanceClick}
			onCurrencySelect={openBaseModal}
			priceRate={basePriceRate}
			label={t('exchange.common.into')}
		/>
	);
});

export default MobileBaseCurrencyCard;
