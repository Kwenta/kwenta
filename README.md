![CodeQL](https://github.com/kwenta/kwenta/workflows/CodeQL/badge.svg?branch=perps-v2) [![Discord](https://img.shields.io/discord/413890591840272394.svg?color=768AD4&label=discord&logo=https%3A%2F%2Fdiscordapp.com%2Fassets%2F8c9701b98ad4372b58f13fd9f65f966e.svg)](https://discordapp.com/channels/413890591840272394/)
[![Twitter Follow](https://img.shields.io/twitter/follow/kwenta_io.svg?label=kwenta_io&style=social)](https://twitter.com/kwenta_io)
[![GitPOAP Badge](https://public-api.gitpoap.io/v1/repo/Kwenta/kwenta/badge)](https://www.gitpoap.io/gh/Kwenta/kwenta)

# Kwenta

A dApp enabling derivatives trading — powered by the Synthetix protocol.

The decentralized trading UI is available at [kwenta.eth.limo](https://kwenta.eth.limo).

ENS link: [kwenta.eth](https://app.ens.domains/name/kwenta.eth).

The latest IPFS hash can be found under [releases](https://github.com/Kwenta/kwenta/releases).

## Contributing

Kwenta welcomes contributors. Regardless of the time you have available, everyone can provide meaningful contributions to the project by submitting bug reports, feature requests or even the smallest of fixes! To submit your contribution, please fork, fix, commit and create a pull-request describing your work in detail. For more details, please have a look at the [Contribution guidelines](CONTRIBUTING.md).

## Tech stack

- Next.js
- React
- Redux
- Kwenta SDK
- Styled-Components

## Ethereum stack

- [ethers.js v5](https://github.com/ethers-io/ethers.js) - Ethereum wallet implementation.
- [Rainbowkit](https://github.com/rainbow-me/rainbowkit) - for ethereum wallet onboarding.

## Development

- [Contributing to the Kwenta frontend](https://docs.kwenta.io/developers/contributing-to-the-kwenta-frontend) - Kwenta Code Style Guidelines
- [The devDAO](https://docs.kwenta.io/developers/devdao-contribute) - How to contribute

### Install dependencies

```bash
pnpm install
```

### Set up environment variables

Copy the `.env.local.example` file in the `packages/app` directory to `.env.local` (which will be ignored by Git):

```bash
cd packages/app
cp .env.local.example .env.local
```

Then, open `.env.local` and add the missing environment variables:

Required:

- `NEXT_PUBLIC_PROVIDER_ID` - Specifies the default provider, options are `INFURA` or `BLAST_API`
- `NEXT_PUBLIC_INFURA_PROJECT_ID` - Infura project id (get it from [infura.io](https://infura.io/)) or
- `NEXT_PUBLIC_BLASTAPI_PROJECT_ID` - Blast API project id (get it from [blastapi.io](https://blastapi.io/))
- `NEXT_PUBLIC_SOCKET_API_KEY` - Socket API key (get it from [socket.tech](https://docs.socket.tech/socket-api/v2#api-key)
- `NEXT_PUBLIC_SATSUMA_API_KEY` - API key for Satsuma subgraph queries
- `NEXT_PUBLIC_THEGRAPH_API_KEY` - API key for The Graph's decentralized service
- `NEXT_PUBLIC_DEFAULT_PRICE_SERVICE` - Specifies the default price server, options are `KWENTA` or `PYTH`

### Run

```bash
cd packages/app
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Build

```bash
cd packages/app
pnpm build
pnpm start
```

### Unit Testing

```bash
cd packages/app
pnpm test:unit
```

For unit tests we use a combination of Jest and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

Page tests should be added to the \_\_tests\_\_ folder at the root as it is not possible to co-locate tests and pages in nextjs. Other tests should be co-located in a \_\_tests\_\_ folder next to their related file.

### End-2-End testing

In order to run fully automated end-2-end (e2e) tests Kwenta uses [Synpress](https://github.com/Synthetixio/synpress) (a wrapper around [Cypress](https://www.cypress.io/)).

#### Constraints

The current e2e tests are written to be run on Optimistic Kovan using Chrome as the browser.

#### Setup

- Download and install Google Chrome
- Setup a test wallet on Optimistic Kovan and fund it with plenty of ETH (to pay for gas) and sUSD
- Prior to running the tests you must set the environment variables below in the shell from which npm is started. Unfortunately, at this time other methods to set said environment variables (eg. through `.env.local`) don't work in conjunction with Synpress.

```bash
PRIVATE_KEY=<INSERTPRIVATEKEY>
NETWORK_NAME=OptimisticKovan
RPC_URL=https://kovan.optimism.io
CHAIN_ID=69
BLOCK_EXPLORER=https://kovan-optimistic.etherscan.io
IS_TESTNET=true
```

##### Bash convenience script for setting up the environment

A Bash convenience script [has been made available here](https://gist.github.com/raffiegang/b24a6b97bcd054645abf59be852bc88d).

- Open bash
- Copy the private key of the test wallet into the file `SYNPRESS_PRIVATEKEY` into the same folder location as the script. While using this method, please don't forget to update your .gitignore file to prevent your private key to be leaked.
- Run the following command `source ./synpress-envsetter.sh`

#### Run the tests

```bash
npm run build
npm start
npm run test:e2e:only:tests
```

## Contact

Join the community on the [Kwenta Discord server](https://discord.gg/kwentaio)!
