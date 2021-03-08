import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import { ethers, utils } from 'ethers';
import BigNumber from 'bignumber.js';
import fromUnixTime from 'date-fns/fromUnixTime';

import { appReadyState } from 'store/app';
import { isWalletConnectedState, walletAddressState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import { DEFAULT_TOKEN_DECIMALS } from 'constants/defaults';
import { CurrencyKey, SYNTHS_MAP } from 'constants/currency';

import synthetix from 'lib/synthetix';

import { toBigNumber } from 'utils/formatters/number';
import request, { gql } from 'graphql-request';
import { SHORT_GRAPH_ENDPOINT } from 'queries/collateral/subgraph/utils';
import Connector from 'containers/Connector';

export type ShortPosition = {
	id: string;
	accruedInterest: BigNumber;
	lastInteraction: Date;
	synthBorrowed: CurrencyKey;
	synthBorrowedAmount: BigNumber;
	collateralLocked: CurrencyKey;
	collateralLockedAmount: BigNumber;
	collateralRatio: BigNumber;
	txHash: string | null;
	createdAt: Date | null;
	isOpen: boolean | null;
	closedAt: Date | null;
	profitLoss: BigNumber | null;
};

const useCollateralShortPositionQuery = (
	loanId: string | null,
	loanTxHash?: string | null,
	skipSubgraph?: boolean,
	options?: QueryConfig<ShortPosition>
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

					const loanAmount = toBigNumber(utils.formatUnits(loan.amount, DEFAULT_TOKEN_DECIMALS));
					const initialUSDPrice = toBigNumber(
						utils.formatUnits(initialCollateralPrice, DEFAULT_TOKEN_DECIMALS)
					);
					const latestUSDPrice = toBigNumber(
						utils.formatUnits(latestCollateralPrice, DEFAULT_TOKEN_DECIMALS)
					);

					const pnlPercentage = initialUSDPrice.minus(latestUSDPrice).dividedBy(initialUSDPrice);
					profitLoss = pnlPercentage.multipliedBy(loanAmount).multipliedBy(initialUSDPrice);
				}
			}

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
