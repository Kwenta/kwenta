import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NetworkId } from '@synthetixio/contracts-interface';

import { DEFAULT_FUTURES_MARGIN_TYPE } from 'constants/defaults';
import { ORDER_PREVIEW_ERRORS } from 'queries/futures/constants';
import {
	FuturesMarket,
	FuturesMarketKey,
	FuturesPotentialTradeDetails,
	PositionSide,
} from 'sdk/types/futures';
import {
	DEFAULT_MAP_BY_NETWORK,
	DEFAULT_QUERY_STATUS,
	LOADING_STATUS,
	SUCCESS_STATUS,
	ZERO_CM_FEES,
	ZERO_STATE_CM_ACCOUNT,
	ZERO_STATE_CM_TRADE_INPUTS,
	ZERO_STATE_TRADE_INPUTS,
} from 'state/constants';
import { accountType } from 'state/helpers';
import { FetchStatus } from 'state/types';
import { FuturesMarketAsset, MarketKeyByAsset } from 'utils/futures';

import {
	fetchCrossMarginBalanceInfo,
	fetchCrossMarginPositions,
	fetchIsolatedMarginPositions,
	fetchMarkets,
	fetchDailyVolumes,
	refetchPosition,
	fetchCrossMarginOpenOrders,
	fetchCrossMarginSettings,
	fetchIsolatedMarginTradePreview,
	fetchCrossMarginTradePreview,
	fetchKeeperEthBalance,
	fetchCrossMarginAccount,
	fetchPreviousDayRates,
	fetchFuturesPositionHistory,
	fetchPositionHistoryForTrader,
	fetchFundingRates,
	fetchTradesForSelectedMarket,
	fetchAllTradesForAccount,
} from './actions';
import {
	CrossMarginState,
	CrossMarginTradeFees,
	CrossMarginTradeInputs,
	FundingRate,
	FuturesState,
	InputCurrencyDenomination,
	IsolatedMarginTradeInputs,
	TransactionEstimationPayload,
	TransactionEstimations,
} from './types';

const initialState: FuturesState = {
	selectedType: DEFAULT_FUTURES_MARGIN_TYPE,
	confirmationModalOpen: false,
	fundingRates: [],
	markets: [],
	dailyMarketVolumes: {},
	errors: {},
	dynamicFeeRate: '0',
	previousDayRates: [],
	selectedInputDenomination: 'usd',
	leaderboard: {
		selectedTrader: undefined,
		selectedTraderPositionHistory: DEFAULT_MAP_BY_NETWORK,
	},
	queryStatuses: {
		markets: DEFAULT_QUERY_STATUS,
		crossMarginBalanceInfo: DEFAULT_QUERY_STATUS,
		dailyVolumes: DEFAULT_QUERY_STATUS,
		crossMarginPositions: DEFAULT_QUERY_STATUS,
		isolatedPositions: DEFAULT_QUERY_STATUS,
		openOrders: DEFAULT_QUERY_STATUS,
		crossMarginSettings: DEFAULT_QUERY_STATUS,
		isolatedTradePreview: DEFAULT_QUERY_STATUS,
		crossMarginTradePreview: DEFAULT_QUERY_STATUS,
		crossMarginAccount: DEFAULT_QUERY_STATUS,
		previousDayRates: DEFAULT_QUERY_STATUS,
		positionHistory: DEFAULT_QUERY_STATUS,
		selectedTraderPositionHistory: DEFAULT_QUERY_STATUS,
		fetchFundingRates: DEFAULT_QUERY_STATUS,
		trades: DEFAULT_QUERY_STATUS,
	},
	transactionEstimations: {} as TransactionEstimations,
	crossMargin: {
		accounts: DEFAULT_MAP_BY_NETWORK,
		selectedMarketAsset: FuturesMarketAsset.sETH,
		selectedMarketKey: FuturesMarketKey.sETH,
		leverageSide: PositionSide.LONG,
		orderType: 'market',
		orderFeeCap: '0',
		selectedLeverageByAsset: {},
		showCrossMarginOnboard: false,
		tradeInputs: ZERO_STATE_CM_TRADE_INPUTS,
		fees: ZERO_CM_FEES,
		tradePreview: null,
		marginDelta: '0',
		cancellingOrder: undefined,
		depositApproved: false,
		showOnboard: false,
		orderPrice: {
			price: undefined,
			invalidLabel: undefined,
		},
		settings: {
			tradeFee: '0',
			limitOrderFee: '0',
			stopOrderFee: '0',
		},
	},
	isolatedMargin: {
		selectedMarketAsset: FuturesMarketAsset.sETH,
		selectedMarketKey: FuturesMarketKey.sETH,
		leverageSide: PositionSide.LONG,
		orderType: 'market',
		tradePreview: null,
		tradeInputs: ZERO_STATE_TRADE_INPUTS,
		positions: {},
		openOrders: {},
		trades: {},
		positionHistory: {},
		tradeFee: '0',
		leverageInput: '0',
	},
};

