import { wei } from '@synthetixio/wei';

import { PositionSide } from 'sections/futures/types';
import { calculateMarginDelta, FuturesMarketAsset, FuturesMarketKey } from 'utils/futures';

const ETH_PRICE = 1500;

const getPosition = (initialSize: number = 1, leverage = 10, side = 'long') => ({
	marketKey: 'sETH' as FuturesMarketKey,
	asset: 'sETH' as FuturesMarketAsset,
	order: null,
	remainingMargin: wei((initialSize * ETH_PRICE) / leverage),
	accessibleMargin: wei(250),
	position: {
		canLiquidatePosition: false,
		side: side as PositionSide,
		notionalValue: wei(initialSize * ETH_PRICE),
		accruedFunding: wei(1),
		initialMargin: wei(initialSize * ETH_PRICE * leverage),
		profitLoss: wei(10),
		fundingIndex: 100,
		lastPrice: wei(ETH_PRICE),
		size: wei(initialSize),
		liquidationPrice: wei(ETH_PRICE * 0.6),
		initialLeverage: wei(leverage),
		leverage: wei(leverage),
		pnl: wei(10),
		pnlPct: wei(10),
		marginRatio: wei(0.2),
	},
});

const getFees = (overrides: Record<string, any> = {}) => ({
	staticFee: wei(0.01),
	dynamicFeeRate: wei(0.01),
	crossMarginFee: wei(5),
	keeperEthDeposit: wei(0.01),
	limitStopOrderFee: wei(5),
	total: wei(10),
	...overrides,
});

const getTrade = (sizeDelta: number = 1, leverage = 10) => ({
	nativeSize: Math.abs(sizeDelta).toString(),
	susdSize: (Math.abs(sizeDelta) * ETH_PRICE).toString(),
	leverage: wei(leverage),
	nativeSizeDelta: wei(sizeDelta),
	susdSizeDelta: wei(sizeDelta * ETH_PRICE),
	price: wei(ETH_PRICE),
});

describe('futures utils', () => {
	test('calculates correct margin when increasing long', () => {
		const position = getPosition(1, 10);
		const trade = getTrade(0.2);
		const fees = getFees();
		const marginDelta = calculateMarginDelta(trade, fees, position);
		expect(marginDelta.toNumber()).toEqual(40);
	});

	test('calculates correct margin when decreasing long', () => {
		const position = getPosition(1, 10);
		const trade = getTrade(-0.5);
		const fees = getFees();
		const marginDelta = calculateMarginDelta(trade, fees, position);
		expect(marginDelta.toNumber()).toEqual(-65);
	});

	test('calculates correct margin when increasing short', () => {
		const position = getPosition(1, 10, 'short');
		const trade = getTrade(-0.2);
		const fees = getFees();
		const marginDelta = calculateMarginDelta(trade, fees, position);
		expect(marginDelta.toNumber()).toEqual(40);
	});

	test('calculates correct margin when decreasing short', () => {
		const position = getPosition(1, 10, 'short');
		const trade = getTrade(0.5);
		const fees = getFees();
		const marginDelta = calculateMarginDelta(trade, fees, position);
		expect(marginDelta.toNumber()).toEqual(-65);
	});
});
