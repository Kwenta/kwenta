export type ModalType =
	| 'cm_deposit_margin'
	| 'cm_withdraw_margin'
	| 'cm_confirm_order'
	| 'cm_edit_leverage'
	| null;

export type AppState = {
	openModal: ModalType;
};
