import FuturesPage from '../pages/markets/futures-page';

const futures = new FuturesPage();

describe('Trade panel', () => {
	before(() => {
		futures.disconnectMetamaskWalletFromAllDapps();
		//	futures.importMetamaskAccount();
		futures.visit();
		futures.connectBrowserWallet();
		futures.acceptMetamaskAccessRequest();
	});

	it('should show correct total margin after depositing', () => {
		cy.findByTestId('market-info-box-0')
			.invoke('text')
			.then((totalMarginText) => {
				const originalTotalMargin = parseFloat(totalMarginText.split(' sUSD')[0]);
				const depositValue = 100;
				// Deposit 100 sUSD
				futures.getDepositBtn().click();
				futures.enterDepositMarginInsUSD(depositValue);
				futures.getDepositMarginBtn().click();
				futures.confirmMetamaskTransaction();

				const expectTotalMargin = originalTotalMargin + depositValue;
				cy.findByTestId('market-info-box-0').should(
					'have.text',
					`${expectTotalMargin.toFixed(2)} sUSD`
				);
			});
	});

	it('should show correct value in position card after open postion', () => {
		const amountInsUSD = 50;
		futures.getLongBtn().click();
		futures.enterAmountInsUSD(amountInsUSD);

		cy.findByTestId('leverage-input-1x')
			.invoke('value')
			.then((leverageValue) => {
				const defaultLeverage = parseFloat(leverageValue);
				console.log('value' + defaultLeverage);

				cy.findByTestId('leverage-input-1x').should('have.value', '0.50');

				//futures.getOpenPositionBtn().click();
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
