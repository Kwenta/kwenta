import { ethers, utils } from 'ethers';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import Wei, { wei } from '@synthetixio/wei';
import fromUnixTime from 'date-fns/fromUnixTime';
import request, { gql } from 'graphql-request';

import Connector from 'containers/Connector';
import QUERY_KEYS from 'constants/queryKeys';
import { CurrencyKey, Synths } from 'constants/currency';
import {
	SHORT_GRAPH_ENDPOINT,
	SHORT_GRAPH_ENDPOINT_OVM,
	SHORT_GRAPH_ENDPOINT_KOVAN,
	SHORT_GRAPH_ENDPOINT_OVM_KOVAN,
} from 'queries/collateral/subgraph/utils';
import { appReadyState } from 'store/app';
import { hexToAscii } from 'utils/formatters/string';
import { isL2KovanState, isL2MainnetState, isL1KovanState } from 'store/wallet';
import { isWalletConnectedState } from 'store/wallet';

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

type InitialCollateralPrice = {
	rate: String;
	synth: String;
};

const useCollateralShortPositionQuery = (
	loanId: string | null,
	loanTxHash?: string | null,
	options?: UseQueryOptions<ShortPosition>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const { provider, synthetixjs } = Connector.useContainer();
	const isL1Kovan = useRecoilValue(isL1KovanState);
	const isL2Mainnet = useRecoilValue(isL2MainnetState);
	const isL2Kovan = useRecoilValue(isL2KovanState);

	const shortsSubgraphEndpoint = isL1Kovan
		? SHORT_GRAPH_ENDPOINT_KOVAN
		: isL2Kovan
		? SHORT_GRAPH_ENDPOINT_OVM_KOVAN
		: isL2Mainnet
		? SHORT_GRAPH_ENDPOINT_OVM
		: SHORT_GRAPH_ENDPOINT;

	return useQuery<ShortPosition>(
		QUERY_KEYS.Collateral.ShortPosition(loanId as string),
		async () => {
			const { CollateralShort, CollateralUtil, ExchangeRates } = synthetixjs!.contracts;

			const loan = (await CollateralShort.loans(loanId as string)) as {
				accruedInterest: ethers.BigNumber;
				lastInteraction: ethers.BigNumber;
				currency: string;
				amount: ethers.BigNumber;
				collateral: string;
			};

			const collateralRatio = (await CollateralUtil.getCollateralRatio(
				loan,
				utils.formatBytes32String(Synths.sUSD)
			)) as ethers.BigNumber;

			let txHash = loanTxHash ?? null;
			let isOpen = null;
			let createdAt = null;
			let closedAt = null;
			let profitLoss = null;

			try {
				const response = (await request(
					shortsSubgraphEndpoint,
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
				console.error(e?.data?.message);
			}

			if (txHash != null && provider != null && createdAt != null) {
				const tx = await provider.getTransaction(txHash);
				if (tx != null) {
					const RATE_UPDATES_ENDPOINT =
						'https://api.thegraph.com/subgraphs/name/synthetixio-team/optimism-main';

					let [initialCollateralPriceResponse, latestCollateralPrice] = (await Promise.all([
						request(
							RATE_UPDATES_ENDPOINT,
							gql`
								query getRateUpdateAtBlock($currencyKey: String!, $timestamp: Int!) {
									rateUpdates(
										first: 1
										orderBy: timestamp
										direction: desc
										where: { synth: $currencyKey, timestamp_lte: $timestamp }
									) {
										id
										rate
										timestamp
										synth
									}
								}
							`,
							{
								currencyKey: hexToAscii(loan.currency),
								timestamp: Date.parse(createdAt.toISOString()) / 1000,
							}
						),
						ExchangeRates.rateForCurrency(loan.currency),
					])) as [{ rateUpdates: Array<InitialCollateralPrice> }, ethers.BigNumber];

					const initialCollateralPrice = initialCollateralPriceResponse?.rateUpdates[0]?.rate;
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
