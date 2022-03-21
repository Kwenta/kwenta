/* eslint-disable ui-testing/no-hard-wait */
/* eslint-disable cypress/no-unnecessary-waiting */
import Page from '../page';
import Header from './header';
import Notifications from './notifications';
import Onboard from './onboard';

export default class ShortingPage extends Page {
	constructor() {
		super();
		this.header = new Header();
		this.onboard = new Onboard();
		this.notifications = new Notifications();
	}

	getCurrencyAmount() {
		return cy.findByTestId('left-side').findByTestId('currency-amount');
	}

	getSubmitOrderBtn() {
		return cy.findByTestId('submit-order');
	}

	visit() {
		cy.visit('/shorting');
	}

	
	connectBrowserWallet() {
		const connectWalletButton = this.header.getConnectWalletBtn();
		connectWalletButton.click();
		const onboardBrowserWalletButton = this.onboard.getBrowserWalletBtn();
		onboardBrowserWalletButton.click();
	}

	waitUntilLoggedIn() {
		cy.waitUntil(() => {
			const walletButton = this.header.getWalletButton();
			return walletButton.should('exist');
		});
		// waiting for wallet button is not enough in rare cases to be logged in
		cy.wait(2000);
	}

	getLoggedInWalletAddress() {
		const walletButton = this.header.getWalletButton();
		return walletButton.invoke('text');
	}

	waitForTransactionSuccess() {
		cy.waitUntil(
			() => {
				const txSuccessNotification = this.notifications.getTransactionSuccessNotification();
				return txSuccessNotification.should('exist');
			},
			{
				timeout: 60000,
			}
		);
	}

	assertCollateralIsAbove100sUSD(){

		cy.findAllByTestId('destination').each(($el, index, $list) => {			
			if($el.text().match(/collateral/)) {
				cy.wrap($el).parent().findAllByTestId('wallet-balance').invoke('text').then((sUSDinWallet) => {
					sUSDinWallet = Number.parseInt(sUSDinWallet.replace(/,/g,''));
					expect(sUSDinWallet, "sUSD wallet balance must be above 100 to open the short").to.be.above(100);
				});
			} 
		});
	}

	enterCollateralOf100sUSD() {
		
		// need to fill in the field with amount of collateral to short with a minimum 100 sUSD
		cy.findAllByTestId('destination').each(($el, index, $list) => {			
			if($el.text().match(/collateral/)) {
				cy.wrap($el).parent().findAllByTestId('currency-amount').type('100');
			} 
		});
	}

	assertAssetToShortItsValueExceedsZero(){
		
		// need to be sure that the asset its value to short is bigger than 0 at this point
		cy.findAllByTestId('destination').each(($el, index, $list) => {	
			if($el.text().match(/shorting/)) {
				cy.wrap($el).parent().findAllByTestId('currency-amount').invoke('val').then(short => { 
					expect(+short, "Short value must be bigger than 0").to.above(0);
				});
			} 
		})
	}

	executeApproveAndShortTransaction() {

		this
		.getSubmitOrderBtn()
		.then($submitButton => {					
				
			// checking if we need to approve the spending of sUSD first and if yes we do so
			if($submitButton.text().match(/appro/i)) {
				cy.wrap($submitButton).click();
				cy.confirmMetamaskPermissionToSpend();
				this.waitForTransactionSuccess();		
			}

			// need again to get the submit button so that the chain runs smoothly  for the next then()
			this.getSubmitOrderBtn();			
		})
		.then($submitButton => {
			cy.wrap($submitButton).should('contain.text','submit');
			cy.wrap($submitButton).click();
			this.confirmMetamaskTransaction();
			this.waitForTransactionSuccess(); 			
		});
			
	}
}
