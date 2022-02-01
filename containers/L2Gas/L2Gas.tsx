import { useState, useEffect, useMemo } from 'react';
import { createContainer } from 'unstated-next';
import { useRecoilValue } from 'recoil';
import Connector from 'containers/Connector';
import { networkState, isL2State, walletAddressState } from 'store/wallet';
import { makeContract as makeL2WETHContract } from 'contracts/L2WETH';
import { wei } from '@synthetixio/wei';

const MakeContainer = () => {
	const { provider } = Connector.useContainer();
	const isL2 = useRecoilValue(isL2State);
	const address = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);

	const [balance, setBalance] = useState(wei(0));

	const wETHContract = useMemo(() => {
		const networkName = network!?.name;
		if (!(isL2 && networkName && networkName !== 'kovan-ovm' && provider)) {
			return null;
		}
		return makeL2WETHContract(networkName, provider)!;
	}, [isL2, network, provider]);

	const hasNoBalance = useMemo(() => !!wETHContract && balance.eq(0), [wETHContract, balance]);

	useEffect(() => {
		if (!(wETHContract && address)) return;

		let isMounted = true;
		const unsubs = [
			() => {
				isMounted = false;
			},
		];

		const loadBalance = async () => {
			try {
				const balance = await wETHContract.balanceOf(address);
				if (isMounted) setBalance(wei(balance.toString()).div(1e18));
			} catch (e) {
				console.error(e);
			}
		};

		const subscribe = () => {
			const transferEvent = wETHContract.filters.Transfer();
			const onBalanceChange = async (from: string, to: string) => {
				if (from === address || to === address) {
					if (isMounted) setBalance(await wETHContract.balanceOf(address));
				}
			};

			wETHContract.on(transferEvent, onBalanceChange);
			unsubs.push(() => {
				wETHContract.off(transferEvent, onBalanceChange);
			});
		};

		loadBalance();
		subscribe();
		return () => {
			unsubs.forEach((unsub) => unsub());
		};
	}, [wETHContract, address]);

	return {
		gas: balance,
		hasNone: hasNoBalance,
	};
};

const Container = createContainer(MakeContainer);

export default Container;
