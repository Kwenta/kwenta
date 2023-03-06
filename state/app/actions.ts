import { createAsyncThunk } from '@reduxjs/toolkit';

import { ThunkConfig } from 'state/types';

export const checkSynthetixStatus = createAsyncThunk<boolean, void, ThunkConfig>(
	'app/checkSynthetixStatus',
	(_, { extra: { sdk } }) => {
		return sdk.general.getSynthetixStatus();
	}
);
