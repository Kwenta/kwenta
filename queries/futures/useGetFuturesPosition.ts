import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import BigNumber from 'bignumber.js';

import synthetix from 'lib/synthetix';
import { appReadyState } from 'store/app';
import { isL2State, walletAddressState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import { toBigNumber, zeroBN } from 'utils/formatters/number';

export type Position = {
	order: { pending: boolean; fee: BigNumber; leverage: BigNumber } | null;
	margin: BigNumber;
	position: {
		canLiquidatePosition: boolean;
		isLong: boolean;
		notionalValue: BigNumber;
		accruedFunding: BigNumber;
		remainingMargin: BigNumber;
		profitLoss: BigNumber;
		fundingIndex: number;
		lastPrice: BigNumber;
		size: BigNumber;
		liquidationPrice: BigNumber;
		leverage: BigNumber;
	} | null;
};

const useGetFuturesPosition = (
	asset: string | null,
	market: string | null,
	options?: QueryConfig<Position>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const walletAddress = useRecoilValue(walletAddressState);

	return useQuery<Position>(
		QUERY_KEYS.Futures.Position(market || null, walletAddress || ''),
		async () => {
			const {
				contracts: { FuturesMarketData },
			} = synthetix.js!;

			const getFuturesMarketContract = (asset: string | null) => {
				if (!asset) throw new Error(`Asset needs to be specified`);
				const contractName = `FuturesMarket${asset.substring(1)}`;
				const contract = synthetix.js!.contracts[contractName];
				if (!contract) throw new Error(`${contractName} for ${asset} does not exist`);
				return contract;
			};

			const [futuresPosition, canLiquidatePosition] = await Promise.all([
				FuturesMarketData.positionDetails(market, walletAddress),
				getFuturesMarketContract(asset).canLiquidate(walletAddress),
			]);

			const {
				remainingMargin,
				orderPending,
				order,
				position: { fundingIndex, lastPrice, size, margin },
				accruedFunding,
				notionalValue,
				liquidationPrice,
				profitLoss,
			} = futuresPosition;

			return {
				order: !!orderPending
					? { pending: !!orderPending, fee: order.fee, leverage: order.leverage }
					: null,
				margin: toBigNumber(margin.toString()),
				position: toBigNumber(size.toString()).isZero()
					? null
					: {
							canLiquidatePosition: !!canLiquidatePosition,
							isLong: toBigNumber(size.toString()).isGreaterThan(zeroBN),
							notionalValue: toBigNumber(notionalValue.toString()),
							accruedFunding: toBigNumber(accruedFunding.toString()),
							remainingMargin: toBigNumber(remainingMargin.toString()),
							profitLoss: toBigNumber(profitLoss.toString()),
							fundingIndex: Number(fundingIndex.toString()),
							lastPrice: toBigNumber(lastPrice.toString()),
							size: toBigNumber(size.toString()),
							liquidationPrice: toBigNumber(liquidationPrice.toString()),
							leverage: toBigNumber(remainingMargin.toString()).isZero()
								? zeroBN
								: toBigNumber(notionalValue.toString()).dividedBy(
										toBigNumber(remainingMargin.toString())
								  ),
					  },
			};
		},
		{
			enabled: isAppReady && isL2 && !!walletAddress,
			...options,
		}
	);
};

export default useGetFuturesPosition;
