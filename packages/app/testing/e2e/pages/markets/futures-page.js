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
		cy.visit(`/market/?asset=${marketKey}`);
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
		return cy.wait(5000);
	}

	getLoggedInWalletAddress() {
		const walletButton = this.header.getWalletButton();
		return walletButton.invoke('text');
	}
	getDepositBtn() {
		return cy.findByTestId('futures-market-trade-button-deposit');
	}

	getWithdrawBtn() {
		return cy.findByTestId('futures-market-trade-button-withdraw');
	}

	enterDepositMarginInsUSD(margin) {
		return cy.findByTestId('futures-market-trade-deposit-margin-input').type(margin.toString());
	}

	getDepositMarginBtn() {
		return cy.findByTestId('futures-market-trade-deposit-margin-button');
	}

	getWithdrawMarginBtn() {
		return cy.findByTestId('futures-market-trade-withdraw-margin-button');
	}

	getWithdrawMarginMaxBtn() {
		return cy.findByTestId('futures-market-trade-withdraw-max-button');
	}

	getLongBtn() {
		return cy.findByTestId('position-side-long-button');
	}

	getOpenPositionBtn() {
		return cy.findByTestId('trade-open-position-button');
	}

	getClosePositionBtn() {
		return cy.findByTestId('trade-close-position-button');
	}

	openPositionBtnShouldBeDisabled() {
		cy.get('[data-testid = "trade-open-position-button"]').should('be.disabled');
	}

	OpenPostiionBtnShouldBeEnabled() {
		cy.get('[data-testid = "trade-open-position-button"]').should('not.be.disabled');
	}

	closePositionBtnShouldBeDisabled() {
		cy.get('[data-testid = "trade-close-position-button"]').should('be.disabled');
	}

	closePositionBtnShouldBeEnabled() {
		cy.get('[data-testid = "trade-close-position-button"]').should('not.be.disabled');
	}

	enterAmountInsUSD(amount) {
		return cy.findByTestId('set-order-size-amount-susd').type(amount.toString());
	}

	getOpenPositionConfirmOrderBtn() {
		return cy.findByTestId('trade-open-position-confirm-order-button');
	}

	getClosePositionConfirmOrderBtn() {
		return cy.findByTestId('trade-close-position-confirm-order-button');
	}

	getPositionCardLeverageValue() {
		return cy.findByTestId('position-card-leverage-value');
	}

	getPositionCardSideValue() {
		return cy.findByTestId('position-card-side-value');
	}
}
