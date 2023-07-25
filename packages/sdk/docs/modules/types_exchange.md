[@kwenta/sdk](../README.md) / [Modules](../modules.md) / types/exchange

# Module: types/exchange

## Table of contents

### Type Aliases

- [PriceResponse](types_exchange.md#priceresponse)
- [Rates](types_exchange.md#rates)
- [SynthExchange](types_exchange.md#synthexchange)

## Type Aliases

### PriceResponse

Ƭ **PriceResponse**: `Record`<`string`, { `usd`: `number` ; `usd_24h_change`: `number`  }\>

#### Defined in

[packages/sdk/src/types/exchange.ts:4](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/types/exchange.ts#L4)

___

### Rates

Ƭ **Rates**: `Record`<`string`, `Wei`\>

#### Defined in

[packages/sdk/src/types/exchange.ts:6](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/types/exchange.ts#L6)

___

### SynthExchange

Ƭ **SynthExchange**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `feesInUSD` | `string` |
| `fromAmount` | `string` |
| `fromAmountInUSD` | `string` |
| `fromSynth` | { `id`: `string` ; `name`: `string` ; `symbol`: `SynthSymbol`  } |
| `fromSynth.id` | `string` |
| `fromSynth.name` | `string` |
| `fromSynth.symbol` | `SynthSymbol` |
| `gasPrice` | `string` |
| `id` | `string` |
| `timestamp` | `string` |
| `toAddress` | `string` |
| `toAmount` | `string` |
| `toAmountInUSD` | `string` |
| `toSynth` | { `id`: `string` ; `name`: `string` ; `symbol`: `SynthSymbol`  } |
| `toSynth.id` | `string` |
| `toSynth.name` | `string` |
| `toSynth.symbol` | `SynthSymbol` |

#### Defined in

[packages/sdk/src/types/exchange.ts:8](https://github.com/Kwenta/kwenta/blob/616d9e548/packages/sdk/src/types/exchange.ts#L8)
