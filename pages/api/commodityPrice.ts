import nc from 'next-connect';
import cors from 'cors';
import axios from 'axios';

type SpreadProfile = {
	spreadProfile: string;
	bidSpread: number;
	askSpread: number;
	bid: number;
	ask: number;
};

type PriceResponse = {
	spreadProfilePrices: SpreadProfile[];
	topo: {
		platform: string;
		server: string;
	};
	ts: number;
};

const COMMODITIES_BASE_API_URL =
	'https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument';

const handler = nc()
	.use(cors())
	.get(async (req, res) => {
		// @ts-ignore
		const response = await axios.get(`${COMMODITIES_BASE_API_URL}/${req.query.symbol}/USD`, {
			headers: {
				'Content-Type': 'application/json',
			},
		});

		const prices: number[] = response.data
			.map((val: PriceResponse) => {
				const thisSpread = val.spreadProfilePrices
					?.filter((spread: any) => spread.spreadProfile === 'Prime')
					.shift();
				if (thisSpread) {
					const thisPrice = (thisSpread.ask + thisSpread.bid) / 2;
					return thisPrice;
				} else {
					return null;
				}
			})
			.filter((val: number) => !!val);

		const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

		// @ts-ignore
		res.send(avgPrice);
	});

export default handler;
