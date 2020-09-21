import { useEffect, useState } from 'react';
import { createContainer } from 'unstated-next';
import oneSplitAuditContract from 'lib/contracts/oneSplitAuditContract';
import Connector from 'containers/Connector';
import ethers, { Contract } from 'ethers';
import { useRecoilValue } from 'recoil';
import { appReadyState } from 'store/app';
import { NetworkId } from '@synthetixio/js';

const sUSDTokenAddress = '0x57ab1ec28d129707052df4df418d58a2d46d5f51';
const ethTokenAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

const useOneInch = () => {
	const [oneInchContract, setOneInchContract] = useState<Contract | null>(null);
	const isAppReady = useRecoilValue(appReadyState);
	const { signer } = Connector.useContainer();

	useEffect(() => {
		if (signer) {
			const contract = new ethers.Contract(
				oneSplitAuditContract.addresses[NetworkId.Mainnet],
				oneSplitAuditContract.abi,
				signer
			);
			setOneInchContract(contract);
		}
	}, [isAppReady, signer]);

	const swap = async (amount: string) => {
		try {
			if (oneInchContract) {
				const amountBN = ethers.utils.parseEther(amount);
				const swapRates = await oneInchContract.functions.getExpectedReturn(
					ethTokenAddress,
					sUSDTokenAddress,
					amountBN,
					100,
					0
				);
				const tx = oneInchContract.functions.swap(
					ethTokenAddress,
					sUSDTokenAddress,
					amountBN,
					swapRates.returnAmount,
					swapRates.distribution,
					0,
					{
						value: amountBN,
					}
				);
				return tx;
			}
		} catch (e) {
			console.log(e);
		}
	};

	return {
		swap,
	};
};

const OneInch = createContainer(useOneInch);

export default OneInch;
