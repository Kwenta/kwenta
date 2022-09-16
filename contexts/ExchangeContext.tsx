import { createContext, useContext } from 'react';

import useExchange from 'hooks/useExchange';

export const ExchangeContext = createContext<ReturnType<typeof useExchange> | undefined>(undefined);

export const useExchangeContext = () => {
	const exchangeContext = useContext(ExchangeContext);

	if (!exchangeContext) throw new Error('Exchange context not created');

	return exchangeContext;
};
