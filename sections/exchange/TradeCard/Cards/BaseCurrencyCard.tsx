import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { useExchangeContext } from 'contexts/ExchangeContext';
import SelectCurrencyModal from 'sections/shared/modals/SelectCurrencyModal';
import { baseCurrencyKeyState, baseCurrencyAmountState } from 'store/exchange';

import CurrencyCard from '../CurrencyCard';

type BaseCurrencyCardProps = {
	allowBaseCurrencySelection?: boolean;
};

const BaseCurrencyCard: React.FC<BaseCurrencyCardProps> = ({ allowBaseCurrencySelection }) => {
	const { t } = useTranslation();
	const baseCurrencyKey = useRecoilValue(baseCurrencyKeyState);
	const baseCurrencyAmount = useRecoilValue(baseCurrencyAmountState);

	const {
		txProvider,
		baseCurrencyBalance,
		openModal,
		setOpenModal,
		slippagePercent,
		basePriceRate,
		allTokensMap,
		oneInchQuoteQuery,
		onBaseCurrencyAmountChange,
		onBaseBalanceClick,
		onBaseCurrencyChange,
	} = useExchangeContext();

	return (
		<>
			<CurrencyCard
				side="base"
				currencyKey={baseCurrencyKey}
				currencyName={baseCurrencyKey ? allTokensMap[baseCurrencyKey]?.name : null}
				disabled={txProvider !== 'synthetix'}
				amount={baseCurrencyAmount}
				onAmountChange={onBaseCurrencyAmountChange}
				walletBalance={baseCurrencyBalance}
				onBalanceClick={onBaseBalanceClick}
				onCurrencySelect={
					allowBaseCurrencySelection ? () => setOpenModal('base-select') : undefined
				}
				priceRate={basePriceRate}
				label={t('exchange.common.into')}
				slippagePercent={slippagePercent}
				isLoading={txProvider === '1inch' && oneInchQuoteQuery.isFetching}
			/>
			{openModal === 'base-select' && (
				<SelectCurrencyModal
					onDismiss={() => setOpenModal(undefined)}
					onSelect={onBaseCurrencyChange}
				/>
			)}
		</>
	);
};

export default BaseCurrencyCard;
