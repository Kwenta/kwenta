import { formatNumber } from '@kwenta/sdk/utils';
import FuturesPage from '../pages/markets/futures-page';

const futures = new FuturesPage();

describe('Futures Page', () => {
	describe('Trade Panel', () => {
		before(() => {
			futures.disconnectMetamaskWalletFromAllDapps();
			futures.visit();
			futures.connectBrowserWallet();
			futures.acceptMetamaskAccessRequest();
		});

		it('should deposit, open long postiion, close long position and withdraw sUSD in ETH-PERP market', () => {
			cy.findByTestId('market-info-box-0').then(() => {
				// Need to give it some time for the page to populate with users account data
				cy.wait(5000).then(() => {
					cy.findByTestId('market-info-box-0')
						.invoke('text')
						.then((totalMarginText) => {
							const depositValue = 100;
							// Deposit 100 sUSD
							futures.getDepositBtn().click();

							const originalTotalMargin = parseFloat(
								totalMarginText.split(' sUSD')[0].slice('1').replace(',', '')
							);

							futures.enterDepositMarginInsUSD(depositValue);
							futures.getDepositMarginBtn().click();
							futures.confirmMetamaskTransaction();

							const expectTotalMargin = originalTotalMargin + depositValue;
							cy.findByTestId('market-info-box-0').should(
								'have.text',
								`$${formatNumber(expectTotalMargin.toFixed(2))} sUSD`
							);

							futures.openPositionBtnShouldBeDisabled();
							futures.closePositionBtnShouldBeDisabled();
							const amountInsUSD = 50;
							// Use 50 sUSD for Opening Long Position
							futures.getLongBtn().click();
							futures.enterAmountInsUSD(amountInsUSD);

							futures.OpenPostiionBtnShouldBeEnabled();
							futures.closePositionBtnShouldBeDisabled();
							cy.findByTestId('leverage-input')
								.invoke('val')
								.then((leverageInput) => {
									futures.getOpenPositionBtn().click();
									futures.getOpenPositionConfirmOrderBtn().click();
									futures.confirmMetamaskTransaction();
									futures.getPositionCardLeverageValue().should('have.text', `${leverageInput}x`);
									futures.getPositionCardSideValue().should('have.text', 'long');
								});

							//Close Position
							futures.closePositionBtnShouldBeEnabled();
							futures.getClosePositionBtn().click();
							futures.getClosePositionConfirmOrderBtn().click();
							futures.confirmMetamaskTransaction();
							futures.openPositionBtnShouldBeDisabled();
							futures.closePositionBtnShouldBeDisabled();

							//Withdraw all the sUSD
							futures.getWithdrawBtn().click();
							futures.getWithdrawMarginMaxBtn().click();
							futures.getWithdrawMarginBtn().click();
							futures.confirmMetamaskTransaction();
							cy.findByTestId('market-info-box-0').should('have.text', `$0.00 sUSD`);
						});
				});
			});
		});
	});
});
