[@kwenta/sdk](../README.md) / [Modules](../modules.md) / [context](../modules/context.md) / default

# Class: default

[context](../modules/context.md).default

## Implements

- [`IContext`](../interfaces/context.IContext.md)

## Table of contents

### Constructors

- [constructor](context.default.md#constructor)

### Properties

- [contracts](context.default.md#contracts)
- [events](context.default.md#events)
- [l1MainnetProvider](context.default.md#l1mainnetprovider)
- [multicallContracts](context.default.md#multicallcontracts)
- [multicallProvider](context.default.md#multicallprovider)

### Accessors

- [isL2](context.default.md#isl2)
- [isMainnet](context.default.md#ismainnet)
- [networkId](context.default.md#networkid)
- [provider](context.default.md#provider)
- [signer](context.default.md#signer)
- [walletAddress](context.default.md#walletaddress)

### Methods

- [logError](context.default.md#logerror)
- [setNetworkId](context.default.md#setnetworkid)
- [setProvider](context.default.md#setprovider)
- [setSigner](context.default.md#setsigner)

## Constructors

### constructor

• **new default**(`context`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `context` | [`IContext`](../interfaces/context.IContext.md) |

#### Defined in

[packages/sdk/src/context.ts:35](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/context.ts#L35)

## Properties

### contracts

• **contracts**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `BatchClaimer` | `undefined` \| `BatchClaimer` |
| `ExchangeRates` | `undefined` \| `ExchangeRates` |
| `Exchanger` | `undefined` \| `Exchanger` |
| `FuturesMarketData` | `undefined` \| `FuturesMarketData` |
| `FuturesMarketSettings` | `undefined` \| `FuturesMarketSettings` |
| `KwentaArrakisVault` | `undefined` \| `KwentaArrakisVault` |
| `KwentaStakingRewards` | `undefined` \| `KwentaStakingRewards` |
| `KwentaStakingRewardsV2` | `undefined` \| `KwentaStakingRewardsV2` |
| `KwentaToken` | `undefined` \| `ERC20` |
| `MultipleMerkleDistributor` | `undefined` \| `MultipleMerkleDistributor` |
| `MultipleMerkleDistributorOp` | `undefined` \| `MultipleMerkleDistributorOp` |
| `MultipleMerkleDistributorPerpsV2` | `undefined` \| `MultipleMerkleDistributorPerpsV2` |
| `MultipleMerkleDistributorSnxOp` | `undefined` \| `MultipleMerkleDistributorOp` |
| `PerpsV2MarketData` | `undefined` \| `PerpsV2MarketData` |
| `PerpsV2MarketSettings` | `undefined` \| `PerpsV2MarketSettings` |
| `Pyth` | `undefined` \| `Pyth` |
| `RewardEscrow` | `undefined` \| `RewardEscrow` |
| `RewardEscrowV2` | `undefined` \| `RewardEscrowV2` |
| `SUSD` | `undefined` \| `ERC20` |
| `SmartMarginAccountFactory` | `undefined` \| `SmartMarginAccountFactory` |
| `StakingRewards` | `undefined` \| `StakingRewards` |
| `SupplySchedule` | `undefined` \| `SupplySchedule` |
| `SynthRedeemer` | `undefined` \| `SynthRedeemer` |
| `SynthSwap` | `undefined` \| `SynthSwap` |
| `SynthUtil` | `undefined` \| `SynthUtil` |
| `Synthetix` | `undefined` \| `Synthetix` |
| `SystemSettings` | `undefined` \| `SystemSettings` |
| `SystemStatus` | `undefined` \| `SystemStatus` |
| `perpsV3MarketProxy` | `undefined` \| `PerpsV3MarketProxy` |
| `vKwentaRedeemer` | `undefined` \| `VKwentaRedeemer` |
| `vKwentaToken` | `undefined` \| `ERC20` |
| `veKwentaRedeemer` | `undefined` \| `VeKwentaRedeemer` |
| `veKwentaToken` | `undefined` \| `ERC20` |

#### Defined in

[packages/sdk/src/context.ts:30](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/context.ts#L30)

___

### events

• **events**: `EventEmitter`

#### Defined in

[packages/sdk/src/context.ts:32](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/context.ts#L32)

___

### l1MainnetProvider

• **l1MainnetProvider**: `Provider`

#### Defined in

[packages/sdk/src/context.ts:33](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/context.ts#L33)

___

### multicallContracts

• **multicallContracts**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `DappMaintenance` | `undefined` \| `Contract` |
| `ExchangeRates` | `undefined` \| `Contract` |
| `FuturesMarketData` | `undefined` \| `Contract` |
| `FuturesMarketSettings` | `undefined` \| `Contract` |
| `KwentaArrakisVault` | `undefined` \| `Contract` |
| `KwentaStakingRewards` | `undefined` \| `Contract` |
| `KwentaStakingRewardsV2` | `undefined` \| `Contract` |
| `KwentaToken` | `undefined` \| `Contract` |
| `MultipleMerkleDistributor` | `undefined` \| `Contract` |
| `MultipleMerkleDistributorOp` | `undefined` \| `Contract` |
| `MultipleMerkleDistributorPerpsV2` | `undefined` \| `Contract` |
| `MultipleMerkleDistributorSnxOp` | `undefined` \| `Contract` |
| `PerpsV2MarketData` | `undefined` \| `Contract` |
| `PerpsV2MarketSettings` | `undefined` \| `Contract` |
| `RewardEscrow` | `undefined` \| `Contract` |
| `RewardEscrowV2` | `undefined` \| `Contract` |
| `StakingRewards` | `undefined` \| `Contract` |
| `SupplySchedule` | `undefined` \| `Contract` |
| `SynthRedeemer` | `undefined` \| `Contract` |
| `SystemStatus` | `undefined` \| `Contract` |
| `vKwentaToken` | `undefined` \| `Contract` |
| `veKwentaToken` | `undefined` \| `Contract` |

#### Defined in

[packages/sdk/src/context.ts:31](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/context.ts#L31)

___

### multicallProvider

• **multicallProvider**: `Provider`

#### Defined in

[packages/sdk/src/context.ts:29](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/context.ts#L29)

## Accessors

### isL2

• `get` **isL2**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/sdk/src/context.ts:75](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/context.ts#L75)

___

### isMainnet

• `get` **isMainnet**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/sdk/src/context.ts:79](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/context.ts#L79)

___

### networkId

• `get` **networkId**(): [`NetworkId`](../modules/types_common.md#networkid)

#### Returns

[`NetworkId`](../modules/types_common.md#networkid)

#### Implementation of

[IContext](../interfaces/context.IContext.md).[networkId](../interfaces/context.IContext.md#networkid)

#### Defined in

[packages/sdk/src/context.ts:51](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/context.ts#L51)

___

### provider

• `get` **provider**(): `Provider`

#### Returns

`Provider`

#### Implementation of

[IContext](../interfaces/context.IContext.md).[provider](../interfaces/context.IContext.md#provider)

#### Defined in

[packages/sdk/src/context.ts:55](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/context.ts#L55)

___

### signer

• `get` **signer**(): `Signer`

#### Returns

`Signer`

#### Implementation of

[IContext](../interfaces/context.IContext.md).[signer](../interfaces/context.IContext.md#signer)

#### Defined in

[packages/sdk/src/context.ts:59](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/context.ts#L59)

___

### walletAddress

• `get` **walletAddress**(): `string`

#### Returns

`string`

#### Implementation of

[IContext](../interfaces/context.IContext.md).[walletAddress](../interfaces/context.IContext.md#walletaddress)

#### Defined in

[packages/sdk/src/context.ts:67](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/context.ts#L67)

## Methods

### logError

▸ **logError**(`err`, `skipReport?`): `undefined` \| `void`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `err` | `Error` | `undefined` |
| `skipReport` | `boolean` | `false` |

#### Returns

`undefined` \| `void`

#### Implementation of

[IContext](../interfaces/context.IContext.md).[logError](../interfaces/context.IContext.md#logerror)

#### Defined in

[packages/sdk/src/context.ts:105](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/context.ts#L105)

___

### setNetworkId

▸ **setNetworkId**(`networkId`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `networkId` | [`NetworkId`](../modules/types_common.md#networkid) |

#### Returns

`void`

#### Defined in

[packages/sdk/src/context.ts:93](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/context.ts#L93)

___

### setProvider

▸ **setProvider**(`provider`): `Promise`<[`NetworkId`](../modules/types_common.md#networkid)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `provider` | `Provider` |

#### Returns

`Promise`<[`NetworkId`](../modules/types_common.md#networkid)\>

#### Defined in

[packages/sdk/src/context.ts:83](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/context.ts#L83)

___

### setSigner

▸ **setSigner**(`signer`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `signer` | `Signer` |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/sdk/src/context.ts:100](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/context.ts#L100)
