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

[packages/sdk/src/services/synths.ts:17](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/services/synths.ts#L17)

## Properties

### sdk

• `Private` **sdk**: [`default`](index.default.md)

#### Defined in

[packages/sdk/src/services/synths.ts:15](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/services/synths.ts#L15)

## Methods

### getSynthBalances

▸ **getSynthBalances**(`walletAddress`): `Promise`<{ `balances`: [`SynthBalance`](../modules/types_synths.md#synthbalance)[] ; `balancesMap`: `Record`<`string`, [`SynthBalance`](../modules/types_synths.md#synthbalance)\> ; `susdWalletBalance`: `Wei` ; `totalUSDBalance`: `Wei`  }\>

**`Desc`**

Get synth balances for a given wallet address

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `walletAddress` | `string` | Wallet address |

#### Returns

`Promise`<{ `balances`: [`SynthBalance`](../modules/types_synths.md#synthbalance)[] ; `balancesMap`: `Record`<`string`, [`SynthBalance`](../modules/types_synths.md#synthbalance)\> ; `susdWalletBalance`: `Wei` ; `totalUSDBalance`: `Wei`  }\>

Synth balances for the given wallet address

#### Defined in

[packages/sdk/src/services/synths.ts:26](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/services/synths.ts#L26)
