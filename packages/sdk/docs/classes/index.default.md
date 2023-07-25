[@kwenta/sdk](../README.md) / [Modules](../modules.md) / [index](../modules/index.md) / default

# Class: default

[index](../modules/index.md).default

## Table of contents

### Constructors

- [constructor](index.default.md#constructor)

### Properties

- [context](index.default.md#context)
- [exchange](index.default.md#exchange)
- [futures](index.default.md#futures)
- [kwentaToken](index.default.md#kwentatoken)
- [perpsV3](index.default.md#perpsv3)
- [prices](index.default.md#prices)
- [stats](index.default.md#stats)
- [synths](index.default.md#synths)
- [system](index.default.md#system)
- [transactions](index.default.md#transactions)

### Methods

- [setProvider](index.default.md#setprovider)
- [setSigner](index.default.md#setsigner)

## Constructors

### constructor

• **new default**(`context`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `context` | [`IContext`](../interfaces/context.IContext.md) |

#### Defined in

[packages/sdk/src/index.ts:27](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/index.ts#L27)

## Properties

### context

• **context**: [`default`](context.default.md)

#### Defined in

[packages/sdk/src/index.ts:15](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/index.ts#L15)

___

### exchange

• **exchange**: [`default`](services_exchange.default.md)

#### Defined in

[packages/sdk/src/index.ts:17](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/index.ts#L17)

___

### futures

• **futures**: [`default`](services_futures.default.md)

#### Defined in

[packages/sdk/src/index.ts:18](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/index.ts#L18)

___

### kwentaToken

• **kwentaToken**: [`default`](services_kwentaToken.default.md)

#### Defined in

[packages/sdk/src/index.ts:22](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/index.ts#L22)

___

### perpsV3

• **perpsV3**: [`default`](services_perpsV3.default.md)

#### Defined in

[packages/sdk/src/index.ts:19](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/index.ts#L19)

___

### prices

• **prices**: [`default`](services_prices.default.md)

#### Defined in

[packages/sdk/src/index.ts:23](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/index.ts#L23)

___

### stats

• **stats**: [`default`](services_stats.default.md)

#### Defined in

[packages/sdk/src/index.ts:24](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/index.ts#L24)

___

### synths

• **synths**: [`default`](services_synths.default.md)

#### Defined in

[packages/sdk/src/index.ts:20](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/index.ts#L20)

___

### system

• **system**: [`default`](services_system.default.md)

#### Defined in

[packages/sdk/src/index.ts:25](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/index.ts#L25)

___

### transactions

• **transactions**: [`default`](services_transactions.default.md)

#### Defined in

[packages/sdk/src/index.ts:21](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/index.ts#L21)

## Methods

### setProvider

▸ **setProvider**(`provider`): `Promise`<[`NetworkId`](../modules/types_common.md#networkid)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `provider` | `Provider` |

#### Returns

`Promise`<[`NetworkId`](../modules/types_common.md#networkid)\>

#### Defined in

[packages/sdk/src/index.ts:40](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/index.ts#L40)

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

[packages/sdk/src/index.ts:44](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/index.ts#L44)
