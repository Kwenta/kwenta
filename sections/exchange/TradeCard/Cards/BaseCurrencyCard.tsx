import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { CurrencyKey } from 'constants/currency';
import { useExchangeContext } from 'contexts/ExchangeContext';
import SelectCurrencyModal from 'sections/shared/modals/SelectCurrencyModal';
import {
	baseCurrencyKeyState,
	baseCurrencyAmountState,
	quoteCurrencyAmountState,
	quoteCurrencyKeyState,
	currencyPairState,
} from 'store/exchange';

import CurrencyCard from '../CurrencyCard';

type BaseCurrencyCardProps = {
	allowBaseCurrencySelection?: boolean;
};

const BaseCurrencyCard: React.FC<BaseCurrencyCardProps> = ({ allowBaseCurrencySelection }) => {
	const { t } = useTranslation();
	const baseCurrencyKey = useRecoilValue(baseCurrencyKeyState);
	const quoteCurrencyKey = useRecoilValue(quoteCurrencyKeyState);
	const baseCurrencyAmount = useRecoilValue(baseCurrencyAmountState);
	const setQuoteCurrencyAmount = useSetRecoilState(quoteCurrencyAmountState);
	const setCurrencyPair = useSetRecoilState(currencyPairState);

	const {
		txProvider,
		baseCurrencyBalance,
		openModal,
		setOpenModal,
		slippagePercent,
		routeToBaseCurrency,
		routeToMarketPair,
		basePriceRate,
		allTokensMap,
		oneInchQuoteQuery,
		onBaseCurrencyAmountChange,
		onBaseBalanceClick,
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
				txProvider={txProvider}
			/>
			{openModal === 'base-select' && (
				<SelectCurrencyModal
					onDismiss={() => setOpenModal(undefined)}
					onSelect={(currencyKey) => {
						setQuoteCurrencyAmount('');
						setCurrencyPair((pair) => ({
							base: currencyKey as CurrencyKey,
							quote: pair.quote === currencyKey ? null : pair.quote,
						}));

						if (quoteCurrencyKey != null && quoteCurrencyKey !== currencyKey) {
							routeToMarketPair(currencyKey, quoteCurrencyKey);
						} else {
							routeToBaseCurrency(currencyKey);
						}
					}}
				/>
			)}
		</>
	);
};

export default BaseCurrencyCard;
