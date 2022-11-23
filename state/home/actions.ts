import { createAsyncThunk } from '@reduxjs/toolkit';
import { providers } from 'ethers';

import { FuturesMarket } from 'sdk/types/futures';
import { ThunkConfig } from 'state/types';
import { serializeMarkets } from 'utils/futures';

export const fetchOptimismMarkets = createAsyncThunk<
	{ markets: FuturesMarket<string>[] },
	providers.Provider,
	ThunkConfig
>('home/fetchOptimismMarkets', async (mainnetL2Provider, { extra: { sdk } }) => {
	// For the home page we always fetch OP mainnet markets
	const markets = await sdk.futures.getMarkets({ provider: mainnetL2Provider, networkId: 10 });
	const serializedMarkets = serializeMarkets(markets);
	return { markets: serializedMarkets };
});
