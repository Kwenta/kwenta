import type KwentaSDK from 'sdk';

import type { AppDispatch, RootState } from './store';

export enum FetchStatus {
	Idle,
	Loading,
	Success,
	Error,
}

export type ThunkConfig = {
	dispatch: AppDispatch;
	state: RootState;
	extra: { sdk: KwentaSDK };
};
