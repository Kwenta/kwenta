import ExchangePage from '../pages/exchange/exchange-page';
import {useCyShortHistoryQuery, useCyShortHistoryQueryPollAsync} from '../helper/CyShortHistoryQuery';

const exchange = new ExchangePage();

/*
* This end-to-end test illustrates the happy flow of opening a short through the Kwenta exchange on Optimistic Kovan
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
		
			// this line is necessary to make sure we have a clean slate and empty a cached connection by a previous test spec
			cy.disconnectMetamaskWalletFromAllDapps();
			cy.visit('/shorting');

			exchange.connectBrowserWallet();
			exchange.acceptMetamaskAccessRequest();

			exchange.getMetamaskWalletAddress().then((address) => {
				walletAddress = address;

				// query the subgraph to find out the amount of short postions open
				useCyShortHistoryQuery(walletAddress)
				.its('body.data.shorts')
				.its('length')
				.then((numberOfShortsQueried) => {
					numberOfShortsAtBegin = numberOfShortsQueried;
				});
			});

			// we must be logged in now ; added statement as an extra safeguard we need a wallet address available
			cy.findByTestId('wallet-btn').should(`contain.text`,'0x');

			// need to fill in the field with amount of collateral to short with a minimum 100 sUSD
			cy.findAllByTestId('destination').each(($el, index, $list) => {			
				if($el.text().match(/collateral/)) {
					cy.wrap($el).parent().findAllByTestId('currency-amount').type('100');
				} 
			})
		});
		
		it(`should approve, open and register the short`, () => {

			// need to be sure that the asset its value to short is bigger than 0 at this point
			cy.findAllByTestId('destination').each(($el, index, $list) => {	
				if($el.text().match(/shorting/)) {
					cy.wrap($el).parent().findAllByTestId('currency-amount').invoke('val').then(short => { 
						expect(+short, "Short value must be bigger than 0").to.above(0);
					});
				} 
			})

			exchange.getSubmitOrderBtn()
				.then($submitButton => {					
					// checking if we need to approve the spending of sUSD first and if yes we do so
					if($submitButton.text().match(/appro/i)) {
						cy.wrap($submitButton).click();
						cy.confirmMetamaskPermissionToSpend();
						exchange.waitForTransactionSuccess();		
					}

				// need again to get the submit button so that the chain runs smoothly  for the next then()
				exchange.getSubmitOrderBtn();			
				})
				.then($submitButton => {
					cy.wrap($submitButton).should('contain.text','submit');
					cy.wrap($submitButton).click();
					exchange.confirmMetamaskTransaction();
					exchange.waitForTransactionSuccess(); 			
				});	
				
			cy.wrap(useCyShortHistoryQueryPollAsync(numberOfShortsAtBegin, 0, walletAddress))
            .then((shorts) => {
                expect(shorts, "Short positions should be incremented by 1 for " + walletAddress).to.be.above(numberOfShortsAtBegin);
			});

		});
	});
});
