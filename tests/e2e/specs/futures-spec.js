import FuturesPage from '../pages/markets/futures-page';

const futures = new FuturesPage();

describe('Deposite 100 sUSD', () => {
	context('Connect metamask wallet', () => {
		it(`should login with success`, () => {
			futures.disconnectMetamaskWalletFromAllDapps();
			futures.visit();
			futures.connectBrowserWallet();
			futures.acceptMetamaskAccessRequest();
			futures.getDepositeBtn().click();
			futures.enterMarginOf100sUSD();
			futures.getDepositeMarginBtn().click();
			futures.confirmMetamaskTransaction();
			cy.findByText('Total Margin')
				.first()
				.invoke('val')
				.then((value) => {
					expect(value).to.equal(0);
				});
		});
	});
});
