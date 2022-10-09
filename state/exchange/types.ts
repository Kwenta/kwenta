import { DeprecatedSynthBalance } from '@synthetixio/queries';
import Wei from '@synthetixio/wei';
import { BigNumber } from 'ethers';

import { SwapRatio } from 'hooks/useExchange';

export type ExchangeState = {
	baseCurrencyKey?: string;
	quoteCurrencyKey?: string;
	txProvider?: 'synthetix' | '1inch' | 'synthswap';
	baseAmount: string;
	quoteAmount: string;
	ratio?: SwapRatio;
	quoteBalance?: Wei | null;
	baseBalance?: Wei | null;
	transactionFee?: Wei | null;
	feeCost?: Wei;
	slippagePercent?: Wei | null;
	isSubmitting: boolean;
	isApproving: boolean;
	needsApproval: boolean;
	quotePriceRate?: Wei;
	basePriceRate?: Wei;
	baseFeeRate?: Wei;
	exchangeFeeRate?: BigNumber;
	rate?: Wei;
	numEntries: number;
	redeemableSynthBalances: DeprecatedSynthBalance[];
	totalRedeemableBalance: Wei;
	estimatedBaseTradePrice: Wei;
};
