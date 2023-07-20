[@kwenta/sdk](../README.md) / [Modules](../modules.md) / [services/synths](../modules/services_synths.md) / default

# Class: default

[services/synths](../modules/services_synths.md).default

## Table of contents

### Constructors

- [constructor](services_synths.default.md#constructor)

### Properties

- [sdk](services_synths.default.md#sdk)

### Methods

- [getSynthBalances](services_synths.default.md#getsynthbalances)

## Constructors

### constructor

• **new default**(`sdk`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `sdk` | [`default`](index.default.md) |

#### Defined in

[packages/sdk/src/services/synths.ts:17](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/synths.ts#L17)

## Properties

### sdk

• `Private` **sdk**: [`default`](index.default.md)

#### Defined in

[packages/sdk/src/services/synths.ts:15](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/synths.ts#L15)

## Methods

### getSynthBalances

▸ **getSynthBalances**(`walletAddress`): `Promise`<{ `balances`: [`SynthBalance`](../modules/types_synths.md#synthbalance)[] ; `balancesMap`: `Record`<`string`, [`SynthBalance`](../modules/types_synths.md#synthbalance)\> ; `susdWalletBalance`: `Wei` ; `totalUSDBalance`: `Wei`  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `walletAddress` | `string` |

#### Returns

`Promise`<{ `balances`: [`SynthBalance`](../modules/types_synths.md#synthbalance)[] ; `balancesMap`: `Record`<`string`, [`SynthBalance`](../modules/types_synths.md#synthbalance)\> ; `susdWalletBalance`: `Wei` ; `totalUSDBalance`: `Wei`  }\>

#### Defined in

[packages/sdk/src/services/synths.ts:21](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/synths.ts#L21)
