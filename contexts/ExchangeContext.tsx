import React from 'react';
import useExchange from 'sections/exchange/hooks/useExchange';

export const ExchangeContext = React.createContext<ReturnType<typeof useExchange> | undefined>(
	undefined
);

export const useExchangeContext = () => {
	const exchangeContext = React.useContext(ExchangeContext);

	if (!exchangeContext) throw new Error('Exchange context not created');

	return exchangeContext;
};
