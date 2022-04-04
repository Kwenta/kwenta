import ShortingPage from '../pages/exchange/shorting-page';
import {
	useCyShortHistoryQuery,
	useCyShortHistoryQueryPollAsync,
} from '../helper/CyShortHistoryQuery';

const shorting = new ShortingPage();

/*
 * This end-to-end test illustrates the happy flow of opening a short through the Kwenta shorting on Optimistic Kovan
 * 1 sUSD is swapped
 * This e2e test works with Chrome on Optimistic Kovan
 *
 * In the before clause the amount of shorts for the wallet are determined to compare at the end of the test to determine the short has been opened
 */

let numberOfShortsAtBegin = 0;
let walletAddress;

describe('Shorting on Optimism', () => {
	context(`Open a short`, () => {
		before(() => {
			shorting.disconnectMetamaskWalletFromAllDapps();
			shorting.visit();
			shorting.connectBrowserWallet();
			shorting.acceptMetamaskAccessRequest();

			shorting.assertCollateralIsAbove100sUSD();

			shorting.getMetamaskWalletAddress().then((address) => {
				walletAddress = address;

				// query the subgraph to find out the amount of short postions open
				useCyShortHistoryQuery(walletAddress)
					.its('body.data.shorts')
					.its('length')
					.then((numberOfShortsQueried) => {
						numberOfShortsAtBegin = numberOfShortsQueried;
					});
			});

			shorting.enterCollateralOf100sUSD();
		});

		it(`should approve, open and register the short`, () => {
			shorting.assertAssetToShortItsValueExceedsZero();
			shorting.executeApproveAndShortTransaction();

			cy.wrap(useCyShortHistoryQueryPollAsync(numberOfShortsAtBegin, 0, walletAddress)).then(
				(shorts) => {
					expect(
						shorts,
						'Short positions should be incremented by 1 for ' + walletAddress
					).to.be.above(numberOfShortsAtBegin);
				}
			);
		});
	});
});
