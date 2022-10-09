import { FC, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { useAppSelector } from 'state/store';

import { useExchangeContext } from 'contexts/ExchangeContext';
import { baseCurrencyKeyState, baseCurrencyAmountState } from 'store/exchange';

import MobileCurrencyCard from '../TradeCard/CurrencyCard/MobileCurrencyCard';

const MobileBaseCurrencyCard: FC = memo(() => {
	const { t } = useTranslation();
	const baseCurrencyKey = useRecoilValue(baseCurrencyKeyState);
	const baseCurrencyAmount = useRecoilValue(baseCurrencyAmountState);

	const { setOpenModal, onBaseCurrencyAmountChange, onBaseBalanceClick } = useExchangeContext();

	const { baseBalance, basePriceRate, txProvider } = useAppSelector(({ exchange }) => ({
		baseBalance: exchange.baseBalance,
		basePriceRate: exchange.basePriceRate,
		txProvider: exchange.txProvider,
	}));

	const openBaseModal = useCallback(() => setOpenModal('base-select'), [setOpenModal]);

	return (
		<MobileCurrencyCard
			currencyKey={baseCurrencyKey}
			disabled={txProvider !== 'synthetix'}
			amount={baseCurrencyAmount}
			onAmountChange={onBaseCurrencyAmountChange}
			walletBalance={baseBalance}
			onBalanceClick={onBaseBalanceClick}
			onCurrencySelect={openBaseModal}
			priceRate={basePriceRate}
			label={t('exchange.common.into')}
		/>
	);
});

export default MobileBaseCurrencyCard;
