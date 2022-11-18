import {
	FuturesAccountType,
	FuturesMarket,
	FuturesOrderType,
	FuturesPosition,
} from 'queries/futures/types';
import { PositionSide } from 'sections/futures/types';
import { FuturesMarketAsset } from 'utils/futures';

export type FuturesState = {
	marketAsset: FuturesMarketAsset;
	leverageSide: PositionSide;
	orderType: FuturesOrderType;
	futuresAccountType: FuturesAccountType;
	showCrossMarginOnboard: boolean;
	confirmationModalOpen: boolean;
	position?: FuturesPosition<string>;
	marketInfo?: FuturesMarket<string>;
	crossMarginAccountOverview: {
		freeMargin: string;
		keeperEthBal: string;
		allowance: string;
	};
	futuresMarkets: FuturesMarket<string>[];
};
