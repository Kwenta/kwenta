import nc from 'next-connect';
import cors from 'cors';
import axios from 'axios';

const COMMODITIES_BASE_API_URL =
	'https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/XAU/USD';

const handler = nc()
	.use(cors())
	.get(async (req, res) => {
		const response = await axios.get(COMMODITIES_BASE_API_URL, {
			headers: {
				'Content-Type': 'application/json',
			},
		});
		return response;
	});

export default handler;
