import { providers } from 'ethers';

export type NetworkId = 1 | 5 | 420 | 10 | 42 | 69 | 31337;

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