const futuresSlice = createSlice({
	name: 'futures',
	initialState,
	reducers: {
		setMarketAsset: (state, action) => {
			state[accountType(state.selectedType)].selectedMarketAsset = action.payload;
			state[accountType(state.selectedType)].selectedMarketKey =
				MarketKeyByAsset[action.payload as FuturesMarketAsset];
			if (state.selectedType === 'cross_margin') {
				state.crossMargin.selectedMarketAsset = action.payload;
				state.crossMargin.tradeInputs = ZERO_STATE_CM_TRADE_INPUTS;
			} else {
				state.isolatedMargin.selectedMarketAsset = action.payload;
				state.isolatedMargin.tradeInputs = ZERO_STATE_TRADE_INPUTS;
			}
		},
		setOrderType: (state, action) => {
			state[accountType(state.selectedType)].orderType = action.payload;
		},
		setOrderFeeCap: (state, action) => {
			state.crossMargin.orderFeeCap = action.payload;
		},
		setLeverageSide: (state, action) => {
			state[accountType(state.selectedType)].leverageSide = action.payload;
		},
		setCrossMarginLeverageForAsset: (
			state,
			action: PayloadAction<{ marketKey: FuturesMarketKey; leverage: string }>
		) => {
			state.crossMargin.selectedLeverageByAsset[action.payload.marketKey] = action.payload.leverage;
		},
		setCrossMarginMarginDelta: (state, action: PayloadAction<string>) => {
			state.crossMargin.marginDelta = action.payload;
		},
		setFuturesAccountType: (state, action) => {
			state.selectedType = action.payload;
		},
		setFuturesMarkets: (state, action: PayloadAction<FuturesMarket<string>[]>) => {
			state.markets = action.payload;
		},
		setFundingRates: (state, action: PayloadAction<FundingRate<string>[]>) => {
			state.fundingRates = action.payload;
		},
		setDynamicFeeRate: (state, action: PayloadAction<string>) => {
			state.dynamicFeeRate = action.payload;
		},
		setCrossMarginTradeInputs: (state, action: PayloadAction<CrossMarginTradeInputs<string>>) => {
			state.crossMargin.tradeInputs = action.payload;
		},
		setCrossMarginOrderPrice: (state, action: PayloadAction<string>) => {
			state.crossMargin.orderPrice.price = action.payload;
		},
		setCrossMarginOrderPriceInvalidLabel: (
			state,
			action: PayloadAction<string | null | undefined>
		) => {
			state.crossMargin.orderPrice.invalidLabel = action.payload;
		},
		setIsolatedMarginTradeInputs: (
			state,
			action: PayloadAction<IsolatedMarginTradeInputs<string>>
		) => {
			state.isolatedMargin.tradeInputs = action.payload;
		},
		setSelectedInputDenomination: (state, action: PayloadAction<InputCurrencyDenomination>) => {
			state.selectedInputDenomination = action.payload;
		},
		setIsolatedMarginFee: (state, action: PayloadAction<string>) => {
			state.isolatedMargin.tradeFee = action.payload;
		},
		setIsolatedMarginLeverageInput: (state, action: PayloadAction<string>) => {
			state.isolatedMargin.leverageInput = action.payload;
		},
		setCrossMarginFees: (state, action: PayloadAction<CrossMarginTradeFees<string>>) => {
			state.crossMargin.fees = action.payload;
		},
		setPreviewError: (state, action: PayloadAction<string | null>) => {
			state.errors.tradePreview = action.payload;
		},
		setShowCrossMarginOnboard: (state, action: PayloadAction<boolean>) => {
			state.crossMargin.showOnboard = action.payload;
		},
		handleCrossMarginPreviewError: (futuresState, action: PayloadAction<string>) => {
			const message = Object.values(ORDER_PREVIEW_ERRORS).includes(action.payload)
				? action.payload
				: 'Failed to get trade preview';
			futuresState.queryStatuses.crossMarginTradePreview = {
				status: FetchStatus.Error,
				error: message,
			};
			futuresState.crossMargin.tradePreview = null;
		},
		handleIsolatedMarginPreviewError: (futuresState, action: PayloadAction<string>) => {
			const message = Object.values(ORDER_PREVIEW_ERRORS).includes(action.payload)
				? action.payload
				: 'Failed to get trade preview';
			futuresState.queryStatuses.isolatedTradePreview = {
				status: FetchStatus.Error,
				error: message,
			};
			futuresState.isolatedMargin.tradePreview = null;
		},
		setCrossMarginAccount: (
			state,
			action: PayloadAction<{ wallet: string; account: string; network: NetworkId }>
		) => {
			const { account, wallet, network } = action.payload;
			if (!state.crossMargin.accounts[network]?.[wallet]?.account) {
				state.crossMargin.accounts[network] = {
					...state.crossMargin.accounts[network],
					[wallet]: {
						account: account,
						...ZERO_STATE_CM_ACCOUNT,
					},
				};
			}
		},
		setTransactionEstimate: (state, action: PayloadAction<TransactionEstimationPayload>) => {
			state.transactionEstimations[action.payload.type] = {
				limit: action.payload.limit,
				cost: action.payload.cost,
				error: action.payload.error,
			};
		},
		setIsolatedTradePreview: (
			state,
			action: PayloadAction<FuturesPotentialTradeDetails<string> | null>
		) => {
			state.isolatedMargin.tradePreview = action.payload;
		},
		setCrossMarginTradePreview: (
			state,
			action: PayloadAction<FuturesPotentialTradeDetails<string> | null>
		) => {
			state.crossMargin.tradePreview = action.payload;
		},
		setCrossMarginOrderCancelling: (state, action: PayloadAction<string | undefined>) => {
			state.crossMargin.cancellingOrder = action.payload;
		},
		setSelectedTrader: (state, action: PayloadAction<string | undefined>) => {
			state.leaderboard.selectedTrader = action.payload;
		},
	},
	extraReducers: (builder) => {
		// Markets
		builder.addCase(fetchMarkets.pending, (futuresState) => {
			futuresState.queryStatuses.markets = LOADING_STATUS;
		});
		builder.addCase(fetchMarkets.fulfilled, (futuresState, action) => {
			futuresState.queryStatuses.markets = SUCCESS_STATUS;
			futuresState.markets = action.payload;
		});
		builder.addCase(fetchMarkets.rejected, (futuresState) => {
			futuresState.queryStatuses.markets = {
				status: FetchStatus.Error,
				error: 'Failed to fetch markets',
			};
		});

		// Cross margin overview
		builder.addCase(fetchCrossMarginBalanceInfo.pending, (futuresState) => {
			futuresState.queryStatuses.crossMarginBalanceInfo = LOADING_STATUS;
		});
		builder.addCase(fetchCrossMarginBalanceInfo.fulfilled, (futuresState, action) => {
			futuresState.queryStatuses.crossMarginBalanceInfo = SUCCESS_STATUS;
			if (action.payload) {
				const { account, network, balanceInfo } = action.payload;
				const wallet = findWalletForAccount(futuresState.crossMargin, account, network);
				if (wallet) {
					futuresState.crossMargin.accounts[network][wallet].balanceInfo = balanceInfo;
				}
			}
		});
		builder.addCase(fetchCrossMarginBalanceInfo.rejected, (futuresState) => {
			futuresState.queryStatuses.crossMarginBalanceInfo = {
				status: FetchStatus.Error,
				error: 'Failed to fetch balance info',
			};
		});

		// Daily volumes
		builder.addCase(fetchDailyVolumes.pending, (futuresState) => {
			futuresState.queryStatuses.dailyVolumes = LOADING_STATUS;
		});
		builder.addCase(fetchDailyVolumes.fulfilled, (futuresState, action) => {
			futuresState.queryStatuses.dailyVolumes = SUCCESS_STATUS;
			futuresState.dailyMarketVolumes = action.payload;
		});
		builder.addCase(fetchDailyVolumes.rejected, (futuresState) => {
			futuresState.queryStatuses.dailyVolumes = {
				status: FetchStatus.Error,
				error: 'Failed to fetch volume data',
			};
		});

		// Cross margin positions
		builder.addCase(fetchCrossMarginPositions.pending, (futuresState) => {
			futuresState.queryStatuses.crossMarginPositions = LOADING_STATUS;
		});
		builder.addCase(fetchCrossMarginPositions.fulfilled, (futuresState, action) => {
			futuresState.queryStatuses.crossMarginPositions = SUCCESS_STATUS;
			if (!action.payload) return;
			const { account, positions, network } = action.payload;
			const wallet = findWalletForAccount(futuresState.crossMargin, account, network);
			if (wallet) {
				futuresState.crossMargin.accounts[network][wallet].positions = positions;
			}
		});
		builder.addCase(fetchCrossMarginPositions.rejected, (futuresState) => {
			futuresState.queryStatuses.crossMarginPositions = {
				status: FetchStatus.Error,
				error: 'Failed to fetch positions',
			};
		});

		// Isolated margin positions
		builder.addCase(fetchIsolatedMarginPositions.pending, (futuresState) => {
			futuresState.queryStatuses.isolatedPositions = LOADING_STATUS;
		});
		builder.addCase(fetchIsolatedMarginPositions.fulfilled, (futuresState, action) => {
			futuresState.queryStatuses.isolatedPositions = SUCCESS_STATUS;
			if (action.payload) {
				futuresState.isolatedMargin.positions[action.payload.wallet] = action.payload.positions;
			}
		});
		builder.addCase(fetchIsolatedMarginPositions.rejected, (futuresState) => {
			futuresState.queryStatuses.isolatedPositions = {
				status: FetchStatus.Error,
				error: 'Failed to fetch positions',
			};
		});

		// Refetch selected position
		builder.addCase(refetchPosition.fulfilled, (futuresState, action) => {
			const { positions } = futuresState.isolatedMargin;
			if (action.payload && positions[action.payload.wallet]) {
				const existingPositions = [...positions[action.payload.wallet]];
				const index = existingPositions.findIndex(
					(p) => p.marketKey === action.payload!.position.marketKey
				);
				existingPositions[index] = action.payload.position;
				futuresState.isolatedMargin.positions[action.payload.wallet] = existingPositions;
			}
		});

		// Fetch Open Orders
		builder.addCase(fetchCrossMarginOpenOrders.pending, (futuresState) => {
			futuresState.queryStatuses.openOrders = LOADING_STATUS;
		});
		builder.addCase(fetchCrossMarginOpenOrders.fulfilled, (futuresState, action) => {
			futuresState.queryStatuses.openOrders = SUCCESS_STATUS;
			if (!action.payload) return;
			const { network, account, orders } = action.payload;
			const wallet = findWalletForAccount(futuresState.crossMargin, account, network);
			if (wallet) {
				futuresState.crossMargin.accounts[network][wallet].openOrders = orders;
			}
		});
		builder.addCase(fetchCrossMarginOpenOrders.rejected, (futuresState) => {
			futuresState.queryStatuses.openOrders = {
				status: FetchStatus.Error,
				error: 'Failed to fetch open orders',
			};
		});

		// Fetch Cross Margin Settings
		builder.addCase(fetchCrossMarginSettings.pending, (futuresState) => {
			futuresState.queryStatuses.openOrders = LOADING_STATUS;
		});
		builder.addCase(fetchCrossMarginSettings.fulfilled, (futuresState, action) => {
			if (action.payload) {
				futuresState.crossMargin.settings = action.payload;
			}
			futuresState.queryStatuses.crossMarginSettings = SUCCESS_STATUS;
		});
		builder.addCase(fetchCrossMarginSettings.rejected, (futuresState) => {
			futuresState.queryStatuses.crossMarginSettings = {
				status: FetchStatus.Error,
				error: 'Failed to fetch cross margin settings',
			};
		});

		// Fetch Isolated Margin Trade Preview
		builder.addCase(fetchIsolatedMarginTradePreview.pending, (futuresState) => {
			futuresState.queryStatuses.isolatedTradePreview = LOADING_STATUS;
		});
		builder.addCase(fetchIsolatedMarginTradePreview.fulfilled, (futuresState, action) => {
			futuresState.isolatedMargin.tradePreview = action.payload;
			futuresState.queryStatuses.isolatedTradePreview = SUCCESS_STATUS;
		});
		builder.addCase(fetchIsolatedMarginTradePreview.rejected, (futuresState) => {
			futuresState.queryStatuses.isolatedTradePreview = {
				status: FetchStatus.Error,
				error: 'Failed to fetch trade preview',
			};
			futuresState.isolatedMargin.tradePreview = null;
		});

		// Fetch Cross Margin Trade Preview
		builder.addCase(fetchCrossMarginTradePreview.pending, (futuresState) => {
			futuresState.queryStatuses.crossMarginTradePreview = LOADING_STATUS;
		});
		builder.addCase(fetchCrossMarginTradePreview.fulfilled, (futuresState, action) => {
			futuresState.crossMargin.tradePreview = action.payload;
			futuresState.queryStatuses.crossMarginTradePreview = SUCCESS_STATUS;
		});
		builder.addCase(fetchCrossMarginTradePreview.rejected, (futuresState) => {
			futuresState.queryStatuses.crossMarginTradePreview = {
				error: 'Failed to get preview',
				status: FetchStatus.Error,
			};
			futuresState.crossMargin.tradePreview = null;
		});

		// Fetch keeper balance
		builder.addCase(fetchKeeperEthBalance.fulfilled, (futuresState, action) => {
			if (!action.payload) return;
			const { account, network, balance } = action.payload;
			const wallet = findWalletForAccount(futuresState.crossMargin, account, network);
			if (wallet) {
				futuresState.crossMargin.accounts[network][wallet].balanceInfo.keeperEthBal = balance;
			}
		});

		// Fetch cross margin account
		builder.addCase(fetchCrossMarginAccount.pending, (futuresState) => {
			futuresState.queryStatuses.crossMarginAccount = LOADING_STATUS;
		});
		builder.addCase(fetchCrossMarginAccount.fulfilled, (futuresState, action) => {
			if (action.payload) {
				const { network, account, wallet } = action.payload;
				futuresState.crossMargin.accounts[network] = {
					...futuresState.crossMargin.accounts[network],
					[wallet]: {
						account: account,
						...ZERO_STATE_CM_ACCOUNT,
					},
				};
			}
			futuresState.queryStatuses.crossMarginAccount = SUCCESS_STATUS;
		});
		builder.addCase(fetchCrossMarginAccount.rejected, (futuresState) => {
			futuresState.queryStatuses.crossMarginAccount = {
				status: FetchStatus.Error,
				error: 'Failed to fetch cross margin account',
			};
		});

		// Fetch past daily prices
		builder.addCase(fetchPreviousDayRates.pending, (futuresState) => {
			futuresState.queryStatuses.previousDayRates = LOADING_STATUS;
		});
		builder.addCase(fetchPreviousDayRates.fulfilled, (futuresState, action) => {
			futuresState.previousDayRates = action.payload;
			futuresState.queryStatuses.previousDayRates = SUCCESS_STATUS;
		});
		builder.addCase(fetchPreviousDayRates.rejected, (futuresState) => {
			futuresState.queryStatuses.previousDayRates = {
				error: 'Failed to fetch past rates',
				status: FetchStatus.Error,
			};
		});

		// Fetch position history
		builder.addCase(fetchFuturesPositionHistory.pending, (futuresState) => {
			futuresState.queryStatuses.positionHistory = LOADING_STATUS;
		});
		builder.addCase(fetchFuturesPositionHistory.fulfilled, (futuresState, { payload }) => {
			futuresState.queryStatuses.positionHistory = SUCCESS_STATUS;
			if (!payload) return;
			if (payload.accountType === 'isolated_margin') {
				futuresState.isolatedMargin.positionHistory[payload.account] = payload.history.filter(
					(p) => p.accountType === 'isolated_margin'
				);
			} else {
				const wallet = findWalletForAccount(
					futuresState.crossMargin,
					payload.account,
					payload.networkId
				);
				if (wallet) {
					futuresState.crossMargin.accounts[payload.networkId][
						wallet
					].positionHistory = payload.history.filter((p) => p.accountType === 'cross_margin');
				}
			}
		});
		builder.addCase(fetchFuturesPositionHistory.rejected, (futuresState) => {
			futuresState.queryStatuses.positionHistory = {
				error: 'Failed to fetch position history',
				status: FetchStatus.Error,
			};
		});

		// Fetch position history for trader
		builder.addCase(fetchPositionHistoryForTrader.pending, (futuresState) => {
			futuresState.queryStatuses.selectedTraderPositionHistory = LOADING_STATUS;
		});
		builder.addCase(fetchPositionHistoryForTrader.fulfilled, (futuresState, { payload }) => {
			futuresState.queryStatuses.selectedTraderPositionHistory = SUCCESS_STATUS;
			if (!payload) return;
			futuresState.leaderboard.selectedTraderPositionHistory[payload.networkId] = {
				...futuresState.leaderboard.selectedTraderPositionHistory[payload.networkId],
				[payload.address]: payload.history,
			};
		});
		builder.addCase(fetchPositionHistoryForTrader.rejected, (futuresState) => {
			futuresState.queryStatuses.selectedTraderPositionHistory = {
				error: 'Failed to fetch traders position history',
				status: FetchStatus.Error,
			};
		});

		// Fetch funding rates
		builder.addCase(fetchFundingRates.pending, (futuresState) => {
			futuresState.queryStatuses.fetchFundingRates = LOADING_STATUS;
		});
		builder.addCase(fetchFundingRates.fulfilled, (futuresState, action) => {
			futuresState.queryStatuses.fetchFundingRates = SUCCESS_STATUS;
			futuresState.fundingRates = action.payload;
		});
		builder.addCase(fetchFundingRates.rejected, (futuresState) => {
			futuresState.queryStatuses.fetchFundingRates = {
				status: FetchStatus.Error,
				error: 'Failed to fetch funding rates',
			};
		});

		// Fetch trades for market
		builder.addCase(fetchTradesForSelectedMarket.pending, (futuresState) => {
			futuresState.queryStatuses.trades = LOADING_STATUS;
		});
		builder.addCase(fetchTradesForSelectedMarket.fulfilled, (futuresState, { payload }) => {
			futuresState.queryStatuses.trades = SUCCESS_STATUS;
			if (!payload) return;
			if (payload.accountType === 'isolated_margin') {
				futuresState.isolatedMargin.trades[payload.account] = payload.trades;
			} else {
				futuresState.crossMargin.accounts[payload.networkId][payload.wallet].trades =
					payload.trades;
			}
		});
		builder.addCase(fetchTradesForSelectedMarket.rejected, (futuresState) => {
			futuresState.queryStatuses.trades = {
				error: 'Failed to fetch trades',
				status: FetchStatus.Error,
			};
		});

		// TODO: Combine all with market trades rather than overwrite as the filter is done on selector

		// Fetch all trades for account
		builder.addCase(fetchAllTradesForAccount.pending, (futuresState) => {
			futuresState.queryStatuses.trades = LOADING_STATUS;
		});
		builder.addCase(fetchAllTradesForAccount.fulfilled, (futuresState, { payload }) => {
			futuresState.queryStatuses.trades = SUCCESS_STATUS;
			if (!payload) return;
			if (payload.accountType === 'isolated_margin') {
				futuresState.isolatedMargin.trades[payload.account] = payload.trades;
			} else {
				futuresState.crossMargin.accounts[payload.networkId][payload.wallet].trades =
					payload.trades;
			}
		});
		builder.addCase(fetchAllTradesForAccount.rejected, (futuresState) => {
			futuresState.queryStatuses.trades = {
				error: 'Failed to fetch trades',
				status: FetchStatus.Error,
			};
		});
	},
});

