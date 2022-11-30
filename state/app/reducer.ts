import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AppState, ModalType } from './types';

const initialState: AppState = {
	openModal: null,
};

const appSlice = createSlice({
	name: 'app',
	initialState,
	reducers: {
		setOpenModal: (state, action: PayloadAction<ModalType>) => {
			state.openModal = action.payload;
		},
	},
});

export const { setOpenModal } = appSlice.actions;

export default appSlice.reducer;
