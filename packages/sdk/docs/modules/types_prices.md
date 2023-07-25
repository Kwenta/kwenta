[@kwenta/sdk](../README.md) / [Modules](../modules.md) / types/prices

# Module: types/prices

## Table of contents

### Type Aliases

- [AssetKey](types_prices.md#assetkey)
- [CurrencyPrice](types_prices.md#currencyprice)
- [Price](types_prices.md#price)
- [PriceType](types_prices.md#pricetype)
- [Prices](types_prices.md#prices)
- [PricesListener](types_prices.md#priceslistener)
- [PricesMap](types_prices.md#pricesmap)
- [SynthPrice](types_prices.md#synthprice)
- [SynthPricesTuple](types_prices.md#synthpricestuple)

## Type Aliases

### AssetKey

Ƭ **AssetKey**: [`FuturesMarketAsset`](../enums/types_futures.FuturesMarketAsset.md) \| ``"sUSD"``

#### Defined in

[packages/sdk/src/types/prices.ts:13](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/types/prices.ts#L13)

___

### CurrencyPrice

Ƭ **CurrencyPrice**: `BigNumberish`

#### Defined in

[packages/sdk/src/types/prices.ts:6](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/types/prices.ts#L6)

___

### Price

Ƭ **Price**<`T`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `Wei` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `offChain?` | `T` |
| `onChain?` | `T` |

#### Defined in

[packages/sdk/src/types/prices.ts:8](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/types/prices.ts#L8)

___

### PriceType

Ƭ **PriceType**: ``"on_chain"`` \| ``"off_chain"``

#### Defined in

[packages/sdk/src/types/prices.ts:24](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/types/prices.ts#L24)

___

### Prices

Ƭ **Prices**<`T`\>: `Record`<`string`, [`Price`](types_prices.md#price)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `Wei` |

#### Defined in

[packages/sdk/src/types/prices.ts:15](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/types/prices.ts#L15)

___

### PricesListener

Ƭ **PricesListener**: (`updatedPrices`: { `prices`: [`PricesMap`](types_prices.md#pricesmap) ; `source`: ``"fetch"`` \| ``"stream"`` ; `type`: [`PriceType`](types_prices.md#pricetype)  }) => `void`

#### Type declaration

▸ (`updatedPrices`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `updatedPrices` | `Object` |
| `updatedPrices.prices` | [`PricesMap`](types_prices.md#pricesmap) |
| `updatedPrices.source` | ``"fetch"`` \| ``"stream"`` |
| `updatedPrices.type` | [`PriceType`](types_prices.md#pricetype) |

##### Returns

`void`

#### Defined in

[packages/sdk/src/types/prices.ts:26](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/types/prices.ts#L26)

___

### PricesMap

Ƭ **PricesMap**<`T`\>: `Partial`<`Record`<[`AssetKey`](types_prices.md#assetkey), `T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `Wei` |

#### Defined in

[packages/sdk/src/types/prices.ts:17](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/types/prices.ts#L17)

___

### SynthPrice

Ƭ **SynthPrice**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `rate` | `Wei` |
| `synth` | `string` |

#### Defined in

[packages/sdk/src/types/prices.ts:19](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/types/prices.ts#L19)

___

### SynthPricesTuple

Ƭ **SynthPricesTuple**: [`string`[], [`CurrencyPrice`](types_prices.md#currencyprice)[]]

#### Defined in

[packages/sdk/src/types/prices.ts:7](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/types/prices.ts#L7)
