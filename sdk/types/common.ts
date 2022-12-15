import { NetworkId } from '@synthetixio/contracts-interface';
import { providers } from 'ethers';

export type NetworkOverrideOptions = {
	networkId: NetworkId;
	provider: providers.Provider;
};

export enum TransactionStatus {
	AwaitingExecution = 'AwaitingExecution',
	Executed = 'Executed',
	Confirmed = 'Confirmed',
	Failed = 'Failed',
}
