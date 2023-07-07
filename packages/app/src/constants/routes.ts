import { FuturesMarketAsset } from '@kwenta/sdk/types'

import { AppFuturesMarginType } from 'state/futures/types'

import { EXTERNAL_LINKS } from './links'

const prettyURLsDisabled = !!process.env.NEXT_PUBLIC_DISABLE_PRETTY_URLS

const normalizeRoute = (baseURL: string, path: string, queryParam: string) =>
	prettyURLsDisabled ? `${baseURL}?${queryParam}=${path}` : `${baseURL}/${path}`

export const formatUrl = (route: string, params: Record<string, string>) => {
	return route + '?' + new URLSearchParams(params)
}

export const ROUTES = {
	Home: {
		Root: '/',
	},
	Dashboard: {
		Home: '/dashboard',
		Overview: normalizeRoute('/dashboard', 'overview', 'tab'),
		History: normalizeRoute('/dashboard', 'history', 'tab'),
		Markets: normalizeRoute('/dashboard', 'markets', 'tab'),
		Earn: normalizeRoute('/dashboard', 'earn', 'tab'),
		Stake: normalizeRoute('/dashboard', 'staking', 'tab'),
		Rewards: normalizeRoute('/dashboard', 'rewards', 'tab'),
		TradingRewards: formatUrl('/dashboard/staking', { tab: 'trading-rewards' }),
	},
	Exchange: {
		Home: '/exchange',
		MarketPair: (baseCurrencyKey: string, quoteCurrencyKey: string) =>
			`/exchange/?quote=${quoteCurrencyKey}&base=${baseCurrencyKey}`,
		Into: (currencyKey: string) => `/exchange/?quote=${currencyKey}`,
	},
	Markets: {
		Home: (accountType: AppFuturesMarginType) =>
			formatUrl('/market', { accountType, asset: 'sETH' }),
		MarketPair: (asset: FuturesMarketAsset | string, accountType: AppFuturesMarginType) =>
			formatUrl('/market', { asset, accountType }),
		Position: (asset: FuturesMarketAsset, accountType: AppFuturesMarginType) =>
			formatUrl('/market', {
				asset,
				accountType,
				tab: 'position',
			}),
		Orders: (asset: FuturesMarketAsset, accountType: AppFuturesMarginType) =>
			formatUrl('/market', { asset, accountType, tab: 'orders' }),
		ConditionalOrders: (asset: FuturesMarketAsset, accountType: AppFuturesMarginType) =>
			formatUrl('/market', { asset, accountType, tab: 'conditional_orders' }),
		Trades: (asset: FuturesMarketAsset, accountType: AppFuturesMarginType) =>
			formatUrl('/market', { asset, accountType, tab: 'trades' }),
		Transfers: (asset: FuturesMarketAsset, accountType: AppFuturesMarginType) =>
			formatUrl('/market', { asset, accountType, tab: 'transfers' }),
	},
	Stats: {
		Home: '/stats',
	},
	Leaderboard: {
		Home: '/leaderboard',
		Trader: (trader: string) => `/leaderboard/?trader=${trader}`,
		Competition: (round: string) => `/leaderboard/?competitionRound=${round}`,
	},
	Earn: {
		Home: '/earn',
	},
}

export const SUB_MENUS = {
	[ROUTES.Dashboard.Overview]: [
		{ label: 'Overview', link: '/dashboard/overview' },
		{ label: 'Markets', link: '/dashboard/markets' },
		// { label: 'Governance', link: '/governance' },
	],
	[ROUTES.Home.Root]: [
		{ label: 'Overview', link: EXTERNAL_LINKS.Docs.Governance },
		{ label: 'KIPs', link: EXTERNAL_LINKS.Governance.Kips },
	],
}

export const setLastVisited = (
	baseCurrencyPair: string,
	accountType: AppFuturesMarginType
): void => {
	localStorage.setItem('lastVisited', ROUTES.Markets.MarketPair(baseCurrencyPair, accountType))
}

export default ROUTES
