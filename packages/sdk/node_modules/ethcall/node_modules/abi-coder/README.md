# ABI Coder

A set of high-level ABI encoding and decoding utils.

## Motivation

There are several packages that provide ABI coding utils. However, there is no a high-level solution in the Ethers ecosystem. `web3-eth-abi` and `abi-decoder` depend on web3.js. `@ethersproject/abi` is pretty low-level. `ethereumjs-abi` works only with functions. Many other packages provide encoding or decoding only.

## Features

- Function coding
- Event coding
- Constructor coding
- TS support

## Installation

`npm install abi-coder`

> This package requires ethers V6. If you use ethers V5, you need to install abi-coder V4.

> This package is a pure ESM package. Follow [this guide](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c) for more info.

## Example

```ts
import { Coder } from 'abi-coder';

import * as erc20Abi from './abi/erc20.json';

const erc20Coder = new Coder(erc20Abi);

erc20Coder.getFunctionSelector('totalSupply');
// 0x18160ddd

erc20Coder.decodeEvent(
  [
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    '0x000000000000000000000000b5cfcb4d4745cbbd252945856e1b6eaadcf2fc4e',
    '0x000000000000000000000000694c6aea9444876d4fa9375fc9089c370f8e9eda',
  ],
  '0x0000000000000000000000000000000000000000000000370c9b5ef669c35300',
);
/*
{
	name: 'Transfer',
	inputs: [...],
	values: [
		'0xb5CFcb4D4745cBBD252945856E1B6eaadCf2fC4E',
		'0x694c6aea9444876d4fA9375fC9089C370F8E9edA',
		BigNumber('1015479348216300000000'),
	],
}
*/

erc20Coder.encodeFunction({
  name: 'transfer',
  inputs: [
    {
      name: 'from',
      type: 'address',
    },
    {
      name: 'amount',
      type: 'uint256',
    },
  ],
  values: [
    '0x694c6aea9444876d4fA9375fC9089C370F8E9edA',
    '1015479348216300000000',
  ],
});
// '0xa9059cbb000000000000000000000000694c6aea9444876d4fa9375fc9089c370f8e9eda0000000000000000000000000000000000000000000000370c9b5ef669c35300'
```

## API

- Coder(abi)
  - utils
    - getFunctionSelector(name: string): string
    - getEventTopic(name: string): string
  - decoding
    - decodeConstructor(data: string): Constructor
    - decodeEvent(topics: string[], data: string): Event
    - decodeFunction(data: string): FunctionData
    - decodeFunctionOutput(name: string, data: string): FunctionOutputData
  - encoding
    - encodeConstructor(constructorData: Constructor): string
    - encodeEvent(eventData: Event): EventEncoding
    - encodeFunction(functionData: FunctionData): string
    - encodeFunctionOutput(functionData: FunctionOutputData): string
