import { CurrencyKey } from './currency';

export const EXTERNAL_LINKS = {
	Trading: {
		DexAG: 'https://dex.ag/',
		Uniswap: 'https://uniswap.exchange/',
		OneInch: `https://1inch.exchange/`,
		OneInchLink: (from: CurrencyKey, to: CurrencyKey) => `https://1inch.exchange/#/${from}/${to}`,
		OptimismTokenBridge: 'https://gateway.optimism.io',
	},
	Synthetix: {
		Home: 'https://www.synthetix.io',
		Litepaper: 'https://docs.synthetix.io/litepaper/',
	},
	Social: {
		Twitter: 'https://twitter.com/kwenta_io',
		Medium: 'https://blog.kwenta.io/',
		Discord: 'https://discord.gg/SwNfgV4w6C',
		GitHub: 'https://github.com/kwenta/kwenta',
	},
	TokenLists: {
		Synthetix:
			'https://bafybeidkpj743vthl5chzdxibjxfbf2hv3y4mmtcbciu4kdh4d6xqfezpa.ipfs.dweb.link/',
		Zapper: 'https://zapper.fi/api/token-list',
		OneInch: 'https://gateway.ipfs.io/ipns/tokens.1inch.eth',
	},
};
