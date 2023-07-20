[@kwenta/sdk](../README.md) / [Modules](../modules.md) / [services/perpsV3](../modules/services_perpsV3.md) / default

# Class: default

[services/perpsV3](../modules/services_perpsV3.md).default

## Table of contents

### Constructors

- [constructor](services_perpsV3.default.md#constructor)

### Properties

- [internalFuturesMarkets](services_perpsV3.default.md#internalfuturesmarkets)
- [markets](services_perpsV3.default.md#markets)
- [sdk](services_perpsV3.default.md#sdk)

### Accessors

- [subgraphUrl](services_perpsV3.default.md#subgraphurl)

### Methods

- [approveDeposit](services_perpsV3.default.md#approvedeposit)
- [cancelDelayedOrder](services_perpsV3.default.md#canceldelayedorder)
- [closePosition](services_perpsV3.default.md#closeposition)
- [createPerpsV3Account](services_perpsV3.default.md#createperpsv3account)
- [depositToAccount](services_perpsV3.default.md#deposittoaccount)
- [executeDelayedOffchainOrder](services_perpsV3.default.md#executedelayedoffchainorder)
- [executeDelayedOrder](services_perpsV3.default.md#executedelayedorder)
- [getAccountCollateral](services_perpsV3.default.md#getaccountcollateral)
- [getAccountOwner](services_perpsV3.default.md#getaccountowner)
- [getAllTrades](services_perpsV3.default.md#getalltrades)
- [getAvailableMargin](services_perpsV3.default.md#getavailablemargin)
- [getAverageFundingRates](services_perpsV3.default.md#getaveragefundingrates)
- [getDailyVolumes](services_perpsV3.default.md#getdailyvolumes)
- [getDelayedOrder](services_perpsV3.default.md#getdelayedorder)
- [getDelayedOrders](services_perpsV3.default.md#getdelayedorders)
- [getFuturesPositions](services_perpsV3.default.md#getfuturespositions)
- [getFuturesTrades](services_perpsV3.default.md#getfuturestrades)
- [getIsolatedTradePreview](services_perpsV3.default.md#getisolatedtradepreview)
- [getMarginTransfers](services_perpsV3.default.md#getmargintransfers)
- [getMarketFundingRatesHistory](services_perpsV3.default.md#getmarketfundingrateshistory)
- [getMarkets](services_perpsV3.default.md#getmarkets)
- [getOrderFee](services_perpsV3.default.md#getorderfee)
- [getPerpsV3AccountIds](services_perpsV3.default.md#getperpsv3accountids)
- [getPositionHistory](services_perpsV3.default.md#getpositionhistory)
- [getSkewAdjustedPrice](services_perpsV3.default.md#getskewadjustedprice)
- [getTradesForMarket](services_perpsV3.default.md#gettradesformarket)
- [submitOrder](services_perpsV3.default.md#submitorder)
- [withdrawFromAccount](services_perpsV3.default.md#withdrawfromaccount)

## Constructors

### constructor

• **new default**(`sdk`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `sdk` | [`default`](index.default.md) |

#### Defined in

[packages/sdk/src/services/perpsV3.ts:60](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/perpsV3.ts#L60)

## Properties

### internalFuturesMarkets

• **internalFuturesMarkets**: `Partial`<`Record`<[`NetworkId`](../modules/types_common.md#networkid), { `[marketAddress: string]`: `PerpsV2MarketInternal`;  }\>\> = `{}`

#### Defined in

[packages/sdk/src/services/perpsV3.ts:56](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/perpsV3.ts#L56)

___

### markets

• **markets**: `undefined` \| [`FuturesMarket`](../modules/types_futures.md#futuresmarket)[]

#### Defined in

[packages/sdk/src/services/perpsV3.ts:55](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/perpsV3.ts#L55)

___

### sdk

• `Private` **sdk**: [`default`](index.default.md)

#### Defined in

[packages/sdk/src/services/perpsV3.ts:54](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/perpsV3.ts#L54)

## Accessors

### subgraphUrl

• `get` **subgraphUrl**(): `string`

#### Returns

`string`

#### Defined in

[packages/sdk/src/services/perpsV3.ts:64](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/perpsV3.ts#L64)

## Methods

### approveDeposit

▸ **approveDeposit**(`crossMarginAddress`, `amount?`): `Promise`<`TransactionResponse`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `crossMarginAddress` | `string` |
| `amount` | `BigNumber` |

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/perpsV3.ts:515](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/perpsV3.ts#L515)

___

### cancelDelayedOrder

▸ **cancelDelayedOrder**(`marketAddress`, `account`, `isOffchain`): `Promise`<`ContractTransaction`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `marketAddress` | `string` |
| `account` | `string` |
| `isOffchain` | `boolean` |

#### Returns

`Promise`<`ContractTransaction`\>

#### Defined in

[packages/sdk/src/services/perpsV3.ts:568](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/perpsV3.ts#L568)

___

### closePosition

▸ **closePosition**(`marketAddress`, `priceImpactDelta`): `Promise`<`ContractTransaction`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `marketAddress` | `string` |
| `priceImpactDelta` | `Wei` |

#### Returns

`Promise`<`ContractTransaction`\>

#### Defined in

[packages/sdk/src/services/perpsV3.ts:542](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/perpsV3.ts#L542)

___

### createPerpsV3Account

▸ **createPerpsV3Account**(`requestedId`): `Promise`<`TransactionResponse`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `requestedId` | `BigNumberish` |

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/perpsV3.ts:596](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/perpsV3.ts#L596)

___

### depositToAccount

▸ **depositToAccount**(`marketAddress`, `amount`): `Promise`<`TransactionResponse`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `marketAddress` | `string` |
| `amount` | `Wei` |

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/perpsV3.ts:526](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/perpsV3.ts#L526)

___

### executeDelayedOffchainOrder

▸ **executeDelayedOffchainOrder**(`marketKey`, `marketAddress`, `account`): `Promise`<`ContractTransaction`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `marketKey` | [`FuturesMarketKey`](../enums/types_futures.FuturesMarketKey.md) |
| `marketAddress` | `string` |
| `account` | `string` |

#### Returns

`Promise`<`ContractTransaction`\>

#### Defined in

[packages/sdk/src/services/perpsV3.ts:580](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/perpsV3.ts#L580)

___

### executeDelayedOrder

▸ **executeDelayedOrder**(`marketAddress`, `account`): `Promise`<`ContractTransaction`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `marketAddress` | `string` |
| `account` | `string` |

#### Returns

`Promise`<`ContractTransaction`\>

#### Defined in

[packages/sdk/src/services/perpsV3.ts:575](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/perpsV3.ts#L575)

___

### getAccountCollateral

▸ **getAccountCollateral**(`crossMarginAddress`): `Promise`<{}\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `crossMarginAddress` | `string` |

#### Returns

`Promise`<{}\>

#### Defined in

[packages/sdk/src/services/perpsV3.ts:417](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/perpsV3.ts#L417)

___

### getAccountOwner

▸ **getAccountOwner**(`id`): `Promise`<``null`` \| `string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `BigNumberish` |

#### Returns

`Promise`<``null`` \| `string`\>

#### Defined in

[packages/sdk/src/services/perpsV3.ts:404](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/perpsV3.ts#L404)

___

### getAllTrades

▸ **getAllTrades**(`walletAddress`, `accountType`, `pageLength?`): `Promise`<[`FuturesTrade`](../modules/types_futures.md#futurestrade)[]\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `walletAddress` | `string` | `undefined` |
| `accountType` | [`FuturesMarginType`](../enums/types_futures.FuturesMarginType.md) | `undefined` |
| `pageLength` | `number` | `16` |

#### Returns

`Promise`<[`FuturesTrade`](../modules/types_futures.md#futurestrade)[]\>

#### Defined in

[packages/sdk/src/services/perpsV3.ts:487](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/perpsV3.ts#L487)

___

### getAvailableMargin

▸ **getAvailableMargin**(`walletAddress`, `crossMarginAddress`): `Promise`<`Wei`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `walletAddress` | `string` |
| `crossMarginAddress` | `string` |

#### Returns

`Promise`<`Wei`\>

#### Defined in

[packages/sdk/src/services/perpsV3.ts:422](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/perpsV3.ts#L422)

___

### getAverageFundingRates

▸ **getAverageFundingRates**(`_markets`, `_prices`, `_period`): `Promise`<`never`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `_markets` | [`FuturesMarket`](../modules/types_futures.md#futuresmarket)[] |
| `_prices` | `Partial`<`Record`<[`AssetKey`](../modules/types_prices.md#assetkey), `Wei`\>\> |
| `_period` | `Period` |

#### Returns

`Promise`<`never`[]\>

#### Defined in

[packages/sdk/src/services/perpsV3.ts:259](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/perpsV3.ts#L259)

___

### getDailyVolumes

▸ **getDailyVolumes**(): `Promise`<[`FuturesVolumes`](../modules/types_futures.md#futuresvolumes)\>

#### Returns

`Promise`<[`FuturesVolumes`](../modules/types_futures.md#futuresvolumes)\>

#### Defined in

[packages/sdk/src/services/perpsV3.ts:370](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/perpsV3.ts#L370)

___

### getDelayedOrder

▸ **getDelayedOrder**(`account`, `marketAddress`): `Promise`<[`DelayedOrder`](../modules/types_futures.md#delayedorder)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `account` | `string` |
| `marketAddress` | `string` |

#### Returns

`Promise`<[`DelayedOrder`](../modules/types_futures.md#delayedorder)\>

#### Defined in

[packages/sdk/src/services/perpsV3.ts:427](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/perpsV3.ts#L427)

___

### getDelayedOrders

▸ **getDelayedOrders**(`account`, `marketAddresses`): `Promise`<[`DelayedOrder`](../modules/types_futures.md#delayedorder)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `account` | `string` |
| `marketAddresses` | `string`[] |

#### Returns

`Promise`<[`DelayedOrder`](../modules/types_futures.md#delayedorder)[]\>

#### Defined in

[packages/sdk/src/services/perpsV3.ts:433](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/perpsV3.ts#L433)

___

### getFuturesPositions

▸ **getFuturesPositions**(`address`, `futuresMarkets`): `Promise`<[`FuturesPosition`](../modules/types_futures.md#futuresposition)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `address` | `string` |
| `futuresMarkets` | { `address`: `string` ; `asset`: [`FuturesMarketAsset`](../enums/types_futures.FuturesMarketAsset.md) ; `marketKey`: [`FuturesMarketKey`](../enums/types_futures.FuturesMarketKey.md)  }[] |

#### Returns

`Promise`<[`FuturesPosition`](../modules/types_futures.md#futuresposition)[]\>

#### Defined in

[packages/sdk/src/services/perpsV3.ts:208](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/perpsV3.ts#L208)

___

### getFuturesTrades

▸ **getFuturesTrades**(`marketKey`, `minTs`, `maxTs`): `Promise`<``null`` \| [`FuturesTrade`](../modules/types_futures.md#futurestrade)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `marketKey` | [`FuturesMarketKey`](../enums/types_futures.FuturesMarketKey.md) |
| `minTs` | `number` |
| `maxTs` | `number` |

#### Returns

`Promise`<``null`` \| [`FuturesTrade`](../modules/types_futures.md#futurestrade)[]\>

#### Defined in

[packages/sdk/src/services/perpsV3.ts:501](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/perpsV3.ts#L501)

___

### getIsolatedTradePreview

▸ **getIsolatedTradePreview**(`_marketAddress`, `_marketKey`, `_orderType`, `_inputs`): `Promise`<{ `fillPrice`: `Wei` ; `leverage`: `Wei` ; `liqPrice`: `Wei`  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `_marketAddress` | `string` |
| `_marketKey` | [`FuturesMarketKey`](../enums/types_futures.FuturesMarketKey.md) |
| `_orderType` | [`ContractOrderType`](../enums/types_futures.ContractOrderType.md) |
| `_inputs` | `Object` |
| `_inputs.leverageSide` | [`PositionSide`](../enums/types_futures.PositionSide.md) |
| `_inputs.price` | `Wei` |
| `_inputs.sizeDelta` | `Wei` |

#### Returns

`Promise`<{ `fillPrice`: `Wei` ; `leverage`: `Wei` ; `liqPrice`: `Wei`  }\>

#### Defined in

[packages/sdk/src/services/perpsV3.ts:444](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/perpsV3.ts#L444)

___

### getMarginTransfers

▸ **getMarginTransfers**(`walletAddress?`): `Promise`<[`MarginTransfer`](../modules/types_futures.md#margintransfer)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `walletAddress?` | ``null`` \| `string` |

#### Returns

`Promise`<[`MarginTransfer`](../modules/types_futures.md#margintransfer)[]\>

#### Defined in

[packages/sdk/src/services/perpsV3.ts:412](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/perpsV3.ts#L412)

___

### getMarketFundingRatesHistory

▸ **getMarketFundingRatesHistory**(`marketAsset`, `periodLength?`): `Promise`<`any`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `marketAsset` | [`FuturesMarketAsset`](../enums/types_futures.FuturesMarketAsset.md) | `undefined` |
| `periodLength` | `number` | `PERIOD_IN_SECONDS.TWO_WEEKS` |

#### Returns

`Promise`<`any`\>

#### Defined in

[packages/sdk/src/services/perpsV3.ts:251](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/perpsV3.ts#L251)

___

### getMarkets

▸ **getMarkets**(): `Promise`<[`FuturesMarket`](../modules/types_futures.md#futuresmarket)[]\>

#### Returns

`Promise`<[`FuturesMarket`](../modules/types_futures.md#futuresmarket)[]\>

#### Defined in

[packages/sdk/src/services/perpsV3.ts:68](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/perpsV3.ts#L68)

___

### getOrderFee

▸ **getOrderFee**(`marketAddress`, `size`): `Promise`<`Wei`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `marketAddress` | `string` |
| `size` | `Wei` |

#### Returns

`Promise`<`Wei`\>

#### Defined in

[packages/sdk/src/services/perpsV3.ts:507](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/perpsV3.ts#L507)

___

### getPerpsV3AccountIds

▸ **getPerpsV3AccountIds**(`walletAddress?`): `Promise`<`string`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `walletAddress?` | ``null`` \| `string` |

#### Returns

`Promise`<`string`[]\>

#### Defined in

[packages/sdk/src/services/perpsV3.ts:398](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/perpsV3.ts#L398)

___

### getPositionHistory

▸ **getPositionHistory**(`walletAddress`): `Promise`<[`FuturesPositionHistory`](../modules/types_futures.md#futurespositionhistory)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `walletAddress` | `string` |

#### Returns

`Promise`<[`FuturesPositionHistory`](../modules/types_futures.md#futurespositionhistory)[]\>

#### Defined in

[packages/sdk/src/services/perpsV3.ts:465](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/perpsV3.ts#L465)

___

### getSkewAdjustedPrice

▸ **getSkewAdjustedPrice**(`price`, `marketAddress`, `marketKey`): `Promise`<`Wei`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `price` | `Wei` |
| `marketAddress` | `string` |
| `marketKey` | `string` |

#### Returns

`Promise`<`Wei`\>

#### Defined in

[packages/sdk/src/services/perpsV3.ts:602](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/perpsV3.ts#L602)

___

### getTradesForMarket

▸ **getTradesForMarket**(`marketAsset`, `walletAddress`, `accountType`, `pageLength?`): `Promise`<[`FuturesTrade`](../modules/types_futures.md#futurestrade)[]\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `marketAsset` | [`FuturesMarketAsset`](../enums/types_futures.FuturesMarketAsset.md) | `undefined` |
| `walletAddress` | `string` | `undefined` |
| `accountType` | [`FuturesMarginType`](../enums/types_futures.FuturesMarginType.md) | `undefined` |
| `pageLength` | `number` | `16` |

#### Returns

`Promise`<[`FuturesTrade`](../modules/types_futures.md#futurestrade)[]\>

#### Defined in

[packages/sdk/src/services/perpsV3.ts:472](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/perpsV3.ts#L472)

___

### submitOrder

▸ **submitOrder**(`marketId`, `accountId`, `sizeDelta`, `acceptablePrice`): `Promise`<`TransactionResponse`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `marketId` | `string` |
| `accountId` | `string` |
| `sizeDelta` | `Wei` |
| `acceptablePrice` | `Wei` |

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/perpsV3.ts:547](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/perpsV3.ts#L547)

___

### withdrawFromAccount

▸ **withdrawFromAccount**(`marketAddress`, `amount`): `Promise`<`TransactionResponse`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `marketAddress` | `string` |
| `amount` | `Wei` |

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/perpsV3.ts:533](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/perpsV3.ts#L533)
