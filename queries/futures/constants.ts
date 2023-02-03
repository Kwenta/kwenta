import { utils as ethersUtils } from 'ethers';
import { gql } from 'graphql-request';

import { chain } from 'containers/Connector/config';

export const FUTURES_ENDPOINT_OP_MAINNET = `https://subgraph.satsuma-prod.com/${process.env.NEXT_PUBLIC_SATSUMA_API_KEY}/kwenta/optimism-perps/api`;

export const FUTURES_ENDPOINT_OP_GOERLI =
	'https://api.thegraph.com/subgraphs/name/kwenta/optimism-goerli-perps';

export const FUTURES_ENDPOINTS = {
	[chain.optimism.id]: FUTURES_ENDPOINT_OP_MAINNET,
	[chain.optimismGoerli.id]: FUTURES_ENDPOINT_OP_GOERLI,
};

export const MAIN_ENDPOINT_OP_MAINNET = `https://subgraph.satsuma-prod.com/${process.env.NEXT_PUBLIC_SATSUMA_API_KEY}/kwenta/optimism-main/api`;

export const MAIN_ENDPOINT_OP_GOERLI =
	'https://api.thegraph.com/subgraphs/name/kwenta/optimism-goerli-main';

export const MAIN_ENDPOINTS = {
	[chain.optimism.id]: MAIN_ENDPOINT_OP_MAINNET,
	[chain.optimismGoerli.id]: MAIN_ENDPOINT_OP_GOERLI,
};

export const DAY_PERIOD = 24;

export const SECONDS_PER_DAY = 24 * 60 * 60;

export const FUTURES_POSITION_FRAGMENT = gql`
	fragment FuturesPositionFragment on FuturesPosition {
		id
		abstractAccount
		openTimestamp
		closeTimestamp
		lastTxHash
		timestamp
		account
		market
		asset
		initialMargin
		margin
		size
		feesPaid
		totalDeposits
		netTransfers
		netFunding
		isOpen
		isLiquidated
		entryPrice
		exitPrice
		avgEntryPrice
		totalVolume
		pnl
		pnlWithFeesPaid
		trades
	}
`;
export const KWENTA_TRACKING_CODE = ethersUtils.formatBytes32String('KWENTA');

export const AGGREGATE_ASSET_KEY = '0x';

export const ORDER_PREVIEW_ERRORS = { insufficient_margin: 'Insufficient free margin' };
export const ORDER_PREVIEW_ERRORS_I18N: Record<string, string> = {
	insufficient_margin: 'futures.market.trade.preview.insufficient-margin',
	insufficient_margin_edit_leverage: 'futures.market.trade.edit-leverage.insufficient-margin',
	insufficient_free_margin_edit_leverage:
		'futures.market.trade.edit-leverage.insufficient-free-margin',
};

export const previewErrorI18n = (message: string) => {
	return ORDER_PREVIEW_ERRORS_I18N[message] || 'futures.market.trade.preview.error';
};
