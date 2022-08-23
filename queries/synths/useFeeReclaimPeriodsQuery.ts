import { CurrencyKey } from '@synthetixio/contracts-interface';
import { SynthFeeAndWaitingPeriod } from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import { Provider, Contract } from 'ethcall';
import { BigNumber, ethers } from 'ethers';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import { useProvider } from 'wagmi';

import Connector from 'containers/Connector';
import { networkState } from 'store/wallet';

const ethcallProvider = new Provider();

type TradeFees = {
	fee: Wei;
	noOfTrades: number;
};

type FeeResult = {
	rebate: BigNumber;
	reclaim: BigNumber;
	noOfTrades: BigNumber;
};

const useFeeReclaimPeriodsQuery = (
	walletAddress: string,
	options?: UseQueryOptions<SynthFeeAndWaitingPeriod[]>
) => {
	const { defaultSynthetixjs: synthetixjs } = Connector.useContainer();
	const network = useRecoilValue(networkState);
	const provider = useProvider();

	return useQuery<SynthFeeAndWaitingPeriod[]>(
		['synths', 'feeReclaimPeriods', network.id],
		async () => {
			if (!synthetixjs) return [];
			await ethcallProvider.init(provider as any);

			const {
				synths,
				contracts: { Exchanger: BaseExchanger },
				sources,
			} = synthetixjs;

			const Exchanger = new Contract(BaseExchanger.address, sources.Exchanger.abi as any);

			const waitingPeriodCalls = [];
			const feeCalls = [];

			for (const currencyKey of synths) {
				waitingPeriodCalls.push(
					Exchanger.maxSecsLeftInWaitingPeriod(
						walletAddress,
						ethers.utils.formatBytes32String(currencyKey.name)
					)
				);

				feeCalls.push(
					Exchanger.settlementOwing(
						walletAddress,
						ethers.utils.formatBytes32String(currencyKey.name)
					)
				);
			}

			const waitingPeriodsRaw = (await ethcallProvider.all(
				waitingPeriodCalls
			)) as ethers.BigNumberish[];
			const feesRaw = (await ethcallProvider.all(feeCalls)) as FeeResult[];

			const waitingPeriods = waitingPeriodsRaw.map((period) => Number(period));

			const fees = feesRaw.map(
				(value): TradeFees => ({
					fee: wei(ethers.utils.formatEther(value.rebate.sub(value.reclaim))),
					noOfTrades: Number(value.noOfTrades.toString()),
				})
			);

			return synths.map((currencyKey, i) => {
				const { fee, noOfTrades } = fees[i];
				return {
					currencyKey: currencyKey.name as CurrencyKey,
					waitingPeriod: waitingPeriods[i],
					fee,
					noOfTrades,
				};
			});
		},
		{
			enabled: !!synthetixjs && !!walletAddress,
			...options,
		}
	);
};

export default useFeeReclaimPeriodsQuery;
