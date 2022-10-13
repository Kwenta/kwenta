import React from 'react';

import useFuturesData from 'hooks/useFuturesData';

export const FuturesContext = React.createContext<ReturnType<typeof useFuturesData> | undefined>(
	undefined
);

export const useFuturesContext = () => {
	const futuresContext = React.useContext(FuturesContext);

	if (!futuresContext) throw new Error('Futures context not defined yet.');

	return futuresContext;
};
