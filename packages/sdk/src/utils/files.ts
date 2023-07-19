import axios from 'axios'

import { FLEEK_BASE_URL, FLEEK_STORAGE_BUCKET } from '../constants/files'

export const client = axios.create({
	baseURL: `${FLEEK_BASE_URL}/${FLEEK_STORAGE_BUCKET}/data/`,
	timeout: 10000,
})
