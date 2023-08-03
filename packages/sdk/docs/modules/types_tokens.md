[@kwenta/sdk](../README.md) / [Modules](../modules.md) / types/tokens

# Module: types/tokens

## Table of contents

### Type Aliases

- [Token](types_tokens.md#token)
- [TokenBalances](types_tokens.md#tokenbalances)

## Type Aliases

### Token

Ƭ **Token**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `address` | `string` |
| `chainId` | [`NetworkId`](types_common.md#networkid) |
| `decimals` | `number` |
| `logoURI` | `string` |
| `name` | `string` |
| `symbol` | `string` |
| `tags` | `string`[] |

#### Defined in

[packages/sdk/src/types/tokens.ts:13](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/types/tokens.ts#L13)

___

### TokenBalances

Ƭ **TokenBalances**<`T`\>: `Record`<`string`, { `balance`: `T` ; `token`: [`Token`](types_tokens.md#token)  }\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `Wei` |

#### Defined in

[packages/sdk/src/types/tokens.ts:5](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/types/tokens.ts#L5)
