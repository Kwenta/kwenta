import { Provider, Contract } from 'ethcall';
import { ethers } from 'ethers';
import { useQuery, UseQueryOptions } from 'react-query';
import { CurrencyKey } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';

import Connector from 'containers/Connector';

import { SynthFeeAndWaitingPeriod } from '@synthetixio/queries';

const ethcallProvider = new Provider();

const useFeeReclaimPeriodsQuery = (
	walletAddress: string,
	options?: UseQueryOptions<SynthFeeAndWaitingPeriod[]>
) => {
	const { synthetixjs, network, provider } = Connector.useContainer();

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
			const feesRaw = (await ethcallProvider.all(feeCalls)) as [
				ethers.BigNumber,
				ethers.BigNumber,
				ethers.BigNumber
			][];

			const waitingPeriods = waitingPeriodsRaw.map((period) => Number(period));

			const fees = feesRaw.map(([rebate, reclaim, noOfTrades]) => ({
				fee: wei(ethers.utils.formatEther(rebate.sub(reclaim))),
				noOfTrades: Number(noOfTrades.toString()),
			}));

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
