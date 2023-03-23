import request, { gql } from 'graphql-request';
import KwentaSDK from 'sdk';

export const queryPriceAdjustmentData = async (sdk: KwentaSDK, walletAddress: string) => {
	const response = await request(
		'',
		gql`
			query priceAdjustmentFee($walletAddress: String!) {
				exchangeEntrySettleds(where: { from: $walletAddress }) {
					rebate
					reclaim
				}
			}
		`,
		{ walletAddress }
	);

	return response?.exchangeEntrySettleds[0];
};
