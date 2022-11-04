import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from 'state/store';

const SUPPORTED_NETWORKS = [1, 10, 5, 420];

export const selectIsUnsupportedNetwork = createSelector(
	(state: RootState) => state.wallet.networkId,
	(networkId) => networkId && !SUPPORTED_NETWORKS.includes(networkId)
);

export const selectIsWalletConnected = createSelector(
	(state: RootState) => state.wallet.walletAddress,
	(walletAddress) => !!walletAddress
);

export const selectIsL2 = createSelector(
	(state: RootState) => state.wallet.networkId,
	(networkId) => networkId && (networkId === 10 || networkId === 420)
);

export const selectIsL1 = createSelector(
	(state: RootState) => state.wallet.networkId,
	(networkId) => networkId && (networkId === 1 || networkId === 5)
);

export const selectIsTestnet = createSelector(
	(state: RootState) => state.wallet.networkId,
	(networkId) => networkId && (networkId === 5 || networkId === 420)
);

export const selectIsMainnet = createSelector(
	(state: RootState) => state.wallet.networkId,
	(networkId) => networkId && (networkId === 5 || networkId === 420)
);
