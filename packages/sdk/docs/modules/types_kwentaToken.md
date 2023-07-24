[@kwenta/sdk](../README.md) / [Modules](../modules.md) / types/kwentaToken

# Module: types/kwentaToken

## Table of contents

### Type Aliases

- [ClaimParams](types_kwentaToken.md#claimparams)
- [EpochData](types_kwentaToken.md#epochdata)
- [EscrowData](types_kwentaToken.md#escrowdata)

## Type Aliases

### ClaimParams

Ƭ **ClaimParams**: [`number`, `string`, `string`, `string`[], `number`]

#### Defined in

[packages/sdk/src/types/kwentaToken.ts:3](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/types/kwentaToken.ts#L3)

___

### EpochData

Ƭ **EpochData**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `claims` | { `[address: string]`: { `amount`: `string` ; `index`: `number` ; `proof`: `string`[]  };  } |
| `merkleRoot` | `string` |
| `period` | `number` |
| `tokenTotal` | `string` |

#### Defined in

[packages/sdk/src/types/kwentaToken.ts:5](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/types/kwentaToken.ts#L5)

___

### EscrowData

Ƭ **EscrowData**<`T`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `Wei` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `amount` | `T` |
| `date` | `string` |
| `fee` | `T` |
| `id` | `number` |
| `status` | ``"Vesting"`` \| ``"Vested"`` |
| `time` | `string` |
| `version` | ``1`` \| ``2`` |
| `vestable` | `T` |

#### Defined in

[packages/sdk/src/types/kwentaToken.ts:18](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/types/kwentaToken.ts#L18)
