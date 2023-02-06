import { NetworkId } from '@synthetixio/contracts-interface';
import { Contract as EthCallContract } from 'ethcall';
import { Contract, ethers } from 'ethers';

import ERC20ABI from '../contracts/abis/ERC20.json';
import MultipleMerkleDistributorABI from '../contracts/abis/MultipleMerkleDistributor.json';
import RewardEscrowABI from '../contracts/abis/RewardEscrow.json';
import SupplyScheduleABI from '../contracts/abis/SupplySchedule.json';
import CrossMarginBaseSettingsABI from './abis/CrossMarginBaseSettings.json';
import ExchangeRatesABI from './abis/ExchangeRates.json';
import FuturesMarketDataABI from './abis/FuturesMarketData.json';
import FuturesMarketSettingsABI from './abis/FuturesMarketSettings.json';
import KwentaArrakisVaultABI from './abis/KwentaArrakisVault.json';
import KwentaStakingRewardsABI from './abis/KwentaStakingRewards.json';
import PerpsV2MarketABI from './abis/PerpsV2Market.json';
import PerpsV2MarketDataABI from './abis/PerpsV2MarketData.json';
import PerpsV2MarketSettingsABI from './abis/PerpsV2MarketSettings.json';
import StakingRewardsABI from './abis/StakingRewards.json';
import SynthRedeemerABI from './abis/SynthRedeemer.json';
import { ADDRESSES } from './constants';
import {
	CrossMarginAccountFactory__factory,
	CrossMarginBaseSettings__factory,
	ExchangeRates__factory,
	Exchanger__factory,
	FuturesMarketData__factory,
	FuturesMarketSettings__factory,
	PerpsV2MarketData__factory,
	PerpsV2MarketSettings__factory,
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
	KwentaStakingRewards__factory,
	VKwentaRedeemer__factory,
	StakingRewards__factory,
	VeKwentaRedeemer__factory,
	Pyth__factory,
} from './types';

type ContractFactory = {
	connect: (address: string, provider: ethers.providers.Provider) => Contract;
};

export type AllContractsMap = Record<
	ContractName,
	{ addresses: Partial<Record<NetworkId, string>>; Factory: ContractFactory }
>;

export const getPerpsV2MarketMulticall = (marketAddress: string) =>
	new EthCallContract(marketAddress, PerpsV2MarketABI);

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
		PerpsV2MarketData: ADDRESSES.PerpsV2MarketData[networkId]
			? PerpsV2MarketData__factory.connect(ADDRESSES.PerpsV2MarketData[networkId], provider)
			: undefined,
		PerpsV2MarketSettings: ADDRESSES.PerpsV2MarketSettings[networkId]
			? PerpsV2MarketSettings__factory.connect(ADDRESSES.PerpsV2MarketSettings[networkId], provider)
			: undefined,
		Pyth: ADDRESSES.Pyth[networkId]
			? Pyth__factory.connect(ADDRESSES.Pyth[networkId], provider)
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
			? KwentaStakingRewards__factory.connect(ADDRESSES.KwentaStakingRewards[networkId], provider)
			: undefined,
		vKwentaRedeemer: ADDRESSES.vKwentaRedeemer[networkId]
			? VKwentaRedeemer__factory.connect(ADDRESSES.vKwentaRedeemer[networkId], provider)
			: undefined,
		veKwentaRedeemer: ADDRESSES.veKwentaRedeemer[networkId]
			? VeKwentaRedeemer__factory.connect(ADDRESSES.veKwentaRedeemer[networkId], provider)
			: undefined,
	};
};

export const getMulticallContractsByNetwork = (networkId: NetworkId) => {
	return {
		SynthRedeemer: ADDRESSES.SynthRedeemer[networkId]
			? new EthCallContract(ADDRESSES.SynthRedeemer[networkId], SynthRedeemerABI)
			: undefined,
		CrossMarginBaseSettings: ADDRESSES.CrossMarginBaseSettings[networkId]
			? new EthCallContract(
					ADDRESSES.CrossMarginBaseSettings[networkId],
					CrossMarginBaseSettingsABI
			  )
			: undefined,
		ExchangeRates: ADDRESSES.ExchangeRates[networkId]
			? new EthCallContract(ADDRESSES.ExchangeRates[networkId], ExchangeRatesABI)
			: undefined,
		FuturesMarketData: ADDRESSES.FuturesMarketData[networkId]
			? new EthCallContract(ADDRESSES.FuturesMarketData[networkId], FuturesMarketDataABI)
			: undefined,
		FuturesMarketSettings: ADDRESSES.FuturesMarketSettings[networkId]
			? new EthCallContract(ADDRESSES.FuturesMarketSettings[networkId], FuturesMarketSettingsABI)
			: undefined,
		PerpsV2MarketData: ADDRESSES.PerpsV2MarketData[networkId]
			? new EthCallContract(ADDRESSES.PerpsV2MarketData[networkId], PerpsV2MarketDataABI)
			: undefined,
		PerpsV2MarketSettings: ADDRESSES.PerpsV2MarketSettings[networkId]
			? new EthCallContract(ADDRESSES.PerpsV2MarketSettings[networkId], PerpsV2MarketSettingsABI)
			: undefined,
		StakingRewards: ADDRESSES.StakingRewards[networkId]
			? new EthCallContract(ADDRESSES.StakingRewards[networkId], StakingRewardsABI)
			: undefined,
		KwentaArrakisVault: ADDRESSES.KwentaArrakisVault[networkId]
			? new EthCallContract(ADDRESSES.KwentaArrakisVault[networkId], KwentaArrakisVaultABI)
			: undefined,
		RewardEscrow: ADDRESSES.RewardEscrow[networkId]
			? new EthCallContract(ADDRESSES.RewardEscrow[networkId], RewardEscrowABI)
			: undefined,
		KwentaStakingRewards: ADDRESSES.KwentaStakingRewards[networkId]
			? new EthCallContract(ADDRESSES.KwentaStakingRewards[networkId], KwentaStakingRewardsABI)
			: undefined,
		KwentaToken: ADDRESSES.KwentaToken[networkId]
			? new EthCallContract(ADDRESSES.KwentaToken[networkId], ERC20ABI)
			: undefined,
		MultipleMerkleDistributor: ADDRESSES.TradingRewards[networkId]
			? new EthCallContract(ADDRESSES.TradingRewards[networkId], MultipleMerkleDistributorABI)
			: undefined,
		vKwentaToken: ADDRESSES.vKwentaToken[networkId]
			? new EthCallContract(ADDRESSES.vKwentaToken[networkId], ERC20ABI)
			: undefined,
		veKwentaToken: ADDRESSES.veKwentaToken[networkId]
			? new EthCallContract(ADDRESSES.veKwentaToken[networkId], ERC20ABI)
			: undefined,
		SupplySchedule: ADDRESSES.SupplySchedule[networkId]
			? new EthCallContract(ADDRESSES.SupplySchedule[networkId], SupplyScheduleABI)
			: undefined,
	};
};

export type ContractsMap = ReturnType<typeof getContractsByNetwork>;
export type MulticallContractsMap = ReturnType<typeof getMulticallContractsByNetwork>;
export type ContractName = keyof ContractsMap;
