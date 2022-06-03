import Connector from 'containers/Connector';
import { Contract } from 'ethers';
import { useEffect, useState } from 'react';
import { ENS_REVERSE_LOOKUP } from 'constants/address';
import reverseRecordsAbi from 'lib/abis/ReverseRecords.json';

const ADDRESSES_PER_LOOKUP = 1500;

const useENSs = (addresses: string[]): string[] => {
	const [ensInfo, setEnsInfo] = useState<string[]>(addresses);
	const { staticMainnetProvider } = Connector.useContainer();

	useEffect(() => {
		const ReverseLookup = new Contract(
			ENS_REVERSE_LOOKUP,
			reverseRecordsAbi,
			staticMainnetProvider
		);

		(async () => {
			if (addresses.length > 0) {
				let ensPromises = [];
				for (let i = 0; i < addresses.length; i += ADDRESSES_PER_LOOKUP) {
					const addressesToLookup = addresses.slice(i, i + ADDRESSES_PER_LOOKUP);
					const ensNamesPromise = ReverseLookup.getNames(addressesToLookup);
					ensPromises.push(ensNamesPromise);
				}

				const ensPromiseResult = await Promise.all(ensPromises);
				const newEnsInfo = ensPromiseResult.flat(1).map((val: string, ind: number) => {
					return val !== '' ? val : addresses[ind];
				});
				setEnsInfo(newEnsInfo);
			}
		})();
	}, [addresses, staticMainnetProvider]);

	return ensInfo;
};

export default useENSs;
