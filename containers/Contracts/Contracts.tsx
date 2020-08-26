import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import { useRecoilValue } from 'recoil';
import initSnxJS from '@synthetixio/js';

import { networkIdState } from 'store/connection';
import Connector from 'containers/Connector';
import { ethers } from 'ethers';

import synthSummaryUtilContract from './contracts/synthSummaryUtilContract';

const useContracts = () => {
	const { signer, provider } = Connector.useContainer();
	const networkId = useRecoilValue(networkIdState);
	const [snxJS, setSnxJS] = useState<ReturnType<typeof initSnxJS> | null>(null);
	const [synthSummaryUtil, setSynthSummaryUtil] = useState<ethers.Contract | null>(null);

	useEffect(() => {
		setSnxJS(initSnxJS({ networkId, signer: signer || undefined }));

		setSynthSummaryUtil(
			new ethers.Contract(
				synthSummaryUtilContract.addresses[networkId],
				synthSummaryUtilContract.abi,
				provider
			)
		);
	}, [signer, networkId, provider]);

	return {
		snxJS,
		synthSummaryUtil,
	};
};

const Contracts = createContainer(useContracts);

export default Contracts;
