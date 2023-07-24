[@kwenta/sdk](../README.md) / [Modules](../modules.md) / types/1inch

# Module: types/1inch

## Table of contents

### Type Aliases

- [OneInchApproveSpenderResponse](types_1inch.md#oneinchapprovespenderresponse)
- [OneInchQuoteResponse](types_1inch.md#oneinchquoteresponse)
- [OneInchSwapResponse](types_1inch.md#oneinchswapresponse)
- [OneInchTokenListResponse](types_1inch.md#oneinchtokenlistresponse)

## Type Aliases

### OneInchApproveSpenderResponse

Ƭ **OneInchApproveSpenderResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `address` | `string` |

#### Defined in

[packages/sdk/src/types/1inch.ts:27](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/types/1inch.ts#L27)

___

### OneInchQuoteResponse

Ƭ **OneInchQuoteResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `fromToken` | `Token` |
| `fromTokenAmount` | `string` |
| `toToken` | `Token` |
| `toTokenAmount` | `string` |

#### Defined in

[packages/sdk/src/types/1inch.ts:9](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/types/1inch.ts#L9)

___

### OneInchSwapResponse

Ƭ **OneInchSwapResponse**: [`OneInchQuoteResponse`](types_1inch.md#oneinchquoteresponse) & { `tx`: { `data`: `string` ; `from`: `string` ; `gas`: `number` ; `gasPrice`: `string` ; `to`: `string` ; `value`: `string`  }  }

#### Defined in

[packages/sdk/src/types/1inch.ts:16](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/types/1inch.ts#L16)

___

### OneInchTokenListResponse

Ƭ **OneInchTokenListResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `tokens` | `Record`<`string`, `Token`\> |

#### Defined in

[packages/sdk/src/types/1inch.ts:31](https://github.com/Kwenta/kwenta/blob/84039a5ef/packages/sdk/src/types/1inch.ts#L31)
