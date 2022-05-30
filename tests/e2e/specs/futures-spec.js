import FuturesPage from '../pages/markets/futures-page';

const futures = new FuturesPage();

describe('Trade panel', () => {
	context('Deposite', () => {
		it('should show correct total margin after depositing', () => {
			futures.disconnectMetamaskWalletFromAllDapps();
			futures.importMetamaskAccount();
			futures.visit();
			futures.connectBrowserWallet();
			futures.acceptMetamaskAccessRequest();

			cy.findByTestId('market-info-box-0')
				.invoke('text')
				.then((totalMarginText) => {
					const originalTotalMargin = parseFloat(totalMarginText.split(' sUSD')[0]);
					const depositeValue = 100;
					// Deposite 100 sUSD
					futures.getDepositeBtn().click();
					futures.enterMarginInsUSD(depositeValue);
					futures.getDepositeMarginBtn().click();
					futures.confirmMetamaskTransaction();

					const expectTotalMargin = originalTotalMargin + depositeValue;
					cy.findByTestId('market-info-box-0').should(
						'have.text',
						`${expectTotalMargin.toFixed(2)} sUSD`
					);
				});
		});
	});
});
