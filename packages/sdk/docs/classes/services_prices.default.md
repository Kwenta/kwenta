[@kwenta/sdk](../README.md) / [Modules](../modules.md) / [services/prices](../modules/services_prices.md) / default

# Class: default

[services/prices](../modules/services_prices.md).default

## Table of contents

### Constructors

- [constructor](services_prices.default.md#constructor)

### Properties

- [connectionMonitorId](services_prices.default.md#connectionmonitorid)
- [lastConnectionTime](services_prices.default.md#lastconnectiontime)
- [offChainPrices](services_prices.default.md#offchainprices)
- [onChainPrices](services_prices.default.md#onchainprices)
- [pyth](services_prices.default.md#pyth)
- [ratesInterval](services_prices.default.md#ratesinterval)
- [sdk](services_prices.default.md#sdk)
- [server](services_prices.default.md#server)
- [throttleOffChainPricesUpdate](services_prices.default.md#throttleoffchainpricesupdate)
- [wsConnected](services_prices.default.md#wsconnected)

### Accessors

- [currentPrices](services_prices.default.md#currentprices)
- [pythIds](services_prices.default.md#pythids)

### Methods

- [connectToPyth](services_prices.default.md#connecttopyth)
- [formatOffChainPrices](services_prices.default.md#formatoffchainprices)
- [formatPythPrice](services_prices.default.md#formatpythprice)
- [getOffChainPrices](services_prices.default.md#getoffchainprices)
- [getOffchainPrice](services_prices.default.md#getoffchainprice)
- [getOnChainPrices](services_prices.default.md#getonchainprices)
- [getPreviousDayPrices](services_prices.default.md#getpreviousdayprices)
- [getPythPriceUpdateData](services_prices.default.md#getpythpriceupdatedata)
- [monitorConnection](services_prices.default.md#monitorconnection)
- [onPricesConnectionUpdated](services_prices.default.md#onpricesconnectionupdated)
- [onPricesUpdated](services_prices.default.md#onpricesupdated)
- [removeConnectionListeners](services_prices.default.md#removeconnectionlisteners)
- [removePricesListener](services_prices.default.md#removepriceslistener)
- [removePricesListeners](services_prices.default.md#removepriceslisteners)
- [setEventListeners](services_prices.default.md#seteventlisteners)
- [setWsConnected](services_prices.default.md#setwsconnected)
- [startPriceUpdates](services_prices.default.md#startpriceupdates)
- [subscribeToPythPriceUpdates](services_prices.default.md#subscribetopythpriceupdates)
- [switchConnection](services_prices.default.md#switchconnection)

## Constructors

### constructor

• **new default**(`sdk`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `sdk` | [`default`](index.default.md) |

#### Defined in

[packages/sdk/src/services/prices.ts:48](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/services/prices.ts#L48)

## Properties

### connectionMonitorId

• `Private` `Optional` **connectionMonitorId**: `Timeout`

#### Defined in

[packages/sdk/src/services/prices.ts:46](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/services/prices.ts#L46)

___

### lastConnectionTime

• `Private` **lastConnectionTime**: `number`

#### Defined in

[packages/sdk/src/services/prices.ts:43](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/services/prices.ts#L43)

___

### offChainPrices

• `Private` **offChainPrices**: `Partial`<`Record`<[`AssetKey`](../modules/types_prices.md#assetkey), `Wei`\>\> = `{}`

#### Defined in

[packages/sdk/src/services/prices.ts:39](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/services/prices.ts#L39)

___

### onChainPrices

• `Private` **onChainPrices**: `Partial`<`Record`<[`AssetKey`](../modules/types_prices.md#assetkey), `Wei`\>\> = `{}`

#### Defined in

[packages/sdk/src/services/prices.ts:40](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/services/prices.ts#L40)

___

### pyth

• `Private` **pyth**: `EvmPriceServiceConnection`

#### Defined in

[packages/sdk/src/services/prices.ts:42](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/services/prices.ts#L42)

___

### ratesInterval

• `Private` `Optional` **ratesInterval**: `Timeout`

#### Defined in

[packages/sdk/src/services/prices.ts:41](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/services/prices.ts#L41)

___

### sdk

• `Private` **sdk**: [`default`](index.default.md)

#### Defined in

[packages/sdk/src/services/prices.ts:38](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/services/prices.ts#L38)

___

### server

• `Private` **server**: [`PriceServer`](../modules/types_common.md#priceserver) = `DEFAULT_PRICE_SERVER`

#### Defined in

[packages/sdk/src/services/prices.ts:45](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/services/prices.ts#L45)

___

### throttleOffChainPricesUpdate

• **throttleOffChainPricesUpdate**: `DebouncedFunc`<(`offChainPrices`: `Partial`<`Record`<[`AssetKey`](../modules/types_prices.md#assetkey), `Wei`\>\>) => `void`\>

#### Defined in

[packages/sdk/src/services/prices.ts:296](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/services/prices.ts#L296)

___

### wsConnected

• `Private` **wsConnected**: `boolean` = `false`

#### Defined in

[packages/sdk/src/services/prices.ts:44](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/services/prices.ts#L44)

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

[packages/sdk/src/services/prices.ts:54](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/services/prices.ts#L54)

___

### pythIds

• `get` **pythIds**(): `string`[]

#### Returns

`string`[]

#### Defined in

[packages/sdk/src/services/prices.ts:61](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/services/prices.ts#L61)

## Methods

### connectToPyth

▸ `Private` **connectToPyth**(`networkId`, `server`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `networkId` | [`NetworkId`](../modules/types_common.md#networkid) |
| `server` | [`PriceServer`](../modules/types_common.md#priceserver) |

#### Returns

`void`

#### Defined in

[packages/sdk/src/services/prices.ts:234](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/services/prices.ts#L234)

___

### formatOffChainPrices

▸ `Private` **formatOffChainPrices**(`pythPrices`): `Record`<`string`, `Wei`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `pythPrices` | `PriceFeed`[] |

#### Returns

`Record`<`string`, `Wei`\>

#### Defined in

[packages/sdk/src/services/prices.ts:219](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/services/prices.ts#L219)

___

### formatPythPrice

▸ `Private` **formatPythPrice**(`priceFeed`): `Wei`

#### Parameters

| Name | Type |
| :------ | :------ |
| `priceFeed` | `PriceFeed` |

#### Returns

`Wei`

#### Defined in

[packages/sdk/src/services/prices.ts:291](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/services/prices.ts#L291)

___

### getOffChainPrices

▸ **getOffChainPrices**(): `Promise`<`Record`<`string`, `Wei`\>\>

#### Returns

`Promise`<`Record`<`string`, `Wei`\>\>

#### Defined in

[packages/sdk/src/services/prices.ts:159](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/services/prices.ts#L159)

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

[packages/sdk/src/services/prices.ts:76](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/services/prices.ts#L76)

___

### getOnChainPrices

▸ **getOnChainPrices**(): `Promise`<`Record`<`string`, `Wei`\>\>

#### Returns

`Promise`<`Record`<`string`, `Wei`\>\>

#### Defined in

[packages/sdk/src/services/prices.ts:130](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/services/prices.ts#L130)

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

[packages/sdk/src/services/prices.ts:164](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/services/prices.ts#L164)

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

[packages/sdk/src/services/prices.ts:210](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/services/prices.ts#L210)

___

### monitorConnection

▸ `Private` **monitorConnection**(): `void`

#### Returns

`void`

#### Defined in

[packages/sdk/src/services/prices.ts:274](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/services/prices.ts#L274)

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

[packages/sdk/src/services/prices.ts:120](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/services/prices.ts#L120)

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

[packages/sdk/src/services/prices.ts:108](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/services/prices.ts#L108)

___

### removeConnectionListeners

▸ **removeConnectionListeners**(): `void`

#### Returns

`void`

#### Defined in

[packages/sdk/src/services/prices.ts:126](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/services/prices.ts#L126)

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

[packages/sdk/src/services/prices.ts:112](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/services/prices.ts#L112)

___

### removePricesListeners

▸ **removePricesListeners**(): `void`

#### Returns

`void`

#### Defined in

[packages/sdk/src/services/prices.ts:116](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/services/prices.ts#L116)

___

### setEventListeners

▸ `Private` **setEventListeners**(): `void`

#### Returns

`void`

#### Defined in

[packages/sdk/src/services/prices.ts:268](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/services/prices.ts#L268)

___

### setWsConnected

▸ `Private` **setWsConnected**(`connected`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `connected` | `boolean` |

#### Returns

`void`

#### Defined in

[packages/sdk/src/services/prices.ts:259](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/services/prices.ts#L259)

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

[packages/sdk/src/services/prices.ts:91](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/services/prices.ts#L91)

___

### subscribeToPythPriceUpdates

▸ `Private` **subscribeToPythPriceUpdates**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/sdk/src/services/prices.ts:304](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/services/prices.ts#L304)

___

### switchConnection

▸ `Private` **switchConnection**(): `void`

#### Returns

`void`

#### Defined in

[packages/sdk/src/services/prices.ts:286](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/services/prices.ts#L286)
