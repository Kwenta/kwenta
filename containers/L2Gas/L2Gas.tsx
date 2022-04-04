import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import { useRecoilValue } from 'recoil';
import Connector from 'containers/Connector';
import { walletAddressState } from 'store/wallet';
import { wei } from '@synthetixio/wei';

const MakeContainer = () => {
	const { provider } = Connector.useContainer();
	const address = useRecoilValue(walletAddressState);

	const [balance, setBalance] = useState(wei(0));

	const hasNoBalance = balance.eq(0);

	useEffect(() => {
		if (!address) return;

		let isMounted = true;
		const unsubs = [
			() => {
				isMounted = false;
			},
		];

		const loadBalance = async () => {
			try {
				const balance = await provider?.getBalance(address);
				if (isMounted && balance !== undefined) setBalance(wei(balance.toString()).div(1e18));
			} catch (e) {
				console.error(e);
			}
		};

		loadBalance();

		return () => {
			unsubs.forEach((unsub) => unsub());
		};
	}, [address, provider]);

	return {
		gas: balance,
		hasNone: hasNoBalance,
	};
};

const Container = createContainer(MakeContainer);

export default Container;
