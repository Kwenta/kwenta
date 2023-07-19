import axios from 'axios'

import {
	FLEEK_BASE_URL,
	FLEEK_STORAGE_BUCKET,
	TRADING_REWARDS_AWS_BUCKET,
} from '../constants/files'

export const getClient = (useAWS: boolean = false) => {
	const baseURL = useAWS
		? TRADING_REWARDS_AWS_BUCKET
		: `${FLEEK_BASE_URL}/${FLEEK_STORAGE_BUCKET}/data/`
	return axios.create({
		baseURL,
		timeout: 5000,
	})
}
