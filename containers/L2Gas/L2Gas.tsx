import { useState, useEffect, useMemo } from 'react';
import { createContainer } from 'unstated-next';
import { useRecoilValue } from 'recoil';
import Connector from 'containers/Connector';
import { networkState, isL2State, walletAddressState } from 'store/wallet';
import { makeContract as makeL2ovmETHContract } from 'contracts/L2OVMETH';
import { wei } from '@synthetixio/wei';

const MakeContainer = () => {
	const { provider } = Connector.useContainer();
	const isL2 = useRecoilValue(isL2State);
	const address = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);

	const [balance, setBalance] = useState(wei(0));

	const ovmETHContract = useMemo(() => {
		const networkName = network!?.name;
		if (!(isL2 && networkName && networkName !== 'kovan-ovm' && provider)) {
			return null;
		}
		return makeL2ovmETHContract(networkName, provider)!;
	}, [isL2, network, provider]);

	const hasNoBalance = useMemo(() => !!ovmETHContract && balance.eq(0), [ovmETHContract, balance]);

	useEffect(() => {
		if (!(ovmETHContract && address)) return;

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

		// Need to find a way to track the connected wallet's ETH transfers
		// Optimism's OVM_ETH contract does not track transfers of L2 ETH
		const subscribe = () => {
			const transferEvent = ovmETHContract.filters.Transfer();
			const onBalanceChange = (from: string, to: string) => {
				if (from === address || to === address) loadBalance();
			};
			ovmETHContract.on(transferEvent, onBalanceChange);
			unsubs.push(() => {
				ovmETHContract.off(transferEvent, onBalanceChange);
			});
		};

		loadBalance();
		subscribe();

		return () => {
			unsubs.forEach((unsub) => unsub());
		};
	}, [ovmETHContract, address, provider]);

	return {
		gas: balance,
		hasNone: hasNoBalance,
	};
};

const Container = createContainer(MakeContainer);

export default Container;
