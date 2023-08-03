[@kwenta/sdk](../README.md) / [Modules](../modules.md) / [services/exchange](../modules/services_exchange.md) / default

# Class: default

[services/exchange](../modules/services_exchange.md).default

## Table of contents

### Constructors

- [constructor](services_exchange.default.md#constructor)

### Accessors

- [exchangeRates](services_exchange.default.md#exchangerates)
- [mainGqlEndpoint](services_exchange.default.md#maingqlendpoint)
- [synthsMap](services_exchange.default.md#synthsmap)

### Methods

- [approveSwap](services_exchange.default.md#approveswap)
- [batchGetCoingeckoPrices](services_exchange.default.md#batchgetcoingeckoprices)
- [checkAllowance](services_exchange.default.md#checkallowance)
- [getApproveAddress](services_exchange.default.md#getapproveaddress)
- [getAtomicRates](services_exchange.default.md#getatomicrates)
- [getBaseFeeRate](services_exchange.default.md#getbasefeerate)
- [getCoingeckoPrices](services_exchange.default.md#getcoingeckoprices)
- [getCurrencyName](services_exchange.default.md#getcurrencyname)
- [getExchangeFeeRate](services_exchange.default.md#getexchangefeerate)
- [getFeeCost](services_exchange.default.md#getfeecost)
- [getFeeReclaimPeriod](services_exchange.default.md#getfeereclaimperiod)
- [getNumEntries](services_exchange.default.md#getnumentries)
- [getOneInchQuote](services_exchange.default.md#getoneinchquote)
- [getOneInchTokenList](services_exchange.default.md#getoneinchtokenlist)
- [getOneInchTokens](services_exchange.default.md#getoneinchtokens)
- [getPriceRate](services_exchange.default.md#getpricerate)
- [getRate](services_exchange.default.md#getrate)
- [getRedeemableDeprecatedSynths](services_exchange.default.md#getredeemabledeprecatedsynths)
- [getSlippagePercent](services_exchange.default.md#getslippagepercent)
- [getSynthSuspensions](services_exchange.default.md#getsynthsuspensions)
- [getSynthsMap](services_exchange.default.md#getsynthsmap)
- [getTokenBalances](services_exchange.default.md#gettokenbalances)
- [getTradePrices](services_exchange.default.md#gettradeprices)
- [getTransactionFee](services_exchange.default.md#gettransactionfee)
- [getTxProvider](services_exchange.default.md#gettxprovider)
- [getWalletTrades](services_exchange.default.md#getwallettrades)
- [handleExchange](services_exchange.default.md#handleexchange)
- [handleSettle](services_exchange.default.md#handlesettle)
- [swapOneInch](services_exchange.default.md#swaponeinch)
- [swapOneInchGasEstimate](services_exchange.default.md#swaponeinchgasestimate)
- [swapOneInchMeta](services_exchange.default.md#swaponeinchmeta)
- [swapSynthSwap](services_exchange.default.md#swapsynthswap)
- [validCurrencyKeys](services_exchange.default.md#validcurrencykeys)

## Constructors

### constructor

• **new default**(`sdk`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `sdk` | [`default`](index.default.md) |

#### Defined in

[packages/sdk/src/services/exchange.ts:56](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L56)

## Accessors

### exchangeRates

• `get` **exchangeRates**(): `Partial`<`Record`<[`AssetKey`](../modules/types_prices.md#assetkey), `Wei`\>\>

#### Returns

`Partial`<`Record`<[`AssetKey`](../modules/types_prices.md#assetkey), `Wei`\>\>

#### Defined in

[packages/sdk/src/services/exchange.ts:60](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L60)

___

### mainGqlEndpoint

• `get` **mainGqlEndpoint**(): `string`

#### Returns

`string`

#### Defined in

[packages/sdk/src/services/exchange.ts:853](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L853)

___

### synthsMap

• `get` **synthsMap**(): `Partial`<`Record`<`SynthSymbol`, `SynthToken`\>\>

#### Returns

`Partial`<`Record`<`SynthSymbol`, `SynthToken`\>\>

#### Defined in

[packages/sdk/src/services/exchange.ts:797](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L797)

## Methods

### approveSwap

▸ **approveSwap**(`fromCurrencyKey`, `toCurrencyKey`): `Promise`<`undefined` \| `string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `fromCurrencyKey` | `string` |
| `toCurrencyKey` | `string` |

#### Returns

`Promise`<`undefined` \| `string`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:415](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L415)

___

### batchGetCoingeckoPrices

▸ **batchGetCoingeckoPrices**(`tokenAddresses`, `include24hrChange?`): `Promise`<[`PriceResponse`](../modules/types_exchange.md#priceresponse)\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `tokenAddresses` | `string`[] | `undefined` |
| `include24hrChange` | `boolean` | `false` |

#### Returns

`Promise`<[`PriceResponse`](../modules/types_exchange.md#priceresponse)\>

#### Defined in

[packages/sdk/src/services/exchange.ts:747](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L747)

___

### checkAllowance

▸ **checkAllowance**(`fromCurrencyKey`, `toCurrencyKey`): `Promise`<`undefined` \| `Wei`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `fromCurrencyKey` | `string` |
| `toCurrencyKey` | `string` |

#### Returns

`Promise`<`undefined` \| `Wei`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:590](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L590)

___

### getApproveAddress

▸ **getApproveAddress**(`txProvider`): ``"0x6d6273f52b0C8eaB388141393c1e8cfDB3311De6"`` \| `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `txProvider` | `undefined` \| ``"synthetix"`` \| ``"1inch"`` \| ``"synthswap"`` |

#### Returns

``"0x6d6273f52b0C8eaB388141393c1e8cfDB3311De6"`` \| `Promise`<`string`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:586](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L586)

___

### getAtomicRates

▸ **getAtomicRates**(`currencyKey`): `Promise`<`Wei`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `currencyKey` | `string` |

#### Returns

`Promise`<`Wei`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:401](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L401)

___

### getBaseFeeRate

▸ **getBaseFeeRate**(`fromCurrencyKey`, `toCurrencyKey`): `Promise`<`Wei`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `fromCurrencyKey` | `string` |
| `toCurrencyKey` | `string` |

#### Returns

`Promise`<`Wei`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:128](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L128)

___

### getCoingeckoPrices

▸ **getCoingeckoPrices**(`fromCurrencyKey`, `toCurrencyKey`): `Promise`<[`PriceResponse`](../modules/types_exchange.md#priceresponse)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `fromCurrencyKey` | `string` |
| `toCurrencyKey` | `string` |

#### Returns

`Promise`<[`PriceResponse`](../modules/types_exchange.md#priceresponse)\>

#### Defined in

[packages/sdk/src/services/exchange.ts:739](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L739)

___

### getCurrencyName

▸ **getCurrencyName**(`currencyKey`): `undefined` \| `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `currencyKey` | `string` |

#### Returns

`undefined` \| `string`

#### Defined in

[packages/sdk/src/services/exchange.ts:608](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L608)

___

### getExchangeFeeRate

▸ **getExchangeFeeRate**(`fromCurrencyKey`, `toCurrencyKey`): `Promise`<`Wei`\>

**`Desc`**

- Get the fee rate for exchanging between two currencies.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fromCurrencyKey` | `string` | The currency key of the source token. |
| `toCurrencyKey` | `string` | The currency key of the destination token. |

#### Returns

`Promise`<`Wei`\>

Returns the fee rate.

#### Defined in

[packages/sdk/src/services/exchange.ts:153](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L153)

___

### getFeeCost

▸ **getFeeCost**(`fromCurrencyKey`, `toCurrencyKey`, `fromAmount`): `Promise`<`Wei`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `fromCurrencyKey` | `string` |
| `toCurrencyKey` | `string` |
| `fromAmount` | `string` |

#### Returns

`Promise`<`Wei`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:573](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L573)

___

### getFeeReclaimPeriod

▸ **getFeeReclaimPeriod**(`currencyKey`): `Promise`<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `currencyKey` | `string` |

#### Returns

`Promise`<`number`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:204](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L204)

___

### getNumEntries

▸ **getNumEntries**(`currencyKey`): `Promise`<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `currencyKey` | `string` |

#### Returns

`Promise`<`number`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:388](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L388)

___

### getOneInchQuote

▸ **getOneInchQuote**(`toCurrencyKey`, `fromCurrencyKey`, `amount`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `toCurrencyKey` | `string` |
| `fromCurrencyKey` | `string` |
| `amount` | `string` |

#### Returns

`Promise`<`string`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:612](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L612)

___

### getOneInchTokenList

▸ **getOneInchTokenList**(): `Promise`<{ `symbols`: `string`[] ; `tokens`: { `address`: `string` ; `chainId`: ``1`` \| ``10`` ; `decimals`: `number` ; `logoURI`: `string` ; `name`: `string` ; `symbol`: `string` ; `tags`: `never`[] = [] }[] ; `tokensMap`: `Dictionary`<{ `address`: `string` ; `chainId`: ``1`` \| ``10`` ; `decimals`: `number` ; `logoURI`: `string` ; `name`: `string` ; `symbol`: `string` ; `tags`: `never`[] = [] }\>  }\>

**`Desc`**

Get the list of whitelisted tokens on 1inch.

#### Returns

`Promise`<{ `symbols`: `string`[] ; `tokens`: { `address`: `string` ; `chainId`: ``1`` \| ``10`` ; `decimals`: `number` ; `logoURI`: `string` ; `name`: `string` ; `symbol`: `string` ; `tags`: `never`[] = [] }[] ; `tokensMap`: `Dictionary`<{ `address`: `string` ; `chainId`: ``1`` \| ``10`` ; `decimals`: `number` ; `logoURI`: `string` ; `name`: `string` ; `symbol`: `string` ; `tags`: `never`[] = [] }\>  }\>

Returns the list of tokens currently whitelisted on 1inch.

#### Defined in

[packages/sdk/src/services/exchange.ts:190](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L190)

___

### getOneInchTokens

▸ **getOneInchTokens**(): `Promise`<{ `tokenList`: [`Token`](../modules/types_tokens.md#token)[] ; `tokensMap`: `any`  }\>

#### Returns

`Promise`<{ `tokenList`: [`Token`](../modules/types_tokens.md#token)[] ; `tokensMap`: `any`  }\>

#### Defined in

[packages/sdk/src/services/exchange.ts:801](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L801)

___

### getPriceRate

▸ **getPriceRate**(`currencyKey`, `txProvider`, `coinGeckoPrices`): `Promise`<`Wei`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `currencyKey` | `string` |
| `txProvider` | `undefined` \| ``"synthetix"`` \| ``"1inch"`` \| ``"synthswap"`` |
| `coinGeckoPrices` | [`PriceResponse`](../modules/types_exchange.md#priceresponse) |

#### Returns

`Promise`<`Wei`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:661](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L661)

___

### getRate

▸ **getRate**(`fromCurrencyKey`, `toCurrencyKey`): `Promise`<`Wei`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `fromCurrencyKey` | `string` |
| `toCurrencyKey` | `string` |

#### Returns

`Promise`<`Wei`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:166](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L166)

___

### getRedeemableDeprecatedSynths

▸ **getRedeemableDeprecatedSynths**(): `Promise`<{ `balances`: [`DeprecatedSynthBalance`](../modules/types_synths.md#deprecatedsynthbalance)[] = cryptoBalances; `totalUSDBalance`: `Wei`  }\>

#### Returns

`Promise`<{ `balances`: [`DeprecatedSynthBalance`](../modules/types_synths.md#deprecatedsynthbalance)[] = cryptoBalances; `totalUSDBalance`: `Wei`  }\>

#### Defined in

[packages/sdk/src/services/exchange.ts:684](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L684)

___

### getSlippagePercent

▸ **getSlippagePercent**(`fromCurrencyKey`, `toCurrencyKey`, `fromAmount`, `toAmount`): `Promise`<`undefined` \| `Wei`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `fromCurrencyKey` | `string` |
| `toCurrencyKey` | `string` |
| `fromAmount` | `Wei` |
| `toAmount` | `Wei` |

#### Returns

`Promise`<`undefined` \| `Wei`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:108](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L108)

___

### getSynthSuspensions

▸ **getSynthSuspensions**(): `Promise`<`Record`<`string`, { `isSuspended`: `boolean` ; `reason`: ``null`` \| [`SynthSuspensionReason`](../modules/types_futures.md#synthsuspensionreason) ; `reasonCode`: `number`  }\>\>

#### Returns

`Promise`<`Record`<`string`, { `isSuspended`: `boolean` ; `reason`: ``null`` \| [`SynthSuspensionReason`](../modules/types_futures.md#synthsuspensionreason) ; `reasonCode`: `number`  }\>\>

#### Defined in

[packages/sdk/src/services/exchange.ts:811](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L811)

___

### getSynthsMap

▸ **getSynthsMap**(): `Partial`<`Record`<`SynthSymbol`, `SynthToken`\>\>

#### Returns

`Partial`<`Record`<`SynthSymbol`, `SynthToken`\>\>

#### Defined in

[packages/sdk/src/services/exchange.ts:793](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L793)

___

### getTokenBalances

▸ **getTokenBalances**(`walletAddress`): `Promise`<[`TokenBalances`](../modules/types_tokens.md#tokenbalances)\>

Get token balances for the given wallet address

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `walletAddress` | `string` | Wallet address |

#### Returns

`Promise`<[`TokenBalances`](../modules/types_tokens.md#tokenbalances)\>

Token balances for the given wallet address

#### Defined in

[packages/sdk/src/services/exchange.ts:866](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L866)

___

### getTradePrices

▸ **getTradePrices**(`txProvider`, `fromCurrencyKey`, `toCurrencyKey`, `fromAmount`, `toAmount`): `Promise`<{ `baseTradePrice`: `Wei` ; `quoteTradePrice`: `Wei`  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `txProvider` | `undefined` \| ``"synthetix"`` \| ``"1inch"`` \| ``"synthswap"`` |
| `fromCurrencyKey` | `string` |
| `toCurrencyKey` | `string` |
| `fromAmount` | `Wei` |
| `toAmount` | `Wei` |

#### Returns

`Promise`<{ `baseTradePrice`: `Wei` ; `quoteTradePrice`: `Wei`  }\>

#### Defined in

[packages/sdk/src/services/exchange.ts:82](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L82)

___

### getTransactionFee

▸ **getTransactionFee**(`fromCurrencyKey`, `toCurrencyKey`, `fromAmount`, `toAmount`): `Promise`<``null`` \| `Wei`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `fromCurrencyKey` | `string` |
| `toCurrencyKey` | `string` |
| `fromAmount` | `string` |
| `toAmount` | `string` |

#### Returns

`Promise`<``null`` \| `Wei`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:508](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L508)

___

### getTxProvider

▸ **getTxProvider**(`fromCurrencyKey`, `toCurrencyKey`): `undefined` \| ``"synthetix"`` \| ``"1inch"`` \| ``"synthswap"``

**`Desc`**

- Get the provider to be used for transactions on a currency pair.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fromCurrencyKey` | `string` | The currency key of the source token. |
| `toCurrencyKey` | `string` | The currency key of the destination token. |

#### Returns

`undefined` \| ``"synthetix"`` \| ``"1inch"`` \| ``"synthswap"``

Returns one of '1inch', 'synthetix', or 'synthswap'.

#### Defined in

[packages/sdk/src/services/exchange.ts:70](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L70)

___

### getWalletTrades

▸ **getWalletTrades**(): `Promise`<[`SynthExchange`](../modules/types_exchange.md#synthexchange)[]\>

#### Returns

`Promise`<[`SynthExchange`](../modules/types_exchange.md#synthexchange)[]\>

#### Defined in

[packages/sdk/src/services/exchange.ts:857](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L857)

___

### handleExchange

▸ **handleExchange**(`fromCurrencyKey`, `toCurrencyKey`, `fromAmount`, `toAmount`): `Promise`<`undefined` \| `string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `fromCurrencyKey` | `string` |
| `toCurrencyKey` | `string` |
| `fromAmount` | `string` |
| `toAmount` | `string` |

#### Returns

`Promise`<`undefined` \| `string`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:456](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L456)

___

### handleSettle

▸ **handleSettle**(`toCurrencyKey`): `Promise`<`undefined` \| `string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `toCurrencyKey` | `string` |

#### Returns

`Promise`<`undefined` \| `string`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:433](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L433)

___

### swapOneInch

▸ **swapOneInch**(`fromTokenAddress`, `toTokenAddress`, `amount`, `fromTokenDecimals`): `Promise`<`TransactionResponse`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `fromTokenAddress` | `string` |
| `toTokenAddress` | `string` |
| `amount` | `string` |
| `fromTokenDecimals` | `number` |

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:354](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L354)

___

### swapOneInchGasEstimate

▸ **swapOneInchGasEstimate**(`fromTokenAddress`, `toTokenAddress`, `amount`, `fromTokenDecimals`): `Promise`<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `fromTokenAddress` | `string` |
| `toTokenAddress` | `string` |
| `amount` | `string` |
| `fromTokenDecimals` | `number` |

#### Returns

`Promise`<`number`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:372](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L372)

___

### swapOneInchMeta

▸ **swapOneInchMeta**(`fromTokenAddress`, `toTokenAddress`, `amount`, `fromTokenDecimals`): `Promise`<`TransactionRequest`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `fromTokenAddress` | `string` |
| `toTokenAddress` | `string` |
| `amount` | `string` |
| `fromTokenDecimals` | `number` |

#### Returns

`Promise`<`TransactionRequest`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:331](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L331)

___

### swapSynthSwap

▸ **swapSynthSwap**(`fromToken`, `toToken`, `fromAmount`, `metaOnly?`): `Promise`<`BigNumber` \| `TransactionResponse` \| `PopulatedTransaction`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `fromToken` | [`Token`](../modules/types_tokens.md#token) |
| `toToken` | [`Token`](../modules/types_tokens.md#token) |
| `fromAmount` | `string` |
| `metaOnly?` | ``"meta_tx"`` \| ``"estimate_gas"`` |

#### Returns

`Promise`<`BigNumber` \| `TransactionResponse` \| `PopulatedTransaction`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:218](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L218)

___

### validCurrencyKeys

▸ **validCurrencyKeys**(`fromCurrencyKey?`, `toCurrencyKey?`): `boolean`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `fromCurrencyKey?` | `string` |
| `toCurrencyKey?` | `string` |

#### Returns

`boolean`[]

#### Defined in

[packages/sdk/src/services/exchange.ts:730](https://github.com/Kwenta/kwenta/blob/60f0875a3/packages/sdk/src/services/exchange.ts#L730)
