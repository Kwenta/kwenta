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
		// Currently without supplying a gas configuration results in failing transactions
		// Possibly caused by wrong default behaviour within Synpress
		cy.confirmMetamaskTransaction({ gasFee: 1, gasLimit: 5000000 });
	}

	snxExchangerSettle(asset) {
		return cy.snxExchangerSettle(asset);
	}

	snxCheckWaitingPeriod(asset) {
		cy.snxCheckWaitingPeriod(asset);
	}

	waitUntilAvailableOnEtherscan(urlOrTx, alias) {
		if (!urlOrTx.includes('http')) {
			cy.getNetwork().then((network) => {
				const etherscanUrl =
					network.networkName === 'mainnet'
						? `https://etherscan.io/tx/${urlOrTx}`
						: `https://${network.networkName}.etherscan.io/tx/${urlOrTx}`;
				waitForTxSuccess(etherscanUrl, alias);
			});
		} else {
			waitForTxSuccess(urlOrTx, alias);
		}
	}

	disconnectMetamaskWalletFromAllDapps() {
		// this line is necessary to make sure we have a clean slate and empty a cached connection by a previous test spec
		cy.disconnectMetamaskWalletFromAllDapps();
	}
}

function waitForTxSuccess(url, alias) {
	cy.request(url).as(alias);
	cy.get(`@${alias}`).then((response) => {
		if (
			response.body.includes('This transaction has been included into Block No') ||
			response.body.includes('</i> Pending</span>')
		) {
			cy.wait(5000);
			waitForTxSuccess(url, alias);
		}
	});
}
