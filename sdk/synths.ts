import { getSynthBalances } from './common/balances';
import { ContractMap, getContractsByNetwork } from './contracts';

export default class SynthsService {
	private contracts: ReturnType<typeof getContractsByNetwork>;

	constructor(contracts: ContractMap) {
		this.contracts = contracts;
	}

	public async getSynthBalances(walletAddress: string) {
		return getSynthBalances(walletAddress, this.contracts);
	}
}
