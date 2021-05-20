![Kwenta CI](https://github.com/Synthetixio/kwenta/workflows/Kwenta%20CI/badge.svg?branch=master) [![kwenta](https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/simple/camtjp/master&style=flat)](https://dashboard.cypress.io/projects/camtjp/runs) [![Discord](https://img.shields.io/discord/413890591840272394.svg?color=768AD4&label=discord&logo=https%3A%2F%2Fdiscordapp.com%2Fassets%2F8c9701b98ad4372b58f13fd9f65f966e.svg)](https://discordapp.com/channels/413890591840272394/)
[![Twitter Follow](https://img.shields.io/twitter/follow/kwenta_io.svg?label=kwenta_io&style=social)](https://twitter.com/kwenta_io)

# Kwenta

A dApp enabling derivatives trading with infinite liquidity — powered by the Synthetix protocol.

The trading UI is available on IPFS [kwenta.eth.link](https://kwenta.eth.link) and [kwenta.io](https://kwenta.io).<br />
ENS link: [kwenta.eth](https://app.ens.domains/name/kwenta.eth).

## Tech stack

- Next.js
- React
- React Query
- Recoil
- Unstated-next
- Styled-Components
- Immer

## Ethereum stack

- ethers.js v5 - Ethereum wallet implementation.
- Blocknative Onboard - for ethereum wallet connectivity.
- [@synthetixio/contracts-interface](https://github.com/Synthetixio/js-monorepo) - for interactions with the Synthetix protocol.
- [@synthetixio/data](https://github.com/Synthetixio/js-monorepo/tree/master/packages/data) - for historical data (powered by [TheGraph](https://thegraph.com/))

## Development

### Install dependencies

```bash
npm i
```

### Set up environment variables

Copy the `.env.local.example` file in this directory to `.env.local` (which will be ignored by Git):

```bash
cp .env.local.example .env.local
```

Then, open `.env.local` and add the missing environment variables:

- `NEXT_PUBLIC_PORTIS_APP_ID` - Portis app id (get it from [portis.io](https://www.portis.io/))
- `NEXT_PUBLIC_BN_ONBOARD_API_KEY` - Blocknative Onboard API key (get it from [blocknative.com](https://blocknative.com/))
- `NEXT_PUBLIC_INFURA_PROJECT_ID` - Infura project id (get it from [infura.io](https://infura.io/))

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Build

```bash
npm run build
npm start
```
