import { KwentaStatus } from '@kwenta/sdk/types'
import { createAsyncThunk } from '@reduxjs/toolkit'

import { ThunkConfig } from 'state/types'

export const checkSynthetixStatus = createAsyncThunk<boolean, void, ThunkConfig>(
	'app/checkSynthetixStatus',
	(_, { extra: { sdk } }) => {
		return sdk.system.getSynthetixStatus()
	}
)

export const fetchKwentaStatus = createAsyncThunk<KwentaStatus, void, ThunkConfig>(
	'app/fetchKwentaStatus',
	(_, { extra: { sdk } }) => {
		return sdk.system.getKwentaStatus()
	}
)
