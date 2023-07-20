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

[services/synths.ts:17](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/synths.ts#L17)

## Properties

### sdk

• `Private` **sdk**: [`default`](index.default.md)

#### Defined in

[services/synths.ts:15](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/synths.ts#L15)

## Methods

### getSynthBalances

▸ **getSynthBalances**(`walletAddress`): `Promise`<{ `balances`: `SynthBalance`[] ; `balancesMap`: `Record`<`string`, `SynthBalance`\> ; `susdWalletBalance`: `Wei` ; `totalUSDBalance`: `Wei`  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `walletAddress` | `string` |

#### Returns

`Promise`<{ `balances`: `SynthBalance`[] ; `balancesMap`: `Record`<`string`, `SynthBalance`\> ; `susdWalletBalance`: `Wei` ; `totalUSDBalance`: `Wei`  }\>

#### Defined in

[services/synths.ts:21](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/synths.ts#L21)
