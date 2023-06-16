"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMulticallContractsByNetwork = exports.getContractsByNetwork = exports.getPerpsV2MarketMulticall = void 0;
const ethcall_1 = require("ethcall");
const ERC20_json_1 = __importDefault(require("./abis/ERC20.json"));
const MultipleMerkleDistributor_json_1 = __importDefault(require("./abis/MultipleMerkleDistributor.json"));
const MultipleMerkleDistributorPerpsV2_json_1 = __importDefault(require("./abis/MultipleMerkleDistributorPerpsV2.json"));
const RewardEscrow_json_1 = __importDefault(require("./abis/RewardEscrow.json"));
const SupplySchedule_json_1 = __importDefault(require("./abis/SupplySchedule.json"));
const DappMaintenance_json_1 = __importDefault(require("./abis/DappMaintenance.json"));
const ExchangeRates_json_1 = __importDefault(require("./abis/ExchangeRates.json"));
const FuturesMarketData_json_1 = __importDefault(require("./abis/FuturesMarketData.json"));
const FuturesMarketSettings_json_1 = __importDefault(require("./abis/FuturesMarketSettings.json"));
const KwentaArrakisVault_json_1 = __importDefault(require("./abis/KwentaArrakisVault.json"));
const KwentaStakingRewards_json_1 = __importDefault(require("./abis/KwentaStakingRewards.json"));
const MultipleMerkleDistributorOp_json_1 = __importDefault(require("./abis/MultipleMerkleDistributorOp.json"));
const PerpsV2Market_json_1 = __importDefault(require("./abis/PerpsV2Market.json"));
const PerpsV2MarketData_json_1 = __importDefault(require("./abis/PerpsV2MarketData.json"));
const PerpsV2MarketSettings_json_1 = __importDefault(require("./abis/PerpsV2MarketSettings.json"));
const StakingRewards_json_1 = __importDefault(require("./abis/StakingRewards.json"));
const SynthRedeemer_json_1 = __importDefault(require("./abis/SynthRedeemer.json"));
const SystemStatus_json_1 = __importDefault(require("./abis/SystemStatus.json"));
const constants_1 = require("./constants");
const types_1 = require("./types");
const PerpsV2MarketData__factory_1 = require("./types/factories/PerpsV2MarketData__factory");
const PerpsV2MarketSettings__factory_1 = require("./types/factories/PerpsV2MarketSettings__factory");
const getPerpsV2MarketMulticall = (marketAddress) => new ethcall_1.Contract(marketAddress, PerpsV2Market_json_1.default);
exports.getPerpsV2MarketMulticall = getPerpsV2MarketMulticall;
const getContractsByNetwork = (networkId, provider) => {
    return {
        Exchanger: constants_1.ADDRESSES.Exchanger[networkId]
            ? types_1.Exchanger__factory.connect(constants_1.ADDRESSES.Exchanger[networkId], provider)
            : undefined,
        ExchangeRates: constants_1.ADDRESSES.ExchangeRates[networkId]
            ? types_1.ExchangeRates__factory.connect(constants_1.ADDRESSES.ExchangeRates[networkId], provider)
            : undefined,
        SystemStatus: constants_1.ADDRESSES.SystemStatus[networkId]
            ? types_1.SystemStatus__factory.connect(constants_1.ADDRESSES.SystemStatus[networkId], provider)
            : undefined,
        SynthUtil: constants_1.ADDRESSES.SynthUtil[networkId]
            ? types_1.SynthUtil__factory.connect(constants_1.ADDRESSES.SynthUtil[networkId], provider)
            : undefined,
        SystemSettings: constants_1.ADDRESSES.SystemSettings[networkId]
            ? types_1.SystemSettings__factory.connect(constants_1.ADDRESSES.SystemSettings[networkId], provider)
            : undefined,
        SynthRedeemer: constants_1.ADDRESSES.SynthRedeemer[networkId]
            ? types_1.SynthRedeemer__factory.connect(constants_1.ADDRESSES.SynthRedeemer[networkId], provider)
            : undefined,
        FuturesMarketData: constants_1.ADDRESSES.FuturesMarketData[networkId]
            ? types_1.FuturesMarketData__factory.connect(constants_1.ADDRESSES.FuturesMarketData[networkId], provider)
            : undefined,
        PerpsV2MarketData: constants_1.ADDRESSES.PerpsV2MarketData[networkId]
            ? PerpsV2MarketData__factory_1.PerpsV2MarketData__factory.connect(constants_1.ADDRESSES.PerpsV2MarketData[networkId], provider)
            : undefined,
        PerpsV2MarketSettings: constants_1.ADDRESSES.PerpsV2MarketSettings[networkId]
            ? PerpsV2MarketSettings__factory_1.PerpsV2MarketSettings__factory.connect(constants_1.ADDRESSES.PerpsV2MarketSettings[networkId], provider)
            : undefined,
        Pyth: constants_1.ADDRESSES.Pyth[networkId]
            ? types_1.Pyth__factory.connect(constants_1.ADDRESSES.Pyth[networkId], provider)
            : undefined,
        FuturesMarketSettings: constants_1.ADDRESSES.FuturesMarketSettings[networkId]
            ? types_1.FuturesMarketSettings__factory.connect(constants_1.ADDRESSES.FuturesMarketSettings[networkId], provider)
            : undefined,
        Synthetix: constants_1.ADDRESSES.Synthetix[networkId]
            ? types_1.Synthetix__factory.connect(constants_1.ADDRESSES.Synthetix[networkId], provider)
            : undefined,
        SynthSwap: constants_1.ADDRESSES.SynthSwap[networkId]
            ? types_1.SynthSwap__factory.connect(constants_1.ADDRESSES.SynthSwap[networkId], provider)
            : undefined,
        SUSD: constants_1.ADDRESSES.SUSD[networkId]
            ? types_1.ERC20__factory.connect(constants_1.ADDRESSES.SUSD[networkId], provider)
            : undefined,
        SmartMarginAccountFactory: constants_1.ADDRESSES.SmartMarginAccountFactory[networkId]
            ? types_1.SmartMarginAccountFactory__factory.connect(constants_1.ADDRESSES.SmartMarginAccountFactory[networkId], provider)
            : undefined,
        // TODO: Replace these when we move away from wagmi hooks
        KwentaArrakisVault: constants_1.ADDRESSES.KwentaArrakisVault[networkId]
            ? types_1.KwentaArrakisVault__factory.connect(constants_1.ADDRESSES.KwentaArrakisVault[networkId], provider)
            : undefined,
        StakingRewards: constants_1.ADDRESSES.StakingRewards[networkId]
            ? types_1.StakingRewards__factory.connect(constants_1.ADDRESSES.StakingRewards[networkId], provider)
            : undefined,
        RewardEscrow: constants_1.ADDRESSES.RewardEscrow[networkId]
            ? types_1.RewardEscrow__factory.connect(constants_1.ADDRESSES.RewardEscrow[networkId], provider)
            : undefined,
        KwentaToken: constants_1.ADDRESSES.KwentaToken[networkId]
            ? types_1.ERC20__factory.connect(constants_1.ADDRESSES.KwentaToken[networkId], provider)
            : undefined,
        SupplySchedule: constants_1.ADDRESSES.SupplySchedule[networkId]
            ? types_1.SupplySchedule__factory.connect(constants_1.ADDRESSES.SupplySchedule[networkId], provider)
            : undefined,
        vKwentaToken: constants_1.ADDRESSES.vKwentaToken[networkId]
            ? types_1.ERC20__factory.connect(constants_1.ADDRESSES.vKwentaToken[networkId], provider)
            : undefined,
        MultipleMerkleDistributor: constants_1.ADDRESSES.TradingRewards[networkId]
            ? types_1.MultipleMerkleDistributor__factory.connect(constants_1.ADDRESSES.TradingRewards[networkId], provider)
            : undefined,
        MultipleMerkleDistributorPerpsV2: constants_1.ADDRESSES.TradingRewardsPerpsV2[networkId]
            ? types_1.MultipleMerkleDistributorPerpsV2__factory.connect(constants_1.ADDRESSES.TradingRewardsPerpsV2[networkId], provider)
            : undefined,
        MultipleMerkleDistributorOp: constants_1.ADDRESSES.OpRewards[networkId]
            ? types_1.MultipleMerkleDistributorOp__factory.connect(constants_1.ADDRESSES.OpRewards[networkId], provider)
            : undefined,
        MultipleMerkleDistributorSnxOp: constants_1.ADDRESSES.SnxOpRewards[networkId]
            ? types_1.MultipleMerkleDistributorOp__factory.connect(constants_1.ADDRESSES.SnxOpRewards[networkId], provider)
            : undefined,
        BatchClaimer: constants_1.ADDRESSES.BatchClaimer[networkId]
            ? types_1.BatchClaimer__factory.connect(constants_1.ADDRESSES.BatchClaimer[networkId], provider)
            : undefined,
        veKwentaToken: constants_1.ADDRESSES.veKwentaToken[networkId]
            ? types_1.ERC20__factory.connect(constants_1.ADDRESSES.veKwentaToken[networkId], provider)
            : undefined,
        KwentaStakingRewards: constants_1.ADDRESSES.KwentaStakingRewards[networkId]
            ? types_1.KwentaStakingRewards__factory.connect(constants_1.ADDRESSES.KwentaStakingRewards[networkId], provider)
            : undefined,
        vKwentaRedeemer: constants_1.ADDRESSES.vKwentaRedeemer[networkId]
            ? types_1.VKwentaRedeemer__factory.connect(constants_1.ADDRESSES.vKwentaRedeemer[networkId], provider)
            : undefined,
        veKwentaRedeemer: constants_1.ADDRESSES.veKwentaRedeemer[networkId]
            ? types_1.VeKwentaRedeemer__factory.connect(constants_1.ADDRESSES.veKwentaRedeemer[networkId], provider)
            : undefined,
    };
};
exports.getContractsByNetwork = getContractsByNetwork;
const getMulticallContractsByNetwork = (networkId) => {
    return {
        SynthRedeemer: constants_1.ADDRESSES.SynthRedeemer[networkId]
            ? new ethcall_1.Contract(constants_1.ADDRESSES.SynthRedeemer[networkId], SynthRedeemer_json_1.default)
            : undefined,
        ExchangeRates: constants_1.ADDRESSES.ExchangeRates[networkId]
            ? new ethcall_1.Contract(constants_1.ADDRESSES.ExchangeRates[networkId], ExchangeRates_json_1.default)
            : undefined,
        FuturesMarketData: constants_1.ADDRESSES.FuturesMarketData[networkId]
            ? new ethcall_1.Contract(constants_1.ADDRESSES.FuturesMarketData[networkId], FuturesMarketData_json_1.default)
            : undefined,
        FuturesMarketSettings: constants_1.ADDRESSES.FuturesMarketSettings[networkId]
            ? new ethcall_1.Contract(constants_1.ADDRESSES.FuturesMarketSettings[networkId], FuturesMarketSettings_json_1.default)
            : undefined,
        PerpsV2MarketData: constants_1.ADDRESSES.PerpsV2MarketData[networkId]
            ? new ethcall_1.Contract(constants_1.ADDRESSES.PerpsV2MarketData[networkId], PerpsV2MarketData_json_1.default)
            : undefined,
        PerpsV2MarketSettings: constants_1.ADDRESSES.PerpsV2MarketSettings[networkId]
            ? new ethcall_1.Contract(constants_1.ADDRESSES.PerpsV2MarketSettings[networkId], PerpsV2MarketSettings_json_1.default)
            : undefined,
        StakingRewards: constants_1.ADDRESSES.StakingRewards[networkId]
            ? new ethcall_1.Contract(constants_1.ADDRESSES.StakingRewards[networkId], StakingRewards_json_1.default)
            : undefined,
        KwentaArrakisVault: constants_1.ADDRESSES.KwentaArrakisVault[networkId]
            ? new ethcall_1.Contract(constants_1.ADDRESSES.KwentaArrakisVault[networkId], KwentaArrakisVault_json_1.default)
            : undefined,
        RewardEscrow: constants_1.ADDRESSES.RewardEscrow[networkId]
            ? new ethcall_1.Contract(constants_1.ADDRESSES.RewardEscrow[networkId], RewardEscrow_json_1.default)
            : undefined,
        KwentaStakingRewards: constants_1.ADDRESSES.KwentaStakingRewards[networkId]
            ? new ethcall_1.Contract(constants_1.ADDRESSES.KwentaStakingRewards[networkId], KwentaStakingRewards_json_1.default)
            : undefined,
        KwentaToken: constants_1.ADDRESSES.KwentaToken[networkId]
            ? new ethcall_1.Contract(constants_1.ADDRESSES.KwentaToken[networkId], ERC20_json_1.default)
            : undefined,
        MultipleMerkleDistributor: constants_1.ADDRESSES.TradingRewards[networkId]
            ? new ethcall_1.Contract(constants_1.ADDRESSES.TradingRewards[networkId], MultipleMerkleDistributor_json_1.default)
            : undefined,
        MultipleMerkleDistributorPerpsV2: constants_1.ADDRESSES.TradingRewardsPerpsV2[networkId]
            ? new ethcall_1.Contract(constants_1.ADDRESSES.TradingRewardsPerpsV2[networkId], MultipleMerkleDistributorPerpsV2_json_1.default)
            : undefined,
        MultipleMerkleDistributorOp: constants_1.ADDRESSES.OpRewards[networkId]
            ? new ethcall_1.Contract(constants_1.ADDRESSES.OpRewards[networkId], MultipleMerkleDistributorOp_json_1.default)
            : undefined,
        MultipleMerkleDistributorSnxOp: constants_1.ADDRESSES.SnxOpRewards[networkId]
            ? new ethcall_1.Contract(constants_1.ADDRESSES.SnxOpRewards[networkId], MultipleMerkleDistributorOp_json_1.default)
            : undefined,
        vKwentaToken: constants_1.ADDRESSES.vKwentaToken[networkId]
            ? new ethcall_1.Contract(constants_1.ADDRESSES.vKwentaToken[networkId], ERC20_json_1.default)
            : undefined,
        veKwentaToken: constants_1.ADDRESSES.veKwentaToken[networkId]
            ? new ethcall_1.Contract(constants_1.ADDRESSES.veKwentaToken[networkId], ERC20_json_1.default)
            : undefined,
        SupplySchedule: constants_1.ADDRESSES.SupplySchedule[networkId]
            ? new ethcall_1.Contract(constants_1.ADDRESSES.SupplySchedule[networkId], SupplySchedule_json_1.default)
            : undefined,
        SystemStatus: constants_1.ADDRESSES.SystemStatus[networkId]
            ? new ethcall_1.Contract(constants_1.ADDRESSES.SystemStatus[networkId], SystemStatus_json_1.default)
            : undefined,
        DappMaintenance: constants_1.ADDRESSES.DappMaintenance[networkId]
            ? new ethcall_1.Contract(constants_1.ADDRESSES.DappMaintenance[networkId], DappMaintenance_json_1.default)
            : undefined,
    };
};
exports.getMulticallContractsByNetwork = getMulticallContractsByNetwork;
