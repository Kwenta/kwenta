import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import Wei, { wei } from '@synthetixio/wei';
import request, { gql } from 'graphql-request';

import { appReadyState } from 'store/app';
import { isL2State, walletAddressState } from 'store/wallet';
import Connector from 'containers/Connector';

import QUERY_KEYS from 'constants/queryKeys';
import { PositionHistory, PositionSide } from './types';

const FUTURES_ENDPOINT = 'https://api.thegraph.com/subgraphs/name/clementbalestrat/futures';

const useGetFuturesPositionHistory = (
	currencyKey: string | null,
	options?: UseQueryOptions<any | null>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const walletAddress = useRecoilValue(walletAddressState);
	const { synthetixjs } = Connector.useContainer();
	return useQuery<PositionHistory[]>(
		QUERY_KEYS.Futures.PositionHistory(currencyKey || null, walletAddress || ''),
		async () => {
			if (!currencyKey) return null;
			try {
				const { contracts } = synthetixjs!;
				const marketAddress = contracts[`FuturesMarket${currencyKey.substr(1)}`].address;
				if (!marketAddress) return null;
				const response = await request(
					FUTURES_ENDPOINT,
					gql`
						query positionHistory($market: String!, $account: String!) {
							futuresPositions(
								where: { market: $market, account: $account }
								orderBy: timestamp
								orderDirection: desc
							) {
								id
								lastTxHash
								timestamp
								isOpen
								isLiquidated
								entryPrice
								exitPrice
								size
								margin
							}
						}
					`,
					{ market: marketAddress, account: walletAddress }
				);

				return (
					response?.futuresPositions?.map(
						({
							id,
							lastTxHash,
							timestamp,
							isOpen,
							isLiquidated,
							entryPrice,
							exitPrice,
							size,
							margin,
						}: {
							id: string;
							lastTxHash: string;
							timestamp: number;
							isOpen: boolean;
							isLiquidated: boolean;
							entryPrice: string;
							exitPrice: string;
							size: string;
							margin: string;
						}) => {
							const entryPriceWei = new Wei(entryPrice, 18, true);
							const exitPriceWei = new Wei(exitPrice || 0, 18, true);
							const sizeWei = new Wei(size, 18, true);
							const marginWei = new Wei(margin, 18, true);
							return {
								id: Number(id.split('-')[1].toString()),
								transactionHash: lastTxHash,
								timestamp: timestamp * 1000,
								isOpen,
								isLiquidated,
								entryPrice: entryPriceWei,
								exitPrice: exitPriceWei,
								size: sizeWei,
								asset: currencyKey,
								margin: marginWei,
								leverage: sizeWei.mul(entryPriceWei).div(marginWei),
								side: sizeWei.gte(wei(0)) ? PositionSide.LONG : PositionSide.SHORT,
								pnl: sizeWei.mul(exitPriceWei.sub(entryPriceWei)),
							};
						}
					) ?? null
				);
			} catch (e) {
				console.log(e);
				return null;
			}
		},
		{ enabled: isAppReady && isL2 && !!walletAddress && !!currencyKey && !!synthetixjs, ...options }
	);
};

export default useGetFuturesPositionHistory;
