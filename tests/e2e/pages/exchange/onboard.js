import Page from '../page';
export default class Onboard extends Page {
	getBrowserWalletBtn() {
		return cy.findByAltText('Browser Wallet');
		// return cy.get('.bn-onboard-modal-select-wallets li:nth-child(1) .bn-onboard-icon-button');
	}
}
