# End-2-End testing guidance

In order to run fully automated end-2-end (e2e) tests Kwenta uses [Synpress](https://github.com/Synthetixio/synpress) (a wrapper around [Cynpress](https://www.cypress.io/)).  

## Constraints 
The current e2e tests are written to be run on Optimistic Kovan using Chrome as the browser.

## Setup
- Download and install Google Chrome 
- Setup a testing wallet on Optimistic Kovan and fund it with plenty of ETH (to pay for gas) and sUSD 
- Copy the private key of the wallet into the file `TEST-PRIVATEKEY` into the folder `kwenta/kwenta/tests/e2e`
- Before proceeding to the next step you need to setup environment variables. Navigate to the folder `kwenta/kwenta/tests/e2e` and run the following command `source ./RUN-WITH-SOURCE-synpress-env-KovanOE.sh`

## Run the tests

```bash
npm run build
npm start
npm run test:e2e:only:tests
```