export default futuresSlice.reducer;

export const {
	handleCrossMarginPreviewError,
	handleIsolatedMarginPreviewError,
	setMarketAsset,
	setOrderType,
	setOrderFeeCap,
	setLeverageSide,
	setFuturesAccountType,
	setFuturesMarkets,
	setCrossMarginTradeInputs,
	setCrossMarginAccount,
	setCrossMarginMarginDelta,
	setCrossMarginFees,
	setCrossMarginOrderPrice,
	setCrossMarginOrderPriceInvalidLabel,
	setDynamicFeeRate,
	setTransactionEstimate,
	setIsolatedMarginLeverageInput,
	setIsolatedMarginTradeInputs,
	setIsolatedTradePreview,
	setIsolatedMarginFee,
	setCrossMarginTradePreview,
	setCrossMarginLeverageForAsset,
	setPreviewError,
	setCrossMarginOrderCancelling,
	setShowCrossMarginOnboard,
	setSelectedTrader,
	setSelectedInputDenomination,
} = futuresSlice.actions;

const findWalletForAccount = (
	crossMarginState: CrossMarginState,
	account: string,
	network: NetworkId
) => {
	const entry = Object.entries(crossMarginState.accounts[network]).find(([_, value]) => {
		return value.account === account;
	});
	return entry ? entry[0] : undefined;
};
