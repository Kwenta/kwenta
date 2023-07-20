[@kwenta/sdk](../README.md) / [Modules](../modules.md) / [services/futures](../modules/services_futures.md) / default

# Class: default

[services/futures](../modules/services_futures.md).default

## Table of contents

### Constructors

- [constructor](services_futures.default.md#constructor)

### Properties

- [internalFuturesMarkets](services_futures.default.md#internalfuturesmarkets)
- [markets](services_futures.default.md#markets)
- [sdk](services_futures.default.md#sdk)

### Accessors

- [futuresGqlEndpoint](services_futures.default.md#futuresgqlendpoint)

### Methods

- [approveSmartMarginDeposit](services_futures.default.md#approvesmartmargindeposit)
- [batchIdleMarketMarginSweeps](services_futures.default.md#batchidlemarketmarginsweeps)
- [cancelConditionalOrder](services_futures.default.md#cancelconditionalorder)
- [cancelDelayedOrder](services_futures.default.md#canceldelayedorder)
- [closeIsolatedPosition](services_futures.default.md#closeisolatedposition)
- [closeSmartMarginPosition](services_futures.default.md#closesmartmarginposition)
- [createSmartMarginAccount](services_futures.default.md#createsmartmarginaccount)
- [depositIsolatedMargin](services_futures.default.md#depositisolatedmargin)
- [depositSmartMarginAccount](services_futures.default.md#depositsmartmarginaccount)
- [executeDelayedOffchainOrder](services_futures.default.md#executedelayedoffchainorder)
- [executeDelayedOrder](services_futures.default.md#executedelayedorder)
- [getAllTrades](services_futures.default.md#getalltrades)
- [getAverageFundingRates](services_futures.default.md#getaveragefundingrates)
- [getConditionalOrders](services_futures.default.md#getconditionalorders)
- [getDailyVolumes](services_futures.default.md#getdailyvolumes)
- [getDelayedOrder](services_futures.default.md#getdelayedorder)
- [getDelayedOrders](services_futures.default.md#getdelayedorders)
- [getFuturesPositions](services_futures.default.md#getfuturespositions)
- [getFuturesTrades](services_futures.default.md#getfuturestrades)
- [getIdleMargin](services_futures.default.md#getidlemargin)
- [getIdleMarginInMarkets](services_futures.default.md#getidlemargininmarkets)
- [getInternalFuturesMarket](services_futures.default.md#getinternalfuturesmarket)
- [getIsolatedMarginTradePreview](services_futures.default.md#getisolatedmargintradepreview)
- [getIsolatedMarginTransfers](services_futures.default.md#getisolatedmargintransfers)
- [getMarketFundingRatesHistory](services_futures.default.md#getmarketfundingrateshistory)
- [getMarkets](services_futures.default.md#getmarkets)
- [getOrderFee](services_futures.default.md#getorderfee)
- [getPositionHistory](services_futures.default.md#getpositionhistory)
- [getSkewAdjustedPrice](services_futures.default.md#getskewadjustedprice)
- [getSmartMarginAccountBalance](services_futures.default.md#getsmartmarginaccountbalance)
- [getSmartMarginAccounts](services_futures.default.md#getsmartmarginaccounts)
- [getSmartMarginBalanceInfo](services_futures.default.md#getsmartmarginbalanceinfo)
- [getSmartMarginTradePreview](services_futures.default.md#getsmartmargintradepreview)
- [getSmartMarginTransfers](services_futures.default.md#getsmartmargintransfers)
- [getTradesForMarket](services_futures.default.md#gettradesformarket)
- [modifySmartMarginMarketMargin](services_futures.default.md#modifysmartmarginmarketmargin)
- [modifySmartMarginPositionSize](services_futures.default.md#modifysmartmarginpositionsize)
- [submitIsolatedMarginOrder](services_futures.default.md#submitisolatedmarginorder)
- [submitSmartMarginOrder](services_futures.default.md#submitsmartmarginorder)
- [updateStopLossAndTakeProfit](services_futures.default.md#updatestoplossandtakeprofit)
- [withdrawAccountKeeperBalance](services_futures.default.md#withdrawaccountkeeperbalance)
- [withdrawIsolatedMargin](services_futures.default.md#withdrawisolatedmargin)
- [withdrawSmartMarginAccount](services_futures.default.md#withdrawsmartmarginaccount)

## Constructors

### constructor

• **new default**(`sdk`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `sdk` | [`default`](index.default.md) |

#### Defined in

[packages/sdk/src/services/futures.ts:84](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L84)

## Properties

### internalFuturesMarkets

• **internalFuturesMarkets**: `Partial`<`Record`<[`NetworkId`](../modules/types_common.md#networkid), { `[marketAddress: string]`: `PerpsV2MarketInternal`;  }\>\> = `{}`

#### Defined in

[packages/sdk/src/services/futures.ts:80](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L80)

___

### markets

• **markets**: `undefined` \| [`FuturesMarket`](../modules/types_futures.md#futuresmarket)[]

#### Defined in

[packages/sdk/src/services/futures.ts:79](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L79)

___

### sdk

• `Private` **sdk**: [`default`](index.default.md)

#### Defined in

[packages/sdk/src/services/futures.ts:78](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L78)

## Accessors

### futuresGqlEndpoint

• `get` **futuresGqlEndpoint**(): `string`

#### Returns

`string`

#### Defined in

[packages/sdk/src/services/futures.ts:88](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L88)

## Methods

### approveSmartMarginDeposit

▸ **approveSmartMarginDeposit**(`smartMarginAddress`, `amount?`): `Promise`<`TransactionResponse`\>

**`Desc`**

Approve a smart margin account deposit

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `smartMarginAddress` | `string` | Smart margin account address |
| `amount` | `BigNumber` | Amount to approve |

#### Returns

`Promise`<`TransactionResponse`\>

ethers.js TransactionResponse object

#### Defined in

[packages/sdk/src/services/futures.ts:811](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L811)

___

### batchIdleMarketMarginSweeps

▸ `Private` **batchIdleMarketMarginSweeps**(`smartMarginAddress`): `Promise`<{ `commands`: `number`[] ; `idleMargin`: { `marketsWithIdleMargin`: [`MarketWithIdleMargin`](../modules/types_futures.md#marketwithidlemargin)[] ; `totalIdleInMarkets`: `Wei`  } ; `inputs`: `string`[]  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `smartMarginAddress` | `string` |

#### Returns

`Promise`<{ `commands`: `number`[] ; `idleMargin`: { `marketsWithIdleMargin`: [`MarketWithIdleMargin`](../modules/types_futures.md#marketwithidlemargin)[] ; `totalIdleInMarkets`: `Wei`  } ; `inputs`: `string`[]  }\>

#### Defined in

[packages/sdk/src/services/futures.ts:1455](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L1455)

___

### cancelConditionalOrder

▸ **cancelConditionalOrder**(`smartMarginAddress`, `orderId`): `Promise`<`TransactionResponse`\>

**`Desc`**

Cancels a conditional order

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `smartMarginAddress` | `string` | Smart margin account address |
| `orderId` | `number` | Conditional order id |

#### Returns

`Promise`<`TransactionResponse`\>

ethers.js TransactionResponse object

#### Defined in

[packages/sdk/src/services/futures.ts:1290](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L1290)

___

### cancelDelayedOrder

▸ **cancelDelayedOrder**(`marketAddress`, `account`, `isOffchain`): `Promise`<`ContractTransaction`\>

**`Desc`**

Cancels a pending/expired delayed order, for the given market and account

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `marketAddress` | `string` | Market address |
| `account` | `string` | Wallet address |
| `isOffchain` | `boolean` | Boolean describing if the order is offchain or not |

#### Returns

`Promise`<`ContractTransaction`\>

ethers.js ContractTransaction object

#### Defined in

[packages/sdk/src/services/futures.ts:1032](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L1032)

___

### closeIsolatedPosition

▸ **closeIsolatedPosition**(`marketAddress`, `priceImpactDelta`): `Promise`<`ContractTransaction`\>

**`Desc`**

Close an open position in an isolated margin market

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `marketAddress` | `string` | Market address |
| `priceImpactDelta` | `Wei` | Price impact delta |

#### Returns

`Promise`<`ContractTransaction`\>

ethers.js ContractTransaction object

#### Defined in

[packages/sdk/src/services/futures.ts:994](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L994)

___

### closeSmartMarginPosition

▸ **closeSmartMarginPosition**(`market`, `smartMarginAddress`, `desiredFillPrice`): `Promise`<`TransactionResponse`\>

**`Desc`**

Closes a smart margin position

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `market` | `Object` | Object containing market address and key |
| `market.address` | `string` | - |
| `market.key` | [`FuturesMarketKey`](../enums/types_futures.FuturesMarketKey.md) | - |
| `smartMarginAddress` | `string` | Smart margin account address |
| `desiredFillPrice` | `Wei` | Desired fill price |

#### Returns

`Promise`<`TransactionResponse`\>

ethers.js TransactionResponse object

#### Defined in

[packages/sdk/src/services/futures.ts:1250](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L1250)

___

### createSmartMarginAccount

▸ **createSmartMarginAccount**(): `Promise`<`TransactionResponse`\>

**`Desc`**

Creates a smart margin account

#### Returns

`Promise`<`TransactionResponse`\>

ethers.js TransactionResponse object

#### Defined in

[packages/sdk/src/services/futures.ts:1070](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L1070)

___

### depositIsolatedMargin

▸ **depositIsolatedMargin**(`marketAddress`, `amount`): `Promise`<`TransactionResponse`\>

**`Desc`**

Deposit margin for use in an isolated margin market

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `marketAddress` | `string` | Market address |
| `amount` | `Wei` | Amount to deposit |

#### Returns

`Promise`<`TransactionResponse`\>

ethers.js TransactionResponse object

#### Defined in

[packages/sdk/src/services/futures.ts:968](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L968)

___

### depositSmartMarginAccount

▸ **depositSmartMarginAccount**(`smartMarginAddress`, `amount`): `Promise`<`TransactionResponse`\>

**`Desc`**

Deposit sUSD into a smart margin account

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `smartMarginAddress` | `string` | Smart margin account address |
| `amount` | `Wei` | Amount to deposit |

#### Returns

`Promise`<`TransactionResponse`\>

ethers.js TransactionResponse object

#### Defined in

[packages/sdk/src/services/futures.ts:828](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L828)

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

[packages/sdk/src/services/futures.ts:1050](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L1050)

___

### executeDelayedOrder

▸ **executeDelayedOrder**(`marketAddress`, `account`): `Promise`<`ContractTransaction`\>

**`Desc`**

Executes a pending delayed order, for the given market and account

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `marketAddress` | `string` | Market address |
| `account` | `string` | Wallet address |

#### Returns

`Promise`<`ContractTransaction`\>

ethers.js ContractTransaction object

#### Defined in

[packages/sdk/src/services/futures.ts:1045](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L1045)

___

### getAllTrades

▸ **getAllTrades**(`walletAddress`, `accountType`, `pageLength?`): `Promise`<[`FuturesTrade`](../modules/types_futures.md#futurestrade)[]\>

**`Desc`**

Get the trade history for a given account

**`Example`**

```ts
const sdk = new KwentaSDK()
const trades = await sdk.futures.getAllTrades('0x...', FuturesMarginType.SMART_MARGIN)
console.log(trades)
```

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `walletAddress` | `string` | `undefined` | Account address |
| `accountType` | [`FuturesMarginType`](../enums/types_futures.FuturesMarginType.md) | `undefined` | Account type (smart or isolated) |
| `pageLength` | `number` | `16` | Number of trades to fetch |

#### Returns

`Promise`<[`FuturesTrade`](../modules/types_futures.md#futurestrade)[]\>

Array of trades for the account on the given market.

#### Defined in

[packages/sdk/src/services/futures.ts:701](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L701)

___

### getAverageFundingRates

▸ **getAverageFundingRates**(`markets`, `prices`, `period`): `Promise`<[`FundingRateResponse`](../modules/types_futures.md#fundingrateresponse)[]\>

**`Desc`**

Get the average funding rates for the given markets

**`Example`**

```ts
const sdk = new KwentaSDK()
const markets = await sdk.futures.getMarkets()
const prices =
const fundingRates = await sdk.synths.getAverageFundingRates(markets, prices, Period.ONE_DAY)
console.log(fundingRates)
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `markets` | [`FuturesMarket`](../modules/types_futures.md#futuresmarket)[] | Futures markets array |
| `prices` | `Partial`<`Record`<[`AssetKey`](../modules/types_prices.md#assetkey), `Wei`\>\> | Prices map |
| `period` | `Period` | Period enum member |

#### Returns

`Promise`<[`FundingRateResponse`](../modules/types_futures.md#fundingrateresponse)[]\>

#### Defined in

[packages/sdk/src/services/futures.ts:258](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L258)

___

### getConditionalOrders

▸ **getConditionalOrders**(`account`): `Promise`<[`ConditionalOrder`](../modules/types_futures.md#conditionalorder)[]\>

**`Desc`**

Get the conditional orders created by a given smart margin account

**`Example`**

```ts
const sdk = new KwentaSDK()
const orders = await sdk.futures.getConditionalOrders('0x...')
console.log(orders)
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `account` | `string` | Smart margin account address |

#### Returns

`Promise`<[`ConditionalOrder`](../modules/types_futures.md#conditionalorder)[]\>

Array of conditional orders created by the given smart margin account

#### Defined in

[packages/sdk/src/services/futures.ts:511](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L511)

___

### getDailyVolumes

▸ **getDailyVolumes**(): `Promise`<[`FuturesVolumes`](../modules/types_futures.md#futuresvolumes)\>

**`Desc`**

Get the daily volumes for all markets

**`Example`**

```ts
const sdk = new KwentaSDK()
const dailyVolumes = await sdk.futures.getDailyVolumes()
console.log(dailyVolumes)
```

#### Returns

`Promise`<[`FuturesVolumes`](../modules/types_futures.md#futuresvolumes)\>

Object with the daily number of trades and volumes for all markets

#### Defined in

[packages/sdk/src/services/futures.ts:372](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L372)

___

### getDelayedOrder

▸ **getDelayedOrder**(`account`, `marketAddress`): `Promise`<[`DelayedOrder`](../modules/types_futures.md#delayedorder)\>

**`Desc`**

Get delayed orders associated with a given wallet address, for a specific market

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `account` | `string` | Wallet address |
| `marketAddress` | `string` | Array of futures market addresses |

#### Returns

`Promise`<[`DelayedOrder`](../modules/types_futures.md#delayedorder)\>

Delayed order for the given market address, associated with the given wallet address

#### Defined in

[packages/sdk/src/services/futures.ts:553](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L553)

___

### getDelayedOrders

▸ **getDelayedOrders**(`account`, `marketAddresses`): `Promise`<[`DelayedOrder`](../modules/types_futures.md#delayedorder)[]\>

**`Desc`**

Get delayed orders associated with a given wallet address

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `account` | `string` | Wallet address |
| `marketAddresses` | `string`[] | Array of futures market addresses |

#### Returns

`Promise`<[`DelayedOrder`](../modules/types_futures.md#delayedorder)[]\>

Array of delayed orders for the given market addresses, associated with the given wallet address

#### Defined in

[packages/sdk/src/services/futures.ts:565](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L565)

___

### getFuturesPositions

▸ **getFuturesPositions**(`address`, `futuresMarkets`): `Promise`<[`FuturesPosition`](../modules/types_futures.md#futuresposition)[]\>

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `address` | `string` | Smart margin or EOA address |
| `futuresMarkets` | { `address`: `string` ; `asset`: [`FuturesMarketAsset`](../enums/types_futures.FuturesMarketAsset.md) ; `marketKey`: [`FuturesMarketKey`](../enums/types_futures.FuturesMarketKey.md)  }[] | Array of objects with market address, market key, and asset |

#### Returns

`Promise`<[`FuturesPosition`](../modules/types_futures.md#futuresposition)[]\>

Array of futures positions associated with the given address

#### Defined in

[packages/sdk/src/services/futures.ts:184](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L184)

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

[packages/sdk/src/services/futures.ts:791](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L791)

___

### getIdleMargin

▸ **getIdleMargin**(`eoa`, `account?`): `Promise`<{ `marketsTotal`: `Wei` = idleMargin.totalIdleInMarkets; `marketsWithMargin`: [`MarketWithIdleMargin`](../modules/types_futures.md#marketwithidlemargin)[] = idleMargin.marketsWithIdleMargin; `total`: `Wei` ; `walletTotal`: `Wei` = susdWalletBalance }\>

**`Desc`**

Get idle margin for given wallet address or smart margin account address

**`Example`**

```ts
const sdk = new KwentaSDK()
const idleMargin = await sdk.futures.getIdleMargin('0x...')
console.log(idleMargin)
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `eoa` | `string` | Wallet address |
| `account?` | `string` | Smart margin account address |

#### Returns

`Promise`<{ `marketsTotal`: `Wei` = idleMargin.totalIdleInMarkets; `marketsWithMargin`: [`MarketWithIdleMargin`](../modules/types_futures.md#marketwithidlemargin)[] = idleMargin.marketsWithIdleMargin; `total`: `Wei` ; `walletTotal`: `Wei` = susdWalletBalance }\>

Total idle margin, idle margin in markets, total wallet balance and the markets with idle margin for the given address(es).

#### Defined in

[packages/sdk/src/services/futures.ts:778](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L778)

___

### getIdleMarginInMarkets

▸ **getIdleMarginInMarkets**(`accountOrEoa`): `Promise`<{ `marketsWithIdleMargin`: [`MarketWithIdleMargin`](../modules/types_futures.md#marketwithidlemargin)[] ; `totalIdleInMarkets`: `Wei`  }\>

**`Desc`**

Get the idle margin in futures markets

**`Example`**

```ts
const sdk = new KwentaSDK()
const idleMargin = await sdk.futures.getIdleMargin('0x...')
console.log(idleMargin)
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `accountOrEoa` | `string` | Wallet address or smart margin account address |

#### Returns

`Promise`<{ `marketsWithIdleMargin`: [`MarketWithIdleMargin`](../modules/types_futures.md#marketwithidlemargin)[] ; `totalIdleInMarkets`: `Wei`  }\>

Total idle margin in markets and an array of markets with idle margin

#### Defined in

[packages/sdk/src/services/futures.ts:725](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L725)

___

### getInternalFuturesMarket

▸ `Private` **getInternalFuturesMarket**(`marketAddress`, `marketKey`): `FuturesMarketInternal`

#### Parameters

| Name | Type |
| :------ | :------ |
| `marketAddress` | `string` |
| `marketKey` | [`FuturesMarketKey`](../enums/types_futures.FuturesMarketKey.md) |

#### Returns

`FuturesMarketInternal`

#### Defined in

[packages/sdk/src/services/futures.ts:1436](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L1436)

___

### getIsolatedMarginTradePreview

▸ **getIsolatedMarginTradePreview**(`marketAddress`, `marketKey`, `orderType`, `inputs`): `Promise`<{ `exceedsPriceProtection`: `boolean` ; `fee`: `Wei` ; `leverage`: `Wei` = leverage; `liqPrice`: `Wei` ; `margin`: `Wei` ; `notionalValue`: `Wei` = notionalValue; `price`: `Wei` ; `priceImpact`: `Wei` = priceImpact; `showStatus`: `boolean` ; `side`: [`PositionSide`](../enums/types_futures.PositionSide.md) = leverageSide; `size`: `Wei` ; `sizeDelta`: `Wei` = nativeSizeDelta; `status`: `number` ; `statusMessage`: `string`  }\>

**`Desc`**

Generate a trade preview for a potential trade with an isolated margin account.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `marketAddress` | `string` | Futures market address |
| `marketKey` | [`FuturesMarketKey`](../enums/types_futures.FuturesMarketKey.md) | Futures market key |
| `orderType` | [`ContractOrderType`](../enums/types_futures.ContractOrderType.md) | Order type (market, delayed, delayed offchain) |
| `inputs` | `Object` | Object containing size delta, order price, and leverage side |
| `inputs.leverageSide` | [`PositionSide`](../enums/types_futures.PositionSide.md) | - |
| `inputs.price` | `Wei` | - |
| `inputs.sizeDelta` | `Wei` | - |

#### Returns

`Promise`<{ `exceedsPriceProtection`: `boolean` ; `fee`: `Wei` ; `leverage`: `Wei` = leverage; `liqPrice`: `Wei` ; `margin`: `Wei` ; `notionalValue`: `Wei` = notionalValue; `price`: `Wei` ; `priceImpact`: `Wei` = priceImpact; `showStatus`: `boolean` ; `side`: [`PositionSide`](../enums/types_futures.PositionSide.md) = leverageSide; `size`: `Wei` ; `sizeDelta`: `Wei` = nativeSizeDelta; `status`: `number` ; `statusMessage`: `string`  }\>

Object containing details about the potential trade

#### Defined in

[packages/sdk/src/services/futures.ts:583](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L583)

___

### getIsolatedMarginTransfers

▸ **getIsolatedMarginTransfers**(`walletAddress?`): `Promise`<[`MarginTransfer`](../modules/types_futures.md#margintransfer)[]\>

**`Desc`**

Get isolated margin transfer history for a given wallet address

**`Example`**

```ts
const sdk = new KwentaSDK()
const transfers = await sdk.futures.getIsolatedMarginTransfers()
console.log(transfers)
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `walletAddress?` | ``null`` \| `string` | Wallet address |

#### Returns

`Promise`<[`MarginTransfer`](../modules/types_futures.md#margintransfer)[]\>

Array of past isolated margin transfers for the given wallet address

#### Defined in

[packages/sdk/src/services/futures.ts:426](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L426)

___

### getMarketFundingRatesHistory

▸ **getMarketFundingRatesHistory**(`marketAsset`, `periodLength?`): `Promise`<`any`\>

**`Desc`**

Get the funding rate history for a given market

**`Example`**

```ts
const sdk = new KwentaSDK()
const fundingRateHistory = await sdk.futures.getMarketFundingRatesHistory('ETH')
console.log(fundingRateHistory)
```

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `marketAsset` | [`FuturesMarketAsset`](../enums/types_futures.FuturesMarketAsset.md) | `undefined` | Futures market asset |
| `periodLength` | `number` | `PERIOD_IN_SECONDS.TWO_WEEKS` | Period length in seconds |

#### Returns

`Promise`<`any`\>

Funding rate history for the given market

#### Defined in

[packages/sdk/src/services/futures.ts:236](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L236)

___

### getMarkets

▸ **getMarkets**(`networkOverride?`): `Promise`<{ `appMaxLeverage`: `Wei` ; `asset`: [`FuturesMarketAsset`](../enums/types_futures.FuturesMarketAsset.md) ; `assetHex`: `string` = asset; `contractMaxLeverage`: `Wei` ; `currentFundingRate`: `Wei` ; `currentFundingVelocity`: `Wei` ; `feeRates`: { `makerFee`: `Wei` ; `makerFeeDelayedOrder`: `Wei` ; `makerFeeOffchainDelayedOrder`: `Wei` ; `takerFee`: `Wei` ; `takerFeeDelayedOrder`: `Wei` ; `takerFeeOffchainDelayedOrder`: `Wei`  } ; `isSuspended`: `boolean` = isSuspended; `keeperDeposit`: `Wei` = globalSettings.minKeeperFee; `market`: `string` ; `marketClosureReason`: [`SynthSuspensionReason`](../modules/types_futures.md#synthsuspensionreason) = suspendedReason; `marketDebt`: `Wei` ; `marketKey`: [`FuturesMarketKey`](../enums/types_futures.FuturesMarketKey.md) ; `marketLimitNative`: `Wei` ; `marketLimitUsd`: `Wei` ; `marketName`: `string` ; `marketSize`: `Wei` ; `marketSkew`: `Wei` ; `minInitialMargin`: `Wei` = globalSettings.minInitialMargin; `openInterest`: { `long`: `Wei` ; `longPct`: `number` ; `longUSD`: `Wei` ; `short`: `Wei` ; `shortPct`: `number` ; `shortUSD`: `Wei`  } ; `settings`: { `delayedOrderConfirmWindow`: `number` ; `maxDelayTimeDelta`: `number` ; `maxMarketValue`: `Wei` ; `minDelayTimeDelta`: `number` ; `offchainDelayedOrderMaxAge`: `number` ; `offchainDelayedOrderMinAge`: `number` ; `skewScale`: `Wei`  }  }[]\>

**`Desc`**

Fetches futures markets

**`Example`**

```ts
import { KwentaSDK } from '@kwenta/sdk'

const sdk = new KwentaSDK()
const markets = await sdk.futures.getMarkets()
console.log(markets)
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `networkOverride?` | [`NetworkOverrideOptions`](../modules/types_common.md#networkoverrideoptions) | Network override options |

#### Returns

`Promise`<{ `appMaxLeverage`: `Wei` ; `asset`: [`FuturesMarketAsset`](../enums/types_futures.FuturesMarketAsset.md) ; `assetHex`: `string` = asset; `contractMaxLeverage`: `Wei` ; `currentFundingRate`: `Wei` ; `currentFundingVelocity`: `Wei` ; `feeRates`: { `makerFee`: `Wei` ; `makerFeeDelayedOrder`: `Wei` ; `makerFeeOffchainDelayedOrder`: `Wei` ; `takerFee`: `Wei` ; `takerFeeDelayedOrder`: `Wei` ; `takerFeeOffchainDelayedOrder`: `Wei`  } ; `isSuspended`: `boolean` = isSuspended; `keeperDeposit`: `Wei` = globalSettings.minKeeperFee; `market`: `string` ; `marketClosureReason`: [`SynthSuspensionReason`](../modules/types_futures.md#synthsuspensionreason) = suspendedReason; `marketDebt`: `Wei` ; `marketKey`: [`FuturesMarketKey`](../enums/types_futures.FuturesMarketKey.md) ; `marketLimitNative`: `Wei` ; `marketLimitUsd`: `Wei` ; `marketName`: `string` ; `marketSize`: `Wei` ; `marketSkew`: `Wei` ; `minInitialMargin`: `Wei` = globalSettings.minInitialMargin; `openInterest`: { `long`: `Wei` ; `longPct`: `number` ; `longUSD`: `Wei` ; `short`: `Wei` ; `shortPct`: `number` ; `shortUSD`: `Wei`  } ; `settings`: { `delayedOrderConfirmWindow`: `number` ; `maxDelayTimeDelta`: `number` ; `maxMarketValue`: `Wei` ; `minDelayTimeDelta`: `number` ; `offchainDelayedOrderMaxAge`: `number` ; `offchainDelayedOrderMinAge`: `number` ; `skewScale`: `Wei`  }  }[]\>

Futures markets array

#### Defined in

[packages/sdk/src/services/futures.ts:105](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L105)

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

[packages/sdk/src/services/futures.ts:797](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L797)

___

### getPositionHistory

▸ **getPositionHistory**(`address`, `addressType?`): `Promise`<[`FuturesPositionHistory`](../modules/types_futures.md#futurespositionhistory)[]\>

**`Desc`**

Get futures positions history for a given wallet address or smart margin account

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `address` | `string` | `undefined` | Wallet address or smart margin account address |
| `addressType` | ``"account"`` \| ``"eoa"`` | `'account'` | Address type (EOA or smart margin account) |

#### Returns

`Promise`<[`FuturesPositionHistory`](../modules/types_futures.md#futurespositionhistory)[]\>

Array of historical futures positions associated with the given address

#### Defined in

[packages/sdk/src/services/futures.ts:658](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L658)

___

### getSkewAdjustedPrice

▸ **getSkewAdjustedPrice**(`price`, `marketAddress`, `marketKey`): `Promise`<`Wei`\>

**`Desc`**

Adjusts the given price, based on the current market skew.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `price` | `Wei` | Price to adjust |
| `marketAddress` | `string` | Market address |
| `marketKey` | `string` | Market key |

#### Returns

`Promise`<`Wei`\>

Adjusted price, based on the given market's skew.

#### Defined in

[packages/sdk/src/services/futures.ts:1418](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L1418)

___

### getSmartMarginAccountBalance

▸ **getSmartMarginAccountBalance**(`smartMarginAddress`): `Promise`<`Wei`\>

**`Desc`**

Get the balance of a smart margin account

**`Example`**

```ts
const sdk = new KwentaSDK()
const balance = await sdk.futures.getSmartMarginAccountBalance('0x...')
console.log(balance)
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `smartMarginAddress` | `string` | Smart margin account address |

#### Returns

`Promise`<`Wei`\>

Balance of the given smart margin account

#### Defined in

[packages/sdk/src/services/futures.ts:460](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L460)

___

### getSmartMarginAccounts

▸ **getSmartMarginAccounts**(`walletAddress?`): `Promise`<`string`[]\>

**`Desc`**

Get the smart margin accounts associated with a given wallet address

**`Example`**

```ts
const sdk = new KwentaSDK()
const accounts = await sdk.futures.getSmartMarginAccounts()
console.log(accounts)
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `walletAddress?` | ``null`` \| `string` | Wallet address |

#### Returns

`Promise`<`string`[]\>

Array of smart margin account addresses

#### Defined in

[packages/sdk/src/services/futures.ts:410](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L410)

___

### getSmartMarginBalanceInfo

▸ **getSmartMarginBalanceInfo**(`walletAddress`, `smartMarginAddress`): `Promise`<{ `allowance`: `Wei` ; `freeMargin`: `Wei` ; `keeperEthBal`: `Wei` ; `walletEthBal`: `Wei`  }\>

**`Desc`**

Get important balances for a given smart margin account and wallet address.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `walletAddress` | `string` | Wallet address |
| `smartMarginAddress` | `string` | Smart margin account address |

#### Returns

`Promise`<{ `allowance`: `Wei` ; `freeMargin`: `Wei` ; `keeperEthBal`: `Wei` ; `walletEthBal`: `Wei`  }\>

Free margin and keeper balance (in ETH) for given smart margin address, as well as the wallet balance (in ETH), and sUSD allowance for the given wallet address.

#### Defined in

[packages/sdk/src/services/futures.ts:476](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L476)

___

### getSmartMarginTradePreview

▸ **getSmartMarginTradePreview**(`smartMarginAccount`, `marketKey`, `marketAddress`, `tradeParams`): `Promise`<{ `exceedsPriceProtection`: `boolean` ; `fee`: `Wei` ; `leverage`: `Wei` = leverage; `liqPrice`: `Wei` ; `margin`: `Wei` ; `notionalValue`: `Wei` = notionalValue; `price`: `Wei` ; `priceImpact`: `Wei` = priceImpact; `showStatus`: `boolean` ; `side`: [`PositionSide`](../enums/types_futures.PositionSide.md) = leverageSide; `size`: `Wei` ; `sizeDelta`: `Wei` = nativeSizeDelta; `status`: `number` ; `statusMessage`: `string`  }\>

**`Desc`**

Generate a trade preview for a potential trade with a smart margin account.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `smartMarginAccount` | `string` | Smart margin account address |
| `marketKey` | [`FuturesMarketKey`](../enums/types_futures.FuturesMarketKey.md) | Futures market key |
| `marketAddress` | `string` | Futures market address |
| `tradeParams` | `Object` | Object containing size delta, margin delta, order price, and leverage side |
| `tradeParams.leverageSide` | [`PositionSide`](../enums/types_futures.PositionSide.md) | - |
| `tradeParams.marginDelta` | `Wei` | - |
| `tradeParams.orderPrice` | `Wei` | - |
| `tradeParams.sizeDelta` | `Wei` | - |

#### Returns

`Promise`<{ `exceedsPriceProtection`: `boolean` ; `fee`: `Wei` ; `leverage`: `Wei` = leverage; `liqPrice`: `Wei` ; `margin`: `Wei` ; `notionalValue`: `Wei` = notionalValue; `price`: `Wei` ; `priceImpact`: `Wei` = priceImpact; `showStatus`: `boolean` ; `side`: [`PositionSide`](../enums/types_futures.PositionSide.md) = leverageSide; `size`: `Wei` ; `sizeDelta`: `Wei` = nativeSizeDelta; `status`: `number` ; `statusMessage`: `string`  }\>

Object containing details about the potential trade

#### Defined in

[packages/sdk/src/services/futures.ts:618](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L618)

___

### getSmartMarginTransfers

▸ **getSmartMarginTransfers**(`walletAddress?`): `Promise`<[`MarginTransfer`](../modules/types_futures.md#margintransfer)[]\>

**`Desc`**

Get smart margin transfer history for a given wallet address

**`Example`**

```ts
const sdk = new KwentaSDK()
const transfers = await sdk.futures.getSmartMarginTransfers()
console.log(transfers)
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `walletAddress?` | ``null`` \| `string` | Wallet address |

#### Returns

`Promise`<[`MarginTransfer`](../modules/types_futures.md#margintransfer)[]\>

Array of past smart margin transfers for the given wallet address

#### Defined in

[packages/sdk/src/services/futures.ts:444](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L444)

___

### getTradesForMarket

▸ **getTradesForMarket**(`marketAsset`, `walletAddress`, `accountType`, `pageLength?`): `Promise`<[`FuturesTrade`](../modules/types_futures.md#futurestrade)[]\>

**`Desc`**

Get the trade history for a given account on a specific market

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `marketAsset` | [`FuturesMarketAsset`](../enums/types_futures.FuturesMarketAsset.md) | `undefined` | Market asset |
| `walletAddress` | `string` | `undefined` | Account address |
| `accountType` | [`FuturesMarginType`](../enums/types_futures.FuturesMarginType.md) | `undefined` | Account type (smart or isolated) |
| `pageLength` | `number` | `16` | Number of trades to fetch |

#### Returns

`Promise`<[`FuturesTrade`](../modules/types_futures.md#futurestrade)[]\>

Array of trades for the account on the given market.

#### Defined in

[packages/sdk/src/services/futures.ts:673](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L673)

___

### modifySmartMarginMarketMargin

▸ **modifySmartMarginMarketMargin**(`smartMarginAddress`, `marketAddress`, `marginDelta`): `Promise`<`TransactionResponse`\>

**`Desc`**

Modify the margin for a specific market in a smart margin account

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `smartMarginAddress` | `string` | Smart margin account address |
| `marketAddress` | `string` | Market address |
| `marginDelta` | `Wei` | Amount to modify the margin by (can be positive or negative) |

#### Returns

`Promise`<`TransactionResponse`\>

ethers.js TransactionResponse object

#### Defined in

[packages/sdk/src/services/futures.ts:869](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L869)

___

### modifySmartMarginPositionSize

▸ **modifySmartMarginPositionSize**(`smartMarginAddress`, `market`, `sizeDelta`, `desiredFillPrice`, `cancelPendingReduceOrders?`): `Promise`<`TransactionResponse`\>

**`Desc`**

Modify the position size for a specific market in a smart margin account

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `smartMarginAddress` | `string` | Smart margin account address |
| `market` | `Object` | Object containing the market key and address |
| `market.address` | `string` | - |
| `market.key` | [`FuturesMarketKey`](../enums/types_futures.FuturesMarketKey.md) | - |
| `sizeDelta` | `Wei` | Intended size change (positive or negative) |
| `desiredFillPrice` | `Wei` | Desired fill price |
| `cancelPendingReduceOrders?` | `boolean` | Boolean describing if pending reduce orders should be cancelled |

#### Returns

`Promise`<`TransactionResponse`\>

ethers.js TransactionResponse object

#### Defined in

[packages/sdk/src/services/futures.ts:926](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L926)

___

### submitIsolatedMarginOrder

▸ **submitIsolatedMarginOrder**(`marketAddress`, `sizeDelta`, `priceImpactDelta`): `Promise`<`TransactionResponse`\>

**`Desc`**

Get idle margin for given wallet address or smart margin account address

**`Example`**

```ts
const sdk = new KwentaSDK()
const idleMargin = await sdk.futures.getIdleMargin('0x...')
console.log(idleMargin)
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `marketAddress` | `string` |
| `sizeDelta` | `Wei` |
| `priceImpactDelta` | `Wei` |

#### Returns

`Promise`<`TransactionResponse`\>

Total idle margin, idle margin in markets, total wallet balance and the markets with idle margin for the given address(es).

#### Defined in

[packages/sdk/src/services/futures.ts:1011](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L1011)

___

### submitSmartMarginOrder

▸ **submitSmartMarginOrder**(`market`, `walletAddress`, `smartMarginAddress`, `order`, `options?`): `Promise`<`TransactionResponse`\>

**`Desc`**

Get idle margin for given wallet address or smart margin account address

**`Example`**

```ts
const sdk = new KwentaSDK()
const idleMargin = await sdk.futures.getIdleMargin('0x...')
console.log(idleMargin)
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `market` | `Object` |
| `market.address` | `string` |
| `market.key` | [`FuturesMarketKey`](../enums/types_futures.FuturesMarketKey.md) |
| `walletAddress` | `string` |
| `smartMarginAddress` | `string` |
| `order` | [`SmartMarginOrderInputs`](../modules/types_futures.md#smartmarginorderinputs) |
| `options?` | `Object` |
| `options.cancelExpiredDelayedOrders?` | `boolean` |
| `options.cancelPendingReduceOrders?` | `boolean` |

#### Returns

`Promise`<`TransactionResponse`\>

Total idle margin, idle margin in markets, total wallet balance and the markets with idle margin for the given address(es).

#### Defined in

[packages/sdk/src/services/futures.ts:1091](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L1091)

___

### updateStopLossAndTakeProfit

▸ **updateStopLossAndTakeProfit**(`marketKey`, `smartMarginAddress`, `params`): `Promise`<`TransactionResponse`\>

**`Desc`**

Updates the stop loss and take profit values for a given smart margin account, based on the specified market.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `marketKey` | [`FuturesMarketKey`](../enums/types_futures.FuturesMarketKey.md) | Market key |
| `smartMarginAddress` | `string` | Smart margin account address |
| `params` | [`SLTPOrderInputs`](../modules/types_futures.md#sltporderinputs) | Object containing the stop loss and take profit values |

#### Returns

`Promise`<`TransactionResponse`\>

ethers.js TransactionResponse object

#### Defined in

[packages/sdk/src/services/futures.ts:1327](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L1327)

___

### withdrawAccountKeeperBalance

▸ **withdrawAccountKeeperBalance**(`smartMarginAddress`, `amount`): `Promise`<`TransactionResponse`\>

**`Desc`**

Withdraws given smarkt margin account's keeper balance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `smartMarginAddress` | `string` | Smart margin account address |
| `amount` | `Wei` | Amount to withdraw |

#### Returns

`Promise`<`TransactionResponse`\>

ethers.js TransactionResponse object

#### Defined in

[packages/sdk/src/services/futures.ts:1308](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L1308)

___

### withdrawIsolatedMargin

▸ **withdrawIsolatedMargin**(`marketAddress`, `amount`): `Promise`<`TransactionResponse`\>

**`Desc`**

Withdraw margin from an isolated margin market

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `marketAddress` | `string` | Market address |
| `amount` | `Wei` | Amount to withdraw |

#### Returns

`Promise`<`TransactionResponse`\>

ethers.js TransactionResponse object

#### Defined in

[packages/sdk/src/services/futures.ts:980](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L980)

___

### withdrawSmartMarginAccount

▸ **withdrawSmartMarginAccount**(`smartMarginAddress`, `amount`): `Promise`<`TransactionResponse`\>

**`Desc`**

Withdraw sUSD from a smart margin account

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `smartMarginAddress` | `string` | Smart margin account address |
| `amount` | `Wei` | Amount to withdraw |

#### Returns

`Promise`<`TransactionResponse`\>

ethers.js TransactionResponse object

#### Defined in

[packages/sdk/src/services/futures.ts:846](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/futures.ts#L846)
