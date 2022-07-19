import Connector from 'containers/Connector';
import { Contract } from 'ethers';
import { useMemo } from 'react';

import MarginBaseAbi from 'lib/abis/MarginBase.json';
import { useRecoilValue } from 'recoil';
import { futuresAccountState } from 'store/futures';
import { CROSS_MARGIN_ACCOUNT_FACTORY } from 'constants/address';
import crossMarginAccountFactory from 'lib/abis/CrossMarginAccountFactory.json';

export default function useCrossMarginAccountContracts(): {
	crossMarginAccountContract: Contract | null;
	crossMarginContractFactory: Contract | null;
} {
	const futuresAccount = useRecoilValue(futuresAccountState);

	const { signer, network } = Connector.useContainer();

	const crossMarginAccountContract = useMemo(() => {
		if (!signer || !futuresAccount?.crossMarginAddress) return null;
		return new Contract(futuresAccount.crossMarginAddress, MarginBaseAbi, signer);
	}, [futuresAccount?.crossMarginAddress, signer]);

	const crossMarginContractFactory = useMemo(() => {
		const address = CROSS_MARGIN_ACCOUNT_FACTORY[network.id];
		if (!signer || !address) return null;

		return new Contract(address, crossMarginAccountFactory, signer);
	}, [network, signer]);

	return { crossMarginAccountContract, crossMarginContractFactory };
}
