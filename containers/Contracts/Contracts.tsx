import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import initSnxJS from '@synthetixio/js';

import { networkIdState } from 'store/connection';
import Connector from 'containers/Connector';
import { ethers } from 'ethers';

import synthSummaryUtilContract from './contracts/synthSummaryUtilContract';
import { synthsMapState, SynthDefinitionMap } from 'store/synths';
import keyBy from 'lodash/keyBy';

const useContracts = () => {
	const { signer, provider } = Connector.useContainer();
	const networkId = useRecoilValue(networkIdState);
	const [snxJS, setSnxJS] = useState<ReturnType<typeof initSnxJS> | null>(null);
	const [synthSummaryUtil, setSynthSummaryUtil] = useState<ethers.Contract | null>(null);
	const setSynthsMap = useSetRecoilState(synthsMapState);

	useEffect(() => {
		const snxJSLib = initSnxJS({ networkId, signer: signer || undefined });
		setSynthsMap(keyBy(snxJSLib.synths, 'name') as SynthDefinitionMap);

		setSnxJS(snxJSLib);
		setSynthSummaryUtil(
			new ethers.Contract(
				synthSummaryUtilContract.addresses[networkId],
				synthSummaryUtilContract.abi,
				provider
			)
		);
	}, [signer, networkId, provider, setSynthsMap]);

	return {
		snxJS,
		synthSummaryUtil,
	};
};

const Contracts = createContainer(useContracts);

export default Contracts;
