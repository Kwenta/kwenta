import ExchangePage from '../pages/exchange/exchange-page';

const exchange = new ExchangePage();
const testedAsset = 'sETH';

/*
 * This end-to-end test illustrates the happy flow of swapping synths through the Kwenta exchange on Optimistic Kovan
 * 1 sUSD is swapped
 * This e2e test works with Chrome on Optimistic Kovan
 */

describe('Trade 1 sUSD for sETH on Optimism', () => {
	context(`Trade sUSD => ${testedAsset}`, () => {
		before(() => {
			// this line is necessary to make sure we have a clean slate and empty a cached connection by a previous test spec
			cy.disconnectMetamaskWalletFromAllDapps();

			exchange.visit(`${testedAsset}-sUSD`);
			exchange.connectBrowserWallet();
			exchange.acceptMetamaskAccessRequest();

			// we must be logged in now ; added statement we need a wallet address available
			cy.findByTestId('wallet-btn').should(`contain.text`, '0x');
		});
		it(`should exchange with success`, () => {
			// enters a value of 1 sUSD
			exchange.getCurrencyAmount().type('1');
			exchange.getSubmitOrderBtn().click();
			exchange.confirmMetamaskTransaction();
			exchange.waitForTransactionSuccess();
		});
	});
});
