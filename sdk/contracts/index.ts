import { NetworkId } from '@synthetixio/contracts-interface';
import { Contract, ethers } from 'ethers';

import { KwentaArrakisVaultABI, StakingRewardsABI } from './abis/main';
import { ADDRESSES } from './constants';
import {
	CrossMarginAccountFactory__factory,
	CrossMarginBaseSettings__factory,
	ERC20__factory,
	ExchangeRates__factory,
	Exchanger__factory,
	FuturesMarketData__factory,
	FuturesMarketSettings__factory,
	Synthetix__factory,
	SynthRedeemer__factory,
	SynthSwap__factory,
	SynthUtil__factory,
	SystemSettings__factory,
	SystemStatus__factory,
} from './types';

type ContractFactory = {
	connect: (address: string, provider: ethers.providers.Provider) => Contract;
};

export type AllContractsMap = Record<
	ContractName,
	{ addresses: Partial<Record<NetworkId, string>>; Factory: ContractFactory }
>;

export const getContractsByNetwork = (
	networkId: NetworkId,
	provider: ethers.providers.Provider | ethers.Signer
) => {
	return {
		Exchanger: ADDRESSES.Exchanger[networkId]
			? Exchanger__factory.connect(ADDRESSES.Exchanger[networkId], provider)
			: undefined,
		ExchangeRates: ADDRESSES.ExchangeRates[networkId]
			? ExchangeRates__factory.connect(ADDRESSES.ExchangeRates[networkId], provider)
			: undefined,
		SystemStatus: ADDRESSES.SystemStatus[networkId]
			? SystemStatus__factory.connect(ADDRESSES.SystemStatus[networkId], provider)
			: undefined,
		SynthUtil: ADDRESSES.SynthUtil[networkId]
			? SynthUtil__factory.connect(ADDRESSES.SynthUtil[networkId], provider)
			: undefined,
		SystemSettings: ADDRESSES.SystemSettings[networkId]
			? SystemSettings__factory.connect(ADDRESSES.SystemSettings[networkId], provider)
			: undefined,
		SynthRedeemer: ADDRESSES.SynthRedeemer[networkId]
			? SynthRedeemer__factory.connect(ADDRESSES.SynthRedeemer[networkId], provider)
			: undefined,
		FuturesMarketData: ADDRESSES.FuturesMarketData[networkId]
			? FuturesMarketData__factory.connect(ADDRESSES.FuturesMarketData[networkId], provider)
			: undefined,
		FuturesMarketSettings: ADDRESSES.FuturesMarketSettings[networkId]
			? FuturesMarketSettings__factory.connect(ADDRESSES.FuturesMarketSettings[networkId], provider)
			: undefined,
		Synthetix: ADDRESSES.Synthetix[networkId]
			? Synthetix__factory.connect(ADDRESSES.Synthetix[networkId], provider)
			: undefined,
		SynthSwap: ADDRESSES.SynthSwap[networkId]
			? SynthSwap__factory.connect(ADDRESSES.SynthSwap[networkId], provider)
			: undefined,
		SUSD: ADDRESSES.SUSD[networkId]
			? ERC20__factory.connect(ADDRESSES.SUSD[networkId], provider)
			: undefined,
		CrossMarginAccountFactory: ADDRESSES.CrossMarginAccountFactory[networkId]
			? CrossMarginAccountFactory__factory.connect(
					ADDRESSES.CrossMarginAccountFactory[networkId],
					provider
			  )
			: undefined,
		CrossMarginBaseSettings: ADDRESSES.CrossMarginBaseSettings[networkId]
			? CrossMarginBaseSettings__factory.connect(
					ADDRESSES.CrossMarginBaseSettings[networkId],
					provider
			  )
			: undefined,
		// TODO: Replace these when we move away from wagmi hooks
		KwentaArrakisVault: ADDRESSES.KwentaArrakisVault[networkId]
			? new Contract(ADDRESSES.KwentaArrakisVault[networkId], KwentaArrakisVaultABI, provider)
			: undefined,
		StakingRewards: ADDRESSES.StakingRewards[networkId]
			? new Contract(ADDRESSES.StakingRewards[networkId], StakingRewardsABI, provider)
			: undefined,
	};
};

export type ContractsMap = ReturnType<typeof getContractsByNetwork>;
export type ContractName = keyof ContractsMap;
