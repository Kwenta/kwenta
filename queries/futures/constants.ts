import { gql } from 'graphql-request';
import { utils as ethersUtils } from 'ethers';

export const FUTURES_ENDPOINT_MAINNET =
	'https://api.thegraph.com/subgraphs/name/kwenta/optimism-main';

export const FUTURES_ENDPOINT_TESTNET =
	'https://api.thegraph.com/subgraphs/name/kwenta/optimism-kovan-main';

export const DAY_PERIOD = 24;

export const SECONDS_PER_DAY = 24 * 60 * 60;

export const FUTURES_POSITION_FRAGMENT = gql`
	fragment FuturesPositionFragment on FuturesPosition {
		id
		openTimestamp
		closeTimestamp
		lastTxHash
		timestamp
		account
		market
		asset
		margin
		size
		feesPaid
		netFunding
		isOpen
		isLiquidated
		entryPrice
		exitPrice
		avgEntryPrice
		totalVolume
		pnl
		trades
	}
`;
export const KWENTA_TRACKING_CODE = ethersUtils.formatBytes32String('KWENTA');
