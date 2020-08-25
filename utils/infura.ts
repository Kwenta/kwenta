import { NetworkIds, SUPPORTED_NETWORKS } from '@synthetixio/js';

export const GWEI_UNIT = 1000000000;

export const getInfuraRpcURL = (networkId: NetworkIds) =>
	`https://${SUPPORTED_NETWORKS[networkId]}.infura.io/v3/${process.env.INFURA_PROJECT_ID}`;
