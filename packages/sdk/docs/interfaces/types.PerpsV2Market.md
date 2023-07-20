[@kwenta/sdk](../README.md) / [Modules](../modules.md) / [types](../modules/types.md) / PerpsV2Market

# Interface: PerpsV2Market

[types](../modules/types.md).PerpsV2Market

## Hierarchy

- `BaseContract`

  ↳ **`PerpsV2Market`**

## Table of contents

### Properties

- [\_deployedPromise](types.PerpsV2Market.md#_deployedpromise)
- [\_runningEvents](types.PerpsV2Market.md#_runningevents)
- [\_wrappedEmits](types.PerpsV2Market.md#_wrappedemits)
- [address](types.PerpsV2Market.md#address)
- [callStatic](types.PerpsV2Market.md#callstatic)
- [deployTransaction](types.PerpsV2Market.md#deploytransaction)
- [estimateGas](types.PerpsV2Market.md#estimategas)
- [filters](types.PerpsV2Market.md#filters)
- [functions](types.PerpsV2Market.md#functions)
- [interface](types.PerpsV2Market.md#interface)
- [off](types.PerpsV2Market.md#off)
- [on](types.PerpsV2Market.md#on)
- [once](types.PerpsV2Market.md#once)
- [populateTransaction](types.PerpsV2Market.md#populatetransaction)
- [provider](types.PerpsV2Market.md#provider)
- [removeListener](types.PerpsV2Market.md#removelistener)
- [resolvedAddress](types.PerpsV2Market.md#resolvedaddress)
- [signer](types.PerpsV2Market.md#signer)

### Methods

- [\_checkRunningEvents](types.PerpsV2Market.md#_checkrunningevents)
- [\_deployed](types.PerpsV2Market.md#_deployed)
- [\_wrapEvent](types.PerpsV2Market.md#_wrapevent)
- [accessibleMargin](types.PerpsV2Market.md#accessiblemargin)
- [accruedFunding](types.PerpsV2Market.md#accruedfunding)
- [assetPrice](types.PerpsV2Market.md#assetprice)
- [attach](types.PerpsV2Market.md#attach)
- [baseAsset](types.PerpsV2Market.md#baseasset)
- [canLiquidate](types.PerpsV2Market.md#canliquidate)
- [cancelDelayedOrder](types.PerpsV2Market.md#canceldelayedorder)
- [cancelOffchainDelayedOrder](types.PerpsV2Market.md#canceloffchaindelayedorder)
- [closePosition](types.PerpsV2Market.md#closeposition)
- [closePositionWithTracking](types.PerpsV2Market.md#closepositionwithtracking)
- [connect](types.PerpsV2Market.md#connect)
- [currentFundingRate](types.PerpsV2Market.md#currentfundingrate)
- [currentFundingVelocity](types.PerpsV2Market.md#currentfundingvelocity)
- [delayedOrders](types.PerpsV2Market.md#delayedorders)
- [deployed](types.PerpsV2Market.md#deployed)
- [emit](types.PerpsV2Market.md#emit)
- [executeDelayedOrder](types.PerpsV2Market.md#executedelayedorder)
- [executeOffchainDelayedOrder](types.PerpsV2Market.md#executeoffchaindelayedorder)
- [fallback](types.PerpsV2Market.md#fallback)
- [fillPrice](types.PerpsV2Market.md#fillprice)
- [flagPosition](types.PerpsV2Market.md#flagposition)
- [forceLiquidatePosition](types.PerpsV2Market.md#forceliquidateposition)
- [fundingLastRecomputed](types.PerpsV2Market.md#fundinglastrecomputed)
- [fundingRateLastRecomputed](types.PerpsV2Market.md#fundingratelastrecomputed)
- [fundingSequence](types.PerpsV2Market.md#fundingsequence)
- [fundingSequenceLength](types.PerpsV2Market.md#fundingsequencelength)
- [isFlagged](types.PerpsV2Market.md#isflagged)
- [liquidatePosition](types.PerpsV2Market.md#liquidateposition)
- [liquidationFee](types.PerpsV2Market.md#liquidationfee)
- [liquidationPrice](types.PerpsV2Market.md#liquidationprice)
- [listenerCount](types.PerpsV2Market.md#listenercount)
- [listeners](types.PerpsV2Market.md#listeners)
- [marketDebt](types.PerpsV2Market.md#marketdebt)
- [marketKey](types.PerpsV2Market.md#marketkey)
- [marketSize](types.PerpsV2Market.md#marketsize)
- [marketSizes](types.PerpsV2Market.md#marketsizes)
- [marketSkew](types.PerpsV2Market.md#marketskew)
- [modifyPosition](types.PerpsV2Market.md#modifyposition)
- [modifyPositionWithTracking](types.PerpsV2Market.md#modifypositionwithtracking)
- [notionalValue](types.PerpsV2Market.md#notionalvalue)
- [orderFee](types.PerpsV2Market.md#orderfee)
- [positions](types.PerpsV2Market.md#positions)
- [postTradeDetails](types.PerpsV2Market.md#posttradedetails)
- [profitLoss](types.PerpsV2Market.md#profitloss)
- [queryFilter](types.PerpsV2Market.md#queryfilter)
- [recomputeFunding](types.PerpsV2Market.md#recomputefunding)
- [remainingMargin](types.PerpsV2Market.md#remainingmargin)
- [removeAllListeners](types.PerpsV2Market.md#removealllisteners)
- [submitCloseDelayedOrderWithTracking](types.PerpsV2Market.md#submitclosedelayedorderwithtracking)
- [submitCloseOffchainDelayedOrderWithTracking](types.PerpsV2Market.md#submitcloseoffchaindelayedorderwithtracking)
- [submitDelayedOrder](types.PerpsV2Market.md#submitdelayedorder)
- [submitDelayedOrderWithTracking](types.PerpsV2Market.md#submitdelayedorderwithtracking)
- [submitOffchainDelayedOrder](types.PerpsV2Market.md#submitoffchaindelayedorder)
- [submitOffchainDelayedOrderWithTracking](types.PerpsV2Market.md#submitoffchaindelayedorderwithtracking)
- [transferMargin](types.PerpsV2Market.md#transfermargin)
- [unrecordedFunding](types.PerpsV2Market.md#unrecordedfunding)
- [withdrawAllMargin](types.PerpsV2Market.md#withdrawallmargin)

## Properties

### \_deployedPromise

• **\_deployedPromise**: `Promise`<`Contract`\>

#### Inherited from

BaseContract.\_deployedPromise

#### Defined in

node_modules/.pnpm/@ethersproject+contracts@5.7.0/node_modules/@ethersproject/contracts/lib/index.d.ts:100

___

### \_runningEvents

• **\_runningEvents**: `Object`

#### Index signature

▪ [eventTag: `string`]: `RunningEvent`

#### Inherited from

BaseContract.\_runningEvents

#### Defined in

node_modules/.pnpm/@ethersproject+contracts@5.7.0/node_modules/@ethersproject/contracts/lib/index.d.ts:101

___

### \_wrappedEmits

• **\_wrappedEmits**: `Object`

#### Index signature

▪ [eventTag: `string`]: (...`args`: `any`[]) => `void`

#### Inherited from

BaseContract.\_wrappedEmits

#### Defined in

node_modules/.pnpm/@ethersproject+contracts@5.7.0/node_modules/@ethersproject/contracts/lib/index.d.ts:104

___

### address

• `Readonly` **address**: `string`

#### Inherited from

BaseContract.address

#### Defined in

node_modules/.pnpm/@ethersproject+contracts@5.7.0/node_modules/@ethersproject/contracts/lib/index.d.ts:79

___

### callStatic

• **callStatic**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `accessibleMargin` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<[`BigNumber`, `boolean`] & { `invalid`: `boolean` ; `marginAccessible`: `BigNumber`  }\> |
| `accruedFunding` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<[`BigNumber`, `boolean`] & { `funding`: `BigNumber` ; `invalid`: `boolean`  }\> |
| `assetPrice` | (`overrides?`: `CallOverrides`) => `Promise`<[`BigNumber`, `boolean`] & { `invalid`: `boolean` ; `price`: `BigNumber`  }\> |
| `baseAsset` | (`overrides?`: `CallOverrides`) => `Promise`<`string`\> |
| `canLiquidate` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`boolean`\> |
| `cancelDelayedOrder` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`void`\> |
| `cancelOffchainDelayedOrder` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`void`\> |
| `closePosition` | (`desiredFillPrice`: `BigNumberish`, `overrides?`: `CallOverrides`) => `Promise`<`void`\> |
| `closePositionWithTracking` | (`desiredFillPrice`: `BigNumberish`, `trackingCode`: `BytesLike`, `overrides?`: `CallOverrides`) => `Promise`<`void`\> |
| `currentFundingRate` | (`overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `currentFundingVelocity` | (`overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `delayedOrders` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`DelayedOrderStructOutput`\> |
| `executeDelayedOrder` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`void`\> |
| `executeOffchainDelayedOrder` | (`account`: `string`, `priceUpdateData`: `BytesLike`[], `overrides?`: `CallOverrides`) => `Promise`<`void`\> |
| `fillPrice` | (`sizeDelta`: `BigNumberish`, `overrides?`: `CallOverrides`) => `Promise`<[`BigNumber`, `boolean`] & { `invalid`: `boolean` ; `price`: `BigNumber`  }\> |
| `flagPosition` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`void`\> |
| `forceLiquidatePosition` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`void`\> |
| `fundingLastRecomputed` | (`overrides?`: `CallOverrides`) => `Promise`<`number`\> |
| `fundingRateLastRecomputed` | (`overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `fundingSequence` | (`index`: `BigNumberish`, `overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `fundingSequenceLength` | (`overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `isFlagged` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`boolean`\> |
| `liquidatePosition` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`void`\> |
| `liquidationFee` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `liquidationPrice` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<[`BigNumber`, `boolean`] & { `invalid`: `boolean` ; `price`: `BigNumber`  }\> |
| `marketDebt` | (`overrides?`: `CallOverrides`) => `Promise`<[`BigNumber`, `boolean`] & { `debt`: `BigNumber` ; `isInvalid`: `boolean`  }\> |
| `marketKey` | (`overrides?`: `CallOverrides`) => `Promise`<`string`\> |
| `marketSize` | (`overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `marketSizes` | (`overrides?`: `CallOverrides`) => `Promise`<[`BigNumber`, `BigNumber`] & { `long`: `BigNumber` ; `short`: `BigNumber`  }\> |
| `marketSkew` | (`overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `modifyPosition` | (`sizeDelta`: `BigNumberish`, `desiredFillPrice`: `BigNumberish`, `overrides?`: `CallOverrides`) => `Promise`<`void`\> |
| `modifyPositionWithTracking` | (`sizeDelta`: `BigNumberish`, `desiredFillPrice`: `BigNumberish`, `trackingCode`: `BytesLike`, `overrides?`: `CallOverrides`) => `Promise`<`void`\> |
| `notionalValue` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<[`BigNumber`, `boolean`] & { `invalid`: `boolean` ; `value`: `BigNumber`  }\> |
| `orderFee` | (`sizeDelta`: `BigNumberish`, `orderType`: `BigNumberish`, `overrides?`: `CallOverrides`) => `Promise`<[`BigNumber`, `boolean`] & { `fee`: `BigNumber` ; `invalid`: `boolean`  }\> |
| `positions` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`PositionStructOutput`\> |
| `postTradeDetails` | (`sizeDelta`: `BigNumberish`, `tradePrice`: `BigNumberish`, `orderType`: `BigNumberish`, `sender`: `string`, `overrides?`: `CallOverrides`) => `Promise`<[`BigNumber`, `BigNumber`, `BigNumber`, `BigNumber`, `BigNumber`, `number`] & { `fee`: `BigNumber` ; `liqPrice`: `BigNumber` ; `margin`: `BigNumber` ; `price`: `BigNumber` ; `size`: `BigNumber` ; `status`: `number`  }\> |
| `profitLoss` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<[`BigNumber`, `boolean`] & { `invalid`: `boolean` ; `pnl`: `BigNumber`  }\> |
| `recomputeFunding` | (`overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `remainingMargin` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<[`BigNumber`, `boolean`] & { `invalid`: `boolean` ; `marginRemaining`: `BigNumber`  }\> |
| `submitCloseDelayedOrderWithTracking` | (`desiredTimeDelta`: `BigNumberish`, `desiredFillPrice`: `BigNumberish`, `trackingCode`: `BytesLike`, `overrides?`: `CallOverrides`) => `Promise`<`void`\> |
| `submitCloseOffchainDelayedOrderWithTracking` | (`desiredFillPrice`: `BigNumberish`, `trackingCode`: `BytesLike`, `overrides?`: `CallOverrides`) => `Promise`<`void`\> |
| `submitDelayedOrder` | (`sizeDelta`: `BigNumberish`, `desiredTimeDelta`: `BigNumberish`, `desiredFillPrice`: `BigNumberish`, `overrides?`: `CallOverrides`) => `Promise`<`void`\> |
| `submitDelayedOrderWithTracking` | (`sizeDelta`: `BigNumberish`, `desiredTimeDelta`: `BigNumberish`, `desiredFillPrice`: `BigNumberish`, `trackingCode`: `BytesLike`, `overrides?`: `CallOverrides`) => `Promise`<`void`\> |
| `submitOffchainDelayedOrder` | (`sizeDelta`: `BigNumberish`, `desiredFillPrice`: `BigNumberish`, `overrides?`: `CallOverrides`) => `Promise`<`void`\> |
| `submitOffchainDelayedOrderWithTracking` | (`sizeDelta`: `BigNumberish`, `desiredFillPrice`: `BigNumberish`, `trackingCode`: `BytesLike`, `overrides?`: `CallOverrides`) => `Promise`<`void`\> |
| `transferMargin` | (`marginDelta`: `BigNumberish`, `overrides?`: `CallOverrides`) => `Promise`<`void`\> |
| `unrecordedFunding` | (`overrides?`: `CallOverrides`) => `Promise`<[`BigNumber`, `boolean`] & { `funding`: `BigNumber` ; `invalid`: `boolean`  }\> |
| `withdrawAllMargin` | (`overrides?`: `CallOverrides`) => `Promise`<`void`\> |

#### Overrides

BaseContract.callStatic

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1229](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1229)

___

### deployTransaction

• `Readonly` **deployTransaction**: `TransactionResponse`

#### Inherited from

BaseContract.deployTransaction

#### Defined in

node_modules/.pnpm/@ethersproject+contracts@5.7.0/node_modules/@ethersproject/contracts/lib/index.d.ts:99

___

### estimateGas

• **estimateGas**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `accessibleMargin` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `accruedFunding` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `assetPrice` | (`overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `baseAsset` | (`overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `canLiquidate` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `cancelDelayedOrder` | (`account`: `string`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`BigNumber`\> |
| `cancelOffchainDelayedOrder` | (`account`: `string`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`BigNumber`\> |
| `closePosition` | (`desiredFillPrice`: `BigNumberish`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`BigNumber`\> |
| `closePositionWithTracking` | (`desiredFillPrice`: `BigNumberish`, `trackingCode`: `BytesLike`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`BigNumber`\> |
| `currentFundingRate` | (`overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `currentFundingVelocity` | (`overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `delayedOrders` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `executeDelayedOrder` | (`account`: `string`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`BigNumber`\> |
| `executeOffchainDelayedOrder` | (`account`: `string`, `priceUpdateData`: `BytesLike`[], `overrides?`: `PayableOverrides` & { `from?`: `string`  }) => `Promise`<`BigNumber`\> |
| `fillPrice` | (`sizeDelta`: `BigNumberish`, `overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `flagPosition` | (`account`: `string`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`BigNumber`\> |
| `forceLiquidatePosition` | (`account`: `string`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`BigNumber`\> |
| `fundingLastRecomputed` | (`overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `fundingRateLastRecomputed` | (`overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `fundingSequence` | (`index`: `BigNumberish`, `overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `fundingSequenceLength` | (`overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `isFlagged` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `liquidatePosition` | (`account`: `string`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`BigNumber`\> |
| `liquidationFee` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `liquidationPrice` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `marketDebt` | (`overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `marketKey` | (`overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `marketSize` | (`overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `marketSizes` | (`overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `marketSkew` | (`overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `modifyPosition` | (`sizeDelta`: `BigNumberish`, `desiredFillPrice`: `BigNumberish`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`BigNumber`\> |
| `modifyPositionWithTracking` | (`sizeDelta`: `BigNumberish`, `desiredFillPrice`: `BigNumberish`, `trackingCode`: `BytesLike`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`BigNumber`\> |
| `notionalValue` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `orderFee` | (`sizeDelta`: `BigNumberish`, `orderType`: `BigNumberish`, `overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `positions` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `postTradeDetails` | (`sizeDelta`: `BigNumberish`, `tradePrice`: `BigNumberish`, `orderType`: `BigNumberish`, `sender`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `profitLoss` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `recomputeFunding` | (`overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`BigNumber`\> |
| `remainingMargin` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `submitCloseDelayedOrderWithTracking` | (`desiredTimeDelta`: `BigNumberish`, `desiredFillPrice`: `BigNumberish`, `trackingCode`: `BytesLike`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`BigNumber`\> |
| `submitCloseOffchainDelayedOrderWithTracking` | (`desiredFillPrice`: `BigNumberish`, `trackingCode`: `BytesLike`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`BigNumber`\> |
| `submitDelayedOrder` | (`sizeDelta`: `BigNumberish`, `desiredTimeDelta`: `BigNumberish`, `desiredFillPrice`: `BigNumberish`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`BigNumber`\> |
| `submitDelayedOrderWithTracking` | (`sizeDelta`: `BigNumberish`, `desiredTimeDelta`: `BigNumberish`, `desiredFillPrice`: `BigNumberish`, `trackingCode`: `BytesLike`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`BigNumber`\> |
| `submitOffchainDelayedOrder` | (`sizeDelta`: `BigNumberish`, `desiredFillPrice`: `BigNumberish`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`BigNumber`\> |
| `submitOffchainDelayedOrderWithTracking` | (`sizeDelta`: `BigNumberish`, `desiredFillPrice`: `BigNumberish`, `trackingCode`: `BytesLike`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`BigNumber`\> |
| `transferMargin` | (`marginDelta`: `BigNumberish`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`BigNumber`\> |
| `unrecordedFunding` | (`overrides?`: `CallOverrides`) => `Promise`<`BigNumber`\> |
| `withdrawAllMargin` | (`overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`BigNumber`\> |

#### Overrides

BaseContract.estimateGas

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1598](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1598)

___

### filters

• **filters**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `DelayedOrderRemoved` | (`account?`: ``null`` \| `string`, `isOffchain?`: ``null``, `currentRoundId?`: ``null``, `sizeDelta?`: ``null``, `targetRoundId?`: ``null``, `commitDeposit?`: ``null``, `keeperDeposit?`: ``null``, `trackingCode?`: ``null``) => `DelayedOrderRemovedEventFilter` |
| `DelayedOrderRemoved(address,bool,uint256,int256,uint256,uint256,uint256,bytes32)` | (`account?`: ``null`` \| `string`, `isOffchain?`: ``null``, `currentRoundId?`: ``null``, `sizeDelta?`: ``null``, `targetRoundId?`: ``null``, `commitDeposit?`: ``null``, `keeperDeposit?`: ``null``, `trackingCode?`: ``null``) => `DelayedOrderRemovedEventFilter` |
| `DelayedOrderSubmitted` | (`account?`: ``null`` \| `string`, `isOffchain?`: ``null``, `sizeDelta?`: ``null``, `targetRoundId?`: ``null``, `intentionTime?`: ``null``, `executableAtTime?`: ``null``, `commitDeposit?`: ``null``, `keeperDeposit?`: ``null``, `trackingCode?`: ``null``) => `DelayedOrderSubmittedEventFilter` |
| `DelayedOrderSubmitted(address,bool,int256,uint256,uint256,uint256,uint256,uint256,bytes32)` | (`account?`: ``null`` \| `string`, `isOffchain?`: ``null``, `sizeDelta?`: ``null``, `targetRoundId?`: ``null``, `intentionTime?`: ``null``, `executableAtTime?`: ``null``, `commitDeposit?`: ``null``, `keeperDeposit?`: ``null``, `trackingCode?`: ``null``) => `DelayedOrderSubmittedEventFilter` |
| `FundingRecomputed` | (`funding?`: ``null``, `fundingRate?`: ``null``, `index?`: ``null``, `timestamp?`: ``null``) => `FundingRecomputedEventFilter` |
| `FundingRecomputed(int256,int256,uint256,uint256)` | (`funding?`: ``null``, `fundingRate?`: ``null``, `index?`: ``null``, `timestamp?`: ``null``) => `FundingRecomputedEventFilter` |
| `MarginTransferred` | (`account?`: ``null`` \| `string`, `marginDelta?`: ``null``) => `MarginTransferredEventFilter` |
| `MarginTransferred(address,int256)` | (`account?`: ``null`` \| `string`, `marginDelta?`: ``null``) => `MarginTransferredEventFilter` |
| `PerpsTracking` | (`trackingCode?`: ``null`` \| `BytesLike`, `baseAsset?`: ``null``, `marketKey?`: ``null``, `sizeDelta?`: ``null``, `fee?`: ``null``) => `PerpsTrackingEventFilter` |
| `PerpsTracking(bytes32,bytes32,bytes32,int256,uint256)` | (`trackingCode?`: ``null`` \| `BytesLike`, `baseAsset?`: ``null``, `marketKey?`: ``null``, `sizeDelta?`: ``null``, `fee?`: ``null``) => `PerpsTrackingEventFilter` |
| `PositionFlagged` | (`id?`: ``null``, `account?`: ``null``, `flagger?`: ``null``, `timestamp?`: ``null``) => `PositionFlaggedEventFilter` |
| `PositionFlagged(uint256,address,address,uint256)` | (`id?`: ``null``, `account?`: ``null``, `flagger?`: ``null``, `timestamp?`: ``null``) => `PositionFlaggedEventFilter` |
| `PositionLiquidated` | (`id?`: ``null``, `account?`: ``null``, `liquidator?`: ``null``, `size?`: ``null``, `price?`: ``null``, `flaggerFee?`: ``null``, `liquidatorFee?`: ``null``, `stakersFee?`: ``null``) => `PositionLiquidatedEventFilter` |
| `PositionLiquidated(uint256,address,address,int256,uint256,uint256,uint256,uint256)` | (`id?`: ``null``, `account?`: ``null``, `liquidator?`: ``null``, `size?`: ``null``, `price?`: ``null``, `flaggerFee?`: ``null``, `liquidatorFee?`: ``null``, `stakersFee?`: ``null``) => `PositionLiquidatedEventFilter` |
| `PositionModified` | (`id?`: ``null`` \| `BigNumberish`, `account?`: ``null`` \| `string`, `margin?`: ``null``, `size?`: ``null``, `tradeSize?`: ``null``, `lastPrice?`: ``null``, `fundingIndex?`: ``null``, `fee?`: ``null``, `skew?`: ``null``) => `PositionModifiedEventFilter` |
| `PositionModified(uint256,address,uint256,int256,int256,uint256,uint256,uint256,int256)` | (`id?`: ``null`` \| `BigNumberish`, `account?`: ``null`` \| `string`, `margin?`: ``null``, `size?`: ``null``, `tradeSize?`: ``null``, `lastPrice?`: ``null``, `fundingIndex?`: ``null``, `fee?`: ``null``, `skew?`: ``null``) => `PositionModifiedEventFilter` |

#### Overrides

BaseContract.filters

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1458](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1458)

___

### functions

• **functions**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `accessibleMargin` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<[`BigNumber`, `boolean`] & { `invalid`: `boolean` ; `marginAccessible`: `BigNumber`  }\> |
| `accruedFunding` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<[`BigNumber`, `boolean`] & { `funding`: `BigNumber` ; `invalid`: `boolean`  }\> |
| `assetPrice` | (`overrides?`: `CallOverrides`) => `Promise`<[`BigNumber`, `boolean`] & { `invalid`: `boolean` ; `price`: `BigNumber`  }\> |
| `baseAsset` | (`overrides?`: `CallOverrides`) => `Promise`<[`string`] & { `key`: `string`  }\> |
| `canLiquidate` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<[`boolean`]\> |
| `cancelDelayedOrder` | (`account`: `string`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`ContractTransaction`\> |
| `cancelOffchainDelayedOrder` | (`account`: `string`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`ContractTransaction`\> |
| `closePosition` | (`desiredFillPrice`: `BigNumberish`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`ContractTransaction`\> |
| `closePositionWithTracking` | (`desiredFillPrice`: `BigNumberish`, `trackingCode`: `BytesLike`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`ContractTransaction`\> |
| `currentFundingRate` | (`overrides?`: `CallOverrides`) => `Promise`<[`BigNumber`] & { `fundingRate`: `BigNumber`  }\> |
| `currentFundingVelocity` | (`overrides?`: `CallOverrides`) => `Promise`<[`BigNumber`] & { `fundingVelocity`: `BigNumber`  }\> |
| `delayedOrders` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<[`DelayedOrderStructOutput`]\> |
| `executeDelayedOrder` | (`account`: `string`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`ContractTransaction`\> |
| `executeOffchainDelayedOrder` | (`account`: `string`, `priceUpdateData`: `BytesLike`[], `overrides?`: `PayableOverrides` & { `from?`: `string`  }) => `Promise`<`ContractTransaction`\> |
| `fillPrice` | (`sizeDelta`: `BigNumberish`, `overrides?`: `CallOverrides`) => `Promise`<[`BigNumber`, `boolean`] & { `invalid`: `boolean` ; `price`: `BigNumber`  }\> |
| `flagPosition` | (`account`: `string`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`ContractTransaction`\> |
| `forceLiquidatePosition` | (`account`: `string`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`ContractTransaction`\> |
| `fundingLastRecomputed` | (`overrides?`: `CallOverrides`) => `Promise`<[`number`] & { `timestamp`: `number`  }\> |
| `fundingRateLastRecomputed` | (`overrides?`: `CallOverrides`) => `Promise`<[`BigNumber`] & { `fundingRate`: `BigNumber`  }\> |
| `fundingSequence` | (`index`: `BigNumberish`, `overrides?`: `CallOverrides`) => `Promise`<[`BigNumber`] & { `netFunding`: `BigNumber`  }\> |
| `fundingSequenceLength` | (`overrides?`: `CallOverrides`) => `Promise`<[`BigNumber`] & { `length`: `BigNumber`  }\> |
| `isFlagged` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<[`boolean`]\> |
| `liquidatePosition` | (`account`: `string`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`ContractTransaction`\> |
| `liquidationFee` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<[`BigNumber`]\> |
| `liquidationPrice` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<[`BigNumber`, `boolean`] & { `invalid`: `boolean` ; `price`: `BigNumber`  }\> |
| `marketDebt` | (`overrides?`: `CallOverrides`) => `Promise`<[`BigNumber`, `boolean`] & { `debt`: `BigNumber` ; `isInvalid`: `boolean`  }\> |
| `marketKey` | (`overrides?`: `CallOverrides`) => `Promise`<[`string`] & { `key`: `string`  }\> |
| `marketSize` | (`overrides?`: `CallOverrides`) => `Promise`<[`BigNumber`] & { `size`: `BigNumber`  }\> |
| `marketSizes` | (`overrides?`: `CallOverrides`) => `Promise`<[`BigNumber`, `BigNumber`] & { `long`: `BigNumber` ; `short`: `BigNumber`  }\> |
| `marketSkew` | (`overrides?`: `CallOverrides`) => `Promise`<[`BigNumber`] & { `skew`: `BigNumber`  }\> |
| `modifyPosition` | (`sizeDelta`: `BigNumberish`, `desiredFillPrice`: `BigNumberish`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`ContractTransaction`\> |
| `modifyPositionWithTracking` | (`sizeDelta`: `BigNumberish`, `desiredFillPrice`: `BigNumberish`, `trackingCode`: `BytesLike`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`ContractTransaction`\> |
| `notionalValue` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<[`BigNumber`, `boolean`] & { `invalid`: `boolean` ; `value`: `BigNumber`  }\> |
| `orderFee` | (`sizeDelta`: `BigNumberish`, `orderType`: `BigNumberish`, `overrides?`: `CallOverrides`) => `Promise`<[`BigNumber`, `boolean`] & { `fee`: `BigNumber` ; `invalid`: `boolean`  }\> |
| `positions` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<[`PositionStructOutput`]\> |
| `postTradeDetails` | (`sizeDelta`: `BigNumberish`, `tradePrice`: `BigNumberish`, `orderType`: `BigNumberish`, `sender`: `string`, `overrides?`: `CallOverrides`) => `Promise`<[`BigNumber`, `BigNumber`, `BigNumber`, `BigNumber`, `BigNumber`, `number`] & { `fee`: `BigNumber` ; `liqPrice`: `BigNumber` ; `margin`: `BigNumber` ; `price`: `BigNumber` ; `size`: `BigNumber` ; `status`: `number`  }\> |
| `profitLoss` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<[`BigNumber`, `boolean`] & { `invalid`: `boolean` ; `pnl`: `BigNumber`  }\> |
| `recomputeFunding` | (`overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`ContractTransaction`\> |
| `remainingMargin` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<[`BigNumber`, `boolean`] & { `invalid`: `boolean` ; `marginRemaining`: `BigNumber`  }\> |
| `submitCloseDelayedOrderWithTracking` | (`desiredTimeDelta`: `BigNumberish`, `desiredFillPrice`: `BigNumberish`, `trackingCode`: `BytesLike`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`ContractTransaction`\> |
| `submitCloseOffchainDelayedOrderWithTracking` | (`desiredFillPrice`: `BigNumberish`, `trackingCode`: `BytesLike`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`ContractTransaction`\> |
| `submitDelayedOrder` | (`sizeDelta`: `BigNumberish`, `desiredTimeDelta`: `BigNumberish`, `desiredFillPrice`: `BigNumberish`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`ContractTransaction`\> |
| `submitDelayedOrderWithTracking` | (`sizeDelta`: `BigNumberish`, `desiredTimeDelta`: `BigNumberish`, `desiredFillPrice`: `BigNumberish`, `trackingCode`: `BytesLike`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`ContractTransaction`\> |
| `submitOffchainDelayedOrder` | (`sizeDelta`: `BigNumberish`, `desiredFillPrice`: `BigNumberish`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`ContractTransaction`\> |
| `submitOffchainDelayedOrderWithTracking` | (`sizeDelta`: `BigNumberish`, `desiredFillPrice`: `BigNumberish`, `trackingCode`: `BytesLike`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`ContractTransaction`\> |
| `transferMargin` | (`marginDelta`: `BigNumberish`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`ContractTransaction`\> |
| `unrecordedFunding` | (`overrides?`: `CallOverrides`) => `Promise`<[`BigNumber`, `boolean`] & { `funding`: `BigNumber` ; `invalid`: `boolean`  }\> |
| `withdrawAllMargin` | (`overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`ContractTransaction`\> |

#### Overrides

BaseContract.functions

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:742](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L742)

___

### interface

• **interface**: `PerpsV2MarketInterface`

#### Overrides

BaseContract.interface

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:721](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L721)

___

### off

• **off**: `OnEvent`<[`PerpsV2Market`](types.PerpsV2Market.md)\>

#### Overrides

BaseContract.off

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:737](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L737)

___

### on

• **on**: `OnEvent`<[`PerpsV2Market`](types.PerpsV2Market.md)\>

#### Overrides

BaseContract.on

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:738](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L738)

___

### once

• **once**: `OnEvent`<[`PerpsV2Market`](types.PerpsV2Market.md)\>

#### Overrides

BaseContract.once

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:739](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L739)

___

### populateTransaction

• **populateTransaction**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `accessibleMargin` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`PopulatedTransaction`\> |
| `accruedFunding` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`PopulatedTransaction`\> |
| `assetPrice` | (`overrides?`: `CallOverrides`) => `Promise`<`PopulatedTransaction`\> |
| `baseAsset` | (`overrides?`: `CallOverrides`) => `Promise`<`PopulatedTransaction`\> |
| `canLiquidate` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`PopulatedTransaction`\> |
| `cancelDelayedOrder` | (`account`: `string`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`PopulatedTransaction`\> |
| `cancelOffchainDelayedOrder` | (`account`: `string`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`PopulatedTransaction`\> |
| `closePosition` | (`desiredFillPrice`: `BigNumberish`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`PopulatedTransaction`\> |
| `closePositionWithTracking` | (`desiredFillPrice`: `BigNumberish`, `trackingCode`: `BytesLike`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`PopulatedTransaction`\> |
| `currentFundingRate` | (`overrides?`: `CallOverrides`) => `Promise`<`PopulatedTransaction`\> |
| `currentFundingVelocity` | (`overrides?`: `CallOverrides`) => `Promise`<`PopulatedTransaction`\> |
| `delayedOrders` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`PopulatedTransaction`\> |
| `executeDelayedOrder` | (`account`: `string`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`PopulatedTransaction`\> |
| `executeOffchainDelayedOrder` | (`account`: `string`, `priceUpdateData`: `BytesLike`[], `overrides?`: `PayableOverrides` & { `from?`: `string`  }) => `Promise`<`PopulatedTransaction`\> |
| `fillPrice` | (`sizeDelta`: `BigNumberish`, `overrides?`: `CallOverrides`) => `Promise`<`PopulatedTransaction`\> |
| `flagPosition` | (`account`: `string`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`PopulatedTransaction`\> |
| `forceLiquidatePosition` | (`account`: `string`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`PopulatedTransaction`\> |
| `fundingLastRecomputed` | (`overrides?`: `CallOverrides`) => `Promise`<`PopulatedTransaction`\> |
| `fundingRateLastRecomputed` | (`overrides?`: `CallOverrides`) => `Promise`<`PopulatedTransaction`\> |
| `fundingSequence` | (`index`: `BigNumberish`, `overrides?`: `CallOverrides`) => `Promise`<`PopulatedTransaction`\> |
| `fundingSequenceLength` | (`overrides?`: `CallOverrides`) => `Promise`<`PopulatedTransaction`\> |
| `isFlagged` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`PopulatedTransaction`\> |
| `liquidatePosition` | (`account`: `string`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`PopulatedTransaction`\> |
| `liquidationFee` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`PopulatedTransaction`\> |
| `liquidationPrice` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`PopulatedTransaction`\> |
| `marketDebt` | (`overrides?`: `CallOverrides`) => `Promise`<`PopulatedTransaction`\> |
| `marketKey` | (`overrides?`: `CallOverrides`) => `Promise`<`PopulatedTransaction`\> |
| `marketSize` | (`overrides?`: `CallOverrides`) => `Promise`<`PopulatedTransaction`\> |
| `marketSizes` | (`overrides?`: `CallOverrides`) => `Promise`<`PopulatedTransaction`\> |
| `marketSkew` | (`overrides?`: `CallOverrides`) => `Promise`<`PopulatedTransaction`\> |
| `modifyPosition` | (`sizeDelta`: `BigNumberish`, `desiredFillPrice`: `BigNumberish`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`PopulatedTransaction`\> |
| `modifyPositionWithTracking` | (`sizeDelta`: `BigNumberish`, `desiredFillPrice`: `BigNumberish`, `trackingCode`: `BytesLike`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`PopulatedTransaction`\> |
| `notionalValue` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`PopulatedTransaction`\> |
| `orderFee` | (`sizeDelta`: `BigNumberish`, `orderType`: `BigNumberish`, `overrides?`: `CallOverrides`) => `Promise`<`PopulatedTransaction`\> |
| `positions` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`PopulatedTransaction`\> |
| `postTradeDetails` | (`sizeDelta`: `BigNumberish`, `tradePrice`: `BigNumberish`, `orderType`: `BigNumberish`, `sender`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`PopulatedTransaction`\> |
| `profitLoss` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`PopulatedTransaction`\> |
| `recomputeFunding` | (`overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`PopulatedTransaction`\> |
| `remainingMargin` | (`account`: `string`, `overrides?`: `CallOverrides`) => `Promise`<`PopulatedTransaction`\> |
| `submitCloseDelayedOrderWithTracking` | (`desiredTimeDelta`: `BigNumberish`, `desiredFillPrice`: `BigNumberish`, `trackingCode`: `BytesLike`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`PopulatedTransaction`\> |
| `submitCloseOffchainDelayedOrderWithTracking` | (`desiredFillPrice`: `BigNumberish`, `trackingCode`: `BytesLike`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`PopulatedTransaction`\> |
| `submitDelayedOrder` | (`sizeDelta`: `BigNumberish`, `desiredTimeDelta`: `BigNumberish`, `desiredFillPrice`: `BigNumberish`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`PopulatedTransaction`\> |
| `submitDelayedOrderWithTracking` | (`sizeDelta`: `BigNumberish`, `desiredTimeDelta`: `BigNumberish`, `desiredFillPrice`: `BigNumberish`, `trackingCode`: `BytesLike`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`PopulatedTransaction`\> |
| `submitOffchainDelayedOrder` | (`sizeDelta`: `BigNumberish`, `desiredFillPrice`: `BigNumberish`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`PopulatedTransaction`\> |
| `submitOffchainDelayedOrderWithTracking` | (`sizeDelta`: `BigNumberish`, `desiredFillPrice`: `BigNumberish`, `trackingCode`: `BytesLike`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`PopulatedTransaction`\> |
| `transferMargin` | (`marginDelta`: `BigNumberish`, `overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`PopulatedTransaction`\> |
| `unrecordedFunding` | (`overrides?`: `CallOverrides`) => `Promise`<`PopulatedTransaction`\> |
| `withdrawAllMargin` | (`overrides?`: `Overrides` & { `from?`: `string`  }) => `Promise`<`PopulatedTransaction`\> |

#### Overrides

BaseContract.populateTransaction

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1810](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1810)

___

### provider

• `Readonly` **provider**: `Provider`

#### Inherited from

BaseContract.provider

#### Defined in

node_modules/.pnpm/@ethersproject+contracts@5.7.0/node_modules/@ethersproject/contracts/lib/index.d.ts:82

___

### removeListener

• **removeListener**: `OnEvent`<[`PerpsV2Market`](types.PerpsV2Market.md)\>

#### Overrides

BaseContract.removeListener

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:740](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L740)

___

### resolvedAddress

• `Readonly` **resolvedAddress**: `Promise`<`string`\>

#### Inherited from

BaseContract.resolvedAddress

#### Defined in

node_modules/.pnpm/@ethersproject+contracts@5.7.0/node_modules/@ethersproject/contracts/lib/index.d.ts:98

___

### signer

• `Readonly` **signer**: `Signer`

#### Inherited from

BaseContract.signer

#### Defined in

node_modules/.pnpm/@ethersproject+contracts@5.7.0/node_modules/@ethersproject/contracts/lib/index.d.ts:81

## Methods

### \_checkRunningEvents

▸ **_checkRunningEvents**(`runningEvent`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `runningEvent` | `RunningEvent` |

#### Returns

`void`

#### Inherited from

BaseContract.\_checkRunningEvents

#### Defined in

node_modules/.pnpm/@ethersproject+contracts@5.7.0/node_modules/@ethersproject/contracts/lib/index.d.ts:121

___

### \_deployed

▸ **_deployed**(`blockTag?`): `Promise`<`Contract`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `blockTag?` | `BlockTag` |

#### Returns

`Promise`<`Contract`\>

#### Inherited from

BaseContract.\_deployed

#### Defined in

node_modules/.pnpm/@ethersproject+contracts@5.7.0/node_modules/@ethersproject/contracts/lib/index.d.ts:114

___

### \_wrapEvent

▸ **_wrapEvent**(`runningEvent`, `log`, `listener`): `Event`

#### Parameters

| Name | Type |
| :------ | :------ |
| `runningEvent` | `RunningEvent` |
| `log` | `Log` |
| `listener` | `Listener` |

#### Returns

`Event`

#### Inherited from

BaseContract.\_wrapEvent

#### Defined in

node_modules/.pnpm/@ethersproject+contracts@5.7.0/node_modules/@ethersproject/contracts/lib/index.d.ts:122

___

### accessibleMargin

▸ **accessibleMargin**(`account`, `overrides?`): `Promise`<[`BigNumber`, `boolean`] & { `invalid`: `boolean` ; `marginAccessible`: `BigNumber`  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `account` | `string` |
| `overrides?` | `CallOverrides` |

#### Returns

`Promise`<[`BigNumber`, `boolean`] & { `invalid`: `boolean` ; `marginAccessible`: `BigNumber`  }\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:995](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L995)

___

### accruedFunding

▸ **accruedFunding**(`account`, `overrides?`): `Promise`<[`BigNumber`, `boolean`] & { `funding`: `BigNumber` ; `invalid`: `boolean`  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `account` | `string` |
| `overrides?` | `CallOverrides` |

#### Returns

`Promise`<[`BigNumber`, `boolean`] & { `funding`: `BigNumber` ; `invalid`: `boolean`  }\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1002](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1002)

___

### assetPrice

▸ **assetPrice**(`overrides?`): `Promise`<[`BigNumber`, `boolean`] & { `invalid`: `boolean` ; `price`: `BigNumber`  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `overrides?` | `CallOverrides` |

#### Returns

`Promise`<[`BigNumber`, `boolean`] & { `invalid`: `boolean` ; `price`: `BigNumber`  }\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1007](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1007)

___

### attach

▸ **attach**(`addressOrName`): [`PerpsV2Market`](types.PerpsV2Market.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `addressOrName` | `string` |

#### Returns

[`PerpsV2Market`](types.PerpsV2Market.md)

#### Overrides

BaseContract.attach

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:718](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L718)

___

### baseAsset

▸ **baseAsset**(`overrides?`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `overrides?` | `CallOverrides` |

#### Returns

`Promise`<`string`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1011](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1011)

___

### canLiquidate

▸ **canLiquidate**(`account`, `overrides?`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `account` | `string` |
| `overrides?` | `CallOverrides` |

#### Returns

`Promise`<`boolean`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1013](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1013)

___

### cancelDelayedOrder

▸ **cancelDelayedOrder**(`account`, `overrides?`): `Promise`<`ContractTransaction`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `account` | `string` |
| `overrides?` | `Overrides` & { `from?`: `string`  } |

#### Returns

`Promise`<`ContractTransaction`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1015](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1015)

___

### cancelOffchainDelayedOrder

▸ **cancelOffchainDelayedOrder**(`account`, `overrides?`): `Promise`<`ContractTransaction`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `account` | `string` |
| `overrides?` | `Overrides` & { `from?`: `string`  } |

#### Returns

`Promise`<`ContractTransaction`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1020](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1020)

___

### closePosition

▸ **closePosition**(`desiredFillPrice`, `overrides?`): `Promise`<`ContractTransaction`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `desiredFillPrice` | `BigNumberish` |
| `overrides?` | `Overrides` & { `from?`: `string`  } |

#### Returns

`Promise`<`ContractTransaction`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1025](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1025)

___

### closePositionWithTracking

▸ **closePositionWithTracking**(`desiredFillPrice`, `trackingCode`, `overrides?`): `Promise`<`ContractTransaction`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `desiredFillPrice` | `BigNumberish` |
| `trackingCode` | `BytesLike` |
| `overrides?` | `Overrides` & { `from?`: `string`  } |

#### Returns

`Promise`<`ContractTransaction`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1030](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1030)

___

### connect

▸ **connect**(`signerOrProvider`): [`PerpsV2Market`](types.PerpsV2Market.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `signerOrProvider` | `string` \| `Provider` \| `Signer` |

#### Returns

[`PerpsV2Market`](types.PerpsV2Market.md)

#### Overrides

BaseContract.connect

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:717](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L717)

___

### currentFundingRate

▸ **currentFundingRate**(`overrides?`): `Promise`<`BigNumber`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `overrides?` | `CallOverrides` |

#### Returns

`Promise`<`BigNumber`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1036](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1036)

___

### currentFundingVelocity

▸ **currentFundingVelocity**(`overrides?`): `Promise`<`BigNumber`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `overrides?` | `CallOverrides` |

#### Returns

`Promise`<`BigNumber`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1038](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1038)

___

### delayedOrders

▸ **delayedOrders**(`account`, `overrides?`): `Promise`<`DelayedOrderStructOutput`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `account` | `string` |
| `overrides?` | `CallOverrides` |

#### Returns

`Promise`<`DelayedOrderStructOutput`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1040](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1040)

___

### deployed

▸ **deployed**(): `Promise`<[`PerpsV2Market`](types.PerpsV2Market.md)\>

#### Returns

`Promise`<[`PerpsV2Market`](types.PerpsV2Market.md)\>

#### Overrides

BaseContract.deployed

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:719](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L719)

___

### emit

▸ **emit**(`eventName`, `...args`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | `string` \| `EventFilter` |
| `...args` | `any`[] |

#### Returns

`boolean`

#### Inherited from

BaseContract.emit

#### Defined in

node_modules/.pnpm/@ethersproject+contracts@5.7.0/node_modules/@ethersproject/contracts/lib/index.d.ts:127

___

### executeDelayedOrder

▸ **executeDelayedOrder**(`account`, `overrides?`): `Promise`<`ContractTransaction`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `account` | `string` |
| `overrides?` | `Overrides` & { `from?`: `string`  } |

#### Returns

`Promise`<`ContractTransaction`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1045](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1045)

___

### executeOffchainDelayedOrder

▸ **executeOffchainDelayedOrder**(`account`, `priceUpdateData`, `overrides?`): `Promise`<`ContractTransaction`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `account` | `string` |
| `priceUpdateData` | `BytesLike`[] |
| `overrides?` | `PayableOverrides` & { `from?`: `string`  } |

#### Returns

`Promise`<`ContractTransaction`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1050](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1050)

___

### fallback

▸ **fallback**(`overrides?`): `Promise`<`TransactionResponse`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `overrides?` | `TransactionRequest` |

#### Returns

`Promise`<`TransactionResponse`\>

#### Inherited from

BaseContract.fallback

#### Defined in

node_modules/.pnpm/@ethersproject+contracts@5.7.0/node_modules/@ethersproject/contracts/lib/index.d.ts:115

___

### fillPrice

▸ **fillPrice**(`sizeDelta`, `overrides?`): `Promise`<[`BigNumber`, `boolean`] & { `invalid`: `boolean` ; `price`: `BigNumber`  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `sizeDelta` | `BigNumberish` |
| `overrides?` | `CallOverrides` |

#### Returns

`Promise`<[`BigNumber`, `boolean`] & { `invalid`: `boolean` ; `price`: `BigNumber`  }\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1056](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1056)

___

### flagPosition

▸ **flagPosition**(`account`, `overrides?`): `Promise`<`ContractTransaction`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `account` | `string` |
| `overrides?` | `Overrides` & { `from?`: `string`  } |

#### Returns

`Promise`<`ContractTransaction`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1061](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1061)

___

### forceLiquidatePosition

▸ **forceLiquidatePosition**(`account`, `overrides?`): `Promise`<`ContractTransaction`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `account` | `string` |
| `overrides?` | `Overrides` & { `from?`: `string`  } |

#### Returns

`Promise`<`ContractTransaction`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1066](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1066)

___

### fundingLastRecomputed

▸ **fundingLastRecomputed**(`overrides?`): `Promise`<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `overrides?` | `CallOverrides` |

#### Returns

`Promise`<`number`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1071](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1071)

___

### fundingRateLastRecomputed

▸ **fundingRateLastRecomputed**(`overrides?`): `Promise`<`BigNumber`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `overrides?` | `CallOverrides` |

#### Returns

`Promise`<`BigNumber`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1073](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1073)

___

### fundingSequence

▸ **fundingSequence**(`index`, `overrides?`): `Promise`<`BigNumber`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `index` | `BigNumberish` |
| `overrides?` | `CallOverrides` |

#### Returns

`Promise`<`BigNumber`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1075](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1075)

___

### fundingSequenceLength

▸ **fundingSequenceLength**(`overrides?`): `Promise`<`BigNumber`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `overrides?` | `CallOverrides` |

#### Returns

`Promise`<`BigNumber`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1080](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1080)

___

### isFlagged

▸ **isFlagged**(`account`, `overrides?`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `account` | `string` |
| `overrides?` | `CallOverrides` |

#### Returns

`Promise`<`boolean`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1082](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1082)

___

### liquidatePosition

▸ **liquidatePosition**(`account`, `overrides?`): `Promise`<`ContractTransaction`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `account` | `string` |
| `overrides?` | `Overrides` & { `from?`: `string`  } |

#### Returns

`Promise`<`ContractTransaction`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1084](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1084)

___

### liquidationFee

▸ **liquidationFee**(`account`, `overrides?`): `Promise`<`BigNumber`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `account` | `string` |
| `overrides?` | `CallOverrides` |

#### Returns

`Promise`<`BigNumber`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1089](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1089)

___

### liquidationPrice

▸ **liquidationPrice**(`account`, `overrides?`): `Promise`<[`BigNumber`, `boolean`] & { `invalid`: `boolean` ; `price`: `BigNumber`  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `account` | `string` |
| `overrides?` | `CallOverrides` |

#### Returns

`Promise`<[`BigNumber`, `boolean`] & { `invalid`: `boolean` ; `price`: `BigNumber`  }\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1094](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1094)

___

### listenerCount

▸ **listenerCount**(`eventName?`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName?` | `string` \| `EventFilter` |

#### Returns

`number`

#### Inherited from

BaseContract.listenerCount

#### Defined in

node_modules/.pnpm/@ethersproject+contracts@5.7.0/node_modules/@ethersproject/contracts/lib/index.d.ts:128

___

### listeners

▸ **listeners**<`TEvent`\>(`eventFilter?`): `TypedListener`<`TEvent`\>[]

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TEvent` | extends `TypedEvent`<`any`, `any`, `TEvent`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventFilter?` | `TypedEventFilter`<`TEvent`\> |

#### Returns

`TypedListener`<`TEvent`\>[]

#### Overrides

BaseContract.listeners

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:729](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L729)

▸ **listeners**(`eventName?`): `Listener`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName?` | `string` |

#### Returns

`Listener`[]

#### Overrides

BaseContract.listeners

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:732](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L732)

___

### marketDebt

▸ **marketDebt**(`overrides?`): `Promise`<[`BigNumber`, `boolean`] & { `debt`: `BigNumber` ; `isInvalid`: `boolean`  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `overrides?` | `CallOverrides` |

#### Returns

`Promise`<[`BigNumber`, `boolean`] & { `debt`: `BigNumber` ; `isInvalid`: `boolean`  }\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1099](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1099)

___

### marketKey

▸ **marketKey**(`overrides?`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `overrides?` | `CallOverrides` |

#### Returns

`Promise`<`string`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1103](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1103)

___

### marketSize

▸ **marketSize**(`overrides?`): `Promise`<`BigNumber`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `overrides?` | `CallOverrides` |

#### Returns

`Promise`<`BigNumber`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1105](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1105)

___

### marketSizes

▸ **marketSizes**(`overrides?`): `Promise`<[`BigNumber`, `BigNumber`] & { `long`: `BigNumber` ; `short`: `BigNumber`  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `overrides?` | `CallOverrides` |

#### Returns

`Promise`<[`BigNumber`, `BigNumber`] & { `long`: `BigNumber` ; `short`: `BigNumber`  }\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1107](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1107)

___

### marketSkew

▸ **marketSkew**(`overrides?`): `Promise`<`BigNumber`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `overrides?` | `CallOverrides` |

#### Returns

`Promise`<`BigNumber`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1111](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1111)

___

### modifyPosition

▸ **modifyPosition**(`sizeDelta`, `desiredFillPrice`, `overrides?`): `Promise`<`ContractTransaction`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `sizeDelta` | `BigNumberish` |
| `desiredFillPrice` | `BigNumberish` |
| `overrides?` | `Overrides` & { `from?`: `string`  } |

#### Returns

`Promise`<`ContractTransaction`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1113](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1113)

___

### modifyPositionWithTracking

▸ **modifyPositionWithTracking**(`sizeDelta`, `desiredFillPrice`, `trackingCode`, `overrides?`): `Promise`<`ContractTransaction`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `sizeDelta` | `BigNumberish` |
| `desiredFillPrice` | `BigNumberish` |
| `trackingCode` | `BytesLike` |
| `overrides?` | `Overrides` & { `from?`: `string`  } |

#### Returns

`Promise`<`ContractTransaction`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1119](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1119)

___

### notionalValue

▸ **notionalValue**(`account`, `overrides?`): `Promise`<[`BigNumber`, `boolean`] & { `invalid`: `boolean` ; `value`: `BigNumber`  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `account` | `string` |
| `overrides?` | `CallOverrides` |

#### Returns

`Promise`<[`BigNumber`, `boolean`] & { `invalid`: `boolean` ; `value`: `BigNumber`  }\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1126](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1126)

___

### orderFee

▸ **orderFee**(`sizeDelta`, `orderType`, `overrides?`): `Promise`<[`BigNumber`, `boolean`] & { `fee`: `BigNumber` ; `invalid`: `boolean`  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `sizeDelta` | `BigNumberish` |
| `orderType` | `BigNumberish` |
| `overrides?` | `CallOverrides` |

#### Returns

`Promise`<[`BigNumber`, `boolean`] & { `fee`: `BigNumber` ; `invalid`: `boolean`  }\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1131](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1131)

___

### positions

▸ **positions**(`account`, `overrides?`): `Promise`<`PositionStructOutput`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `account` | `string` |
| `overrides?` | `CallOverrides` |

#### Returns

`Promise`<`PositionStructOutput`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1137](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1137)

___

### postTradeDetails

▸ **postTradeDetails**(`sizeDelta`, `tradePrice`, `orderType`, `sender`, `overrides?`): `Promise`<[`BigNumber`, `BigNumber`, `BigNumber`, `BigNumber`, `BigNumber`, `number`] & { `fee`: `BigNumber` ; `liqPrice`: `BigNumber` ; `margin`: `BigNumber` ; `price`: `BigNumber` ; `size`: `BigNumber` ; `status`: `number`  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `sizeDelta` | `BigNumberish` |
| `tradePrice` | `BigNumberish` |
| `orderType` | `BigNumberish` |
| `sender` | `string` |
| `overrides?` | `CallOverrides` |

#### Returns

`Promise`<[`BigNumber`, `BigNumber`, `BigNumber`, `BigNumber`, `BigNumber`, `number`] & { `fee`: `BigNumber` ; `liqPrice`: `BigNumber` ; `margin`: `BigNumber` ; `price`: `BigNumber` ; `size`: `BigNumber` ; `status`: `number`  }\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1142](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1142)

___

### profitLoss

▸ **profitLoss**(`account`, `overrides?`): `Promise`<[`BigNumber`, `boolean`] & { `invalid`: `boolean` ; `pnl`: `BigNumber`  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `account` | `string` |
| `overrides?` | `CallOverrides` |

#### Returns

`Promise`<[`BigNumber`, `boolean`] & { `invalid`: `boolean` ; `pnl`: `BigNumber`  }\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1159](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1159)

___

### queryFilter

▸ **queryFilter**<`TEvent`\>(`event`, `fromBlockOrBlockhash?`, `toBlock?`): `Promise`<`TEvent`[]\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TEvent` | extends `TypedEvent`<`any`, `any`, `TEvent`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `TypedEventFilter`<`TEvent`\> |
| `fromBlockOrBlockhash?` | `string` \| `number` |
| `toBlock?` | `string` \| `number` |

#### Returns

`Promise`<`TEvent`[]\>

#### Overrides

BaseContract.queryFilter

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:723](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L723)

___

### recomputeFunding

▸ **recomputeFunding**(`overrides?`): `Promise`<`ContractTransaction`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `overrides?` | `Overrides` & { `from?`: `string`  } |

#### Returns

`Promise`<`ContractTransaction`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1164](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1164)

___

### remainingMargin

▸ **remainingMargin**(`account`, `overrides?`): `Promise`<[`BigNumber`, `boolean`] & { `invalid`: `boolean` ; `marginRemaining`: `BigNumber`  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `account` | `string` |
| `overrides?` | `CallOverrides` |

#### Returns

`Promise`<[`BigNumber`, `boolean`] & { `invalid`: `boolean` ; `marginRemaining`: `BigNumber`  }\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1168](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1168)

___

### removeAllListeners

▸ **removeAllListeners**<`TEvent`\>(`eventFilter`): [`PerpsV2Market`](types.PerpsV2Market.md)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TEvent` | extends `TypedEvent`<`any`, `any`, `TEvent`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventFilter` | `TypedEventFilter`<`TEvent`\> |

#### Returns

[`PerpsV2Market`](types.PerpsV2Market.md)

#### Overrides

BaseContract.removeAllListeners

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:733](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L733)

▸ **removeAllListeners**(`eventName?`): [`PerpsV2Market`](types.PerpsV2Market.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName?` | `string` |

#### Returns

[`PerpsV2Market`](types.PerpsV2Market.md)

#### Overrides

BaseContract.removeAllListeners

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:736](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L736)

___

### submitCloseDelayedOrderWithTracking

▸ **submitCloseDelayedOrderWithTracking**(`desiredTimeDelta`, `desiredFillPrice`, `trackingCode`, `overrides?`): `Promise`<`ContractTransaction`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `desiredTimeDelta` | `BigNumberish` |
| `desiredFillPrice` | `BigNumberish` |
| `trackingCode` | `BytesLike` |
| `overrides?` | `Overrides` & { `from?`: `string`  } |

#### Returns

`Promise`<`ContractTransaction`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1175](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1175)

___

### submitCloseOffchainDelayedOrderWithTracking

▸ **submitCloseOffchainDelayedOrderWithTracking**(`desiredFillPrice`, `trackingCode`, `overrides?`): `Promise`<`ContractTransaction`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `desiredFillPrice` | `BigNumberish` |
| `trackingCode` | `BytesLike` |
| `overrides?` | `Overrides` & { `from?`: `string`  } |

#### Returns

`Promise`<`ContractTransaction`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1182](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1182)

___

### submitDelayedOrder

▸ **submitDelayedOrder**(`sizeDelta`, `desiredTimeDelta`, `desiredFillPrice`, `overrides?`): `Promise`<`ContractTransaction`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `sizeDelta` | `BigNumberish` |
| `desiredTimeDelta` | `BigNumberish` |
| `desiredFillPrice` | `BigNumberish` |
| `overrides?` | `Overrides` & { `from?`: `string`  } |

#### Returns

`Promise`<`ContractTransaction`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1188](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1188)

___

### submitDelayedOrderWithTracking

▸ **submitDelayedOrderWithTracking**(`sizeDelta`, `desiredTimeDelta`, `desiredFillPrice`, `trackingCode`, `overrides?`): `Promise`<`ContractTransaction`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `sizeDelta` | `BigNumberish` |
| `desiredTimeDelta` | `BigNumberish` |
| `desiredFillPrice` | `BigNumberish` |
| `trackingCode` | `BytesLike` |
| `overrides?` | `Overrides` & { `from?`: `string`  } |

#### Returns

`Promise`<`ContractTransaction`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1195](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1195)

___

### submitOffchainDelayedOrder

▸ **submitOffchainDelayedOrder**(`sizeDelta`, `desiredFillPrice`, `overrides?`): `Promise`<`ContractTransaction`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `sizeDelta` | `BigNumberish` |
| `desiredFillPrice` | `BigNumberish` |
| `overrides?` | `Overrides` & { `from?`: `string`  } |

#### Returns

`Promise`<`ContractTransaction`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1203](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1203)

___

### submitOffchainDelayedOrderWithTracking

▸ **submitOffchainDelayedOrderWithTracking**(`sizeDelta`, `desiredFillPrice`, `trackingCode`, `overrides?`): `Promise`<`ContractTransaction`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `sizeDelta` | `BigNumberish` |
| `desiredFillPrice` | `BigNumberish` |
| `trackingCode` | `BytesLike` |
| `overrides?` | `Overrides` & { `from?`: `string`  } |

#### Returns

`Promise`<`ContractTransaction`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1209](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1209)

___

### transferMargin

▸ **transferMargin**(`marginDelta`, `overrides?`): `Promise`<`ContractTransaction`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `marginDelta` | `BigNumberish` |
| `overrides?` | `Overrides` & { `from?`: `string`  } |

#### Returns

`Promise`<`ContractTransaction`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1216](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1216)

___

### unrecordedFunding

▸ **unrecordedFunding**(`overrides?`): `Promise`<[`BigNumber`, `boolean`] & { `funding`: `BigNumber` ; `invalid`: `boolean`  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `overrides?` | `CallOverrides` |

#### Returns

`Promise`<[`BigNumber`, `boolean`] & { `funding`: `BigNumber` ; `invalid`: `boolean`  }\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1221](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1221)

___

### withdrawAllMargin

▸ **withdrawAllMargin**(`overrides?`): `Promise`<`ContractTransaction`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `overrides?` | `Overrides` & { `from?`: `string`  } |

#### Returns

`Promise`<`ContractTransaction`\>

#### Defined in

[packages/sdk/src/contracts/types/PerpsV2Market.ts:1225](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/contracts/types/PerpsV2Market.ts#L1225)
