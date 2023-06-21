import axios from 'axios'
import cors from 'cors'
import nc from 'next-connect'

import { FOREX_BASE_API_URL } from 'queries/rates/constants'

enum Symbols {
	USD = 'USD',
}

type LatestRate = {
	motd: {
		msg: string
	}
	url: string
	success: boolean
	base: string
	date: string
	rates: {
		[key in Symbols]: number
	}
}

const handler = nc()
	.use(cors())
	.get(async (req, res) => {
		const response = await axios.get(`${FOREX_BASE_API_URL}`, {
			params: {
				// @ts-ignore
				base: req.query.symbol,
				symbol: 'USD',
			},
			headers: {
				'Content-Type': 'application/json',
			},
		})
		const priceResponse: LatestRate = response.data
		const price = priceResponse?.rates[Symbols.USD]

		// @ts-ignore
		res.send(price)
	})

export default handler
