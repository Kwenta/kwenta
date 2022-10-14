import Page from '../page';
export default class Onboard extends Page {
	getBrowserWalletBtn() {
		return cy.findByText('MetaMask');
	}
}
