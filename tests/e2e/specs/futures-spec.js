import FuturesPage from '../pages/markets/futures-page';

const futures = new FuturesPage();

describe('Trade panel', () => {
	before(() => {
		futures.disconnectMetamaskWalletFromAllDapps();
		futures.importMetamaskAccount();
		futures.visit();
		futures.connectBrowserWallet();
		futures.acceptMetamaskAccessRequest();
	});

	it('should show correct total margin after depositing', () => {
		cy.findByTestId('market-info-box-0')
			.invoke('text')
			.then((totalMarginText) => {
				const originalTotalMargin = parseFloat(totalMarginText.split(' sUSD')[0]);
				const depositeValue = 100;
				// Deposite 100 sUSD
				futures.getDepositeBtn().click();
				futures.enterDepositeMarginInsUSD(depositeValue);
				futures.getDepositeMarginBtn().click();
				futures.confirmMetamaskTransaction();

				const expectTotalMargin = originalTotalMargin + depositeValue;
				cy.findByTestId('market-info-box-0').should(
					'have.text',
					`${expectTotalMargin.toFixed(2)} sUSD`
				);
			});
	});

	it('should show correct total margin after withdrawing', () => {
		cy.findByTestId('market-info-box-0')
			.invoke('text')
			.then((totalMarginText) => {
				const originalTotalMargin = parseFloat(totalMarginText.split(' sUSD')[0]);
				const withdrawValue = 90;
				// Withdraw 90 sUSD
				futures.getWithdrawBtn().click();
				futures.enterWithdrawMarginInsUSD(withdrawValue);
				futures.getWithdrawMarginBtn().click();
				futures.confirmMetamaskTransaction();

				const expectTotalMargin = originalTotalMargin - withdrawValue;
				cy.findByTestId('market-info-box-0').should(
					'have.text',
					`${expectTotalMargin.toFixed(2)} sUSD`
				);
			});
	});
});
