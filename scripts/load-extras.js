const fs = require('fs');

const axios = require('axios');
const { keyBy } = require('lodash');

const ONE_INCH_API_URL = 'https://api.1inch.io/v4.0';

const loadOneInchTokenList = async (chainId) => {
	const response = await axios.get(`${ONE_INCH_API_URL}/${chainId}/tokens`);

	const tokensMap = response.data.tokens || {};
	const tokens = Object.values(tokensMap).map((t) => ({ ...t, chainId, tags: [] }));

	return {
		tokens,
		tokensMap: keyBy(tokens, 'symbol'),
		symbols: tokens.map((token) => token.symbol),
	};
};

const main = async () => {
	fs.mkdirSync('data/token-lists', { recursive: true });

	const [mainnetTokenList, optimismTokenList] = await Promise.all([
		loadOneInchTokenList(1),
		loadOneInchTokenList(10),
	]);

	fs.writeFileSync('data/token-lists/mainnet.json', JSON.stringify(mainnetTokenList));
	fs.writeFileSync('data/token-lists/optimism.json', JSON.stringify(optimismTokenList));
};

main();
