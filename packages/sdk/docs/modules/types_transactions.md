[@kwenta/sdk](../README.md) / [Modules](../modules.md) / types/transactions

# Module: types/transactions

## Table of contents

### Interfaces

- [Emitter](../interfaces/types_transactions.Emitter.md)
- [EmitterListener](../interfaces/types_transactions.EmitterListener.md)
- [TransactionStatusData](../interfaces/types_transactions.TransactionStatusData.md)

### Type Aliases

- [GasLimitEstimate](types_transactions.md#gaslimitestimate)
- [GasPrice](types_transactions.md#gasprice)
- [GetCodeParams](types_transactions.md#getcodeparams)
- [RevertReasonParams](types_transactions.md#revertreasonparams)
- [TransactionEventCode](types_transactions.md#transactioneventcode)

## Type Aliases

### GasLimitEstimate

Ƭ **GasLimitEstimate**: `BigNumber` \| ``null``

#### Defined in

[packages/sdk/src/types/transactions.ts:45](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/types/transactions.ts#L45)

___

### GasPrice

Ƭ **GasPrice**<`T`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `BigNumber` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `baseFeePerGas?` | `T` |
| `gasPrice?` | `T` |
| `maxFeePerGas?` | `T` |
| `maxPriorityFeePerGas?` | `T` |

#### Defined in

[packages/sdk/src/types/transactions.ts:38](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/types/transactions.ts#L38)

___

### GetCodeParams

Ƭ **GetCodeParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `blockNumber` | `number` |
| `networkId` | `number` |
| `provider` | `ethers.providers.Provider` |
| `tx` | `ethers.providers.TransactionResponse` |

#### Defined in

[packages/sdk/src/types/transactions.ts:31](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/types/transactions.ts#L31)

___

### RevertReasonParams

Ƭ **RevertReasonParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `blockNumber` | `number` |
| `networkId` | `number` |
| `provider` | `ethers.providers.Provider` |
| `txHash` | `string` |

#### Defined in

[packages/sdk/src/types/transactions.ts:24](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/types/transactions.ts#L24)

___

### TransactionEventCode

Ƭ **TransactionEventCode**: ``"txSent"`` \| ``"txConfirmed"`` \| ``"txFailed"`` \| ``"txError"``

#### Defined in

[packages/sdk/src/types/transactions.ts:3](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/types/transactions.ts#L3)
