//
import Page from '../page';
export default class Notifications extends Page {
	getTransactionSuccessNotification() {
		// the old code referenced a dom element that has been phased out
		// with this approach using contains we can rely on displaying an element mentioning success
		// and cypress takes care of the rest
		return cy.contains('has succeeded').should(`exist`);
	}
	getTransactionSuccessNotificationLink() {
		return cy.get('.bn-notify-notification-success a', { timeout: 60000 });
	}
}
