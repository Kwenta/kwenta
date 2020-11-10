import { FC } from 'react';

import { CRYPTO_CURRENCY_MAP, SYNTHS_MAP } from 'constants/currency';

import { MinimalExchangeFooter, MinimalExchangeCards } from 'styles/common';

import useExchange from 'sections/exchange/hooks/useExchange';

const CurrencyConvertCard: FC = () => {
	const { quoteCurrencyCard, baseCurrencyCard, footerCard } = useExchange({
		defaultBaseCurrencyKey: SYNTHS_MAP.sUSD,
		defaultQuoteCurrencyKey: CRYPTO_CURRENCY_MAP.ETH,
		footerCardAttached: true,
		persistSelectedCurrencies: false,
		allowCurrencySelection: false,
		showNoSynthsCard: false,
	});

	return (
		<>
			<MinimalExchangeCards>
				{quoteCurrencyCard}
				{baseCurrencyCard}
			</MinimalExchangeCards>
			<MinimalExchangeFooter>{footerCard}</MinimalExchangeFooter>
		</>
	);
};

export default CurrencyConvertCard;
