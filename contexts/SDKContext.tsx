import { createContext, useContext } from 'react';
import { sdk } from 'state/store';

export const SDKContext = createContext({
	setProvider: sdk.setProvider,
	setNetworkId: sdk.setNetworkId,
});

export const useSDKContext = () => useContext(SDKContext);
