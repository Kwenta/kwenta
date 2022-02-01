import {
	NetworkId,
	NetworkIdByName,
	NetworkNameById,
	NetworkName,
} from '@synthetixio/contracts-interface';
import { GasSpeed } from '@synthetixio/queries';
import { atom, selector } from 'recoil';

import { truncateAddress } from 'utils/formatters/string';

import { getWalletKey } from '../utils';

export type Network = {
	id: NetworkId;
	name: NetworkName;
	useOvm?: boolean;
};

export const networkState = atom<Network>({
	key: getWalletKey('network'),
	default: { id: NetworkIdByName.mainnet, name: NetworkNameById[1] },
});

export const isMainnetState = selector<boolean>({
	key: getWalletKey('isMainnet'),
	get: ({ get }) => get(networkState)?.id === NetworkIdByName.mainnet,
});

export const walletAddressState = atom<string | null>({
	key: getWalletKey('walletAddress'),
	default: null,
});

export const isWalletConnectedState = selector<boolean>({
	key: getWalletKey('isWalletConnected'),
	get: ({ get }) => get(walletAddressState) != null,
});

export const truncatedWalletAddressState = selector<string | null>({
	key: getWalletKey('truncatedWalletAddress'),
	get: ({ get }) => {
		const walletAddress = get(walletAddressState);
		if (walletAddress != null) {
			return truncateAddress(walletAddress);
		}
		return walletAddress;
	},
});

export const gasSpeedState = atom<GasSpeed>({
	key: getWalletKey('gasSpeed'),
	default: 'fast',
});

export const customGasPriceState = atom<string>({
	key: getWalletKey('customGasPrice'),
	default: '',
});

export const isL2State = selector<boolean>({
	key: getWalletKey('isL2'),
	get: ({ get }) => {
		return get(networkState)?.useOvm ?? false;
	},
});

export const isL2MainnetState = selector<boolean>({
	key: getWalletKey('isL2-mainnet'),
	get: ({ get }) => {
		return get(networkState)?.id === 10;
	},
});

export const isL1KovanState = selector<boolean>({
	key: getWalletKey('isL1-kovan'),
	get: ({ get }) => {
		return get(networkState)?.id === 42;
	},
});

export const isL2KovanState = selector<boolean>({
	key: getWalletKey('isL2-kovan'),
	get: ({ get }) => {
		return get(networkState)?.id === 69;
	},
});
