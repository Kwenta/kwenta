import axios from 'axios'

import {
	FLEEK_BASE_URL,
	FLEEK_STORAGE_BUCKET,
	TRADING_REWARDS_AWS_BUCKET,
} from '../constants/files'

const createClient = (baseURL: string) => {
	return axios.create({
		baseURL,
		timeout: 30000,
	})
}

export const awsClient = createClient(TRADING_REWARDS_AWS_BUCKET)

export const fleekClient = createClient(`${FLEEK_BASE_URL}/${FLEEK_STORAGE_BUCKET}/data/`)
