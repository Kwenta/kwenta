[@kwenta/sdk](../README.md) / [Modules](../modules.md) / [types/transactions](../modules/types_transactions.md) / Emitter

# Interface: Emitter

[types/transactions](../modules/types_transactions.md).Emitter

## Table of contents

### Properties

- [emit](types_transactions.Emitter.md#emit)
- [listeners](types_transactions.Emitter.md#listeners)
- [on](types_transactions.Emitter.md#on)

## Properties

### emit

• **emit**: (`eventCode`: [`TransactionEventCode`](../modules/types_transactions.md#transactioneventcode), `data`: [`TransactionStatusData`](types_transactions.TransactionStatusData.md)) => `void`

#### Type declaration

▸ (`eventCode`, `data`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `eventCode` | [`TransactionEventCode`](../modules/types_transactions.md#transactioneventcode) |
| `data` | [`TransactionStatusData`](types_transactions.TransactionStatusData.md) |

##### Returns

`void`

#### Defined in

[packages/sdk/src/types/transactions.ts:21](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/types/transactions.ts#L21)

___

### listeners

• **listeners**: `Object`

#### Index signature

▪ [key: `string`]: [`EmitterListener`](types_transactions.EmitterListener.md)

#### Defined in

[packages/sdk/src/types/transactions.ts:17](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/types/transactions.ts#L17)

___

### on

• **on**: (`eventCode`: [`TransactionEventCode`](../modules/types_transactions.md#transactioneventcode), `listener`: [`EmitterListener`](types_transactions.EmitterListener.md)) => `void`

#### Type declaration

▸ (`eventCode`, `listener`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `eventCode` | [`TransactionEventCode`](../modules/types_transactions.md#transactioneventcode) |
| `listener` | [`EmitterListener`](types_transactions.EmitterListener.md) |

##### Returns

`void`

#### Defined in

[packages/sdk/src/types/transactions.ts:20](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/types/transactions.ts#L20)
