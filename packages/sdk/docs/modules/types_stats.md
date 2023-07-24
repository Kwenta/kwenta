[@kwenta/sdk](../README.md) / [Modules](../modules.md) / types/stats

# Module: types/stats

## Table of contents

### Type Aliases

- [AccountStat](types_stats.md#accountstat)
- [EnsInfo](types_stats.md#ensinfo)
- [FuturesCumulativeStats](types_stats.md#futurescumulativestats)
- [FuturesStat](types_stats.md#futuresstat)
- [Leaderboard](types_stats.md#leaderboard)

## Type Aliases

### AccountStat

Ƭ **AccountStat**<`T`, `K`\>: [`FuturesStat`](types_stats.md#futuresstat)<`T`, `K`\> & { `rank`: `number` ; `rankText`: `string` ; `trader`: `string` ; `traderEns?`: `string` \| ``null`` ; `traderShort`: `string`  }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `string` |
| `K` | `string` |

#### Defined in

[packages/sdk/src/types/stats.ts:9](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/types/stats.ts#L9)

___

### EnsInfo

Ƭ **EnsInfo**: `Object`

#### Index signature

▪ [account: `string`]: `string`

#### Defined in

[packages/sdk/src/types/stats.ts:33](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/types/stats.ts#L33)

___

### FuturesCumulativeStats

Ƭ **FuturesCumulativeStats**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `averageTradeSize` | `string` |
| `totalLiquidations` | `string` |
| `totalTraders` | `string` |
| `totalTrades` | `string` |
| `totalVolume` | `string` |

#### Defined in

[packages/sdk/src/types/stats.ts:25](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/types/stats.ts#L25)

___

### FuturesStat

Ƭ **FuturesStat**<`T`, `K`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `string` |
| `K` | `string` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `account` | `string` |
| `liquidations` | `K` |
| `pnlWithFeesPaid` | `T` |
| `totalTrades` | `K` |
| `totalVolume` | `T` |

#### Defined in

[packages/sdk/src/types/stats.ts:1](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/types/stats.ts#L1)

___

### Leaderboard

Ƭ **Leaderboard**<`T`, `K`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `string` |
| `K` | `string` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `all` | [`AccountStat`](types_stats.md#accountstat)<`T`, `K`\>[] |
| `bottom` | [`AccountStat`](types_stats.md#accountstat)<`T`, `K`\>[] |
| `search` | [`AccountStat`](types_stats.md#accountstat)<`T`, `K`\>[] |
| `top` | [`AccountStat`](types_stats.md#accountstat)<`T`, `K`\>[] |
| `wallet` | [`AccountStat`](types_stats.md#accountstat)<`T`, `K`\>[] |

#### Defined in

[packages/sdk/src/types/stats.ts:17](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/types/stats.ts#L17)
