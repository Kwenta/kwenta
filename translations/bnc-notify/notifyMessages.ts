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
	kr: {
		transaction: {
			txRequest: '거래를 진행하시려면 승인해 주세요',
			nsfFail: '요청하신 거래를 진행하기에 자금이 부족합니다',
			txUnderpriced: '입력하신 가스비가 너무 낮습니다. 더 높은 가스비를 입력해 주세요',
			txRepeat: '이 거래는 중복 거래일 수 있습니다',
			txAwaitingApproval: '이전 거래를 승인해 주셔야 합니다',
			txConfirmReminder:
				'계속 진행하시려면 승인해 주세요. 거래창이 귀하의 브라우저 뒤에 있을 수 있습니다',
			txSendFail: '거래를 거부하셨습니다',
			txSent: '귀하의 거래가 네트워크로 송부되었습니다',
			txStallPending: '귀하의 거래가 중지되어 거래 풀에 보내지지 않았습니다',
			txPool: '귀하의 거래가 시작됐습니다',
			txStallConfirmed: '귀하의 거래가 중지되어 승인되지 않았습니다',
			txSpeedUp: '귀하의 거래가 더 빠르게 진행되고 있습니다',
			txCancel: '귀하의 거래가 취소되고 있습니다',
			txFailed: '거래가 발생하지 않았습니다',
			txConfirmed: '성공적으로 거래됐습니다 ',
			txError: '앗, 뭔가 오류가 발생했습니다. 다시 시도해 주세요',
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
			minutes: '분',
			seconds: '초',
		},
	},
};
