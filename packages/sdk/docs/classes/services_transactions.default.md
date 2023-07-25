[@kwenta/sdk](../README.md) / [Modules](../modules.md) / [services/transactions](../modules/services_transactions.md) / default

# Class: default

[services/transactions](../modules/services_transactions.md).default

## Table of contents

### Constructors

- [constructor](services_transactions.default.md#constructor)

### Properties

- [sdk](services_transactions.default.md#sdk)

### Methods

- [createContractTxn](services_transactions.default.md#createcontracttxn)
- [createEVMTxn](services_transactions.default.md#createevmtxn)
- [createSynthetixTxn](services_transactions.default.md#createsynthetixtxn)
- [estimateGas](services_transactions.default.md#estimategas)
- [getGasPrice](services_transactions.default.md#getgasprice)
- [getOptimismLayerOneFees](services_transactions.default.md#getoptimismlayeronefees)
- [hash](services_transactions.default.md#hash)
- [watchTransaction](services_transactions.default.md#watchtransaction)

## Constructors

### constructor

• **new default**(`sdk`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `sdk` | [`default`](index.default.md) |

#### Defined in

[packages/sdk/src/services/transactions.ts:29](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/services/transactions.ts#L29)

## Properties

### sdk

• `Private` **sdk**: [`default`](index.default.md)

#### Defined in

[packages/sdk/src/services/transactions.ts:27](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/services/transactions.ts#L27)

## Methods

### createContractTxn

▸ **createContractTxn**(`contract`, `method`, `args`, `txnOptions?`, `options?`): `Promise`<`TransactionResponse`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `contract` | `Contract` |
| `method` | `string` |
| `args` | `any`[] |
| `txnOptions` | `Partial`<`TransactionRequest`\> |
| `options?` | `Object` |
| `options.gasLimitBuffer?` | `number` |

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/transactions.ts:78](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/services/transactions.ts#L78)

___

### createEVMTxn

▸ **createEVMTxn**(`txn`, `options?`): `Promise`<`TransactionResponse`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `txn` | `TransactionRequest` |
| `options?` | `any` |

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/transactions.ts:95](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/services/transactions.ts#L95)

___

### createSynthetixTxn

▸ **createSynthetixTxn**(`contractName`, `method`, `args`, `txnOptions?`, `options?`): `Promise`<`TransactionResponse`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `contractName` | ``"Exchanger"`` \| ``"SystemStatus"`` \| ``"ExchangeRates"`` \| ``"SynthUtil"`` \| ``"SystemSettings"`` \| ``"SynthRedeemer"`` \| ``"FuturesMarketData"`` \| ``"FuturesMarketSettings"`` \| ``"PerpsV2MarketData"`` \| ``"PerpsV2MarketSettings"`` \| ``"Pyth"`` \| ``"SUSD"`` \| ``"Synthetix"`` \| ``"SynthSwap"`` \| ``"SmartMarginAccountFactory"`` \| ``"KwentaArrakisVault"`` \| ``"StakingRewards"`` \| ``"KwentaToken"`` \| ``"KwentaStakingRewards"`` \| ``"KwentaStakingRewardsV2"`` \| ``"RewardEscrow"`` \| ``"RewardEscrowV2"`` \| ``"SupplySchedule"`` \| ``"vKwentaToken"`` \| ``"veKwentaToken"`` \| ``"vKwentaRedeemer"`` \| ``"veKwentaRedeemer"`` \| ``"BatchClaimer"`` \| ``"MultipleMerkleDistributor"`` \| ``"MultipleMerkleDistributorPerpsV2"`` \| ``"MultipleMerkleDistributorOp"`` \| ``"MultipleMerkleDistributorSnxOp"`` \| ``"perpsV3MarketProxy"`` |
| `method` | `string` |
| `args` | `any`[] |
| `txnOptions` | `Partial`<`TransactionRequest`\> |
| `options?` | `any` |

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/transactions.ts:110](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/services/transactions.ts#L110)

___

### estimateGas

▸ **estimateGas**(`txn`): `Promise`<`BigNumber`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `txn` | `TransactionRequest` |

#### Returns

`Promise`<`BigNumber`\>

#### Defined in

[packages/sdk/src/services/transactions.ts:126](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/services/transactions.ts#L126)

___

### getGasPrice

▸ **getGasPrice**(): `Promise`<{ `average`: { `gasPrice`: `BigNumber`  } ; `fast`: { `gasPrice`: `BigNumber`  } ; `fastest`: { `gasPrice`: `BigNumber`  }  } \| { `average`: { `baseFeePerGas`: `BigNumber` ; `maxFeePerGas`: `BigNumber` ; `maxPriorityFeePerGas`: `BigNumber`  } ; `fast`: { `baseFeePerGas`: `BigNumber` ; `maxFeePerGas`: `BigNumber` ; `maxPriorityFeePerGas`: `BigNumber`  } ; `fastest`: { `baseFeePerGas`: `BigNumber` ; `maxFeePerGas`: `BigNumber` ; `maxPriorityFeePerGas`: `BigNumber`  }  }\>

#### Returns

`Promise`<{ `average`: { `gasPrice`: `BigNumber`  } ; `fast`: { `gasPrice`: `BigNumber`  } ; `fastest`: { `gasPrice`: `BigNumber`  }  } \| { `average`: { `baseFeePerGas`: `BigNumber` ; `maxFeePerGas`: `BigNumber` ; `maxPriorityFeePerGas`: `BigNumber`  } ; `fast`: { `baseFeePerGas`: `BigNumber` ; `maxFeePerGas`: `BigNumber` ; `maxPriorityFeePerGas`: `BigNumber`  } ; `fastest`: { `baseFeePerGas`: `BigNumber` ; `maxFeePerGas`: `BigNumber` ; `maxPriorityFeePerGas`: `BigNumber`  }  }\>

#### Defined in

[packages/sdk/src/services/transactions.ts:158](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/services/transactions.ts#L158)

___

### getOptimismLayerOneFees

▸ **getOptimismLayerOneFees**(`txn?`): `Promise`<``null`` \| `Wei`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `txn?` | `TransactionRequest` |

#### Returns

`Promise`<``null`` \| `Wei`\>

#### Defined in

[packages/sdk/src/services/transactions.ts:132](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/services/transactions.ts#L132)

___

### hash

▸ **hash**(`transactionHash`): [`Emitter`](../interfaces/types_transactions.Emitter.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `transactionHash` | `string` |

#### Returns

[`Emitter`](../interfaces/types_transactions.Emitter.md)

#### Defined in

[packages/sdk/src/services/transactions.ts:34](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/services/transactions.ts#L34)

___

### watchTransaction

▸ **watchTransaction**(`transactionHash`, `emitter`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `transactionHash` | `string` |
| `emitter` | [`Emitter`](../interfaces/types_transactions.Emitter.md) |

#### Returns

`void`

#### Defined in

[packages/sdk/src/services/transactions.ts:40](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/services/transactions.ts#L40)
