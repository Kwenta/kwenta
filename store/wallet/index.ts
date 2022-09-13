import {
	NetworkId,
	NetworkIdByName,
	NetworkNameById,
	NetworkName,
} from '@synthetixio/contracts-interface';
import { GasSpeed } from '@synthetixio/queries';
import { atom, selector } from 'recoil';

import { getWalletKey } from '../utils';

export type Network = {
	id: NetworkId;
	name: NetworkName;
	useOvm?: boolean;
};

export const networkState = atom<Network>({
	key: getWalletKey('network'),
	default: { id: NetworkIdByName['mainnet-ovm'], name: NetworkNameById[10] },
});

export const gasSpeedState = atom<GasSpeed>({
	key: getWalletKey('gasSpeed'),
	default: 'fast',
});

export const customGasPriceState = atom<string>({
	key: getWalletKey('customGasPrice'),
	default: '',
});

export const isL2MainnetState = selector<boolean>({
	key: getWalletKey('isL2-mainnet'),
	get: ({ get }) => {
		return get(networkState)?.id === 10;
	},
});
