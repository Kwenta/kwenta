[@kwenta/sdk](../README.md) / [Modules](../modules.md) / [services/kwentaToken](../modules/services_kwentaToken.md) / default

# Class: default

[services/kwentaToken](../modules/services_kwentaToken.md).default

## Table of contents

### Constructors

- [constructor](services_kwentaToken.default.md#constructor)

### Properties

- [sdk](services_kwentaToken.default.md#sdk)

### Methods

- [approveKwentaToken](services_kwentaToken.default.md#approvekwentatoken)
- [approveLPToken](services_kwentaToken.default.md#approvelptoken)
- [approveToken](services_kwentaToken.default.md#approvetoken)
- [changePoolTokens](services_kwentaToken.default.md#changepooltokens)
- [claimMultipleAllRewards](services_kwentaToken.default.md#claimmultipleallrewards)
- [claimMultipleKwentaRewards](services_kwentaToken.default.md#claimmultiplekwentarewards)
- [claimOpRewards](services_kwentaToken.default.md#claimoprewards)
- [claimRewards](services_kwentaToken.default.md#claimrewards)
- [claimStakingRewards](services_kwentaToken.default.md#claimstakingrewards)
- [claimStakingRewardsV2](services_kwentaToken.default.md#claimstakingrewardsv2)
- [compoundRewards](services_kwentaToken.default.md#compoundrewards)
- [getClaimableAllRewards](services_kwentaToken.default.md#getclaimableallrewards)
- [getClaimableRewards](services_kwentaToken.default.md#getclaimablerewards)
- [getEarnDetails](services_kwentaToken.default.md#getearndetails)
- [getEarnTokenPrices](services_kwentaToken.default.md#getearntokenprices)
- [getEscrowData](services_kwentaToken.default.md#getescrowdata)
- [getEscrowV2Data](services_kwentaToken.default.md#getescrowv2data)
- [getEstimatedRewards](services_kwentaToken.default.md#getestimatedrewards)
- [getFuturesFee](services_kwentaToken.default.md#getfuturesfee)
- [getFuturesFeeForAccount](services_kwentaToken.default.md#getfuturesfeeforaccount)
- [getStakingData](services_kwentaToken.default.md#getstakingdata)
- [getStakingV2Data](services_kwentaToken.default.md#getstakingv2data)
- [performStakeAction](services_kwentaToken.default.md#performstakeaction)
- [redeemToken](services_kwentaToken.default.md#redeemtoken)
- [redeemVKwenta](services_kwentaToken.default.md#redeemvkwenta)
- [redeemVeKwenta](services_kwentaToken.default.md#redeemvekwenta)
- [stakeEscrowedKwenta](services_kwentaToken.default.md#stakeescrowedkwenta)
- [stakeEscrowedKwentaV2](services_kwentaToken.default.md#stakeescrowedkwentav2)
- [stakeKwenta](services_kwentaToken.default.md#stakekwenta)
- [stakeKwentaV2](services_kwentaToken.default.md#stakekwentav2)
- [unstakeEscrowedKwenta](services_kwentaToken.default.md#unstakeescrowedkwenta)
- [unstakeEscrowedKwentaV2](services_kwentaToken.default.md#unstakeescrowedkwentav2)
- [unstakeKwenta](services_kwentaToken.default.md#unstakekwenta)
- [unstakeKwentaV2](services_kwentaToken.default.md#unstakekwentav2)
- [vestToken](services_kwentaToken.default.md#vesttoken)
- [vestTokenV2](services_kwentaToken.default.md#vesttokenv2)

## Constructors

### constructor

• **new default**(`sdk`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `sdk` | [`default`](index.default.md) |

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:30](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L30)

## Properties

### sdk

• `Private` **sdk**: [`default`](index.default.md)

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:28](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L28)

## Methods

### approveKwentaToken

▸ **approveKwentaToken**(`token`, `amount?`): `Promise`<`TransactionResponse`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `token` | ``"kwenta"`` \| ``"veKwenta"`` \| ``"vKwenta"`` \| ``"kwentaStakingV2"`` | `undefined` |
| `amount` | `BigNumber` | `ethers.constants.MaxUint256` |

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:372](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L372)

___

### approveLPToken

▸ **approveLPToken**(): `Promise`<`TransactionResponse`\>

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:46](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L46)

___

### approveToken

▸ **approveToken**(`token`, `spender?`, `amount?`): `Promise`<`TransactionResponse`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `token` | ``"Exchanger"`` \| ``"SystemStatus"`` \| ``"ExchangeRates"`` \| ``"SynthUtil"`` \| ``"SystemSettings"`` \| ``"SynthRedeemer"`` \| ``"FuturesMarketData"`` \| ``"FuturesMarketSettings"`` \| ``"PerpsV2MarketData"`` \| ``"PerpsV2MarketSettings"`` \| ``"Pyth"`` \| ``"SUSD"`` \| ``"Synthetix"`` \| ``"SynthSwap"`` \| ``"SmartMarginAccountFactory"`` \| ``"KwentaArrakisVault"`` \| ``"StakingRewards"`` \| ``"KwentaToken"`` \| ``"KwentaStakingRewards"`` \| ``"KwentaStakingRewardsV2"`` \| ``"RewardEscrow"`` \| ``"RewardEscrowV2"`` \| ``"SupplySchedule"`` \| ``"vKwentaToken"`` \| ``"veKwentaToken"`` \| ``"vKwentaRedeemer"`` \| ``"veKwentaRedeemer"`` \| ``"BatchClaimer"`` \| ``"MultipleMerkleDistributor"`` \| ``"MultipleMerkleDistributorPerpsV2"`` \| ``"MultipleMerkleDistributorOp"`` \| ``"MultipleMerkleDistributorSnxOp"`` \| ``"perpsV3MarketProxy"`` | `undefined` |
| `spender?` | ``"Exchanger"`` \| ``"SystemStatus"`` \| ``"ExchangeRates"`` \| ``"SynthUtil"`` \| ``"SystemSettings"`` \| ``"SynthRedeemer"`` \| ``"FuturesMarketData"`` \| ``"FuturesMarketSettings"`` \| ``"PerpsV2MarketData"`` \| ``"PerpsV2MarketSettings"`` \| ``"Pyth"`` \| ``"SUSD"`` \| ``"Synthetix"`` \| ``"SynthSwap"`` \| ``"SmartMarginAccountFactory"`` \| ``"KwentaArrakisVault"`` \| ``"StakingRewards"`` \| ``"KwentaToken"`` \| ``"KwentaStakingRewards"`` \| ``"KwentaStakingRewardsV2"`` \| ``"RewardEscrow"`` \| ``"RewardEscrowV2"`` \| ``"SupplySchedule"`` \| ``"vKwentaToken"`` \| ``"veKwentaToken"`` \| ``"vKwentaRedeemer"`` \| ``"veKwentaRedeemer"`` \| ``"BatchClaimer"`` \| ``"MultipleMerkleDistributor"`` \| ``"MultipleMerkleDistributorPerpsV2"`` \| ``"MultipleMerkleDistributorOp"`` \| ``"MultipleMerkleDistributorSnxOp"`` \| ``"perpsV3MarketProxy"`` | `undefined` |
| `amount` | `BigNumber` | `ethers.constants.MaxUint256` |

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:402](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L402)

___

### changePoolTokens

▸ **changePoolTokens**(`amount`, `action`): `Promise`<`TransactionResponse`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `amount` | `string` |
| `action` | ``"stake"`` \| ``"withdraw"`` |

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:34](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L34)

___

### claimMultipleAllRewards

▸ **claimMultipleAllRewards**(`claimableRewards`): `Promise`<`TransactionResponse`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `claimableRewards` | [`ClaimParams`](../modules/types_kwentaToken.md#claimparams)[][] |

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:711](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L711)

___

### claimMultipleKwentaRewards

▸ **claimMultipleKwentaRewards**(`claimableRewards`): `Promise`<`TransactionResponse`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `claimableRewards` | [`ClaimParams`](../modules/types_kwentaToken.md#claimparams)[][] |

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:697](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L697)

___

### claimOpRewards

▸ **claimOpRewards**(`claimableRewards`, `isSnx?`): `Promise`<`TransactionResponse`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `claimableRewards` | [`ClaimParams`](../modules/types_kwentaToken.md#claimparams)[] | `undefined` |
| `isSnx` | `boolean` | `false` |

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:741](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L741)

___

### claimRewards

▸ **claimRewards**(): `Promise`<`TransactionResponse`\>

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:108](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L108)

___

### claimStakingRewards

▸ **claimStakingRewards**(): `Promise`<`TransactionResponse`\>

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:339](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L339)

___

### claimStakingRewardsV2

▸ **claimStakingRewardsV2**(): `Promise`<`TransactionResponse`\>

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:349](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L349)

___

### compoundRewards

▸ **compoundRewards**(): `Promise`<`TransactionResponse`\>

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:359](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L359)

___

### getClaimableAllRewards

▸ **getClaimableAllRewards**(`epochPeriod`, `isOldDistributor?`, `isOp?`, `isSnx?`): `Promise`<{ `claimableRewards`: [`ClaimParams`](../modules/types_kwentaToken.md#claimparams)[] ; `totalRewards`: `Wei`  }\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `epochPeriod` | `number` | `undefined` |
| `isOldDistributor` | `boolean` | `true` |
| `isOp` | `boolean` | `false` |
| `isSnx` | `boolean` | `false` |

#### Returns

`Promise`<{ `claimableRewards`: [`ClaimParams`](../modules/types_kwentaToken.md#claimparams)[] ; `totalRewards`: `Wei`  }\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:596](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L596)

___

### getClaimableRewards

▸ **getClaimableRewards**(`epochPeriod`, `isOldDistributor?`): `Promise`<{ `claimableRewards`: [`ClaimParams`](../modules/types_kwentaToken.md#claimparams)[] ; `totalRewards`: `Wei`  }\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `epochPeriod` | `number` | `undefined` |
| `isOldDistributor` | `boolean` | `true` |

#### Returns

`Promise`<{ `claimableRewards`: [`ClaimParams`](../modules/types_kwentaToken.md#claimparams)[] ; `totalRewards`: `Wei`  }\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:529](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L529)

___

### getEarnDetails

▸ **getEarnDetails**(): `Promise`<{ `allowance`: `Wei` ; `balance`: `Wei` ; `earned`: `Wei` ; `endDate`: `any` ; `kwentaAmount`: `Wei` ; `lpTokenBalance`: `Wei` ; `lpTotalSupply`: `Wei` ; `rewardRate`: `Wei` ; `totalSupply`: `Wei` ; `wethAmount`: `Wei`  }\>

#### Returns

`Promise`<{ `allowance`: `Wei` ; `balance`: `Wei` ; `earned`: `Wei` ; `endDate`: `any` ; `kwentaAmount`: `Wei` ; `lpTokenBalance`: `Wei` ; `lpTotalSupply`: `Wei` ; `rewardRate`: `Wei` ; `totalSupply`: `Wei` ; `wethAmount`: `Wei`  }\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:50](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L50)

___

### getEarnTokenPrices

▸ **getEarnTokenPrices**(): `Promise`<{ `kwentaPrice`: `Wei` ; `opPrice`: `Wei` ; `wethPrice`: `Wei`  }\>

#### Returns

`Promise`<{ `kwentaPrice`: `Wei` ; `opPrice`: `Wei` ; `wethPrice`: `Wei`  }\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:95](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L95)

___

### getEscrowData

▸ **getEscrowData**(): `Promise`<{ `escrowData`: [`EscrowData`](../modules/types_kwentaToken.md#escrowdata)[] ; `totalVestable`: `Wei`  }\>

#### Returns

`Promise`<{ `escrowData`: [`EscrowData`](../modules/types_kwentaToken.md#escrowdata)[] ; `totalVestable`: `Wei`  }\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:233](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L233)

___

### getEscrowV2Data

▸ **getEscrowV2Data**(): `Promise`<{ `escrowData`: [`EscrowData`](../modules/types_kwentaToken.md#escrowdata)[] ; `totalVestable`: `Wei`  }\>

#### Returns

`Promise`<{ `escrowData`: [`EscrowData`](../modules/types_kwentaToken.md#escrowdata)[] ; `totalVestable`: `Wei`  }\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:286](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L286)

___

### getEstimatedRewards

▸ **getEstimatedRewards**(): `Promise`<{ `estimatedKwentaRewards`: `Wei` ; `estimatedOpRewards`: `Wei`  }\>

#### Returns

`Promise`<{ `estimatedKwentaRewards`: `Wei` ; `estimatedOpRewards`: `Wei`  }\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:503](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L503)

___

### getFuturesFee

▸ **getFuturesFee**(`start`, `end`): `Promise`<`Wei`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `start` | `number` |
| `end` | `number` |

#### Returns

`Promise`<`Wei`\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:756](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L756)

___

### getFuturesFeeForAccount

▸ **getFuturesFeeForAccount**(`account`, `start`, `end`): `Promise`<`Wei`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `account` | `string` |
| `start` | `number` |
| `end` | `number` |

#### Returns

`Promise`<`Wei`\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:780](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L780)

___

### getStakingData

▸ **getStakingData**(): `Promise`<{ `claimableBalance`: `Wei` ; `epochPeriod`: `number` ; `kwentaAllowance`: `Wei` ; `kwentaBalance`: `Wei` ; `rewardEscrowBalance`: `Wei` ; `stakedEscrowedBalance`: `Wei` ; `stakedNonEscrowedBalance`: `Wei` ; `totalStakedBalance`: `Wei` ; `vKwentaAllowance`: `Wei` ; `vKwentaBalance`: `Wei` ; `veKwentaAllowance`: `Wei` ; `veKwentaBalance`: `Wei` ; `weekCounter`: `number`  }\>

#### Returns

`Promise`<{ `claimableBalance`: `Wei` ; `epochPeriod`: `number` ; `kwentaAllowance`: `Wei` ; `kwentaBalance`: `Wei` ; `rewardEscrowBalance`: `Wei` ; `stakedEscrowedBalance`: `Wei` ; `stakedNonEscrowedBalance`: `Wei` ; `totalStakedBalance`: `Wei` ; `vKwentaAllowance`: `Wei` ; `vKwentaBalance`: `Wei` ; `veKwentaAllowance`: `Wei` ; `veKwentaBalance`: `Wei` ; `weekCounter`: `number`  }\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:118](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L118)

___

### getStakingV2Data

▸ **getStakingV2Data**(): `Promise`<{ `claimableBalance`: `Wei` ; `kwentaStakingV2Allowance`: `Wei` ; `rewardEscrowBalance`: `Wei` ; `stakedEscrowedBalance`: `Wei` ; `stakedNonEscrowedBalance`: `Wei` ; `stakedResetTime`: `number` ; `totalStakedBalance`: `Wei`  }\>

#### Returns

`Promise`<{ `claimableBalance`: `Wei` ; `kwentaStakingV2Allowance`: `Wei` ; `rewardEscrowBalance`: `Wei` ; `stakedEscrowedBalance`: `Wei` ; `stakedNonEscrowedBalance`: `Wei` ; `stakedResetTime`: `number` ; `totalStakedBalance`: `Wei`  }\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:192](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L192)

___

### performStakeAction

▸ `Private` **performStakeAction**(`action`, `amount`, `options?`): `Promise`<`TransactionResponse`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `action` | ``"stake"`` \| ``"unstake"`` |
| `amount` | `string` \| `BigNumber` |
| `options` | `Object` |
| `options.escrow` | `boolean` |
| `options.version?` | `number` |

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:805](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L805)

___

### redeemToken

▸ **redeemToken**(`token`, `options?`): `Promise`<`TransactionResponse`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `token` | ``"Exchanger"`` \| ``"SystemStatus"`` \| ``"ExchangeRates"`` \| ``"SynthUtil"`` \| ``"SystemSettings"`` \| ``"SynthRedeemer"`` \| ``"FuturesMarketData"`` \| ``"FuturesMarketSettings"`` \| ``"PerpsV2MarketData"`` \| ``"PerpsV2MarketSettings"`` \| ``"Pyth"`` \| ``"SUSD"`` \| ``"Synthetix"`` \| ``"SynthSwap"`` \| ``"SmartMarginAccountFactory"`` \| ``"KwentaArrakisVault"`` \| ``"StakingRewards"`` \| ``"KwentaToken"`` \| ``"KwentaStakingRewards"`` \| ``"KwentaStakingRewardsV2"`` \| ``"RewardEscrow"`` \| ``"RewardEscrowV2"`` \| ``"SupplySchedule"`` \| ``"vKwentaToken"`` \| ``"veKwentaToken"`` \| ``"vKwentaRedeemer"`` \| ``"veKwentaRedeemer"`` \| ``"BatchClaimer"`` \| ``"MultipleMerkleDistributor"`` \| ``"MultipleMerkleDistributorPerpsV2"`` \| ``"MultipleMerkleDistributorOp"`` \| ``"MultipleMerkleDistributorSnxOp"`` \| ``"perpsV3MarketProxy"`` |
| `options` | `Object` |
| `options.hasAddress` | `boolean` |

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:426](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L426)

___

### redeemVKwenta

▸ **redeemVKwenta**(): `Promise`<`TransactionResponse`\>

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:443](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L443)

___

### redeemVeKwenta

▸ **redeemVeKwenta**(): `Promise`<`TransactionResponse`\>

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:447](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L447)

___

### stakeEscrowedKwenta

▸ **stakeEscrowedKwenta**(`amount`): `Promise`<`TransactionResponse`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `amount` | `string` \| `BigNumber` |

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:479](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L479)

___

### stakeEscrowedKwentaV2

▸ **stakeEscrowedKwentaV2**(`amount`): `Promise`<`TransactionResponse`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `amount` | `string` \| `BigNumber` |

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:495](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L495)

___

### stakeKwenta

▸ **stakeKwenta**(`amount`): `Promise`<`TransactionResponse`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `amount` | `string` \| `BigNumber` |

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:471](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L471)

___

### stakeKwentaV2

▸ **stakeKwentaV2**(`amount`): `Promise`<`TransactionResponse`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `amount` | `string` \| `BigNumber` |

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:487](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L487)

___

### unstakeEscrowedKwenta

▸ **unstakeEscrowedKwenta**(`amount`): `Promise`<`TransactionResponse`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `amount` | `string` \| `BigNumber` |

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:483](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L483)

___

### unstakeEscrowedKwentaV2

▸ **unstakeEscrowedKwentaV2**(`amount`): `Promise`<`TransactionResponse`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `amount` | `string` \| `BigNumber` |

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:499](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L499)

___

### unstakeKwenta

▸ **unstakeKwenta**(`amount`): `Promise`<`TransactionResponse`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `amount` | `string` \| `BigNumber` |

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:475](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L475)

___

### unstakeKwentaV2

▸ **unstakeKwentaV2**(`amount`): `Promise`<`TransactionResponse`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `amount` | `string` \| `BigNumber` |

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:491](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L491)

___

### vestToken

▸ **vestToken**(`ids`): `Promise`<`TransactionResponse`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ids` | `number`[] |

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:451](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L451)

___

### vestTokenV2

▸ **vestTokenV2**(`ids`): `Promise`<`TransactionResponse`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ids` | `number`[] |

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/kwentaToken.ts:461](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/services/kwentaToken.ts#L461)
