import { RootState } from 'state/store';

export const selectOpenModal = (state: RootState) => state.app.openModal;
