/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable ui-testing/no-hard-wait */

export default class Page {
	getTitle() {
		return cy.title();
	}

	getMetamaskWalletAddress() {
		return cy.fetchMetamaskWalletAddress();
	}

	acceptMetamaskAccessRequest() {
		cy.acceptMetamaskAccess();
	}

	confirmMetamaskTransaction() {
		cy.confirmMetamaskTransaction();
	}

	waitUntilAvailableOnEtherscan(url, alias) {
		cy.request(url).as(alias);
		cy.get(`@${alias}`).then((response) => {
			if (
				response.body.includes('This transaction has been included into Block No') ||
				response.body.includes('</i> Pending</span>')
			) {
				cy.wait(10000);
				this.waitUntilAvailableOnEtherscan(url, alias);
			}
		});
	}
}
