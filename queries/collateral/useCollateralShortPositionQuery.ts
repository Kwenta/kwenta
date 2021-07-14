import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import { ethers, utils } from 'ethers';
import Wei, { wei } from '@synthetixio/wei';
import fromUnixTime from 'date-fns/fromUnixTime';

import { appReadyState } from 'store/app';
import { isWalletConnectedState, walletAddressState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import { CurrencyKey, Synths } from 'constants/currency';

import synthetix from 'lib/synthetix';

import request, { gql } from 'graphql-request';
import { SHORT_GRAPH_ENDPOINT } from 'queries/collateral/subgraph/utils';
import Connector from 'containers/Connector';

export type ShortPosition = {
	id: string;
	accruedInterest: Wei;
	lastInteraction: Date;
	synthBorrowed: CurrencyKey;
	synthBorrowedAmount: Wei;
	collateralLocked: CurrencyKey;
	collateralLockedAmount: Wei;
	collateralRatio: Wei;
	txHash: string | null;
	createdAt: Date | null;
	isOpen: boolean | null;
	closedAt: Date | null;
	profitLoss: Wei | null;
};

const useCollateralShortPositionQuery = (
	loanId: string | null,
	loanTxHash?: string | null,
	skipSubgraph?: boolean,
	options?: UseQueryOptions<ShortPosition>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const { provider } = Connector.useContainer();

	return useQuery<ShortPosition>(
		QUERY_KEYS.Collateral.ShortPosition(loanId as string),
		async () => {
			const { CollateralShort, CollateralStateShort, ExchangeRates } = synthetix.js!.contracts;

			const loan = (await CollateralStateShort.getLoan(walletAddress, loanId as string)) as {
				accruedInterest: ethers.BigNumber;
				lastInteraction: ethers.BigNumber;
				currency: string;
				amount: ethers.BigNumber;
				collateral: string;
			};
			const collateralRatio = (await CollateralShort.collateralRatio(loan)) as ethers.BigNumber;

			let txHash = loanTxHash ?? null;
			let isOpen = null;
			let createdAt = null;
			let closedAt = null;
			let profitLoss = null;

			if (skipSubgraph == null) {
				try {
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

					txHash = subgraphShort.txHash;
					isOpen = subgraphShort.isOpen;
					createdAt = fromUnixTime(Number(subgraphShort.createdAt));
					closedAt = fromUnixTime(Number(subgraphShort.closedAt));
				} catch (e) {
					console.log(e.message);
				}
			}

			if (txHash != null && provider != null) {
				const tx = await provider.getTransaction(txHash);
				if (tx != null) {
					let [initialCollateralPrice, latestCollateralPrice] = (await Promise.all([
						ExchangeRates.rateForCurrency(loan.currency, {
							blockTag: tx.blockNumber,
						}),
						ExchangeRates.rateForCurrency(loan.currency),
					])) as [ethers.BigNumber, ethers.BigNumber];

					const loanAmount = wei(loan.amount);
					const initialUSDPrice = wei(initialCollateralPrice);
					const latestUSDPrice = wei(latestCollateralPrice);

					const pnlPercentage = initialUSDPrice.sub(latestUSDPrice).div(initialUSDPrice);
					profitLoss = pnlPercentage.mul(loanAmount).mul(initialUSDPrice);
				}
			}

			return {
				id: loanId as string,
				accruedInterest: wei(loan.accruedInterest),
				lastInteraction: fromUnixTime(loan.lastInteraction.toNumber()),
				synthBorrowed: utils.parseBytes32String(loan.currency) as CurrencyKey,
				synthBorrowedAmount: wei(loan.amount),
				collateralLocked: Synths.sUSD,
				collateralLockedAmount: wei(loan.collateral),
				collateralRatio: wei(collateralRatio),
				txHash,
				isOpen,
				createdAt,
				closedAt,
				profitLoss,
			};
		},
		{
			enabled: isAppReady && isWalletConnected && loanId != null,
			...options,
		}
	);
};

export default useCollateralShortPositionQuery;
