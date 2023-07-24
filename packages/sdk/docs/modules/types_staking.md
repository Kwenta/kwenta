[@kwenta/sdk](../README.md) / [Modules](../modules.md) / types/staking

# Module: types/staking

## Table of contents

### Type Aliases

- [FuturesFeeForAccountProps](types_staking.md#futuresfeeforaccountprops)
- [FuturesFeeProps](types_staking.md#futuresfeeprops)
- [TradingRewardProps](types_staking.md#tradingrewardprops)

## Type Aliases

### FuturesFeeForAccountProps

Ƭ **FuturesFeeForAccountProps**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `abstractAccount` | `string` |
| `account` | `string` |
| `accountType` | `string` |
| `feesPaid` | `BigNumber` |
| `keeperFeesPaid` | `BigNumber` |
| `timestamp` | `number` |

#### Defined in

[packages/sdk/src/types/staking.ts:9](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/types/staking.ts#L9)

___

### FuturesFeeProps

Ƭ **FuturesFeeProps**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `feesKwenta` | `BigNumber` |
| `timestamp` | `string` |

#### Defined in

[packages/sdk/src/types/staking.ts:18](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/types/staking.ts#L18)

___

### TradingRewardProps

Ƭ **TradingRewardProps**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `end?` | `number` |
| `period` | `number` \| `string` |
| `start?` | `number` |

#### Defined in

[packages/sdk/src/types/staking.ts:3](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/types/staking.ts#L3)
