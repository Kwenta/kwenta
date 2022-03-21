import { SHORT_GRAPH_ENDPOINT_OVM_KOVAN } from '../../../queries/collateral/subgraph/utils';

const MAXPOLLS = 500;

const useCyShortHistoryQuery = (wallet: string) => {
	return cy.request({
		method: 'POST',
		url: SHORT_GRAPH_ENDPOINT_OVM_KOVAN,
		body: {
			query: `query{ shorts(where: { account: "${wallet}", isOpen: true }){ id } }`,
		},
	});
};

function useCyShortHistoryQueryPollAsync(numberOfShorts: number, depth: number, wallet: string) {
	return new Cypress.Promise((resolve, reject) => {
		let number1 = -1;

		function poll(numberOfShorts2: number, depth2: number, wallet2: string) {
			// prevent infinite loop set threshold before we resolve the promise
			if (depth2 === MAXPOLLS) {
				number1 = numberOfShorts2;
				resolve(number1);
				return;
			}

			cy.request({
				method: 'POST',
				url: SHORT_GRAPH_ENDPOINT_OVM_KOVAN,
				body: {
					query: `query{ shorts(where: { account: "${wallet}", isOpen: true }){ id } }`,
				},
			})
				.its('body.data.shorts')
				.its('length')
				.then((numberOfShortsQueried) => {
					if (numberOfShortsQueried > numberOfShorts) {
						number1 = numberOfShortsQueried;
						resolve(number1);
						return;
					} else {
						poll(numberOfShorts, depth2 + 1, wallet);
					}
				});
		}

		try {
			poll(numberOfShorts, depth, wallet);
		} catch (error) {
			reject(error);
		}
	});
}

export { useCyShortHistoryQuery, useCyShortHistoryQueryPollAsync };
