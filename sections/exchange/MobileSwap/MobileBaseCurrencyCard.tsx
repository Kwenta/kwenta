import { FC, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { setBaseAmount, setMaxBaseBalance, setOpenModal } from 'state/exchange/reducer';
import { selectBaseBalanceWei } from 'state/exchange/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';

import MobileCurrencyCard from '../TradeCard/CurrencyCard/MobileCurrencyCard';

const MobileBaseCurrencyCard: FC = memo(() => {
	const { t } = useTranslation();

	const dispatch = useAppDispatch();

	const onBaseCurrencyAmountChange = (value: string) => {
		dispatch(setBaseAmount({ value }));
	};

	const onBaseBalanceClick = () => {
		dispatch(setMaxBaseBalance());
	};

	const { baseCurrencyKey, baseAmount, basePriceRate, txProvider } = useAppSelector(
		({ exchange }) => ({
			baseCurrencyKey: exchange.baseCurrencyKey,
			baseAmount: exchange.baseAmount,
			basePriceRate: exchange.basePriceRate,
			txProvider: exchange.txProvider,
		})
	);

	const baseBalance = useAppSelector(selectBaseBalanceWei);

	const openBaseModal = useCallback(() => dispatch(setOpenModal('base-select')), [dispatch]);

	return (
		<MobileCurrencyCard
			currencyKey={baseCurrencyKey}
			disabled={txProvider !== 'synthetix'}
			amount={baseAmount}
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
