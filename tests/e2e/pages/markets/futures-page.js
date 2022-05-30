/* eslint-disable ui-testing/no-hard-wait */
/* eslint-disable cypress/no-unnecessary-waiting */
import Page from '../page';
import Header from './header';
import Notifications from './notifications';
import Onboard from './onboard';

export default class FuturesPage extends Page {
	constructor() {
		super();
		this.header = new Header();
		this.onboard = new Onboard();
		this.notifications = new Notifications();
	}

	visit(marketKey = 'sETH') {
		cy.visit(`/market/${marketKey}`);
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
		return cy.wait(2000);
	}

	getLoggedInWalletAddress() {
		const walletButton = this.header.getWalletButton();
		return walletButton.invoke('text');
	}
	getDepositeBtn() {
		return cy.findByTestId('futures-market-trade-button-deposit');
	}

	enterMarginInsUSD(margin) {
		return cy.findByTestId('funtures-market-trade-deposite-margin-input').type(margin.toString());
	}

	getDepositeMarginBtn() {
		return cy.findByTestId('funtures-market-trade-deposite-margin-button');
	}

	assertDepositeMargin() {
		cy.findByText('Total Margin')
			.first()
			.invoke('val')
			.then((value) => {
				expect(value).to.equal(0);
			});
	}
}
