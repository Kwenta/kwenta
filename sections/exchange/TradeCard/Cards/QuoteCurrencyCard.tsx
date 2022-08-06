import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { CurrencyKey } from 'constants/currency';
import { useExchangeContext } from 'contexts/ExchangeContext';
import SelectCurrencyModal from 'sections/shared/modals/SelectCurrencyModal';
import {
	baseCurrencyKeyState,
	quoteCurrencyKeyState,
	baseCurrencyAmountState,
	quoteCurrencyAmountState,
	currencyPairState,
} from 'store/exchange';

import CurrencyCard from '../CurrencyCard';

type QuoteCurrencyCardProps = {
	allowQuoteCurrencySelection?: boolean;
};

const QuoteCurrencyCard: React.FC<QuoteCurrencyCardProps> = ({ allowQuoteCurrencySelection }) => {
	const { t } = useTranslation();
	const baseCurrencyKey = useRecoilValue(baseCurrencyKeyState);
	const quoteCurrencyKey = useRecoilValue(quoteCurrencyKeyState);
	const setBaseCurrencyAmount = useSetRecoilState(baseCurrencyAmountState);
	const quoteCurrencyAmount = useRecoilValue(quoteCurrencyAmountState);
	const setCurrencyPair = useSetRecoilState(currencyPairState);

	const {
		txProvider,
		quoteCurrencyBalance,
		openModal,
		setOpenModal,
		routeToMarketPair,
		allTokensMap,
		quotePriceRate,
		onQuoteCurrencyAmountChange,
		onQuoteBalanceClick,
	} = useExchangeContext();

	return (
		<>
			<CurrencyCard
				side="quote"
				currencyKey={quoteCurrencyKey}
				currencyName={quoteCurrencyKey ? allTokensMap[quoteCurrencyKey]?.name : null}
				amount={quoteCurrencyAmount}
				onAmountChange={onQuoteCurrencyAmountChange}
				walletBalance={quoteCurrencyBalance}
				onBalanceClick={onQuoteBalanceClick}
				onCurrencySelect={
					allowQuoteCurrencySelection ? () => setOpenModal('quote-select') : undefined
				}
				priceRate={quotePriceRate}
				label={t('exchange.common.from')}
				txProvider={txProvider}
			/>
			{openModal === 'quote-select' && (
				<SelectCurrencyModal
					onDismiss={() => setOpenModal(undefined)}
					onSelect={(currencyKey) => {
						setBaseCurrencyAmount('');

						setCurrencyPair((pair) => ({
							base: pair.base === currencyKey ? null : pair.base,
							quote: currencyKey as CurrencyKey,
						}));
						if (baseCurrencyKey && baseCurrencyKey !== currencyKey) {
							routeToMarketPair(baseCurrencyKey, currencyKey);
						}
					}}
				/>
			)}
		</>
	);
};

export default QuoteCurrencyCard;
