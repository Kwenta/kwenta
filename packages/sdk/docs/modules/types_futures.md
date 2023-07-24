[@kwenta/sdk](../README.md) / [Modules](../modules.md) / types/futures

# Module: types/futures

## Table of contents

### Enumerations

- [AccountExecuteFunctions](../enums/types_futures.AccountExecuteFunctions.md)
- [ConditionalOrderTypeEnum](../enums/types_futures.ConditionalOrderTypeEnum.md)
- [ContractOrderType](../enums/types_futures.ContractOrderType.md)
- [FuturesMarginType](../enums/types_futures.FuturesMarginType.md)
- [FuturesMarketAsset](../enums/types_futures.FuturesMarketAsset.md)
- [FuturesMarketKey](../enums/types_futures.FuturesMarketKey.md)
- [PositionSide](../enums/types_futures.PositionSide.md)
- [PotentialTradeStatus](../enums/types_futures.PotentialTradeStatus.md)

### Interfaces

- [FuturesMarketConfig](../interfaces/types_futures.FuturesMarketConfig.md)

### Type Aliases

- [ConditionalOrder](types_futures.md#conditionalorder)
- [DelayedOrder](types_futures.md#delayedorder)
- [FundingRateInput](types_futures.md#fundingrateinput)
- [FundingRateResponse](types_futures.md#fundingrateresponse)
- [FundingRateUpdate](types_futures.md#fundingrateupdate)
- [FuturesFilledPosition](types_futures.md#futuresfilledposition)
- [FuturesMarket](types_futures.md#futuresmarket)
- [FuturesOrderType](types_futures.md#futuresordertype)
- [FuturesOrderTypeDisplay](types_futures.md#futuresordertypedisplay)
- [FuturesPosition](types_futures.md#futuresposition)
- [FuturesPositionHistory](types_futures.md#futurespositionhistory)
- [FuturesPotentialTradeDetails](types_futures.md#futurespotentialtradedetails)
- [FuturesTrade](types_futures.md#futurestrade)
- [FuturesVolumes](types_futures.md#futuresvolumes)
- [MarginTransfer](types_futures.md#margintransfer)
- [MarketClosureReason](types_futures.md#marketclosurereason)
- [MarketWithIdleMargin](types_futures.md#marketwithidlemargin)
- [ModifyPositionOptions](types_futures.md#modifypositionoptions)
- [PerpsV3Market](types_futures.md#perpsv3market)
- [PositionDetail](types_futures.md#positiondetail)
- [PostTradeDetailsResponse](types_futures.md#posttradedetailsresponse)
- [SLTPOrderInputs](types_futures.md#sltporderinputs)
- [SmartMarginOrderInputs](types_futures.md#smartmarginorderinputs)
- [SmartMarginOrderType](types_futures.md#smartmarginordertype)
- [SynthSuspensionReason](types_futures.md#synthsuspensionreason)

### Variables

- [OrderEnumByType](types_futures.md#orderenumbytype)

## Type Aliases

### ConditionalOrder

Ƭ **ConditionalOrder**<`T`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `Wei` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `account` | `string` |
| `asset` | [`FuturesMarketAsset`](../enums/types_futures.FuturesMarketAsset.md) |
| `desiredFillPrice` | `T` |
| `id` | `number` |
| `isCancelling?` | `boolean` |
| `isExecutable?` | `boolean` |
| `isSlTp?` | `boolean` |
| `isStale?` | `boolean` |
| `marginDelta` | `T` |
| `market` | `string` |
| `marketKey` | [`FuturesMarketKey`](../enums/types_futures.FuturesMarketKey.md) |
| `orderType` | [`ConditionalOrderTypeEnum`](../enums/types_futures.ConditionalOrderTypeEnum.md) |
| `orderTypeDisplay` | [`FuturesOrderTypeDisplay`](types_futures.md#futuresordertypedisplay) |
| `reduceOnly` | `boolean` |
| `side?` | [`PositionSide`](../enums/types_futures.PositionSide.md) |
| `size` | `T` |
| `sizeTxt?` | `string` |
| `subgraphId` | `string` |
| `targetPrice` | `T` \| ``null`` |
| `targetPriceTxt?` | `string` |

#### Defined in

[packages/sdk/src/types/futures.ts:313](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/types/futures.ts#L313)

___

### DelayedOrder

Ƭ **DelayedOrder**<`T`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `Wei` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `account` | `string` |
| `commitDeposit` | `T` |
| `desiredFillPrice` | `T` |
| `executableAtTimestamp` | `number` |
| `isOffchain` | `boolean` |
| `keeperDeposit` | `T` |
| `marketAddress` | `string` |
| `orderType` | [`FuturesOrderTypeDisplay`](types_futures.md#futuresordertypedisplay) |
| `side` | [`PositionSide`](../enums/types_futures.PositionSide.md) |
| `size` | `T` |
| `submittedAtTimestamp` | `number` |
| `targetRoundId` | `T` \| ``null`` |

#### Defined in

[packages/sdk/src/types/futures.ts:336](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/types/futures.ts#L336)

___

### FundingRateInput

Ƭ **FundingRateInput**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `currentFundingRate` | `Wei` \| `undefined` |
| `marketAddress` | `string` \| `undefined` |
| `marketKey` | [`FuturesMarketKey`](../enums/types_futures.FuturesMarketKey.md) |
| `price` | `Wei` \| `undefined` |

#### Defined in

[packages/sdk/src/types/futures.ts:4](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/types/futures.ts#L4)

___

### FundingRateResponse

Ƭ **FundingRateResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `asset` | [`FuturesMarketKey`](../enums/types_futures.FuturesMarketKey.md) |
| `fundingRate` | `Wei` \| ``null`` |
| `fundingTitle` | `string` |

#### Defined in

[packages/sdk/src/types/futures.ts:70](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/types/futures.ts#L70)

___

### FundingRateUpdate

Ƭ **FundingRateUpdate**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `funding` | `Wei` |
| `timestamp` | `number` |

#### Defined in

[packages/sdk/src/types/futures.ts:65](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/types/futures.ts#L65)

___

### FuturesFilledPosition

Ƭ **FuturesFilledPosition**<`T`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `Wei` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `accruedFunding` | `T` |
| `canLiquidatePosition` | `boolean` |
| `fundingIndex` | `number` |
| `initialLeverage` | `T` |
| `initialMargin` | `T` |
| `lastPrice` | `T` |
| `leverage` | `T` |
| `liquidationPrice` | `T` |
| `marginRatio` | `T` |
| `notionalValue` | `T` |
| `pnl` | `T` |
| `pnlPct` | `T` |
| `profitLoss` | `T` |
| `side` | [`PositionSide`](../enums/types_futures.PositionSide.md) |
| `size` | `T` |

#### Defined in

[packages/sdk/src/types/futures.ts:229](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/types/futures.ts#L229)

___

### FuturesMarket

Ƭ **FuturesMarket**<`T`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `Wei` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `appMaxLeverage` | `T` |
| `asset` | [`FuturesMarketAsset`](../enums/types_futures.FuturesMarketAsset.md) |
| `assetHex` | `string` |
| `contractMaxLeverage` | `T` |
| `currentFundingRate` | `T` |
| `currentFundingVelocity` | `T` |
| `feeRates` | { `makerFee`: `T` ; `makerFeeDelayedOrder`: `T` ; `makerFeeOffchainDelayedOrder`: `T` ; `takerFee`: `T` ; `takerFeeDelayedOrder`: `T` ; `takerFeeOffchainDelayedOrder`: `T`  } |
| `feeRates.makerFee` | `T` |
| `feeRates.makerFeeDelayedOrder` | `T` |
| `feeRates.makerFeeOffchainDelayedOrder` | `T` |
| `feeRates.takerFee` | `T` |
| `feeRates.takerFeeDelayedOrder` | `T` |
| `feeRates.takerFeeOffchainDelayedOrder` | `T` |
| `isSuspended` | `boolean` |
| `keeperDeposit` | `T` |
| `market` | `string` |
| `marketClosureReason` | [`SynthSuspensionReason`](types_futures.md#synthsuspensionreason) |
| `marketDebt` | `T` |
| `marketKey` | [`FuturesMarketKey`](../enums/types_futures.FuturesMarketKey.md) |
| `marketLimitNative` | `T` |
| `marketLimitUsd` | `T` |
| `marketName` | `string` |
| `marketSize` | `T` |
| `marketSkew` | `T` |
| `minInitialMargin` | `T` |
| `openInterest` | { `long`: `T` ; `longPct`: `number` ; `longUSD`: `T` ; `short`: `T` ; `shortPct`: `number` ; `shortUSD`: `T`  } |
| `openInterest.long` | `T` |
| `openInterest.longPct` | `number` |
| `openInterest.longUSD` | `T` |
| `openInterest.short` | `T` |
| `openInterest.shortPct` | `number` |
| `openInterest.shortUSD` | `T` |
| `settings` | { `delayedOrderConfirmWindow`: `number` ; `maxDelayTimeDelta`: `number` ; `maxMarketValue`: `T` ; `minDelayTimeDelta`: `number` ; `offchainDelayedOrderMaxAge`: `number` ; `offchainDelayedOrderMinAge`: `number` ; `skewScale`: `T`  } |
| `settings.delayedOrderConfirmWindow` | `number` |
| `settings.maxDelayTimeDelta` | `number` |
| `settings.maxMarketValue` | `T` |
| `settings.minDelayTimeDelta` | `number` |
| `settings.offchainDelayedOrderMaxAge` | `number` |
| `settings.offchainDelayedOrderMinAge` | `number` |
| `settings.skewScale` | `T` |

#### Defined in

[packages/sdk/src/types/futures.ts:19](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/types/futures.ts#L19)

___

### FuturesOrderType

Ƭ **FuturesOrderType**: [`SmartMarginOrderType`](types_futures.md#smartmarginordertype)

#### Defined in

[packages/sdk/src/types/futures.ts:401](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/types/futures.ts#L401)

___

### FuturesOrderTypeDisplay

Ƭ **FuturesOrderTypeDisplay**: ``"Next Price"`` \| ``"Limit"`` \| ``"Stop"`` \| ``"Market"`` \| ``"Liquidation"`` \| ``"Delayed"`` \| ``"Take Profit"`` \| ``"Stop Loss"`` \| ``"Delayed Market"``

#### Defined in

[packages/sdk/src/types/futures.ts:297](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/types/futures.ts#L297)

___

### FuturesPosition

Ƭ **FuturesPosition**<`T`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `Wei` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `accessibleMargin` | `T` |
| `asset` | [`FuturesMarketAsset`](../enums/types_futures.FuturesMarketAsset.md) |
| `marketKey` | [`FuturesMarketKey`](../enums/types_futures.FuturesMarketKey.md) |
| `position` | [`FuturesFilledPosition`](types_futures.md#futuresfilledposition)<`T`\> \| ``null`` |
| `remainingMargin` | `T` |
| `stopLoss?` | [`ConditionalOrder`](types_futures.md#conditionalorder)<`T`\> |
| `takeProfit?` | [`ConditionalOrder`](types_futures.md#conditionalorder)<`T`\> |

#### Defined in

[packages/sdk/src/types/futures.ts:279](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/types/futures.ts#L279)

___

### FuturesPositionHistory

Ƭ **FuturesPositionHistory**<`T`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `Wei` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `abstractAccount` | `string` |
| `account` | `string` |
| `accountType` | [`FuturesMarginType`](../enums/types_futures.FuturesMarginType.md) |
| `asset` | [`FuturesMarketAsset`](../enums/types_futures.FuturesMarketAsset.md) |
| `avgEntryPrice` | `T` |
| `closeTimestamp` | `number` \| `undefined` |
| `entryPrice` | `T` |
| `exitPrice` | `T` |
| `feesPaid` | `T` |
| `id` | `Number` |
| `initialMargin` | `T` |
| `isLiquidated` | `boolean` |
| `isOpen` | `boolean` |
| `leverage` | `T` |
| `margin` | `T` |
| `market` | `string` |
| `marketKey` | [`FuturesMarketKey`](../enums/types_futures.FuturesMarketKey.md) |
| `netFunding` | `T` |
| `netTransfers` | `T` |
| `openTimestamp` | `number` |
| `pnl` | `T` |
| `pnlWithFeesPaid` | `T` |
| `side` | [`PositionSide`](../enums/types_futures.PositionSide.md) |
| `size` | `T` |
| `timestamp` | `number` |
| `totalDeposits` | `T` |
| `totalVolume` | `T` |
| `trades` | `number` |
| `transactionHash` | `string` |

#### Defined in

[packages/sdk/src/types/futures.ts:247](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/types/futures.ts#L247)

___

### FuturesPotentialTradeDetails

Ƭ **FuturesPotentialTradeDetails**<`T`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `Wei` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `exceedsPriceProtection` | `boolean` |
| `fee` | `T` |
| `leverage` | `T` |
| `liqPrice` | `T` |
| `margin` | `T` |
| `marketKey` | [`FuturesMarketKey`](../enums/types_futures.FuturesMarketKey.md) |
| `notionalValue` | `T` |
| `price` | `T` |
| `priceImpact` | `T` |
| `showStatus` | `boolean` |
| `side` | [`PositionSide`](../enums/types_futures.PositionSide.md) |
| `size` | `T` |
| `sizeDelta` | `T` |
| `status` | [`PotentialTradeStatus`](../enums/types_futures.PotentialTradeStatus.md) |
| `statusMessage` | `string` |

#### Defined in

[packages/sdk/src/types/futures.ts:351](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/types/futures.ts#L351)

___

### FuturesTrade

Ƭ **FuturesTrade**<`T`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `Wei` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `account` | `string` |
| `accountType` | [`FuturesMarginType`](../enums/types_futures.FuturesMarginType.md) |
| `asset` | [`FuturesMarketAsset`](../enums/types_futures.FuturesMarketAsset.md) |
| `feesPaid` | `T` |
| `keeperFeesPaid` | `T` |
| `margin` | `T` |
| `orderType` | [`FuturesOrderTypeDisplay`](types_futures.md#futuresordertypedisplay) |
| `pnl` | `T` |
| `positionClosed` | `boolean` |
| `positionId` | `string` |
| `positionSize` | `T` |
| `price` | `T` |
| `side` | [`PositionSide`](../enums/types_futures.PositionSide.md) |
| `size` | `T` |
| `timestamp` | `number` |
| `txnHash` | `string` |

#### Defined in

[packages/sdk/src/types/futures.ts:403](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/types/futures.ts#L403)

___

### FuturesVolumes

Ƭ **FuturesVolumes**<`T`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `Wei` |

#### Index signature

▪ [asset: `string`]: { `trades`: `T` ; `volume`: `T`  }

#### Defined in

[packages/sdk/src/types/futures.ts:178](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/types/futures.ts#L178)

___

### MarginTransfer

Ƭ **MarginTransfer**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `account` | `string` |
| `action` | `string` |
| `asset?` | [`FuturesMarketAsset`](../enums/types_futures.FuturesMarketAsset.md) |
| `market?` | `string` |
| `size` | `number` |
| `timestamp` | `number` |
| `txHash` | `string` |

#### Defined in

[packages/sdk/src/types/futures.ts:439](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/types/futures.ts#L439)

___

### MarketClosureReason

Ƭ **MarketClosureReason**: [`SynthSuspensionReason`](types_futures.md#synthsuspensionreason)

#### Defined in

[packages/sdk/src/types/futures.ts:17](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/types/futures.ts#L17)

___

### MarketWithIdleMargin

Ƭ **MarketWithIdleMargin**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `marketAddress` | `string` |
| `marketKey` | [`FuturesMarketKey`](../enums/types_futures.FuturesMarketKey.md) |
| `position` | [`FuturesPosition`](types_futures.md#futuresposition) |

#### Defined in

[packages/sdk/src/types/futures.ts:449](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/types/futures.ts#L449)

___

### ModifyPositionOptions

Ƭ **ModifyPositionOptions**<`T`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `boolean` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `delayed?` | `boolean` |
| `estimationOnly?` | `T` |
| `offchain?` | `boolean` |

#### Defined in

[packages/sdk/src/types/futures.ts:290](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/types/futures.ts#L290)

___

### PerpsV3Market

Ƭ **PerpsV3Market**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `feedId` | `string` |
| `id` | `string` |
| `initialMarginFraction` | `string` |
| `liquidationRewardRatioD18` | `string` |
| `lockedOiPercent` | `string` |
| `maintenanceMarginFraction` | `string` |
| `makerFee` | `string` |
| `marketName` | `string` |
| `marketOwner` | `string` |
| `marketSymbol` | `string` |
| `maxFundingVelocity` | `string` |
| `maxLiquidationLimitAccumulationMultiplier` | `string` |
| `owner` | `string` |
| `perpsMarketId` | `string` |
| `skewScale` | `string` |
| `takerFee` | `string` |

#### Defined in

[packages/sdk/src/types/futures.ts:495](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/types/futures.ts#L495)

___

### PositionDetail

Ƭ **PositionDetail**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `accessibleMargin` | `BigNumber` |
| `accruedFunding` | `BigNumber` |
| `liquidationPrice` | `BigNumber` |
| `notionalValue` | `BigNumber` |
| `order` | { `fee`: `BigNumber` ; `leverage`: `BigNumber` ; `pending`: `boolean`  } |
| `order.fee` | `BigNumber` |
| `order.leverage` | `BigNumber` |
| `order.pending` | `boolean` |
| `orderPending` | `boolean` |
| `position` | { `fundingIndex`: `BigNumber` ; `lastPrice`: `BigNumber` ; `margin`: `BigNumber` ; `size`: `BigNumber`  } |
| `position.fundingIndex` | `BigNumber` |
| `position.lastPrice` | `BigNumber` |
| `position.margin` | `BigNumber` |
| `position.size` | `BigNumber` |
| `profitLoss` | `BigNumber` |
| `remainingMargin` | `BigNumber` |

#### Defined in

[packages/sdk/src/types/futures.ts:185](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/types/futures.ts#L185)

___

### PostTradeDetailsResponse

Ƭ **PostTradeDetailsResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `fee` | `BigNumber` |
| `liqPrice` | `BigNumber` |
| `margin` | `BigNumber` |
| `price` | `BigNumber` |
| `size` | `BigNumber` |
| `status` | `number` |

#### Defined in

[packages/sdk/src/types/futures.ts:391](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/types/futures.ts#L391)

___

### SLTPOrderInputs

Ƭ **SLTPOrderInputs**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `keeperEthDeposit` | `Wei` |
| `stopLoss?` | { `desiredFillPrice`: `Wei` ; `isCancelled?`: `boolean` ; `price`: `Wei` ; `sizeDelta`: `Wei`  } |
| `stopLoss.desiredFillPrice` | `Wei` |
| `stopLoss.isCancelled?` | `boolean` |
| `stopLoss.price` | `Wei` |
| `stopLoss.sizeDelta` | `Wei` |
| `takeProfit?` | { `desiredFillPrice`: `Wei` ; `isCancelled?`: `boolean` ; `price`: `Wei` ; `sizeDelta`: `Wei`  } |
| `takeProfit.desiredFillPrice` | `Wei` |
| `takeProfit.isCancelled?` | `boolean` |
| `takeProfit.price` | `Wei` |
| `takeProfit.sizeDelta` | `Wei` |

#### Defined in

[packages/sdk/src/types/futures.ts:479](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/types/futures.ts#L479)

___

### SmartMarginOrderInputs

Ƭ **SmartMarginOrderInputs**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `conditionalOrderInputs?` | { `feeCap`: `Wei` ; `orderType`: [`ConditionalOrderTypeEnum`](../enums/types_futures.ConditionalOrderTypeEnum.md) ; `price`: `Wei` ; `reduceOnly`: `boolean`  } |
| `conditionalOrderInputs.feeCap` | `Wei` |
| `conditionalOrderInputs.orderType` | [`ConditionalOrderTypeEnum`](../enums/types_futures.ConditionalOrderTypeEnum.md) |
| `conditionalOrderInputs.price` | `Wei` |
| `conditionalOrderInputs.reduceOnly` | `boolean` |
| `desiredFillPrice` | `Wei` |
| `keeperEthDeposit?` | `Wei` |
| `marginDelta` | `Wei` |
| `sizeDelta` | `Wei` |
| `stopLoss?` | { `desiredFillPrice`: `Wei` ; `price`: `Wei` ; `sizeDelta`: `Wei`  } |
| `stopLoss.desiredFillPrice` | `Wei` |
| `stopLoss.price` | `Wei` |
| `stopLoss.sizeDelta` | `Wei` |
| `takeProfit?` | { `desiredFillPrice`: `Wei` ; `price`: `Wei` ; `sizeDelta`: `Wei`  } |
| `takeProfit.desiredFillPrice` | `Wei` |
| `takeProfit.price` | `Wei` |
| `takeProfit.sizeDelta` | `Wei` |
| `timeDelta?` | `Wei` |

#### Defined in

[packages/sdk/src/types/futures.ts:455](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/types/futures.ts#L455)

___

### SmartMarginOrderType

Ƭ **SmartMarginOrderType**: ``"market"`` \| ``"stop_market"`` \| ``"limit"``

#### Defined in

[packages/sdk/src/types/futures.ts:400](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/types/futures.ts#L400)

___

### SynthSuspensionReason

Ƭ **SynthSuspensionReason**: ``"system-upgrade"`` \| ``"market-closure"`` \| ``"circuit-breaker"`` \| ``"emergency"``

#### Defined in

[packages/sdk/src/types/futures.ts:11](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/types/futures.ts#L11)

## Variables

### OrderEnumByType

• `Const` **OrderEnumByType**: `Record`<`string`, [`ContractOrderType`](../enums/types_futures.ContractOrderType.md)\>

#### Defined in

[packages/sdk/src/types/futures.ts:223](https://github.com/Kwenta/kwenta/blob/28493a909/packages/sdk/src/types/futures.ts#L223)
