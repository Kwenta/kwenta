export default {
	en: {
		transaction: {
			txRequest: 'Your transaction is waiting for you to confirm',
			nsfFail: 'You have insufficient funds to complete this transaction',
			txUnderpriced:
				'The gas price for your transaction is too low, try again with a higher gas price',
			txRepeat: 'This could be a repeat transaction',
			txAwaitingApproval: 'You have a previous transaction waiting for you to confirm',
			txConfirmReminder:
				'Please confirm your transaction to continue, the transaction window may be behind your browser',
			txSendFail: 'You rejected the transaction',
			txSent: 'Your transaction has been sent to the network',
			txStallPending: 'Your transaction has stalled and has not entered the transaction pool',
			txPool: 'Your transaction has started',
			txStallConfirmed: "Your transaction has stalled and hasn't been confirmed",
			txSpeedUp: 'Your transaction has been sped up',
			txCancel: 'Your transaction is being canceled',
			txFailed: 'Your transaction has failed',
			txConfirmed: 'Your transaction has succeeded',
			txError: 'Oops something went wrong, please try again',
		},
		// currently not used
		watched: {
			txPool:
				'Your account is {verb} {formattedValue} {asset} {preposition} {counterpartyShortened}',
			txSpeedUp:
				'Your account is {verb} {formattedValue} {asset} {preposition} {counterpartyShortened}',
			txCancel:
				'Your account is {verb} {formattedValue} {asset} {preposition} {counterpartyShortened}',
			txConfirmed:
				'Your account successfully {verb} {formattedValue} {asset} {preposition} {counterpartyShortened}',
			txFailed:
				'Your account failed to {verb} {formattedValue} {asset} {preposition} {counterpartyShortened}',
		},
		time: {
			minutes: 'min',
			seconds: 'sec',
		},
	},
};
