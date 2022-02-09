![Kwenta CI](https://github.com/Synthetixio/kwenta/workflows/Kwenta%20CI/badge.svg?branch=master) [![Discord](https://img.shields.io/discord/413890591840272394.svg?color=768AD4&label=discord&logo=https%3A%2F%2Fdiscordapp.com%2Fassets%2F8c9701b98ad4372b58f13fd9f65f966e.svg)](https://discordapp.com/channels/413890591840272394/)
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

### End-2-End testing
In order to run fully automated end-2-end (e2e) tests Kwenta uses [Synpress](https://github.com/Synthetixio/synpress) (a wrapper around [Cynpress](https://www.cypress.io/)).  

#### Constraints 
The current e2e tests are written to be run on Optimistic Kovan using Chrome as the browser.

#### Setup
- Download and install Google Chrome 
- Setup a testing wallet on Optimistic Kovan and fund it with plenty of ETH (to pay for gas) and sUSD 
- Copy the private key of the wallet into the file `SYNPRESS_PRIVATEKEY` into the folder `kwenta/kwenta/tests/e2e`
- Before proceeding to the next step you need to setup environment variables. Navigate to the folder `kwenta/kwenta/tests/e2e` and run the following command `source ./RUN-WITH-SOURCE-synpress-env-KovanOE.sh`

#### Run the tests

```bash
npm run build
npm start
npm run test:e2e:only:tests
```

## Contributing

Kwenta welcomes contributors. Regardless of the time you have available, everyone can provide meaningful contributions to the project by submitting bug reports, feature requests or even the smallest of fixes! To submit your contribution, please fork, fix, commit and create a pull-request describing your work in detail. For more details, please have a look at the [Contribution guidelines](CONTRIBUTING.md).

## Contact

Join the community on the [Kwenta Discord server](https://discord.gg/HUPyQ63TFF)!
