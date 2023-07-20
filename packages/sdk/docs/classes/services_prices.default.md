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

[services/prices.ts:48](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/prices.ts#L48)

## Properties

### connectionMonitorId

• `Private` `Optional` **connectionMonitorId**: `Timeout`

#### Defined in

[services/prices.ts:46](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/prices.ts#L46)

___

### lastConnectionTime

• `Private` **lastConnectionTime**: `number`

#### Defined in

[services/prices.ts:43](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/prices.ts#L43)

___

### offChainPrices

• `Private` **offChainPrices**: `Partial`<`Record`<`AssetKey`, `Wei`\>\> = `{}`

#### Defined in

[services/prices.ts:39](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/prices.ts#L39)

___

### onChainPrices

• `Private` **onChainPrices**: `Partial`<`Record`<`AssetKey`, `Wei`\>\> = `{}`

#### Defined in

[services/prices.ts:40](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/prices.ts#L40)

___

### pyth

• `Private` **pyth**: `EvmPriceServiceConnection`

#### Defined in

[services/prices.ts:42](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/prices.ts#L42)

___

### ratesInterval

• `Private` `Optional` **ratesInterval**: `Timeout`

#### Defined in

[services/prices.ts:41](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/prices.ts#L41)

___

### sdk

• `Private` **sdk**: [`default`](index.default.md)

#### Defined in

[services/prices.ts:38](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/prices.ts#L38)

___

### server

• `Private` **server**: `PriceServer` = `DEFAULT_PRICE_SERVER`

#### Defined in

[services/prices.ts:45](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/prices.ts#L45)

___

### throttleOffChainPricesUpdate

• **throttleOffChainPricesUpdate**: `DebouncedFunc`<(`offChainPrices`: `Partial`<`Record`<`AssetKey`, `Wei`\>\>) => `void`\>

#### Defined in

[services/prices.ts:271](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/prices.ts#L271)

___

### wsConnected

• `Private` **wsConnected**: `boolean` = `false`

#### Defined in

[services/prices.ts:44](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/prices.ts#L44)

## Accessors

### currentPrices

• `get` **currentPrices**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `offChain` | `Partial`<`Record`<`AssetKey`, `Wei`\>\> |
| `onChain` | `Partial`<`Record`<`AssetKey`, `Wei`\>\> |

#### Defined in

[services/prices.ts:54](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/prices.ts#L54)

___

### pythIds

• `get` **pythIds**(): `string`[]

#### Returns

`string`[]

#### Defined in

[services/prices.ts:61](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/prices.ts#L61)

## Methods

### connectToPyth

▸ `Private` **connectToPyth**(`networkId`, `server`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `networkId` | `NetworkId` |
| `server` | `PriceServer` |

#### Returns

`void`

#### Defined in

[services/prices.ts:209](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/prices.ts#L209)

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

[services/prices.ts:194](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/prices.ts#L194)

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

[services/prices.ts:266](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/prices.ts#L266)

___

### getOffChainPrices

▸ **getOffChainPrices**(): `Promise`<`Record`<`string`, `Wei`\>\>

#### Returns

`Promise`<`Record`<`string`, `Wei`\>\>

#### Defined in

[services/prices.ts:139](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/prices.ts#L139)

___

### getOffchainPrice

▸ **getOffchainPrice**(`marketKey`): `Wei`

#### Parameters

| Name | Type |
| :------ | :------ |
| `marketKey` | `FuturesMarketKey` |

#### Returns

`Wei`

#### Defined in

[services/prices.ts:65](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/prices.ts#L65)

___

### getOnChainPrices

▸ **getOnChainPrices**(): `Promise`<`Record`<`string`, `Wei`\>\>

#### Returns

`Promise`<`Record`<`string`, `Wei`\>\>

#### Defined in

[services/prices.ts:110](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/prices.ts#L110)

___

### getPreviousDayPrices

▸ **getPreviousDayPrices**(`marketAssets`, `networkId?`): `Promise`<`SynthPrice`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `marketAssets` | `string`[] |
| `networkId?` | `NetworkId` |

#### Returns

`Promise`<`SynthPrice`[]\>

#### Defined in

[services/prices.ts:144](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/prices.ts#L144)

___

### getPythPriceUpdateData

▸ **getPythPriceUpdateData**(`marketKey`): `Promise`<`string`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `marketKey` | `FuturesMarketKey` |

#### Returns

`Promise`<`string`[]\>

#### Defined in

[services/prices.ts:185](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/prices.ts#L185)

___

### monitorConnection

▸ `Private` **monitorConnection**(): `void`

#### Returns

`void`

#### Defined in

[services/prices.ts:249](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/prices.ts#L249)

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

[services/prices.ts:100](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/prices.ts#L100)

___

### onPricesUpdated

▸ **onPricesUpdated**(`listener`): `EventEmitter`

#### Parameters

| Name | Type |
| :------ | :------ |
| `listener` | `PricesListener` |

#### Returns

`EventEmitter`

#### Defined in

[services/prices.ts:88](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/prices.ts#L88)

___

### removeConnectionListeners

▸ **removeConnectionListeners**(): `void`

#### Returns

`void`

#### Defined in

[services/prices.ts:106](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/prices.ts#L106)

___

### removePricesListener

▸ **removePricesListener**(`listener`): `EventEmitter`

#### Parameters

| Name | Type |
| :------ | :------ |
| `listener` | `PricesListener` |

#### Returns

`EventEmitter`

#### Defined in

[services/prices.ts:92](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/prices.ts#L92)

___

### removePricesListeners

▸ **removePricesListeners**(): `void`

#### Returns

`void`

#### Defined in

[services/prices.ts:96](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/prices.ts#L96)

___

### setEventListeners

▸ `Private` **setEventListeners**(): `void`

#### Returns

`void`

#### Defined in

[services/prices.ts:243](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/prices.ts#L243)

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

[services/prices.ts:234](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/prices.ts#L234)

___

### startPriceUpdates

▸ **startPriceUpdates**(`intervalTime`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `intervalTime` | `number` |

#### Returns

`Promise`<`void`\>

#### Defined in

[services/prices.ts:71](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/prices.ts#L71)

___

### subscribeToPythPriceUpdates

▸ `Private` **subscribeToPythPriceUpdates**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[services/prices.ts:279](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/prices.ts#L279)

___

### switchConnection

▸ `Private` **switchConnection**(): `void`

#### Returns

`void`

#### Defined in

[services/prices.ts:261](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/prices.ts#L261)
