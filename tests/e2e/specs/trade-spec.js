import ExchangePage from '../pages/exchange/exchange-page';

const exchange = new ExchangePage();

describe('Trades tests', () => {
	context('Trade sUSD => sETH', () => {
		before(() => {
			exchange.visit('sETH-sUSD');
			exchange.connectMetamaskWallet();
			exchange.acceptMetamaskAccessRequest();
			exchange.waitUntilLoggedIn();
		});
		it(`should exchange with success`, () => {
			exchange.getCurrencyAmount().type('1');
			exchange.getSubmitOrderBtn().click();
			exchange.confirmMetamaskTransaction();
			exchange.waitForTransactionSuccess();
			exchange.getTransactionUrl().then((url) => {
				exchange.waitUntilAvailableOnEtherscan(url, 'etherscan');
				cy.get('@etherscan').should((response) => {
					expect(response.body).to.include('</i>Success</span>');
					// blocker: need slippage explanations
					// todo: verify gas amount in metamask and etherscan, etherscan asset sent, fee and received asset value
				});
			});
		});
	});
});
