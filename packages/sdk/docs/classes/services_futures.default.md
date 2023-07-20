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

[services/futures.ts:84](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L84)

## Properties

### internalFuturesMarkets

• **internalFuturesMarkets**: `Partial`<`Record`<`NetworkId`, { `[marketAddress: string]`: `PerpsV2MarketInternal`;  }\>\> = `{}`

#### Defined in

[services/futures.ts:80](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L80)

___

### markets

• **markets**: `undefined` \| `FuturesMarket`[]

#### Defined in

[services/futures.ts:79](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L79)

___

### sdk

• `Private` **sdk**: [`default`](index.default.md)

#### Defined in

[services/futures.ts:78](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L78)

## Accessors

### futuresGqlEndpoint

• `get` **futuresGqlEndpoint**(): `string`

#### Returns

`string`

#### Defined in

[services/futures.ts:88](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L88)

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

[services/futures.ts:810](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L810)

___

### batchIdleMarketMarginSweeps

▸ `Private` **batchIdleMarketMarginSweeps**(`smartMarginAddress`): `Promise`<{ `commands`: `number`[] ; `idleMargin`: { `marketsWithIdleMargin`: `MarketWithIdleMargin`[] ; `totalIdleInMarkets`: `Wei`  } ; `inputs`: `string`[]  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `smartMarginAddress` | `string` |

#### Returns

`Promise`<{ `commands`: `number`[] ; `idleMargin`: { `marketsWithIdleMargin`: `MarketWithIdleMargin`[] ; `totalIdleInMarkets`: `Wei`  } ; `inputs`: `string`[]  }\>

#### Defined in

[services/futures.ts:1454](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L1454)

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

[services/futures.ts:1289](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L1289)

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

[services/futures.ts:1031](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L1031)

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

[services/futures.ts:993](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L993)

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
| `market.key` | `FuturesMarketKey` | - |
| `smartMarginAddress` | `string` | Smart margin account address |
| `desiredFillPrice` | `Wei` | Desired fill price |

#### Returns

`Promise`<`TransactionResponse`\>

ethers.js TransactionResponse object

#### Defined in

[services/futures.ts:1249](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L1249)

___

### createSmartMarginAccount

▸ **createSmartMarginAccount**(): `Promise`<`TransactionResponse`\>

**`Desc`**

Creates a smart margin account

#### Returns

`Promise`<`TransactionResponse`\>

ethers.js TransactionResponse object

#### Defined in

[services/futures.ts:1069](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L1069)

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

[services/futures.ts:967](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L967)

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

[services/futures.ts:827](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L827)

___

### executeDelayedOffchainOrder

▸ **executeDelayedOffchainOrder**(`marketKey`, `marketAddress`, `account`): `Promise`<`ContractTransaction`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `marketKey` | `FuturesMarketKey` |
| `marketAddress` | `string` |
| `account` | `string` |

#### Returns

`Promise`<`ContractTransaction`\>

#### Defined in

[services/futures.ts:1049](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L1049)

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

[services/futures.ts:1044](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L1044)

___

### getAllTrades

▸ **getAllTrades**(`walletAddress`, `accountType`, `pageLength?`): `Promise`<`FuturesTrade`[]\>

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
| `accountType` | `FuturesMarginType` | `undefined` | Account type (smart or isolated) |
| `pageLength` | `number` | `16` | Number of trades to fetch |

#### Returns

`Promise`<`FuturesTrade`[]\>

Array of trades for the account on the given market.

#### Defined in

[services/futures.ts:700](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L700)

___

### getAverageFundingRates

▸ **getAverageFundingRates**(`markets`, `prices`, `period`): `Promise`<`FundingRateResponse`[]\>

**`Desc`**

Get the average funding rates for the given markets

**`Example`**

```ts
const sdk = new KwentaSDK()
const markets = await sdk.futures.getMarkets()
const prices =
const fundingRates = await sdk.synths.getAverageFundingRates(markets, prices, Period.ONE_DAY)
console.log(fundingRates)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `markets` | `FuturesMarket`[] | Futures markets array |
| `prices` | `Partial`<`Record`<`AssetKey`, `Wei`\>\> | Prices map |
| `period` | `Period` | Period enum member |

#### Returns

`Promise`<`FundingRateResponse`[]\>

#### Defined in

[services/futures.ts:257](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L257)

___

### getConditionalOrders

▸ **getConditionalOrders**(`account`): `Promise`<`ConditionalOrder`[]\>

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

`Promise`<`ConditionalOrder`[]\>

Array of conditional orders created by the given smart margin account

#### Defined in

[services/futures.ts:510](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L510)

___

### getDailyVolumes

▸ **getDailyVolumes**(): `Promise`<`FuturesVolumes`\>

**`Desc`**

Get the daily volumes for all markets

**`Example`**

```ts
const sdk = new KwentaSDK()
const dailyVolumes = await sdk.futures.getDailyVolumes()
console.log(dailyVolumes)
```

#### Returns

`Promise`<`FuturesVolumes`\>

Object with the daily number of trades and volumes for all markets

#### Defined in

[services/futures.ts:371](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L371)

___

### getDelayedOrder

▸ **getDelayedOrder**(`account`, `marketAddress`): `Promise`<`DelayedOrder`\>

**`Desc`**

Get delayed orders associated with a given wallet address, for a specific market

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `account` | `string` | Wallet address |
| `marketAddress` | `string` | Array of futures market addresses |

#### Returns

`Promise`<`DelayedOrder`\>

Delayed order for the given market address, associated with the given wallet address

#### Defined in

[services/futures.ts:552](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L552)

___

### getDelayedOrders

▸ **getDelayedOrders**(`account`, `marketAddresses`): `Promise`<`DelayedOrder`[]\>

**`Desc`**

Get delayed orders associated with a given wallet address

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `account` | `string` | Wallet address |
| `marketAddresses` | `string`[] | Array of futures market addresses |

#### Returns

`Promise`<`DelayedOrder`[]\>

Array of delayed orders for the given market addresses, associated with the given wallet address

#### Defined in

[services/futures.ts:564](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L564)

___

### getFuturesPositions

▸ **getFuturesPositions**(`address`, `futuresMarkets`): `Promise`<`FuturesPosition`[]\>

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `address` | `string` | Smart margin or EOA address |
| `futuresMarkets` | { `address`: `string` ; `asset`: `FuturesMarketAsset` ; `marketKey`: `FuturesMarketKey`  }[] | Array of objects with market address, market key, and asset |

#### Returns

`Promise`<`FuturesPosition`[]\>

Array of futures positions associated with the given address

#### Defined in

[services/futures.ts:184](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L184)

___

### getFuturesTrades

▸ **getFuturesTrades**(`marketKey`, `minTs`, `maxTs`): `Promise`<``null`` \| `FuturesTrade`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `marketKey` | `FuturesMarketKey` |
| `minTs` | `number` |
| `maxTs` | `number` |

#### Returns

`Promise`<``null`` \| `FuturesTrade`[]\>

#### Defined in

[services/futures.ts:790](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L790)

___

### getIdleMargin

▸ **getIdleMargin**(`eoa`, `account?`): `Promise`<{ `marketsTotal`: `Wei` = idleMargin.totalIdleInMarkets; `marketsWithMargin`: `MarketWithIdleMargin`[] = idleMargin.marketsWithIdleMargin; `total`: `Wei` ; `walletTotal`: `Wei` = susdWalletBalance }\>

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

`Promise`<{ `marketsTotal`: `Wei` = idleMargin.totalIdleInMarkets; `marketsWithMargin`: `MarketWithIdleMargin`[] = idleMargin.marketsWithIdleMargin; `total`: `Wei` ; `walletTotal`: `Wei` = susdWalletBalance }\>

Total idle margin, idle margin in markets, total wallet balance and the markets with idle margin for the given address(es).

#### Defined in

[services/futures.ts:777](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L777)

___

### getIdleMarginInMarkets

▸ **getIdleMarginInMarkets**(`accountOrEoa`): `Promise`<{ `marketsWithIdleMargin`: `MarketWithIdleMargin`[] ; `totalIdleInMarkets`: `Wei`  }\>

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

`Promise`<{ `marketsWithIdleMargin`: `MarketWithIdleMargin`[] ; `totalIdleInMarkets`: `Wei`  }\>

Total idle margin in markets and an array of markets with idle margin

#### Defined in

[services/futures.ts:724](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L724)

___

### getInternalFuturesMarket

▸ `Private` **getInternalFuturesMarket**(`marketAddress`, `marketKey`): `FuturesMarketInternal`

#### Parameters

| Name | Type |
| :------ | :------ |
| `marketAddress` | `string` |
| `marketKey` | `FuturesMarketKey` |

#### Returns

`FuturesMarketInternal`

#### Defined in

[services/futures.ts:1435](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L1435)

___

### getIsolatedMarginTradePreview

▸ **getIsolatedMarginTradePreview**(`marketAddress`, `marketKey`, `orderType`, `inputs`): `Promise`<{ `exceedsPriceProtection`: `boolean` ; `fee`: `Wei` ; `leverage`: `Wei` = leverage; `liqPrice`: `Wei` ; `margin`: `Wei` ; `notionalValue`: `Wei` = notionalValue; `price`: `Wei` ; `priceImpact`: `Wei` = priceImpact; `showStatus`: `boolean` ; `side`: `PositionSide` = leverageSide; `size`: `Wei` ; `sizeDelta`: `Wei` = nativeSizeDelta; `status`: `number` ; `statusMessage`: `string`  }\>

**`Desc`**

Generate a trade preview for a potential trade with an isolated margin account.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `marketAddress` | `string` | Futures market address |
| `marketKey` | `FuturesMarketKey` | Futures market key |
| `orderType` | `ContractOrderType` | Order type (market, delayed, delayed offchain) |
| `inputs` | `Object` | Object containing size delta, order price, and leverage side |
| `inputs.leverageSide` | `PositionSide` | - |
| `inputs.price` | `Wei` | - |
| `inputs.sizeDelta` | `Wei` | - |

#### Returns

`Promise`<{ `exceedsPriceProtection`: `boolean` ; `fee`: `Wei` ; `leverage`: `Wei` = leverage; `liqPrice`: `Wei` ; `margin`: `Wei` ; `notionalValue`: `Wei` = notionalValue; `price`: `Wei` ; `priceImpact`: `Wei` = priceImpact; `showStatus`: `boolean` ; `side`: `PositionSide` = leverageSide; `size`: `Wei` ; `sizeDelta`: `Wei` = nativeSizeDelta; `status`: `number` ; `statusMessage`: `string`  }\>

Object containing details about the potential trade

#### Defined in

[services/futures.ts:582](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L582)

___

### getIsolatedMarginTransfers

▸ **getIsolatedMarginTransfers**(`walletAddress?`): `Promise`<`MarginTransfer`[]\>

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

`Promise`<`MarginTransfer`[]\>

Array of past isolated margin transfers for the given wallet address

#### Defined in

[services/futures.ts:425](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L425)

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
| `marketAsset` | `FuturesMarketAsset` | `undefined` | Futures market asset |
| `periodLength` | `number` | `PERIOD_IN_SECONDS.TWO_WEEKS` | Period length in seconds |

#### Returns

`Promise`<`any`\>

Funding rate history for the given market

#### Defined in

[services/futures.ts:236](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L236)

___

### getMarkets

▸ **getMarkets**(`networkOverride?`): `Promise`<{ `appMaxLeverage`: `Wei` ; `asset`: `FuturesMarketAsset` ; `assetHex`: `string` = asset; `contractMaxLeverage`: `Wei` ; `currentFundingRate`: `Wei` ; `currentFundingVelocity`: `Wei` ; `feeRates`: { `makerFee`: `Wei` ; `makerFeeDelayedOrder`: `Wei` ; `makerFeeOffchainDelayedOrder`: `Wei` ; `takerFee`: `Wei` ; `takerFeeDelayedOrder`: `Wei` ; `takerFeeOffchainDelayedOrder`: `Wei`  } ; `isSuspended`: `boolean` = isSuspended; `keeperDeposit`: `Wei` = globalSettings.minKeeperFee; `market`: `string` ; `marketClosureReason`: `SynthSuspensionReason` = suspendedReason; `marketDebt`: `Wei` ; `marketKey`: `FuturesMarketKey` ; `marketLimitNative`: `Wei` ; `marketLimitUsd`: `Wei` ; `marketName`: `string` ; `marketSize`: `Wei` ; `marketSkew`: `Wei` ; `minInitialMargin`: `Wei` = globalSettings.minInitialMargin; `openInterest`: { `long`: `Wei` ; `longPct`: `number` ; `longUSD`: `Wei` ; `short`: `Wei` ; `shortPct`: `number` ; `shortUSD`: `Wei`  } ; `settings`: { `delayedOrderConfirmWindow`: `number` ; `maxDelayTimeDelta`: `number` ; `maxMarketValue`: `Wei` ; `minDelayTimeDelta`: `number` ; `offchainDelayedOrderMaxAge`: `number` ; `offchainDelayedOrderMinAge`: `number` ; `skewScale`: `Wei`  }  }[]\>

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
| `networkOverride?` | `NetworkOverrideOptions` | Network override options |

#### Returns

`Promise`<{ `appMaxLeverage`: `Wei` ; `asset`: `FuturesMarketAsset` ; `assetHex`: `string` = asset; `contractMaxLeverage`: `Wei` ; `currentFundingRate`: `Wei` ; `currentFundingVelocity`: `Wei` ; `feeRates`: { `makerFee`: `Wei` ; `makerFeeDelayedOrder`: `Wei` ; `makerFeeOffchainDelayedOrder`: `Wei` ; `takerFee`: `Wei` ; `takerFeeDelayedOrder`: `Wei` ; `takerFeeOffchainDelayedOrder`: `Wei`  } ; `isSuspended`: `boolean` = isSuspended; `keeperDeposit`: `Wei` = globalSettings.minKeeperFee; `market`: `string` ; `marketClosureReason`: `SynthSuspensionReason` = suspendedReason; `marketDebt`: `Wei` ; `marketKey`: `FuturesMarketKey` ; `marketLimitNative`: `Wei` ; `marketLimitUsd`: `Wei` ; `marketName`: `string` ; `marketSize`: `Wei` ; `marketSkew`: `Wei` ; `minInitialMargin`: `Wei` = globalSettings.minInitialMargin; `openInterest`: { `long`: `Wei` ; `longPct`: `number` ; `longUSD`: `Wei` ; `short`: `Wei` ; `shortPct`: `number` ; `shortUSD`: `Wei`  } ; `settings`: { `delayedOrderConfirmWindow`: `number` ; `maxDelayTimeDelta`: `number` ; `maxMarketValue`: `Wei` ; `minDelayTimeDelta`: `number` ; `offchainDelayedOrderMaxAge`: `number` ; `offchainDelayedOrderMinAge`: `number` ; `skewScale`: `Wei`  }  }[]\>

Futures markets array

#### Defined in

[services/futures.ts:105](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L105)

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

[services/futures.ts:796](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L796)

___

### getPositionHistory

▸ **getPositionHistory**(`address`, `addressType?`): `Promise`<`FuturesPositionHistory`[]\>

**`Desc`**

Get futures positions history for a given wallet address or smart margin account

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `address` | `string` | `undefined` | Wallet address or smart margin account address |
| `addressType` | ``"account"`` \| ``"eoa"`` | `'account'` | Address type (EOA or smart margin account) |

#### Returns

`Promise`<`FuturesPositionHistory`[]\>

Array of historical futures positions associated with the given address

#### Defined in

[services/futures.ts:657](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L657)

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

[services/futures.ts:1417](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L1417)

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

[services/futures.ts:459](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L459)

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

[services/futures.ts:409](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L409)

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

[services/futures.ts:475](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L475)

___

### getSmartMarginTradePreview

▸ **getSmartMarginTradePreview**(`smartMarginAccount`, `marketKey`, `marketAddress`, `tradeParams`): `Promise`<{ `exceedsPriceProtection`: `boolean` ; `fee`: `Wei` ; `leverage`: `Wei` = leverage; `liqPrice`: `Wei` ; `margin`: `Wei` ; `notionalValue`: `Wei` = notionalValue; `price`: `Wei` ; `priceImpact`: `Wei` = priceImpact; `showStatus`: `boolean` ; `side`: `PositionSide` = leverageSide; `size`: `Wei` ; `sizeDelta`: `Wei` = nativeSizeDelta; `status`: `number` ; `statusMessage`: `string`  }\>

**`Desc`**

Generate a trade preview for a potential trade with a smart margin account.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `smartMarginAccount` | `string` | Smart margin account address |
| `marketKey` | `FuturesMarketKey` | Futures market key |
| `marketAddress` | `string` | Futures market address |
| `tradeParams` | `Object` | Object containing size delta, margin delta, order price, and leverage side |
| `tradeParams.leverageSide` | `PositionSide` | - |
| `tradeParams.marginDelta` | `Wei` | - |
| `tradeParams.orderPrice` | `Wei` | - |
| `tradeParams.sizeDelta` | `Wei` | - |

#### Returns

`Promise`<{ `exceedsPriceProtection`: `boolean` ; `fee`: `Wei` ; `leverage`: `Wei` = leverage; `liqPrice`: `Wei` ; `margin`: `Wei` ; `notionalValue`: `Wei` = notionalValue; `price`: `Wei` ; `priceImpact`: `Wei` = priceImpact; `showStatus`: `boolean` ; `side`: `PositionSide` = leverageSide; `size`: `Wei` ; `sizeDelta`: `Wei` = nativeSizeDelta; `status`: `number` ; `statusMessage`: `string`  }\>

Object containing details about the potential trade

#### Defined in

[services/futures.ts:617](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L617)

___

### getSmartMarginTransfers

▸ **getSmartMarginTransfers**(`walletAddress?`): `Promise`<`MarginTransfer`[]\>

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

`Promise`<`MarginTransfer`[]\>

Array of past smart margin transfers for the given wallet address

#### Defined in

[services/futures.ts:443](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L443)

___

### getTradesForMarket

▸ **getTradesForMarket**(`marketAsset`, `walletAddress`, `accountType`, `pageLength?`): `Promise`<`FuturesTrade`[]\>

**`Desc`**

Get the trade history for a given account on a specific market

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `marketAsset` | `FuturesMarketAsset` | `undefined` | Market asset |
| `walletAddress` | `string` | `undefined` | Account address |
| `accountType` | `FuturesMarginType` | `undefined` | Account type (smart or isolated) |
| `pageLength` | `number` | `16` | Number of trades to fetch |

#### Returns

`Promise`<`FuturesTrade`[]\>

Array of trades for the account on the given market.

#### Defined in

[services/futures.ts:672](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L672)

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

[services/futures.ts:868](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L868)

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
| `market.key` | `FuturesMarketKey` | - |
| `sizeDelta` | `Wei` | Intended size change (positive or negative) |
| `desiredFillPrice` | `Wei` | Desired fill price |
| `cancelPendingReduceOrders?` | `boolean` | Boolean describing if pending reduce orders should be cancelled |

#### Returns

`Promise`<`TransactionResponse`\>

ethers.js TransactionResponse object

#### Defined in

[services/futures.ts:925](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L925)

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

[services/futures.ts:1010](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L1010)

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
| `market.key` | `FuturesMarketKey` |
| `walletAddress` | `string` |
| `smartMarginAddress` | `string` |
| `order` | `SmartMarginOrderInputs` |
| `options?` | `Object` |
| `options.cancelExpiredDelayedOrders?` | `boolean` |
| `options.cancelPendingReduceOrders?` | `boolean` |

#### Returns

`Promise`<`TransactionResponse`\>

Total idle margin, idle margin in markets, total wallet balance and the markets with idle margin for the given address(es).

#### Defined in

[services/futures.ts:1090](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L1090)

___

### updateStopLossAndTakeProfit

▸ **updateStopLossAndTakeProfit**(`marketKey`, `smartMarginAddress`, `params`): `Promise`<`TransactionResponse`\>

**`Desc`**

Updates the stop loss and take profit values for a given smart margin account, based on the specified market.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `marketKey` | `FuturesMarketKey` | Market key |
| `smartMarginAddress` | `string` | Smart margin account address |
| `params` | `SLTPOrderInputs` | Object containing the stop loss and take profit values |

#### Returns

`Promise`<`TransactionResponse`\>

ethers.js TransactionResponse object

#### Defined in

[services/futures.ts:1326](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L1326)

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

[services/futures.ts:1307](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L1307)

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

[services/futures.ts:979](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L979)

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

[services/futures.ts:845](https://github.com/Kwenta/kwenta/blob/8de1d12fe/packages/sdk/src/services/futures.ts#L845)
