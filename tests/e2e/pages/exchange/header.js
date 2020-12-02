import Page from '../page';
export default class Header extends Page {
	getConnectWalletBtn() {
		return cy.getId('connect-wallet');
	}
	getWalletButton() {
		return cy.getId('wallet-btn');
	}
}
