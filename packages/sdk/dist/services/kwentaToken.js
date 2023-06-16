"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const wei_1 = require("@synthetixio/wei");
const ethers_1 = require("ethers");
const moment_1 = __importDefault(require("moment"));
const staking_1 = require("../constants/staking");
const number_1 = require("../constants/number");
const date_1 = require("../utils/date");
const number_2 = require("../utils/number");
const futures_1 = require("../constants/futures");
const period_1 = require("../constants/period");
const subgraph_1 = require("../utils/subgraph");
const sdkErrors = __importStar(require("../common/errors"));
const exchange_1 = require("../constants/exchange");
const files_1 = require("../utils/files");
class KwentaTokenService {
    constructor(sdk) {
        this.sdk = sdk;
    }
    changePoolTokens(amount, action) {
        if (!this.sdk.context.contracts.StakingRewards) {
            throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
        }
        return this.sdk.transactions.createContractTxn(this.sdk.context.contracts.StakingRewards, action, [(0, wei_1.wei)(amount).toBN()]);
    }
    approveLPToken() {
        return this.approveToken('KwentaArrakisVault', 'StakingRewards');
    }
    getEarnDetails() {
        return __awaiter(this, void 0, void 0, function* () {
            const { StakingRewards, KwentaArrakisVault } = this.sdk.context.multicallContracts;
            if (!StakingRewards || !KwentaArrakisVault) {
                throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
            }
            const { walletAddress } = this.sdk.context;
            const [balance, earned, periodFinish, rewardRate, totalSupply, lpTokenBalance, allowance, [wethAmount, kwentaAmount], lpTotalSupply,] = yield this.sdk.context.multicallProvider.all([
                StakingRewards.balanceOf(walletAddress),
                StakingRewards.earned(walletAddress),
                StakingRewards.periodFinish(),
                StakingRewards.rewardRate(),
                StakingRewards.totalSupply(),
                KwentaArrakisVault.balanceOf(walletAddress),
                KwentaArrakisVault.allowance(walletAddress, StakingRewards.address),
                KwentaArrakisVault.getUnderlyingBalances(),
                KwentaArrakisVault.totalSupply(),
            ]);
            return {
                balance: (0, wei_1.wei)(balance),
                earned: (0, wei_1.wei)(earned),
                endDate: periodFinish.toNumber(),
                rewardRate: (0, wei_1.wei)(rewardRate),
                totalSupply: (0, wei_1.wei)(totalSupply),
                lpTokenBalance: (0, wei_1.wei)(lpTokenBalance),
                allowance: (0, wei_1.wei)(allowance),
                wethAmount: (0, wei_1.wei)(wethAmount),
                kwentaAmount: (0, wei_1.wei)(kwentaAmount),
                lpTotalSupply: (0, wei_1.wei)(lpTotalSupply),
            };
        });
    }
    getEarnTokenPrices() {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const coinGeckoPrices = yield this.sdk.exchange.batchGetCoingeckoPrices([exchange_1.KWENTA_ADDRESS, exchange_1.ETH_COINGECKO_ADDRESS, exchange_1.OP_ADDRESS], false);
            return {
                kwentaPrice: coinGeckoPrices ? (0, wei_1.wei)((_a = coinGeckoPrices[exchange_1.KWENTA_ADDRESS]) === null || _a === void 0 ? void 0 : _a.usd) : number_1.ZERO_WEI,
                wethPrice: coinGeckoPrices ? (0, wei_1.wei)((_b = coinGeckoPrices[exchange_1.ETH_COINGECKO_ADDRESS]) === null || _b === void 0 ? void 0 : _b.usd) : number_1.ZERO_WEI,
                opPrice: coinGeckoPrices ? (0, wei_1.wei)((_c = coinGeckoPrices[exchange_1.OP_ADDRESS]) === null || _c === void 0 ? void 0 : _c.usd) : number_1.ZERO_WEI,
            };
        });
    }
    claimRewards() {
        const StakingRewards = this.sdk.context.contracts.StakingRewards;
        if (!StakingRewards) {
            throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
        }
        return this.sdk.transactions.createContractTxn(StakingRewards, 'getReward', []);
    }
    getStakingData() {
        return __awaiter(this, void 0, void 0, function* () {
            const { vKwentaRedeemer, veKwentaRedeemer } = this.sdk.context.contracts;
            const { RewardEscrow, KwentaStakingRewards, KwentaToken, SupplySchedule, vKwentaToken, veKwentaToken, MultipleMerkleDistributor, } = this.sdk.context.multicallContracts;
            if (!RewardEscrow ||
                !KwentaStakingRewards ||
                !KwentaToken ||
                !SupplySchedule ||
                !vKwentaToken ||
                !MultipleMerkleDistributor ||
                !veKwentaToken ||
                !vKwentaRedeemer ||
                !veKwentaRedeemer) {
                throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
            }
            const { walletAddress } = this.sdk.context;
            const [rewardEscrowBalance, stakedNonEscrowedBalance, stakedEscrowedBalance, claimableBalance, kwentaBalance, weekCounter, totalStakedBalance, vKwentaBalance, vKwentaAllowance, kwentaAllowance, veKwentaBalance, veKwentaAllowance,] = yield this.sdk.context.multicallProvider.all([
                RewardEscrow.balanceOf(walletAddress),
                KwentaStakingRewards.nonEscrowedBalanceOf(walletAddress),
                KwentaStakingRewards.escrowedBalanceOf(walletAddress),
                KwentaStakingRewards.earned(walletAddress),
                KwentaToken.balanceOf(walletAddress),
                SupplySchedule.weekCounter(),
                KwentaStakingRewards.totalSupply(),
                vKwentaToken.balanceOf(walletAddress),
                vKwentaToken.allowance(walletAddress, vKwentaRedeemer.address),
                KwentaToken.allowance(walletAddress, KwentaStakingRewards.address),
                veKwentaToken.balanceOf(walletAddress),
                veKwentaToken.allowance(walletAddress, veKwentaRedeemer.address),
            ]);
            return {
                rewardEscrowBalance: (0, wei_1.wei)(rewardEscrowBalance),
                stakedNonEscrowedBalance: (0, wei_1.wei)(stakedNonEscrowedBalance),
                stakedEscrowedBalance: (0, wei_1.wei)(stakedEscrowedBalance),
                claimableBalance: (0, wei_1.wei)(claimableBalance),
                kwentaBalance: (0, wei_1.wei)(kwentaBalance),
                weekCounter: Number(weekCounter),
                totalStakedBalance: (0, wei_1.wei)(totalStakedBalance),
                vKwentaBalance: (0, wei_1.wei)(vKwentaBalance),
                vKwentaAllowance: (0, wei_1.wei)(vKwentaAllowance),
                kwentaAllowance: (0, wei_1.wei)(kwentaAllowance),
                epochPeriod: Math.floor((Math.floor(Date.now() / 1000) - staking_1.EPOCH_START[10]) / staking_1.WEEK),
                veKwentaBalance: (0, wei_1.wei)(veKwentaBalance),
                veKwentaAllowance: (0, wei_1.wei)(veKwentaAllowance),
            };
        });
    }
    getEscrowData() {
        return __awaiter(this, void 0, void 0, function* () {
            const { RewardEscrow } = this.sdk.context.contracts;
            const { RewardEscrow: RewardEscrowMulticall } = this.sdk.context.multicallContracts;
            if (!RewardEscrow || !RewardEscrowMulticall) {
                throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
            }
            const { walletAddress } = this.sdk.context;
            const schedules = yield RewardEscrow.getVestingSchedules(walletAddress, 0, staking_1.DEFAULT_NUMBER_OF_FUTURES_FEE);
            const vestingSchedules = schedules.filter((schedule) => schedule.escrowAmount.gt(0));
            const calls = vestingSchedules.map((schedule) => RewardEscrowMulticall.getVestingEntryClaimable(walletAddress, schedule.entryID));
            const vestingEntries = yield this.sdk.context.multicallProvider.all(calls);
            const { escrowData, totalVestable } = vestingSchedules.reduce((acc, next, i) => {
                const vestable = (0, wei_1.wei)(vestingEntries[i].quantity);
                const date = Number(next.endTime) * 1000;
                acc.totalVestable = acc.totalVestable.add(vestable);
                acc.escrowData.push({
                    id: Number(next.entryID),
                    date: (0, moment_1.default)(date).format('MM/DD/YY'),
                    time: (0, date_1.formatTruncatedDuration)(Number(next.endTime) - new Date().getTime() / 1000),
                    vestable,
                    amount: (0, wei_1.wei)(next.escrowAmount),
                    fee: (0, wei_1.wei)(vestingEntries[i].fee),
                    status: date > Date.now() ? 'VESTING' : 'VESTED',
                });
                return acc;
            }, { escrowData: [], totalVestable: (0, wei_1.wei)(0) });
            return { escrowData, totalVestable };
        });
    }
    getReward() {
        const { KwentaStakingRewards } = this.sdk.context.contracts;
        if (!KwentaStakingRewards) {
            throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
        }
        return this.sdk.transactions.createContractTxn(KwentaStakingRewards, 'getReward', []);
    }
    // TODO: Replace this with separate functions that use `approveToken`
    // In that case, we can safely remove the map object from this method.
    approveKwentaToken(token, amount = ethers_1.ethers.constants.MaxUint256) {
        const { KwentaToken, KwentaStakingRewards, vKwentaToken, vKwentaRedeemer, veKwentaToken, veKwentaRedeemer, } = this.sdk.context.contracts;
        const map = {
            kwenta: { contract: KwentaToken, spender: KwentaStakingRewards },
            vKwenta: { contract: vKwentaToken, spender: vKwentaRedeemer },
            veKwenta: { contract: veKwentaToken, spender: veKwentaRedeemer },
        };
        const { contract, spender } = map[token];
        if (!contract || !spender) {
            throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
        }
        return this.sdk.transactions.createContractTxn(contract, 'approve', [spender.address, amount]);
    }
    approveToken(token, spender, amount = ethers_1.ethers.constants.MaxUint256) {
        const tokenContract = this.sdk.context.contracts[token];
        if (!tokenContract) {
            throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
        }
        let spenderAddress = this.sdk.context.walletAddress;
        if (spender) {
            const spenderContract = this.sdk.context.contracts[spender];
            if (spenderContract)
                spenderAddress = spenderContract.address;
        }
        return this.sdk.transactions.createContractTxn(tokenContract, 'approve', [
            spenderAddress,
            amount,
        ]);
    }
    redeemToken(token, options = { hasAddress: false }) {
        const tokenContract = this.sdk.context.contracts[token];
        if (!tokenContract) {
            throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
        }
        return this.sdk.transactions.createContractTxn(tokenContract, 'redeem', options.hasAddress ? [this.sdk.context.walletAddress] : []);
    }
    redeemVKwenta() {
        return this.redeemToken('vKwentaRedeemer');
    }
    redeemVeKwenta() {
        return this.redeemToken('veKwentaRedeemer', { hasAddress: true });
    }
    vestToken(ids) {
        const { RewardEscrow } = this.sdk.context.contracts;
        if (!RewardEscrow) {
            throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
        }
        return this.sdk.transactions.createContractTxn(RewardEscrow, 'vest', [ids]);
    }
    stakeKwenta(amount) {
        return this.performStakeAction('stake', amount);
    }
    unstakeKwenta(amount) {
        return this.performStakeAction('unstake', amount);
    }
    stakeEscrowedKwenta(amount) {
        return this.performStakeAction('stake', amount, { escrow: true });
    }
    unstakeEscrowedKwenta(amount) {
        return this.performStakeAction('unstake', amount, { escrow: true });
    }
    getClaimableRewards(epochPeriod, isOldDistributor = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const { MultipleMerkleDistributor, MultipleMerkleDistributorPerpsV2, } = this.sdk.context.multicallContracts;
            const { walletAddress } = this.sdk.context;
            if (!MultipleMerkleDistributor || !MultipleMerkleDistributorPerpsV2) {
                throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
            }
            const periods = Array.from(new Array(Number(epochPeriod)), (_, i) => i);
            const adjustedPeriods = isOldDistributor
                ? periods.slice(0, staking_1.TRADING_REWARDS_CUTOFF_EPOCH)
                : periods.slice(staking_1.TRADING_REWARDS_CUTOFF_EPOCH);
            const fileNames = adjustedPeriods.map((i) => `trading-rewards-snapshots/${this.sdk.context.networkId === 420 ? `goerli-` : ''}epoch-${i}.json`);
            const responses = yield Promise.all(fileNames.map((fileName, index) => __awaiter(this, void 0, void 0, function* () {
                const response = yield files_1.client.get(fileName);
                const period = isOldDistributor
                    ? index >= 5
                        ? index >= 10
                            ? index + 2
                            : index + 1
                        : index
                    : index + staking_1.TRADING_REWARDS_CUTOFF_EPOCH;
                return Object.assign(Object.assign({}, response.data), { period });
            })));
            const rewards = responses
                .map((d) => {
                const reward = d.claims[walletAddress];
                if (reward) {
                    return [reward.index, walletAddress, reward.amount, reward.proof, d.period];
                }
                return null;
            })
                .filter((x) => !!x);
            const claimed = yield this.sdk.context.multicallProvider.all(rewards.map((reward) => isOldDistributor
                ? MultipleMerkleDistributor.isClaimed(reward[0], reward[4])
                : MultipleMerkleDistributorPerpsV2.isClaimed(reward[0], reward[4])));
            const { totalRewards, claimableRewards } = rewards.reduce((acc, next, i) => {
                if (!claimed[i]) {
                    acc.claimableRewards.push(next);
                    acc.totalRewards = acc.totalRewards.add((0, number_2.weiFromWei)(next[2]));
                }
                return acc;
            }, { claimableRewards: [], totalRewards: (0, wei_1.wei)(0) });
            return { claimableRewards, totalRewards };
        });
    }
    getClaimableAllRewards(epochPeriod, isOldDistributor = true, isOp = false, isSnx = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const { MultipleMerkleDistributor, MultipleMerkleDistributorPerpsV2, MultipleMerkleDistributorOp, MultipleMerkleDistributorSnxOp, } = this.sdk.context.multicallContracts;
            const { walletAddress } = this.sdk.context;
            if (!MultipleMerkleDistributor ||
                !MultipleMerkleDistributorPerpsV2 ||
                !MultipleMerkleDistributorOp ||
                !MultipleMerkleDistributorSnxOp) {
                throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
            }
            const periods = Array.from(new Array(Number(epochPeriod)), (_, i) => i);
            const adjustedPeriods = isOldDistributor
                ? periods.slice(0, staking_1.TRADING_REWARDS_CUTOFF_EPOCH)
                : isOp
                    ? periods.slice(staking_1.OP_REWARDS_CUTOFF_EPOCH)
                    : periods.slice(staking_1.TRADING_REWARDS_CUTOFF_EPOCH);
            const fileNames = adjustedPeriods.map((i) => `trading-rewards-snapshots/${this.sdk.context.networkId === 420 ? `goerli-` : ''}epoch-${isSnx ? i - staking_1.OP_REWARDS_CUTOFF_EPOCH : i}${isOp ? (isSnx ? '-snx-op' : '-op') : ''}.json`);
            const responses = yield Promise.all(fileNames.map((fileName, index) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const response = yield files_1.client.get(fileName);
                    const period = isOldDistributor
                        ? index >= 5
                            ? index >= 10
                                ? index + 2
                                : index + 1
                            : index
                        : isOp
                            ? isSnx
                                ? index
                                : index + staking_1.OP_REWARDS_CUTOFF_EPOCH
                            : index + staking_1.TRADING_REWARDS_CUTOFF_EPOCH;
                    return Object.assign(Object.assign({}, response.data), { period });
                }
                catch (err) {
                    this.sdk.context.logError(err);
                    return null;
                }
            })));
            const rewards = responses
                .filter(Boolean)
                .map((d) => {
                const reward = d.claims[walletAddress];
                if (reward) {
                    return [reward.index, walletAddress, reward.amount, reward.proof, d.period];
                }
                return null;
            })
                .filter((x) => !!x);
            const claimed = yield this.sdk.context.multicallProvider.all(rewards.map((reward) => isOldDistributor
                ? MultipleMerkleDistributor.isClaimed(reward[0], reward[4])
                : isOp
                    ? isSnx
                        ? MultipleMerkleDistributorSnxOp.isClaimed(reward[0], reward[4])
                        : MultipleMerkleDistributorOp.isClaimed(reward[0], reward[4])
                    : MultipleMerkleDistributorPerpsV2.isClaimed(reward[0], reward[4])));
            const { totalRewards, claimableRewards } = rewards.reduce((acc, next, i) => {
                if (!claimed[i]) {
                    acc.claimableRewards.push(next);
                    acc.totalRewards = acc.totalRewards.add((0, number_2.weiFromWei)(next[2]));
                }
                return acc;
            }, { claimableRewards: [], totalRewards: (0, wei_1.wei)(0) });
            return { claimableRewards, totalRewards };
        });
    }
    claimMultipleKwentaRewards(claimableRewards) {
        return __awaiter(this, void 0, void 0, function* () {
            const { BatchClaimer, MultipleMerkleDistributor, MultipleMerkleDistributorPerpsV2, } = this.sdk.context.contracts;
            if (!BatchClaimer || !MultipleMerkleDistributor || !MultipleMerkleDistributorPerpsV2) {
                throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
            }
            return this.sdk.transactions.createContractTxn(BatchClaimer, 'claimMultiple', [
                [MultipleMerkleDistributor.address, MultipleMerkleDistributorPerpsV2.address],
                claimableRewards,
            ]);
        });
    }
    claimMultipleAllRewards(claimableRewards) {
        return __awaiter(this, void 0, void 0, function* () {
            const { BatchClaimer, MultipleMerkleDistributor, MultipleMerkleDistributorPerpsV2, MultipleMerkleDistributorOp, MultipleMerkleDistributorSnxOp, } = this.sdk.context.contracts;
            if (!BatchClaimer ||
                !MultipleMerkleDistributor ||
                !MultipleMerkleDistributorPerpsV2 ||
                !MultipleMerkleDistributorOp ||
                !MultipleMerkleDistributorSnxOp) {
                throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
            }
            return this.sdk.transactions.createContractTxn(BatchClaimer, 'claimMultiple', [
                [
                    MultipleMerkleDistributor.address,
                    MultipleMerkleDistributorPerpsV2.address,
                    MultipleMerkleDistributorOp.address,
                    MultipleMerkleDistributorSnxOp.address,
                ],
                claimableRewards,
            ]);
        });
    }
    claimOpRewards(claimableRewards, isSnx = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const { MultipleMerkleDistributorOp, MultipleMerkleDistributorSnxOp, } = this.sdk.context.contracts;
            if (!MultipleMerkleDistributorOp || !MultipleMerkleDistributorSnxOp) {
                throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
            }
            return this.sdk.transactions.createContractTxn(isSnx ? MultipleMerkleDistributorSnxOp : MultipleMerkleDistributorOp, 'claimMultiple', [claimableRewards]);
        });
    }
    getFuturesFee(start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.sdk.context.isL2) {
                throw new Error(sdkErrors.REQUIRES_L2);
            }
            const response = yield (0, subgraph_1.getFuturesAggregateStats)(futures_1.FUTURES_ENDPOINT_OP_MAINNET, {
                first: staking_1.DEFAULT_NUMBER_OF_FUTURES_FEE,
                where: {
                    asset: futures_1.AGGREGATE_ASSET_KEY,
                    period: period_1.SECONDS_PER_DAY,
                    timestamp_gte: start,
                    timestamp_lt: end,
                },
                orderDirection: 'desc',
                orderBy: 'timestamp',
            }, { timestamp: true, feesKwenta: true });
            return response;
        });
    }
    getFuturesFeeForAccount(account, start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!account)
                return null;
            const response = yield (0, subgraph_1.getFuturesTrades)(futures_1.FUTURES_ENDPOINT_OP_MAINNET, {
                first: staking_1.DEFAULT_NUMBER_OF_FUTURES_FEE,
                where: {
                    account: account,
                    timestamp_gt: start,
                    timestamp_lt: end,
                    trackingCode: futures_1.KWENTA_TRACKING_CODE,
                },
                orderDirection: 'desc',
                orderBy: 'timestamp',
            }, {
                timestamp: true,
                account: true,
                abstractAccount: true,
                accountType: true,
                feesPaid: true,
                keeperFeesPaid: true,
            });
            return response;
        });
    }
    performStakeAction(action, amount, options = { escrow: false }) {
        const { RewardEscrow, KwentaStakingRewards } = this.sdk.context.contracts;
        if (!RewardEscrow || !KwentaStakingRewards) {
            throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
        }
        const contract = (options === null || options === void 0 ? void 0 : options.escrow) ? RewardEscrow : KwentaStakingRewards;
        return this.sdk.transactions.createContractTxn(contract, `${action}${(options === null || options === void 0 ? void 0 : options.escrow) ? 'Escrow' : ''}`, [amount]);
    }
}
exports.default = KwentaTokenService;
