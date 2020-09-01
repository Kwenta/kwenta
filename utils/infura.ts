import { NetworkId } from '@synthetixio/js';

export const GWEI_UNIT = 1000000000;

export const getInfuraRpcURL = (networkId: NetworkId) =>
	`https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`;
