import { FuturesAccountType, FuturesOrderType } from 'queries/futures/types';
import { PositionSide } from 'sections/futures/types';
import { FuturesMarketAsset } from 'utils/futures';

export type FuturesState = {
	marketAsset: FuturesMarketAsset;
	leverageSide: PositionSide;
	orderType: FuturesOrderType;
	futuresAccountType: FuturesAccountType;
	showCrossMarginOnboard: boolean;
	confirmationModalOpen: boolean;
};
