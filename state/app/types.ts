export type ModalType =
	| 'futures_cross_deposit'
	| 'futures_cross_withdraw'
	| 'futures_cross_leverage'
	| 'futures_isolated_transfer'
	| null;

export type AppState = {
	openModal: ModalType;
};
