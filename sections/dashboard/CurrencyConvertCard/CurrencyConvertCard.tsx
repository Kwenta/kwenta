import { FC } from 'react';

import { SYNTHS_MAP } from 'constants/currency';

import { MinimalExchangeFooter, MinimalExchangeCards } from 'styles/common';

import useExchange from 'sections/exchange/hooks/useExchange';

const CurrencyConvertCard: FC = () => {
	const { quoteCurrencyCard, baseCurrencyCard, footerCard } = useExchange({
		displayMode: 'onboard',
		defaultBaseCurrencyKey: SYNTHS_MAP.sUSD,
		defaultQuoteCurrencyKey: 'ETH',
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
