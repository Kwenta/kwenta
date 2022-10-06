import Wei from '@synthetixio/wei';

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
	slippagePercent?: Wei | null;
	isSubmitting: boolean;
	isApproving: boolean;
};
