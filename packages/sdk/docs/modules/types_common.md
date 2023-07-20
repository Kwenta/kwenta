[@kwenta/sdk](../README.md) / [Modules](../modules.md) / types/common

# Module: types/common

## Table of contents

### Enumerations

- [TransactionStatus](../enums/types_common.TransactionStatus.md)

### Type Aliases

- [CurrencyKey](types_common.md#currencykey)
- [NetworkId](types_common.md#networkid)
- [NetworkOverrideOptions](types_common.md#networkoverrideoptions)
- [PriceServer](types_common.md#priceserver)

### Variables

- [NetworkIdByName](types_common.md#networkidbyname)
- [NetworkNameById](types_common.md#networknamebyid)

## Type Aliases

### CurrencyKey

Ƭ **CurrencyKey**: `string`

#### Defined in

[packages/sdk/src/types/common.ts:39](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/types/common.ts#L39)

___

### NetworkId

Ƭ **NetworkId**: ``1`` \| ``5`` \| ``420`` \| ``10`` \| ``42`` \| ``69`` \| ``31337``

#### Defined in

[packages/sdk/src/types/common.ts:5](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/types/common.ts#L5)

___

### NetworkOverrideOptions

Ƭ **NetworkOverrideOptions**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `networkId` | [`NetworkId`](types_common.md#networkid) |
| `provider` | `ethers.providers.Provider` |

#### Defined in

[packages/sdk/src/types/common.ts:7](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/types/common.ts#L7)

___

### PriceServer

Ƭ **PriceServer**: ``"KWENTA"`` \| ``"PYTH"``

#### Defined in

[packages/sdk/src/types/common.ts:3](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/types/common.ts#L3)

## Variables

### NetworkIdByName

• `Const` **NetworkIdByName**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `goerli` | ``5`` |
| `goerli-ovm` | ``420`` |
| `kovan` | ``42`` |
| `kovan-ovm` | ``69`` |
| `mainnet` | ``1`` |
| `mainnet-fork` | ``31337`` |
| `mainnet-ovm` | ``10`` |

#### Defined in

[packages/sdk/src/types/common.ts:19](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/types/common.ts#L19)

___

### NetworkNameById

• `Const` **NetworkNameById**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `1` | ``"mainnet"`` |
| `10` | ``"mainnet-ovm"`` |
| `31337` | ``"mainnet-fork"`` |
| `42` | ``"kovan"`` |
| `420` | ``"goerli-ovm"`` |
| `5` | ``"goerli"`` |
| `69` | ``"kovan-ovm"`` |

#### Defined in

[packages/sdk/src/types/common.ts:29](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/types/common.ts#L29)
