import { EventEmitter } from 'events'

import { Provider as EthCallProvider } from 'ethcall'
import { ethers } from 'ethers'

import * as sdkErrors from './common/errors'
import {
	ContractsMap,
	MulticallContractsMap,
	getContractsByNetwork,
	getMulticallContractsByNetwork,
} from './contracts'
import { NetworkId } from './types/common'

export interface IContext {
	provider: ethers.providers.Provider
	networkId: NetworkId
	signer?: ethers.Signer
	walletAddress?: string
	logError?: (err: Error, skipReport?: boolean) => void
}

const DEFAULT_CONTEXT: Partial<IContext> = {
	networkId: 10,
}

export default class Context implements IContext {
	private context: IContext
	public multicallProvider: EthCallProvider
	public contracts: ContractsMap
	public multicallContracts: MulticallContractsMap
	public events = new EventEmitter().setMaxListeners(100)
	public l1MainnetProvider: ethers.providers.Provider

	constructor(context: IContext) {
		this.context = { ...DEFAULT_CONTEXT, ...context }

		this.multicallProvider = new EthCallProvider(context.networkId, context.provider)

		if (context.signer) {
			this.setSigner(context.signer)
		}

		this.contracts = getContractsByNetwork(context.networkId, context.provider)
		this.multicallContracts = getMulticallContractsByNetwork(context.networkId)
		this.l1MainnetProvider = new ethers.providers.InfuraProvider()
	}

	get networkId() {
		return this.context.networkId ?? 10
	}

	get provider() {
		return this.context.provider
	}

	get signer() {
		if (!this.context.signer) {
			throw new Error(sdkErrors.NO_SIGNER)
		}

		return this.context.signer
	}

	get walletAddress() {
		if (!this.context.walletAddress) {
			throw new Error(sdkErrors.NO_SIGNER)
		}

		return this.context.walletAddress
	}

	get isL2() {
		return [10, 420].includes(this.networkId)
	}

	get isMainnet() {
		return [1, 10].includes(this.networkId)
	}

	public async setProvider(provider: ethers.providers.Provider) {
		this.context.provider = provider
		const networkId = (await provider.getNetwork()).chainId as NetworkId
		this.multicallProvider = new EthCallProvider(networkId, provider)

		this.setNetworkId(networkId)

		return networkId
	}

	public setNetworkId(networkId: NetworkId) {
		this.context.networkId = networkId
		this.contracts = getContractsByNetwork(networkId, this.provider)
		this.multicallContracts = getMulticallContractsByNetwork(networkId)
		this.events.emit('network_changed', { networkId: networkId })
	}

	public async setSigner(signer: ethers.Signer) {
		this.context.walletAddress = await signer.getAddress()
		this.context.signer = signer
	}

	public logError(err: Error, skipReport = false) {
		return this.context.logError?.(err, skipReport)
	}
}
