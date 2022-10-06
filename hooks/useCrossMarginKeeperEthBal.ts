import { wei } from '@synthetixio/wei';
import { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import Connector from 'containers/Connector';
import { futuresAccountState } from 'store/futures';
import { zeroBN } from 'utils/formatters/number';

export default function useCrossMarginKeeperEthBal() {
	const { provider } = Connector.useContainer();

	const { crossMarginAddress } = useRecoilValue(futuresAccountState);

	const [keeperEthBal, setKeeperEthBal] = useState(zeroBN);

	const getKeeperEthBal = useCallback(async () => {
		if (!crossMarginAddress) return zeroBN;
		const bal = await provider.getBalance(crossMarginAddress);
		setKeeperEthBal(wei(bal));
	}, [crossMarginAddress, provider]);

	useEffect(() => {
		getKeeperEthBal();
	}, [getKeeperEthBal]);

	return { keeperEthBal, getKeeperEthBal };
}
