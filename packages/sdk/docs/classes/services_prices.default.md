[@kwenta/sdk](../README.md) / [Modules](../modules.md) / [services/prices](../modules/services_prices.md) / default

# Class: default

[services/prices](../modules/services_prices.md).default

## Table of contents

### Constructors

- [constructor](services_prices.default.md#constructor)

### Properties

- [throttleOffChainPricesUpdate](services_prices.default.md#throttleoffchainpricesupdate)

### Accessors

- [currentPrices](services_prices.default.md#currentprices)
- [pythIds](services_prices.default.md#pythids)

### Methods

- [getOffChainPrices](services_prices.default.md#getoffchainprices)
- [getOffchainPrice](services_prices.default.md#getoffchainprice)
- [getOnChainPrices](services_prices.default.md#getonchainprices)
- [getPreviousDayPrices](services_prices.default.md#getpreviousdayprices)
- [getPythPriceUpdateData](services_prices.default.md#getpythpriceupdatedata)
- [onPricesConnectionUpdated](services_prices.default.md#onpricesconnectionupdated)
- [onPricesUpdated](services_prices.default.md#onpricesupdated)
- [removeConnectionListeners](services_prices.default.md#removeconnectionlisteners)
- [removePricesListener](services_prices.default.md#removepriceslistener)
- [removePricesListeners](services_prices.default.md#removepriceslisteners)
- [startPriceUpdates](services_prices.default.md#startpriceupdates)

## Constructors

### constructor

• **new default**(`sdk`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `sdk` | [`default`](index.default.md) |

#### Defined in

[packages/sdk/src/services/prices.ts:48](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/prices.ts#L48)

## Properties

### throttleOffChainPricesUpdate

• **throttleOffChainPricesUpdate**: `DebouncedFunc`<(`offChainPrices`: `Partial`<`Record`<[`AssetKey`](../modules/types_prices.md#assetkey), `Wei`\>\>) => `void`\>

#### Defined in

[packages/sdk/src/services/prices.ts:289](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/prices.ts#L289)

## Accessors

### currentPrices

• `get` **currentPrices**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `offChain` | `Partial`<`Record`<[`AssetKey`](../modules/types_prices.md#assetkey), `Wei`\>\> |
| `onChain` | `Partial`<`Record`<[`AssetKey`](../modules/types_prices.md#assetkey), `Wei`\>\> |

#### Defined in

[packages/sdk/src/services/prices.ts:54](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/prices.ts#L54)

___

### pythIds

• `get` **pythIds**(): `string`[]

#### Returns

`string`[]

#### Defined in

[packages/sdk/src/services/prices.ts:61](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/prices.ts#L61)

## Methods

### getOffChainPrices

▸ **getOffChainPrices**(): `Promise`<`Record`<`string`, `Wei`\>\>

#### Returns

`Promise`<`Record`<`string`, `Wei`\>\>

#### Defined in

[packages/sdk/src/services/prices.ts:159](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/prices.ts#L159)

___

### getOffchainPrice

▸ **getOffchainPrice**(`marketKey`): `Wei`

**`Desc`**

Get offchain price for a given market

**`Example`**

```ts
const sdk = new KwentaSDK();
const price = sdk.prices.getOffchainPrice(FuturesMarketKey.sBTCPERP);
console.log(price);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `marketKey` | [`FuturesMarketKey`](../enums/types_futures.FuturesMarketKey.md) | Futures market key |

#### Returns

`Wei`

Offchain price for specified market

#### Defined in

[packages/sdk/src/services/prices.ts:76](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/prices.ts#L76)

___

### getOnChainPrices

▸ **getOnChainPrices**(): `Promise`<`Record`<`string`, `Wei`\>\>

#### Returns

`Promise`<`Record`<`string`, `Wei`\>\>

#### Defined in

[packages/sdk/src/services/prices.ts:130](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/prices.ts#L130)

___

### getPreviousDayPrices

▸ **getPreviousDayPrices**(`marketAssets`, `networkId?`): `Promise`<[`SynthPrice`](../modules/types_prices.md#synthprice)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `marketAssets` | `string`[] |
| `networkId?` | [`NetworkId`](../modules/types_common.md#networkid) |

#### Returns

`Promise`<[`SynthPrice`](../modules/types_prices.md#synthprice)[]\>

#### Defined in

[packages/sdk/src/services/prices.ts:164](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/prices.ts#L164)

___

### getPythPriceUpdateData

▸ **getPythPriceUpdateData**(`marketKey`): `Promise`<`string`[]\>

**`Desc`**

Get pyth price update data for a given market

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `marketKey` | [`FuturesMarketKey`](../enums/types_futures.FuturesMarketKey.md) | Futures market key |

#### Returns

`Promise`<`string`[]\>

Pyth price update data

#### Defined in

[packages/sdk/src/services/prices.ts:203](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/prices.ts#L203)

___

### onPricesConnectionUpdated

▸ **onPricesConnectionUpdated**(`listener`): `EventEmitter`

#### Parameters

| Name | Type |
| :------ | :------ |
| `listener` | (`status`: { `connected`: `boolean` ; `error?`: `Error`  }) => `void` |

#### Returns

`EventEmitter`

#### Defined in

[packages/sdk/src/services/prices.ts:120](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/prices.ts#L120)

___

### onPricesUpdated

▸ **onPricesUpdated**(`listener`): `EventEmitter`

#### Parameters

| Name | Type |
| :------ | :------ |
| `listener` | [`PricesListener`](../modules/types_prices.md#priceslistener) |

#### Returns

`EventEmitter`

#### Defined in

[packages/sdk/src/services/prices.ts:108](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/prices.ts#L108)

___

### removeConnectionListeners

▸ **removeConnectionListeners**(): `void`

#### Returns

`void`

#### Defined in

[packages/sdk/src/services/prices.ts:126](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/prices.ts#L126)

___

### removePricesListener

▸ **removePricesListener**(`listener`): `EventEmitter`

#### Parameters

| Name | Type |
| :------ | :------ |
| `listener` | [`PricesListener`](../modules/types_prices.md#priceslistener) |

#### Returns

`EventEmitter`

#### Defined in

[packages/sdk/src/services/prices.ts:112](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/prices.ts#L112)

___

### removePricesListeners

▸ **removePricesListeners**(): `void`

#### Returns

`void`

#### Defined in

[packages/sdk/src/services/prices.ts:116](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/prices.ts#L116)

___

### startPriceUpdates

▸ **startPriceUpdates**(`intervalTime`): `Promise`<`void`\>

**`Desc`**

Start polling pyth price updates

**`Example`**

```ts
const sdk = new KwentaSDK();
await sdk.prices.startPriceUpdates(10000);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `intervalTime` | `number` | Polling interval in milliseconds |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/sdk/src/services/prices.ts:91](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/prices.ts#L91)
