import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import { ethers, utils } from 'ethers';
import BigNumber from 'bignumber.js';
import fromUnixTime from 'date-fns/fromUnixTime';

import { appReadyState } from 'store/app';
import { isWalletConnectedState, walletAddressState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import { CurrencyKey, DEFAULT_TOKEN_DECIMALS, SYNTHS_MAP } from 'constants/currency';

import synthetix from 'lib/synthetix';

import { toBigNumber } from 'utils/formatters/number';
import request, { gql } from 'graphql-request';
import { SHORT_GRAPH_ENDPOINT } from 'queries/short/utils';

export type ShortPosition = {
	id: string;
	accruedInterest: BigNumber;
	lastInteraction: Date;
	synthBorrowed: CurrencyKey;
	synthBorrowedAmount: BigNumber;
	collateralLocked: CurrencyKey;
	collateralLockedAmount: BigNumber;
	collateralRatio: BigNumber;
	txHash: string;
	createdAt: Date;
	isOpen: boolean;
	closedAt: Date;
};

const useCollateralShortPositionQuery = (
	loanId: string | null,
	options?: QueryConfig<ShortPosition>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);

	return useQuery<ShortPosition>(
		QUERY_KEYS.Collateral.ShortPosition(loanId as string),
		async () => {
			const { CollateralShort, CollateralStateShort } = synthetix.js!.contracts;

			const loan = (await CollateralStateShort.getLoan(walletAddress, loanId as string)) as {
				accruedInterest: ethers.BigNumber;
				lastInteraction: ethers.BigNumber;
				currency: string;
				amount: ethers.BigNumber;
				collateral: string;
			};
			const collateralRatio = (await CollateralShort.collateralRatio(loan)) as ethers.BigNumber;

			const response = (await request(
				SHORT_GRAPH_ENDPOINT,
				gql`
					query shorts($id: String!) {
						shorts(where: { id: $id }) {
							txHash
							isOpen
							createdAt
							closedAt
						}
					}
				`,
				{
					id: loanId,
				}
			)) as {
				shorts: Array<{
					txHash: string;
					isOpen: boolean;
					createdAt: string;
					closedAt: string;
				}>;
			};

			const subgraphShort = response.shorts[0];

			// pnl
			return {
				id: loanId as string,
				accruedInterest: toBigNumber(
					utils.formatUnits(loan.accruedInterest, DEFAULT_TOKEN_DECIMALS)
				),
				lastInteraction: fromUnixTime(loan.lastInteraction.toNumber()),
				synthBorrowed: utils.parseBytes32String(loan.currency),
				synthBorrowedAmount: toBigNumber(utils.formatUnits(loan.amount, DEFAULT_TOKEN_DECIMALS)),
				collateralLocked: SYNTHS_MAP.sUSD,
				collateralLockedAmount: toBigNumber(
					utils.formatUnits(loan.collateral, DEFAULT_TOKEN_DECIMALS)
				),
				collateralRatio: toBigNumber(utils.formatUnits(collateralRatio, DEFAULT_TOKEN_DECIMALS)),
				txHash: subgraphShort.txHash,
				isOpen: subgraphShort.isOpen,
				createdAt: fromUnixTime(Number(subgraphShort.createdAt)),
				closedAt: fromUnixTime(Number(subgraphShort.closedAt)),
			};
		},
		{
			enabled: isAppReady && isWalletConnected && loanId != null,
			...options,
		}
	);
};

export default useCollateralShortPositionQuery;
