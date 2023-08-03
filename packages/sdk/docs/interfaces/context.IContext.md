[@kwenta/sdk](../README.md) / [Modules](../modules.md) / [context](../modules/context.md) / IContext

# Interface: IContext

[context](../modules/context.md).IContext

## Implemented by

- [`default`](../classes/context.default.md)

## Table of contents

### Properties

- [logError](context.IContext.md#logerror)
- [networkId](context.IContext.md#networkid)
- [provider](context.IContext.md#provider)
- [signer](context.IContext.md#signer)
- [walletAddress](context.IContext.md#walletaddress)

## Properties

### logError

• `Optional` **logError**: (`err`: `Error`, `skipReport?`: `boolean`) => `void`

#### Type declaration

▸ (`err`, `skipReport?`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `err` | `Error` |
| `skipReport?` | `boolean` |

##### Returns

`void`

#### Defined in

[packages/sdk/src/context.ts:20](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/context.ts#L20)

___

### networkId

• **networkId**: [`NetworkId`](../modules/types_common.md#networkid)

#### Defined in

[packages/sdk/src/context.ts:17](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/context.ts#L17)

___

### provider

• **provider**: `Provider`

#### Defined in

[packages/sdk/src/context.ts:16](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/context.ts#L16)

___

### signer

• `Optional` **signer**: `Signer`

#### Defined in

[packages/sdk/src/context.ts:18](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/context.ts#L18)

___

### walletAddress

• `Optional` **walletAddress**: `string`

#### Defined in

[packages/sdk/src/context.ts:19](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/context.ts#L19)
