import { FC } from 'react';

import { CRYPTO_CURRENCY_MAP, SYNTHS_MAP } from 'constants/currency';

import { MinimalExchangeFooter, MinimalExchangeCards } from 'styles/common';

import useExchange from 'sections/exchange/hooks/useExchange';

const CurrencyConvertCard: FC = () => {
	const { quoteCurrencyCard, baseCurrencyCard, footerCard } = useExchange({
		displayMode: 'onboard',
		defaultBaseCurrencyKey: SYNTHS_MAP.sUSD,
		defaultQuoteCurrencyKey: CRYPTO_CURRENCY_MAP.ETH,
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
