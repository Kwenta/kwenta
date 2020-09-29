import { Network } from 'store/wallet';

export const GWEI_UNIT = 1000000000;

export const getInfuraRpcURL = (network: Network) =>
	`https://${network.name}.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`;
