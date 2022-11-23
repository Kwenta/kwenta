import Wei from '@synthetixio/wei';

import { FuturesAccountType, FuturesPosition } from 'queries/futures/types';
import { FuturesMarketSerialized } from 'sdk/types/futures';
import { PositionSide } from 'sections/futures/types';
import { FetchStatus } from 'state/types';
import { FuturesMarketAsset, FuturesMarketKey } from 'utils/futures';

export type IsolatedMarginOrderType = 'next price' | 'market';
export type CrossMarginOrderType = 'market' | 'stop market' | 'limit';

export type CrossMarginTradeInputs = {
	leverage: string;
	nativeSizeDelta: string;
	susdSizeDelta: string;
	orderPrice?: string | undefined;
};

export type IsolatedMarginTradeInputs = {
	nativeSizeDelta: string;
	susdSizeDelta: string;
};

export type FundingRateSerialized = {
	asset: FuturesMarketKey;
	fundingTitle: string;
	fundingRate: string | null;
};

export type FundingRate = {
	asset: FuturesMarketKey;
	fundingTitle: string;
	fundingRate: Wei | null;
};

export type FuturesState = {
	selectedType: FuturesAccountType;
	confirmationModalOpen: boolean;
	isolatedMargin: IsolatedMarginState;
	crossMargin: CrossMarginState;
	marketsQueryStatus: FetchStatus;
	markets: FuturesMarketSerialized[];
	fundingRates: FundingRateSerialized[];
	marketInfo?: FuturesMarketSerialized;
};

export type CrossMarginState = {
	tradeInputs: CrossMarginTradeInputs;
	orderType: CrossMarginOrderType;
	selectedLeverage: string;
	leverageSide: PositionSide;
	marketAsset: FuturesMarketAsset;
	showCrossMarginOnboard: boolean;
	position?: FuturesPosition<string>;
	accountOverview: {
		freeMargin: string;
		keeperEthBal: string;
		allowance: string;
	};
};

export type IsolatedMarginState = {
	transferAmount: string;
	tradeInputs: IsolatedMarginTradeInputs;
	orderType: IsolatedMarginOrderType;
	selectedLeverage: string;
	leverageSide: PositionSide;
	marketAsset: FuturesMarketAsset;
	position?: FuturesPosition<string>;
};
