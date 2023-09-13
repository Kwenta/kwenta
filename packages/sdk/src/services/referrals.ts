import { formatBytes32String } from '@ethersproject/strings'
import KwentaSDK from '..'
import * as sdkErrors from '../common/errors'
import { getReferralStatisticsByAccount, getReferralsGqlEndpoint } from '../utils/referrals'
import {
	queryBoostNftTierByHolder,
	queryCodesByReferrer,
	queryReferrerByCode,
} from '../queries/referrals'

export default class ReferralsService {
	private sdk: KwentaSDK

	constructor(sdk: KwentaSDK) {
		this.sdk = sdk
	}

	get referralsGqlEndpoint() {
		const { networkId } = this.sdk.context
		return getReferralsGqlEndpoint(networkId)
	}

	/**
	 * Mint a Boost NFT using the given code.
	 * @param code - The referral code.
	 * @returns ethers.js TransactionResponse object
	 */
	public mintBoostNft(code: string) {
		if (!this.sdk.context.contracts.BoostNft) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		return this.sdk.transactions.createContractTxn(this.sdk.context.contracts.BoostNft, 'mint', [
			formatBytes32String(code),
		])
	}

	/**
	 * Register a new referral code.
	 * @param code - The referral code to register.
	 * @returns ethers.js TransactionResponse object
	 */
	public registerReferralCode(code: string) {
		if (!this.sdk.context.contracts.BoostNft) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		return this.sdk.transactions.createContractTxn(
			this.sdk.context.contracts.BoostNft,
			'registerCode',
			[formatBytes32String(code)]
		)
	}

	/**
	 * Fetches the referral score by a given account.
	 * @param account - The account of the referral code creator.
	 * @returns The referral score of the account.
	 */
	public getReferralScoreByReferrer(account: string) {
		if (!this.sdk.context.contracts.BoostNft) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		return this.sdk.context.contracts.BoostNft.getReferralScore(account)
	}

	/**
	 * Fetch the tier of a boost NFT determined by the issuer's referral score.
	 * @param account - The account of the boost NFT issuer.
	 * @returns The tier level of the boost NFT.
	 */
	public async getReferralNftTierByReferrer(account: string) {
		if (!this.sdk.context.contracts.BoostNft) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}
		try {
			const score = await this.getReferralScoreByReferrer(account)
			const tier = await this.sdk.context.contracts.BoostNft.getTierFromReferralScore(score)
			return tier.toNumber()
		} catch (err) {
			this.sdk.context.logError(err)
			throw err
		}
	}

	/**
	 * Retrieve the tier level associated with a given referral code.
	 * @param code - The referral code.
	 * @returns The tier level of the referral code, or -1 if the code is invalid.
	 */
	public async getTierByReferralCode(code: string) {
		if (!this.sdk.context.contracts.BoostNft) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		try {
			const account = await this.getReferrerByCode(code)
			if (!account) {
				return -1
			}
			return this.getReferralNftTierByReferrer(account)
		} catch (err) {
			this.sdk.context.logError(err)
			throw err
		}
	}

	/**
	 * Check whether a Boost NFT has been minted by a given account.
	 * @param account - The account to check.
	 * @returns Boolean indicating whether the NFT has been minted.
	 */
	public checkNftMintedForAccount(account: string) {
		if (!this.sdk.context.contracts.BoostNft) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}
		return this.sdk.context.contracts.BoostNft.hasMinted(account)
	}

	/**
	 * Retrieve the owner's address associated with a given referral code.
	 * @param code - The referral code.
	 * @returns The code owner's address, or null if the code is not found.
	 */
	public getReferrerByCode(code: string) {
		if (!this.sdk.context.contracts.BoostNft) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		return queryReferrerByCode(this.sdk, code)
	}

	/**
	 * Fetch the tier of a Boost NFT by the owner's account.
	 * @param account - The account of the Boost NFT owner.
	 * @returns The tier level of a Boost NFT.
	 */
	public getBoostNftTierByHolder(account: string) {
		if (!this.sdk.context.contracts.BoostNft) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		return queryBoostNftTierByHolder(this.sdk, account)
	}

	/**
	 * Retrieve all the referral codes created by a given referrer.
	 * @param account - The account of the referrer.
	 * @returns All the referral codes created by the referrer.
	 */
	public getCodesByReferrer(account: string) {
		if (!this.sdk.context.contracts.BoostNft) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		return queryCodesByReferrer(this.sdk, account)
	}

	/**
	 * Retrieve the cumulative statistics for a given referrer.
	 * @param account - The account of the referrer.
	 * @returns Object containing total referrerd account and total referral volumes per code
	 */
	public getCumulativeStatsByReferrer(account: string) {
		if (!this.sdk.context.contracts.BoostNft) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}
		return getReferralStatisticsByAccount(this.sdk, account)
	}
}
