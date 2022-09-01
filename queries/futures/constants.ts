import { utils as ethersUtils } from 'ethers';
import { gql } from 'graphql-request';

export const FUTURES_ENDPOINTS: Record<number, string> = {
	10: 'https://api.thegraph.com/subgraphs/name/kwenta/optimism-futures',
	69: 'https://api.thegraph.com/subgraphs/name/kwenta/optimism-kovan-futures',
	420: 'https://api.thegraph.com/subgraphs/name/kwenta/optimism-goerli-futures',
};

export const FUTURES_ENDPOINT_MAINNET =
	'https://api.thegraph.com/subgraphs/name/kwenta/optimism-futures';

export const FUTURES_ENDPOINT_TESTNET =
	'https://api.thegraph.com/subgraphs/name/kwenta/optimism-kovan-futures';

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
