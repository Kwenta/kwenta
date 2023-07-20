[@kwenta/sdk](../README.md) / [Modules](../modules.md) / [services/stats](../modules/services_stats.md) / default

# Class: default

[services/stats](../modules/services_stats.md).default

## Table of contents

### Constructors

- [constructor](services_stats.default.md#constructor)

### Properties

- [sdk](services_stats.default.md#sdk)

### Methods

- [batchGetENS](services_stats.default.md#batchgetens)
- [getFuturesCumulativeStats](services_stats.default.md#getfuturescumulativestats)
- [getFuturesStats](services_stats.default.md#getfuturesstats)
- [getFuturesTradersStats](services_stats.default.md#getfuturestradersstats)
- [getLeaderboard](services_stats.default.md#getleaderboard)
- [getStatsVolumes](services_stats.default.md#getstatsvolumes)

## Constructors

### constructor

• **new default**(`sdk`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `sdk` | [`default`](index.default.md) |

#### Defined in

[services/stats.ts:24](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/stats.ts#L24)

## Properties

### sdk

• `Private` **sdk**: [`default`](index.default.md)

#### Defined in

[services/stats.ts:22](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/stats.ts#L22)

## Methods

### batchGetENS

▸ `Private` **batchGetENS**(`addresses`): `Promise`<`EnsInfo`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `addresses` | `string`[] |

#### Returns

`Promise`<`EnsInfo`\>

#### Defined in

[services/stats.ts:172](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/stats.ts#L172)

___

### getFuturesCumulativeStats

▸ **getFuturesCumulativeStats**(`homepage`): `Promise`<``null`` \| { `averageTradeSize`: `string` ; `totalLiquidations`: `any` = response.futuresCumulativeStat.totalLiquidations; `totalTraders`: `any` = response.futuresCumulativeStat.totalTraders; `totalTrades`: `any` = response.futuresCumulativeStat.totalTrades; `totalVolume`: `string`  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `homepage` | `boolean` |

#### Returns

`Promise`<``null`` \| { `averageTradeSize`: `string` ; `totalLiquidations`: `any` = response.futuresCumulativeStat.totalLiquidations; `totalTraders`: `any` = response.futuresCumulativeStat.totalTraders; `totalTrades`: `any` = response.futuresCumulativeStat.totalTrades; `totalVolume`: `string`  }\>

#### Defined in

[services/stats.ts:128](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/stats.ts#L128)

___

### getFuturesStats

▸ **getFuturesStats**(): `Promise`<{ `liquidations`: `number` ; `pnl`: `string` ; `rank`: `number` ; `rankText`: `string` ; `totalTrades`: `number` ; `totalVolume`: `string` ; `trader`: `string` = stat.account; `traderShort`: `string`  }[]\>

#### Returns

`Promise`<{ `liquidations`: `number` ; `pnl`: `string` ; `rank`: `number` ; `rankText`: `string` ; `totalTrades`: `number` ; `totalVolume`: `string` ; `trader`: `string` = stat.account; `traderShort`: `string`  }[]\>

#### Defined in

[services/stats.ts:32](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/stats.ts#L32)

___

### getFuturesTradersStats

▸ **getFuturesTradersStats**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[services/stats.ts:30](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/stats.ts#L30)

___

### getLeaderboard

▸ **getLeaderboard**(`searchTerm`): `Promise`<`Leaderboard`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `searchTerm` | `string` |

#### Returns

`Promise`<`Leaderboard`\>

#### Defined in

[services/stats.ts:69](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/stats.ts#L69)

___

### getStatsVolumes

▸ **getStatsVolumes**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[services/stats.ts:28](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/stats.ts#L28)
