//
import Page from '../page';
export default class Notifications extends Page {
	getTransactionSuccessNotification() {
		return cy.get('.bn-notify-notification-success', { timeout: 60000 });
	}
	getTransactionSuccessNotificationLink() {
		return cy.get('.bn-notify-notification-success a', { timeout: 60000 });
	}
}
