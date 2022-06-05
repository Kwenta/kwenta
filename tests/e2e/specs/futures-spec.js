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
		cy.get('[data-testid = "trade-open-position-button"]').should('be.disabled');
		cy.get('[data-testid = "trade-close-position-button"]').should('be.disabled');
		const amountInsUSD = 50;
		futures.getLongBtn().click();
		futures.enterAmountInsUSD(amountInsUSD);

		cy.get('[data-testid = "trade-open-position-button"]').should('not.be.disabled');
		cy.get('[data-testid = "trade-close-position-button"]').should('be.disabled');
		cy.findByTestId('leverage-input-1x')
			.invoke('val')
			.then((leverageInput) => {
				//expect(leverageInput).to.eq('0.50');

				futures.getOpenPositionBtn().click();
				futures.getOpenPositionConfirmOrderBtn().click();
				futures.confirmMetamaskTransaction();

				futures
					.getPositionCardLeverageValue()
					.invoke('text')
					.then((leverageValue) => {
						expect(leverageValue).to.eq(`${leverageInput}x`);
					});
				futures
					.getPositionCardSideValue()
					.invoke('text')
					.then((sideValue) => {
						expect(sideValue).to.eq(`long`);
					});
			});

		cy.get('[data-testid = "trade-close-position-button"]').should('not.be.disabled');
		futures.getClosePositionBtn().click();
		futures.getClosePositionConfirmOrderBtn().click();
		futures.confirmMetamaskTransaction();
		cy.get('[data-testid = "trade-open-position-button"]').should('be.disabled');
		cy.get('[data-testid = "trade-close-position-button"]').should('be.disabled');

		futures.getWithdrawBtn().click();
		futures.getWithdrawMarginMaxBtn().click();
		futures.getWithdrawMarginBtn().click();
		futures.confirmMetamaskTransaction();

		cy.findByTestId('market-info-box-0')
			.invoke('text')
			.then((totalMargint) => {
				expect(totalMargint).to.eq('0.00 sUSD');
			});
	});
});
