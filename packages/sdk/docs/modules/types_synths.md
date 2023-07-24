[@kwenta/sdk](../README.md) / [Modules](../modules.md) / types/synths

# Module: types/synths

## Table of contents

### Type Aliases

- [Balances](types_synths.md#balances)
- [DeprecatedSynthBalance](types_synths.md#deprecatedsynthbalance)
- [SynthBalance](types_synths.md#synthbalance)
- [SynthBalancesMap](types_synths.md#synthbalancesmap)
- [SynthResult](types_synths.md#synthresult)
- [WalletTradesExchangeResult](types_synths.md#wallettradesexchangeresult)

## Type Aliases

### Balances

Ƭ **Balances**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `balances` | [`SynthBalance`](types_synths.md#synthbalance)[] |
| `balancesMap` | [`SynthBalancesMap`](types_synths.md#synthbalancesmap) |
| `totalUSDBalance` | `Wei` |

#### Defined in

[packages/sdk/src/types/synths.ts:13](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/types/synths.ts#L13)

___

### DeprecatedSynthBalance

Ƭ **DeprecatedSynthBalance**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `balance` | `Wei` |
| `currencyKey` | [`CurrencyKey`](types_common.md#currencykey) |
| `proxyAddress` | `string` |
| `usdBalance` | `Wei` |

#### Defined in

[packages/sdk/src/types/synths.ts:41](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/types/synths.ts#L41)

___

### SynthBalance

Ƭ **SynthBalance**<`T`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `Wei` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `balance` | `T` |
| `currencyKey` | [`CurrencyKey`](types_common.md#currencykey) |
| `usdBalance` | `T` |

#### Defined in

[packages/sdk/src/types/synths.ts:5](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/types/synths.ts#L5)

___

### SynthBalancesMap

Ƭ **SynthBalancesMap**: `Partial`<{ `[key: string]`: [`SynthBalance`](types_synths.md#synthbalance);  }\>

#### Defined in

[packages/sdk/src/types/synths.ts:11](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/types/synths.ts#L11)

___

### SynthResult

Ƭ **SynthResult**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `id` | `string` |
| `name` | `string` |
| `symbol` | `string` |
| `totalSupply` | `Wei` |

#### Defined in

[packages/sdk/src/types/synths.ts:19](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/types/synths.ts#L19)

___

### WalletTradesExchangeResult

Ƭ **WalletTradesExchangeResult**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `feesInUSD` | `Wei` |
| `fromAmount` | `Wei` |
| `fromAmountInUSD` | `Wei` |
| `fromSynth` | `Partial`<[`SynthResult`](types_synths.md#synthresult)\> \| ``null`` |
| `gasPrice` | `Wei` |
| `hash` | `string` |
| `id` | `string` |
| `timestamp` | `number` |
| `toAddress` | `string` |
| `toAmount` | `Wei` |
| `toAmountInUSD` | `Wei` |
| `toSynth` | `Partial`<[`SynthResult`](types_synths.md#synthresult)\> \| ``null`` |

#### Defined in

[packages/sdk/src/types/synths.ts:26](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/types/synths.ts#L26)
