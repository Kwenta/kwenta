import { useQuery } from 'react-query';
import { useRecoilValue } from 'recoil';
import Connector from 'containers/Connector';
import { ethers } from 'ethers';
import { Provider, Contract } from 'ethcall';

import { CurrencyKey, Synths } from 'constants/currency';
import { appReadyState } from 'store/app';

const ethCallProvider = new Provider();

const useGetShortableSynths = (isL2: boolean) => {
	const isAppReady = useRecoilValue(appReadyState);
	const { synthetixjs, network, provider } = Connector.useContainer();


	return useQuery(
		[ 'getShortableSynths', network.id ],
		async () => {
			if (isL2) {

				await ethCallProvider.init(provider as any);
				const {
					contracts: { CollateralManager },
					sources,
				} = synthetixjs!;

				const CM = new Contract(CollateralManager.address, sources.CollateralManager.abi as any);

				const getShortableCalls = [];
				const shortableSynthsList = [];


				for(const synth in Synths) {
					shortableSynthsList.push(synth);
					getShortableCalls.push(CM.shortableSynthsByKey(ethers.utils.formatBytes32String(synth)));
				}

				const shortableListRaw = (await ethCallProvider.all(getShortableCalls, {})) as ethers.BigNumber[];
				console.log("shortableListRaw:", shortableListRaw);
				const shortableList = shortableListRaw.map((retval) => Number(retval));

				const SYNTHS_TO_SHORT : CurrencyKey[] = [];
				// for (let i = 0; i < shortableList.length; i++) {
				// 	if(shortableList[i] > 0) {
				// 		SYNTHS_TO_SHORT.push(shortableSynthsList[i] as CurrencyKey)
				// 	}
				// }
				console.log("SYNTHS_TO_SHORT:", SYNTHS_TO_SHORT)
	
				return SYNTHS_TO_SHORT as CurrencyKey[];
			} else {
				return [Synths.sBTC, Synths.sETH, Synths.sLINK] as CurrencyKey[];
			}
		},
		{
			// enabled: isAppReady && !!synthetixjs,
		}
	);
};

export default useGetShortableSynths;
