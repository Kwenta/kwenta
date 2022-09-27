import { createSelector } from '@reduxjs/toolkit';

import { WalletState } from './types';

const SUPPORTED_NETWORKS = [1, 10, 5, 420];

export const isUnsupportedNetwork = createSelector(
	(state: WalletState) => state.networkId,
	(networkId) => networkId && !SUPPORTED_NETWORKS.includes(networkId)
);

export const isWalletConnected = createSelector(
	(state: WalletState) => state.walletAddress,
	(walletAddress) => !!walletAddress
);

export const isL2 = createSelector(
	(state: WalletState) => state.networkId,
	(networkId) => networkId && (networkId === 10 || networkId === 420)
);

export const isL1 = createSelector(
	(state: WalletState) => state.networkId,
	(networkId) => networkId && (networkId === 1 || networkId === 5)
);

export const isTestnet = createSelector(
	(state: WalletState) => state.networkId,
	(networkId) => networkId && (networkId === 5 || networkId === 420)
);

export const isMainnet = createSelector(
	(state: WalletState) => state.networkId,
	(networkId) => networkId && (networkId === 5 || networkId === 420)
);
