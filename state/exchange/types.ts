import { DeprecatedSynthBalance } from '@synthetixio/queries';

import { SwapRatio } from 'hooks/useExchange';

export type ExchangeState = {
	baseCurrencyKey?: string;
	quoteCurrencyKey?: string;
	txProvider?: 'synthetix' | '1inch' | 'synthswap';
	baseAmount: string;
	quoteAmount: string;
	ratio?: SwapRatio;
	quoteBalance?: string | null;
	baseBalance?: string | null;
	transactionFee?: string | null;
	feeCost?: string;
	slippagePercent?: string | null;
	isSubmitting: boolean;
	isApproving: boolean;
	needsApproval: boolean;
	quotePriceRate?: string;
	basePriceRate?: string;
	baseFeeRate?: string;
	exchangeFeeRate?: string;
	rate?: string;
	numEntries: number;
	redeemableSynthBalances: DeprecatedSynthBalance[];
	totalRedeemableBalance?: string;
	estimatedBaseTradePrice?: string;
};
