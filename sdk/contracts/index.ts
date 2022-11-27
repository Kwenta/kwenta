import { NetworkId } from '@synthetixio/contracts-interface';
import { Contract, ethers } from 'ethers';

import { ADDRESSES } from './constants';
import {
	CrossMarginAccountFactory__factory,
	CrossMarginBaseSettings__factory,
	ExchangeRates__factory,
	Exchanger__factory,
	FuturesMarketData__factory,
	FuturesMarketSettings__factory,
	RewardEscrow__factory,
	Synthetix__factory,
	SynthRedeemer__factory,
	SynthSwap__factory,
	SynthUtil__factory,
	SystemSettings__factory,
	SystemStatus__factory,
	KwentaArrakisVault__factory,
	ERC20__factory,
	SupplySchedule__factory,
	MultipleMerkleDistributor__factory,
	StakingRewards__factory,
	VKwentaRedeemer__factory,
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
	provider: ethers.providers.Provider
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
			? KwentaArrakisVault__factory.connect(ADDRESSES.KwentaArrakisVault[networkId], provider)
			: undefined,
		StakingRewards: ADDRESSES.StakingRewards[networkId]
			? StakingRewards__factory.connect(ADDRESSES.StakingRewards[networkId], provider)
			: undefined,
		RewardEscrow: ADDRESSES.RewardEscrow[networkId]
			? RewardEscrow__factory.connect(ADDRESSES.RewardEscrow[networkId], provider)
			: undefined,
		KwentaToken: ADDRESSES.KwentaToken[networkId]
			? ERC20__factory.connect(ADDRESSES.KwentaToken[networkId], provider)
			: undefined,
		SupplySchedule: ADDRESSES.SupplySchedule[networkId]
			? SupplySchedule__factory.connect(ADDRESSES.SupplySchedule[networkId], provider)
			: undefined,
		vKwentaToken: ADDRESSES.vKwentaToken[networkId]
			? ERC20__factory.connect(ADDRESSES.vKwentaToken[networkId], provider)
			: undefined,
		MultipleMerkleDistributor: ADDRESSES.TradingRewards[networkId]
			? MultipleMerkleDistributor__factory.connect(ADDRESSES.TradingRewards[networkId], provider)
			: undefined,
		veKwentaToken: ADDRESSES.veKwentaToken[networkId]
			? ERC20__factory.connect(ADDRESSES.veKwentaToken[networkId], provider)
			: undefined,
		KwentaStakingRewards: ADDRESSES.KwentaStakingRewards[networkId]
			? StakingRewards__factory.connect(ADDRESSES.KwentaStakingRewards[networkId], provider)
			: undefined,
		vKwentaRedeemer: ADDRESSES.vKwentaRedeemer[networkId]
			? VKwentaRedeemer__factory.connect(ADDRESSES.vKwentaRedeemer[networkId], provider)
			: undefined,
		veKwentaRedeemer: ADDRESSES.veKwentaRedeemer[networkId]
			? VKwentaRedeemer__factory.connect(ADDRESSES.veKwentaRedeemer[networkId], provider)
			: undefined,
	};
};

export type ContractsMap = ReturnType<typeof getContractsByNetwork>;
export type ContractName = keyof ContractsMap;
