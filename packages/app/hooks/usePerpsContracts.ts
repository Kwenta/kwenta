import { useMemo } from 'react';

import Connector from 'containers/Connector';
import { PerpsV2Market, PerpsV2Market__factory } from 'sdk/src/contracts/types';
import { selectMarketInfo } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';

export default function usePerpsContracts(): {
	perpsMarketContract: PerpsV2Market | null;
} {
	const { signer } = Connector.useContainer();
	const marketInfo = useAppSelector(selectMarketInfo);

	const perpsMarketContract = useMemo(() => {
		if (!signer || !marketInfo?.market) return null;

		return PerpsV2Market__factory.connect(marketInfo.market, signer);
	}, [signer, marketInfo?.market]);

	return { perpsMarketContract };
}
