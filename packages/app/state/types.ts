import type KwentaSDK from '@kwenta/sdk';

import type { AppDispatch, RootState } from './store';

export enum FetchStatus {
	Idle,
	Loading,
	Success,
	Error,
}

export type QueryStatus = {
	status: FetchStatus;
	error?: string | null;
};

export type ThunkConfig = {
	dispatch: AppDispatch;
	state: RootState;
	extra: { sdk: KwentaSDK };
};
