[@kwenta/sdk](../README.md) / [Modules](../modules.md) / [services/exchange](../modules/services_exchange.md) / default

# Class: default

[services/exchange](../modules/services_exchange.md).default

## Table of contents

### Constructors

- [constructor](services_exchange.default.md#constructor)

### Properties

- [allTokensMap](services_exchange.default.md#alltokensmap)
- [sdk](services_exchange.default.md#sdk)
- [tokenList](services_exchange.default.md#tokenlist)
- [tokensMap](services_exchange.default.md#tokensmap)

### Accessors

- [exchangeRates](services_exchange.default.md#exchangerates)
- [mainGqlEndpoint](services_exchange.default.md#maingqlendpoint)
- [oneInchApiUrl](services_exchange.default.md#oneinchapiurl)
- [sUSDRate](services_exchange.default.md#susdrate)
- [synthsMap](services_exchange.default.md#synthsmap)

### Methods

- [approveSwap](services_exchange.default.md#approveswap)
- [batchGetCoingeckoPrices](services_exchange.default.md#batchgetcoingeckoprices)
- [checkAllowance](services_exchange.default.md#checkallowance)
- [checkIsAtomic](services_exchange.default.md#checkisatomic)
- [createERC20Contract](services_exchange.default.md#createerc20contract)
- [getApproveAddress](services_exchange.default.md#getapproveaddress)
- [getAtomicRates](services_exchange.default.md#getatomicrates)
- [getBaseFeeRate](services_exchange.default.md#getbasefeerate)
- [getCoingeckoPrices](services_exchange.default.md#getcoingeckoprices)
- [getCoingeckoPricesForCurrencies](services_exchange.default.md#getcoingeckopricesforcurrencies)
- [getCurrencyName](services_exchange.default.md#getcurrencyname)
- [getExchangeFeeRate](services_exchange.default.md#getexchangefeerate)
- [getExchangeParams](services_exchange.default.md#getexchangeparams)
- [getExchangeRatesForCurrencies](services_exchange.default.md#getexchangeratesforcurrencies)
- [getExchangeRatesTupleForCurrencies](services_exchange.default.md#getexchangeratestupleforcurrencies)
- [getFeeCost](services_exchange.default.md#getfeecost)
- [getFeeReclaimPeriod](services_exchange.default.md#getfeereclaimperiod)
- [getGasEstimateForExchange](services_exchange.default.md#getgasestimateforexchange)
- [getNumEntries](services_exchange.default.md#getnumentries)
- [getOneInchApproveAddress](services_exchange.default.md#getoneinchapproveaddress)
- [getOneInchQuote](services_exchange.default.md#getoneinchquote)
- [getOneInchQuoteSwapParams](services_exchange.default.md#getoneinchquoteswapparams)
- [getOneInchSwapParams](services_exchange.default.md#getoneinchswapparams)
- [getOneInchTokenList](services_exchange.default.md#getoneinchtokenlist)
- [getOneInchTokens](services_exchange.default.md#getoneinchtokens)
- [getPairRates](services_exchange.default.md#getpairrates)
- [getPriceRate](services_exchange.default.md#getpricerate)
- [getQuoteCurrencyContract](services_exchange.default.md#getquotecurrencycontract)
- [getRate](services_exchange.default.md#getrate)
- [getRedeemableDeprecatedSynths](services_exchange.default.md#getredeemabledeprecatedsynths)
- [getSlippagePercent](services_exchange.default.md#getslippagepercent)
- [getSynthSuspensions](services_exchange.default.md#getsynthsuspensions)
- [getSynthsMap](services_exchange.default.md#getsynthsmap)
- [getTokenAddress](services_exchange.default.md#gettokenaddress)
- [getTokenBalances](services_exchange.default.md#gettokenbalances)
- [getTokenDecimals](services_exchange.default.md#gettokendecimals)
- [getTradePrices](services_exchange.default.md#gettradeprices)
- [getTransactionFee](services_exchange.default.md#gettransactionfee)
- [getTxProvider](services_exchange.default.md#gettxprovider)
- [getWalletTrades](services_exchange.default.md#getwallettrades)
- [handleExchange](services_exchange.default.md#handleexchange)
- [handleSettle](services_exchange.default.md#handlesettle)
- [isCurrencyETH](services_exchange.default.md#iscurrencyeth)
- [quoteOneInch](services_exchange.default.md#quoteoneinch)
- [swapOneInch](services_exchange.default.md#swaponeinch)
- [swapOneInchGasEstimate](services_exchange.default.md#swaponeinchgasestimate)
- [swapOneInchMeta](services_exchange.default.md#swaponeinchmeta)
- [swapSynthSwap](services_exchange.default.md#swapsynthswap)
- [swapSynthSwapGasEstimate](services_exchange.default.md#swapsynthswapgasestimate)
- [validCurrencyKeys](services_exchange.default.md#validcurrencykeys)

## Constructors

### constructor

• **new default**(`sdk`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `sdk` | [`default`](index.default.md) |

#### Defined in

[packages/sdk/src/services/exchange.ts:56](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L56)

## Properties

### allTokensMap

• `Private` **allTokensMap**: `any`

#### Defined in

[packages/sdk/src/services/exchange.ts:53](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L53)

___

### sdk

• `Private` **sdk**: [`default`](index.default.md)

#### Defined in

[packages/sdk/src/services/exchange.ts:54](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L54)

___

### tokenList

• `Private` **tokenList**: [`Token`](../modules/types_tokens.md#token)[] = `[]`

#### Defined in

[packages/sdk/src/services/exchange.ts:52](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L52)

___

### tokensMap

• `Private` **tokensMap**: `any` = `{}`

#### Defined in

[packages/sdk/src/services/exchange.ts:51](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L51)

## Accessors

### exchangeRates

• `get` **exchangeRates**(): `Partial`<`Record`<[`AssetKey`](../modules/types_prices.md#assetkey), `Wei`\>\>

#### Returns

`Partial`<`Record`<[`AssetKey`](../modules/types_prices.md#assetkey), `Wei`\>\>

#### Defined in

[packages/sdk/src/services/exchange.ts:60](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L60)

___

### mainGqlEndpoint

• `get` **mainGqlEndpoint**(): `string`

#### Returns

`string`

#### Defined in

[packages/sdk/src/services/exchange.ts:850](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L850)

___

### oneInchApiUrl

• `Private` `get` **oneInchApiUrl**(): `string`

#### Returns

`string`

#### Defined in

[packages/sdk/src/services/exchange.ts:881](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L881)

___

### sUSDRate

• `Private` `get` **sUSDRate**(): `undefined` \| `Wei`

#### Returns

`undefined` \| `Wei`

#### Defined in

[packages/sdk/src/services/exchange.ts:756](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L756)

___

### synthsMap

• `get` **synthsMap**(): `Partial`<`Record`<`SynthSymbol`, `SynthToken`\>\>

#### Returns

`Partial`<`Record`<`SynthSymbol`, `SynthToken`\>\>

#### Defined in

[packages/sdk/src/services/exchange.ts:794](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L794)

## Methods

### approveSwap

▸ **approveSwap**(`quoteCurrencyKey`, `baseCurrencyKey`): `Promise`<`undefined` \| `string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `quoteCurrencyKey` | `string` |
| `baseCurrencyKey` | `string` |

#### Returns

`Promise`<`undefined` \| `string`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:405](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L405)

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

[packages/sdk/src/services/exchange.ts:744](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L744)

___

### checkAllowance

▸ **checkAllowance**(`quoteCurrencyKey`, `baseCurrencyKey`): `Promise`<`undefined` \| `Wei`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `quoteCurrencyKey` | `string` |
| `baseCurrencyKey` | `string` |

#### Returns

`Promise`<`undefined` \| `Wei`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:587](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L587)

___

### checkIsAtomic

▸ `Private` **checkIsAtomic**(`baseCurrencyKey`, `quoteCurrencyKey`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `baseCurrencyKey` | `string` |
| `quoteCurrencyKey` | `string` |

#### Returns

`boolean`

#### Defined in

[packages/sdk/src/services/exchange.ts:858](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L858)

___

### createERC20Contract

▸ `Private` **createERC20Contract**(`tokenAddress`): `Contract`

#### Parameters

| Name | Type |
| :------ | :------ |
| `tokenAddress` | `string` |

#### Returns

`Contract`

#### Defined in

[packages/sdk/src/services/exchange.ts:1137](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L1137)

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

[packages/sdk/src/services/exchange.ts:583](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L583)

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

[packages/sdk/src/services/exchange.ts:391](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L391)

___

### getBaseFeeRate

▸ **getBaseFeeRate**(`baseCurrencyKey`, `quoteCurrencyKey`): `Promise`<`Wei`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `baseCurrencyKey` | `string` |
| `quoteCurrencyKey` | `string` |

#### Returns

`Promise`<`Wei`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:128](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L128)

___

### getCoingeckoPrices

▸ **getCoingeckoPrices**(`quoteCurrencyKey`, `baseCurrencyKey`): `Promise`<[`PriceResponse`](../modules/types_exchange.md#priceresponse)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `quoteCurrencyKey` | `string` |
| `baseCurrencyKey` | `string` |

#### Returns

`Promise`<[`PriceResponse`](../modules/types_exchange.md#priceresponse)\>

#### Defined in

[packages/sdk/src/services/exchange.ts:736](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L736)

___

### getCoingeckoPricesForCurrencies

▸ `Private` **getCoingeckoPricesForCurrencies**(`coingeckoPrices`, `baseAddress`): `Wei`

#### Parameters

| Name | Type |
| :------ | :------ |
| `coingeckoPrices` | ``null`` \| [`PriceResponse`](../modules/types_exchange.md#priceresponse) |
| `baseAddress` | ``null`` \| `string` |

#### Returns

`Wei`

#### Defined in

[packages/sdk/src/services/exchange.ts:1057](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L1057)

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

[packages/sdk/src/services/exchange.ts:605](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L605)

___

### getExchangeFeeRate

▸ **getExchangeFeeRate**(`quoteCurrencyKey`, `baseCurrencyKey`): `Promise`<`Wei`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `quoteCurrencyKey` | `string` |
| `baseCurrencyKey` | `string` |

#### Returns

`Promise`<`Wei`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:147](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L147)

___

### getExchangeParams

▸ `Private` **getExchangeParams**(`quoteCurrencyKey`, `baseCurrencyKey`, `sourceAmount`, `minAmount`, `isAtomic`): (`string` \| `BigNumber`)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `quoteCurrencyKey` | `string` |
| `baseCurrencyKey` | `string` |
| `sourceAmount` | `Wei` |
| `minAmount` | `Wei` |
| `isAtomic` | `boolean` |

#### Returns

(`string` \| `BigNumber`)[]

#### Defined in

[packages/sdk/src/services/exchange.ts:760](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L760)

___

### getExchangeRatesForCurrencies

▸ `Private` **getExchangeRatesForCurrencies**(`rates`, `base`, `quote`): `Wei`

#### Parameters

| Name | Type |
| :------ | :------ |
| `rates` | ``null`` \| [`Rates`](../modules/types_exchange.md#rates) |
| `base` | `string` |
| `quote` | ``null`` \| `string` |

#### Returns

`Wei`

#### Defined in

[packages/sdk/src/services/exchange.ts:1073](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L1073)

___

### getExchangeRatesTupleForCurrencies

▸ `Private` **getExchangeRatesTupleForCurrencies**(`rates`, `base`, `quote`): `Wei`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `rates` | ``null`` \| [`Rates`](../modules/types_exchange.md#rates) |
| `base` | `string` |
| `quote` | ``null`` \| `string` |

#### Returns

`Wei`[]

#### Defined in

[packages/sdk/src/services/exchange.ts:1084](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L1084)

___

### getFeeCost

▸ **getFeeCost**(`quoteCurrencyKey`, `baseCurrencyKey`, `quoteAmount`): `Promise`<`Wei`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `quoteCurrencyKey` | `string` |
| `baseCurrencyKey` | `string` |
| `quoteAmount` | `string` |

#### Returns

`Promise`<`Wei`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:568](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L568)

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

[packages/sdk/src/services/exchange.ts:194](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L194)

___

### getGasEstimateForExchange

▸ `Private` **getGasEstimateForExchange**(`txProvider`, `quoteCurrencyKey`, `baseCurrencyKey`, `quoteAmount`): `Promise`<`undefined` \| ``null`` \| { `l1Fee`: ``null`` \| `Wei` ; `limit`: `number`  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `txProvider` | `undefined` \| ``"synthetix"`` \| ``"1inch"`` \| ``"synthswap"`` |
| `quoteCurrencyKey` | `string` |
| `baseCurrencyKey` | `string` |
| `quoteAmount` | `string` |

#### Returns

`Promise`<`undefined` \| ``null`` \| { `l1Fee`: ``null`` \| `Wei` ; `limit`: `number`  }\>

#### Defined in

[packages/sdk/src/services/exchange.ts:980](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L980)

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

[packages/sdk/src/services/exchange.ts:378](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L378)

___

### getOneInchApproveAddress

▸ `Private` **getOneInchApproveAddress**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:972](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L972)

___

### getOneInchQuote

▸ **getOneInchQuote**(`baseCurrencyKey`, `quoteCurrencyKey`, `amount`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `baseCurrencyKey` | `string` |
| `quoteCurrencyKey` | `string` |
| `amount` | `string` |

#### Returns

`Promise`<`string`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:609](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L609)

___

### getOneInchQuoteSwapParams

▸ `Private` **getOneInchQuoteSwapParams**(`quoteTokenAddress`, `baseTokenAddress`, `amount`, `decimals`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `quoteTokenAddress` | `string` |
| `baseTokenAddress` | `string` |
| `amount` | `string` |
| `decimals` | `number` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `amount` | `string` |
| `fromTokenAddress` | `string` |
| `toTokenAddress` | `string` |

#### Defined in

[packages/sdk/src/services/exchange.ts:885](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L885)

___

### getOneInchSwapParams

▸ `Private` **getOneInchSwapParams**(`quoteTokenAddress`, `baseTokenAddress`, `amount`, `quoteDecimals`): `Promise`<[`OneInchSwapResponse`](../modules/types_1inch.md#oneinchswapresponse)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `quoteTokenAddress` | `string` |
| `baseTokenAddress` | `string` |
| `amount` | `string` |
| `quoteDecimals` | `number` |

#### Returns

`Promise`<[`OneInchSwapResponse`](../modules/types_1inch.md#oneinchswapresponse)\>

#### Defined in

[packages/sdk/src/services/exchange.ts:898](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L898)

___

### getOneInchTokenList

▸ **getOneInchTokenList**(): `Promise`<{ `symbols`: `string`[] ; `tokens`: { `address`: `string` ; `chainId`: ``1`` \| ``10`` ; `decimals`: `number` ; `logoURI`: `string` ; `name`: `string` ; `symbol`: `string` ; `tags`: `never`[] = [] }[] ; `tokensMap`: `Dictionary`<{ `address`: `string` ; `chainId`: ``1`` \| ``10`` ; `decimals`: `number` ; `logoURI`: `string` ; `name`: `string` ; `symbol`: `string` ; `tags`: `never`[] = [] }\>  }\>

#### Returns

`Promise`<{ `symbols`: `string`[] ; `tokens`: { `address`: `string` ; `chainId`: ``1`` \| ``10`` ; `decimals`: `number` ; `logoURI`: `string` ; `name`: `string` ; `symbol`: `string` ; `tags`: `never`[] = [] }[] ; `tokensMap`: `Dictionary`<{ `address`: `string` ; `chainId`: ``1`` \| ``10`` ; `decimals`: `number` ; `logoURI`: `string` ; `name`: `string` ; `symbol`: `string` ; `tags`: `never`[] = [] }\>  }\>

#### Defined in

[packages/sdk/src/services/exchange.ts:180](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L180)

___

### getOneInchTokens

▸ **getOneInchTokens**(): `Promise`<{ `tokenList`: [`Token`](../modules/types_tokens.md#token)[] ; `tokensMap`: `any`  }\>

#### Returns

`Promise`<{ `tokenList`: [`Token`](../modules/types_tokens.md#token)[] ; `tokensMap`: `any`  }\>

#### Defined in

[packages/sdk/src/services/exchange.ts:798](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L798)

___

### getPairRates

▸ `Private` **getPairRates**(`quoteCurrencyKey`, `baseCurrencyKey`): `Promise`<`Wei`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `quoteCurrencyKey` | `string` |
| `baseCurrencyKey` | `string` |

#### Returns

`Promise`<`Wei`[]\>

#### Defined in

[packages/sdk/src/services/exchange.ts:959](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L959)

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

[packages/sdk/src/services/exchange.ts:658](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L658)

___

### getQuoteCurrencyContract

▸ `Private` **getQuoteCurrencyContract**(`quoteCurrencyKey`): ``null`` \| `Contract`

#### Parameters

| Name | Type |
| :------ | :------ |
| `quoteCurrencyKey` | `string` |

#### Returns

``null`` \| `Contract`

#### Defined in

[packages/sdk/src/services/exchange.ts:872](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L872)

___

### getRate

▸ **getRate**(`baseCurrencyKey`, `quoteCurrencyKey`): `Promise`<`Wei`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `baseCurrencyKey` | `string` |
| `quoteCurrencyKey` | `string` |

#### Returns

`Promise`<`Wei`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:160](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L160)

___

### getRedeemableDeprecatedSynths

▸ **getRedeemableDeprecatedSynths**(): `Promise`<{ `balances`: [`DeprecatedSynthBalance`](../modules/types_synths.md#deprecatedsynthbalance)[] = cryptoBalances; `totalUSDBalance`: `Wei`  }\>

#### Returns

`Promise`<{ `balances`: [`DeprecatedSynthBalance`](../modules/types_synths.md#deprecatedsynthbalance)[] = cryptoBalances; `totalUSDBalance`: `Wei`  }\>

#### Defined in

[packages/sdk/src/services/exchange.ts:681](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L681)

___

### getSlippagePercent

▸ **getSlippagePercent**(`quoteCurrencyKey`, `baseCurrencyKey`, `quoteAmountWei`, `baseAmountWei`): `Promise`<`undefined` \| `Wei`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `quoteCurrencyKey` | `string` |
| `baseCurrencyKey` | `string` |
| `quoteAmountWei` | `Wei` |
| `baseAmountWei` | `Wei` |

#### Returns

`Promise`<`undefined` \| `Wei`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:102](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L102)

___

### getSynthSuspensions

▸ **getSynthSuspensions**(): `Promise`<`Record`<`string`, { `isSuspended`: `boolean` ; `reason`: ``null`` \| [`SynthSuspensionReason`](../modules/types_futures.md#synthsuspensionreason) ; `reasonCode`: `number`  }\>\>

#### Returns

`Promise`<`Record`<`string`, { `isSuspended`: `boolean` ; `reason`: ``null`` \| [`SynthSuspensionReason`](../modules/types_futures.md#synthsuspensionreason) ; `reasonCode`: `number`  }\>\>

#### Defined in

[packages/sdk/src/services/exchange.ts:808](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L808)

___

### getSynthsMap

▸ **getSynthsMap**(): `Partial`<`Record`<`SynthSymbol`, `SynthToken`\>\>

#### Returns

`Partial`<`Record`<`SynthSymbol`, `SynthToken`\>\>

#### Defined in

[packages/sdk/src/services/exchange.ts:790](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L790)

___

### getTokenAddress

▸ `Private` **getTokenAddress**(`currencyKey`, `coingecko?`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `currencyKey` | `string` |
| `coingecko?` | `boolean` |

#### Returns

`any`

#### Defined in

[packages/sdk/src/services/exchange.ts:1045](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L1045)

___

### getTokenBalances

▸ **getTokenBalances**(`walletAddress`): `Promise`<[`TokenBalances`](../modules/types_tokens.md#tokenbalances)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `walletAddress` | `string` |

#### Returns

`Promise`<[`TokenBalances`](../modules/types_tokens.md#tokenbalances)\>

#### Defined in

[packages/sdk/src/services/exchange.ts:1102](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L1102)

___

### getTokenDecimals

▸ `Private` **getTokenDecimals**(`currencyKey`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `currencyKey` | `string` |

#### Returns

`any`

#### Defined in

[packages/sdk/src/services/exchange.ts:868](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L868)

___

### getTradePrices

▸ **getTradePrices**(`txProvider`, `quoteCurrencyKey`, `baseCurrencyKey`, `quoteAmountWei`, `baseAmountWei`): `Promise`<{ `baseTradePrice`: `Wei` ; `quoteTradePrice`: `Wei`  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `txProvider` | `undefined` \| ``"synthetix"`` \| ``"1inch"`` \| ``"synthswap"`` |
| `quoteCurrencyKey` | `string` |
| `baseCurrencyKey` | `string` |
| `quoteAmountWei` | `Wei` |
| `baseAmountWei` | `Wei` |

#### Returns

`Promise`<{ `baseTradePrice`: `Wei` ; `quoteTradePrice`: `Wei`  }\>

#### Defined in

[packages/sdk/src/services/exchange.ts:76](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L76)

___

### getTransactionFee

▸ **getTransactionFee**(`quoteCurrencyKey`, `baseCurrencyKey`, `quoteAmount`, `baseAmount`): `Promise`<``null`` \| `Wei`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `quoteCurrencyKey` | `string` |
| `baseCurrencyKey` | `string` |
| `quoteAmount` | `string` |
| `baseAmount` | `string` |

#### Returns

`Promise`<``null`` \| `Wei`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:503](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L503)

___

### getTxProvider

▸ **getTxProvider**(`baseCurrencyKey`, `quoteCurrencyKey`): `undefined` \| ``"synthetix"`` \| ``"1inch"`` \| ``"synthswap"``

#### Parameters

| Name | Type |
| :------ | :------ |
| `baseCurrencyKey` | `string` |
| `quoteCurrencyKey` | `string` |

#### Returns

`undefined` \| ``"synthetix"`` \| ``"1inch"`` \| ``"synthswap"``

#### Defined in

[packages/sdk/src/services/exchange.ts:64](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L64)

___

### getWalletTrades

▸ **getWalletTrades**(): `Promise`<[`SynthExchange`](../modules/types_exchange.md#synthexchange)[]\>

#### Returns

`Promise`<[`SynthExchange`](../modules/types_exchange.md#synthexchange)[]\>

#### Defined in

[packages/sdk/src/services/exchange.ts:854](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L854)

___

### handleExchange

▸ **handleExchange**(`quoteCurrencyKey`, `baseCurrencyKey`, `quoteAmount`, `baseAmount`): `Promise`<`undefined` \| `string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `quoteCurrencyKey` | `string` |
| `baseCurrencyKey` | `string` |
| `quoteAmount` | `string` |
| `baseAmount` | `string` |

#### Returns

`Promise`<`undefined` \| `string`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:446](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L446)

___

### handleSettle

▸ **handleSettle**(`baseCurrencyKey`): `Promise`<`undefined` \| `string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `baseCurrencyKey` | `string` |

#### Returns

`Promise`<`undefined` \| `string`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:423](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L423)

___

### isCurrencyETH

▸ `Private` **isCurrencyETH**(`currencyKey`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `currencyKey` | `string` |

#### Returns

`boolean`

#### Defined in

[packages/sdk/src/services/exchange.ts:1041](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L1041)

___

### quoteOneInch

▸ `Private` **quoteOneInch**(`quoteTokenAddress`, `baseTokenAddress`, `amount`, `decimals`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `quoteTokenAddress` | `string` |
| `baseTokenAddress` | `string` |
| `amount` | `string` |
| `decimals` | `number` |

#### Returns

`Promise`<`string`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:927](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L927)

___

### swapOneInch

▸ **swapOneInch**(`quoteTokenAddress`, `baseTokenAddress`, `amount`, `quoteDecimals`): `Promise`<`TransactionResponse`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `quoteTokenAddress` | `string` |
| `baseTokenAddress` | `string` |
| `amount` | `string` |
| `quoteDecimals` | `number` |

#### Returns

`Promise`<`TransactionResponse`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:344](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L344)

___

### swapOneInchGasEstimate

▸ **swapOneInchGasEstimate**(`quoteTokenAddress`, `baseTokenAddress`, `amount`, `quoteDecimals`): `Promise`<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `quoteTokenAddress` | `string` |
| `baseTokenAddress` | `string` |
| `amount` | `string` |
| `quoteDecimals` | `number` |

#### Returns

`Promise`<`number`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:362](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L362)

___

### swapOneInchMeta

▸ **swapOneInchMeta**(`quoteTokenAddress`, `baseTokenAddress`, `amount`, `quoteDecimals`): `Promise`<`TransactionRequest`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `quoteTokenAddress` | `string` |
| `baseTokenAddress` | `string` |
| `amount` | `string` |
| `quoteDecimals` | `number` |

#### Returns

`Promise`<`TransactionRequest`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:321](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L321)

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

[packages/sdk/src/services/exchange.ts:208](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L208)

___

### swapSynthSwapGasEstimate

▸ `Private` **swapSynthSwapGasEstimate**(`fromToken`, `toToken`, `fromAmount`): `Promise`<`BigNumber` \| `TransactionResponse` \| `PopulatedTransaction`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `fromToken` | [`Token`](../modules/types_tokens.md#token) |
| `toToken` | [`Token`](../modules/types_tokens.md#token) |
| `fromAmount` | `string` |

#### Returns

`Promise`<`BigNumber` \| `TransactionResponse` \| `PopulatedTransaction`\>

#### Defined in

[packages/sdk/src/services/exchange.ts:955](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L955)

___

### validCurrencyKeys

▸ **validCurrencyKeys**(`quoteCurrencyKey?`, `baseCurrencyKey?`): `boolean`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `quoteCurrencyKey?` | `string` |
| `baseCurrencyKey?` | `string` |

#### Returns

`boolean`[]

#### Defined in

[packages/sdk/src/services/exchange.ts:727](https://github.com/Kwenta/kwenta/blob/935f91508/packages/sdk/src/services/exchange.ts#L727)
