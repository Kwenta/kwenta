import { KwentaStatus } from '@kwenta/sdk/types'
import { createAsyncThunk } from '@reduxjs/toolkit'

import { ThunkConfig } from 'state/types'
import proxy from 'utils/proxy'

export const checkSynthetixStatus = createAsyncThunk<boolean, void, ThunkConfig>(
	'app/checkSynthetixStatus',
	() => {
		return proxy.get('system/synthetix-status').then((response) => response.data)
	}
)

export const fetchKwentaStatus = createAsyncThunk<KwentaStatus, void, ThunkConfig>(
	'app/fetchKwentaStatus',
	() => {
		return proxy.get('system/kwenta-status').then((response) => response.data)
	}
)
