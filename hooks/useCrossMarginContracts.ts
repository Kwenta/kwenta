import { NetworkId } from '@synthetixio/contracts-interface';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { useNetwork, useSigner } from 'wagmi';

import { CROSS_MARGIN_ACCOUNT_FACTORY } from 'constants/address';
import {
	CrossMarginAccountFactory__factory,
	CrossMarginBase__factory,
	CrossMarginAccountFactory,
	CrossMarginBase,
} from 'lib/abis/types';
import { futuresAccountState } from 'store/futures';

export default function useCrossMarginContracts(): {
	crossMarginAccountContract: CrossMarginBase | null;
	crossMarginContractFactory: CrossMarginAccountFactory | null;
} {
	const futuresAccount = useRecoilValue(futuresAccountState);

	const { data: signer } = useSigner();
	const { chain: network } = useNetwork();

	const crossMarginAccountContract = useMemo(() => {
		if (!signer || !futuresAccount?.crossMarginAddress) return null;

		return CrossMarginBase__factory.connect(futuresAccount.crossMarginAddress, signer);
	}, [futuresAccount?.crossMarginAddress, signer]);

	const crossMarginContractFactory = useMemo(() => {
		const address = CROSS_MARGIN_ACCOUNT_FACTORY[network?.id as NetworkId];
		if (!signer || !address) return null;

		return CrossMarginAccountFactory__factory.connect(address, signer);
	}, [network, signer]);

	return { crossMarginAccountContract, crossMarginContractFactory };
}
