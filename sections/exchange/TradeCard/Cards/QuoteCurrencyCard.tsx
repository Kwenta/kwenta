import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { useExchangeContext } from 'contexts/ExchangeContext';
import SelectCurrencyModal from 'sections/shared/modals/SelectCurrencyModal';
import { quoteCurrencyKeyState, quoteCurrencyAmountState } from 'store/exchange';

import CurrencyCard from '../CurrencyCard';

type QuoteCurrencyCardProps = {
	allowQuoteCurrencySelection?: boolean;
};

const QuoteCurrencyCard: React.FC<QuoteCurrencyCardProps> = ({ allowQuoteCurrencySelection }) => {
	const { t } = useTranslation();
	const quoteCurrencyKey = useRecoilValue(quoteCurrencyKeyState);
	const quoteCurrencyAmount = useRecoilValue(quoteCurrencyAmountState);

	const {
		quoteCurrencyBalance,
		openModal,
		setOpenModal,
		allTokensMap,
		quotePriceRate,
		onQuoteCurrencyAmountChange,
		onQuoteBalanceClick,
		onQuoteCurrencyChange,
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
			/>
			{openModal === 'quote-select' && (
				<SelectCurrencyModal
					onDismiss={() => setOpenModal(undefined)}
					onSelect={onQuoteCurrencyChange}
				/>
			)}
		</>
	);
};

export default QuoteCurrencyCard;
