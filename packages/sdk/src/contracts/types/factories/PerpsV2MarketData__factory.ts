/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from 'ethers'
import type { Provider } from '@ethersproject/providers'
import type { PerpsV2MarketData, PerpsV2MarketDataInterface } from '../PerpsV2MarketData'

const _abi = [
	{
		inputs: [
			{
				internalType: 'contract IAddressResolver',
				name: '_resolverProxy',
				type: 'address',
			},
		],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'constructor',
	},
	{
		constant: true,
		inputs: [],
		name: 'allMarketSummaries',
		outputs: [
			{
				components: [
					{
						internalType: 'address',
						name: 'market',
						type: 'address',
					},
					{
						internalType: 'bytes32',
						name: 'asset',
						type: 'bytes32',
					},
					{
						internalType: 'bytes32',
						name: 'key',
						type: 'bytes32',
					},
					{
						internalType: 'uint256',
						name: 'maxLeverage',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'price',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'marketSize',
						type: 'uint256',
					},
					{
						internalType: 'int256',
						name: 'marketSkew',
						type: 'int256',
					},
					{
						internalType: 'uint256',
						name: 'marketDebt',
						type: 'uint256',
					},
					{
						internalType: 'int256',
						name: 'currentFundingRate',
						type: 'int256',
					},
					{
						internalType: 'int256',
						name: 'currentFundingVelocity',
						type: 'int256',
					},
					{
						components: [
							{
								internalType: 'uint256',
								name: 'takerFee',
								type: 'uint256',
							},
							{
								internalType: 'uint256',
								name: 'makerFee',
								type: 'uint256',
							},
							{
								internalType: 'uint256',
								name: 'takerFeeDelayedOrder',
								type: 'uint256',
							},
							{
								internalType: 'uint256',
								name: 'makerFeeDelayedOrder',
								type: 'uint256',
							},
							{
								internalType: 'uint256',
								name: 'takerFeeOffchainDelayedOrder',
								type: 'uint256',
							},
							{
								internalType: 'uint256',
								name: 'makerFeeOffchainDelayedOrder',
								type: 'uint256',
							},
						],
						internalType: 'struct PerpsV2MarketData.FeeRates',
						name: 'feeRates',
						type: 'tuple',
					},
				],
				internalType: 'struct PerpsV2MarketData.MarketSummary[]',
				name: '',
				type: 'tuple[]',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'allProxiedMarketSummaries',
		outputs: [
			{
				components: [
					{
						internalType: 'address',
						name: 'market',
						type: 'address',
					},
					{
						internalType: 'bytes32',
						name: 'asset',
						type: 'bytes32',
					},
					{
						internalType: 'bytes32',
						name: 'key',
						type: 'bytes32',
					},
					{
						internalType: 'uint256',
						name: 'maxLeverage',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'price',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'marketSize',
						type: 'uint256',
					},
					{
						internalType: 'int256',
						name: 'marketSkew',
						type: 'int256',
					},
					{
						internalType: 'uint256',
						name: 'marketDebt',
						type: 'uint256',
					},
					{
						internalType: 'int256',
						name: 'currentFundingRate',
						type: 'int256',
					},
					{
						internalType: 'int256',
						name: 'currentFundingVelocity',
						type: 'int256',
					},
					{
						components: [
							{
								internalType: 'uint256',
								name: 'takerFee',
								type: 'uint256',
							},
							{
								internalType: 'uint256',
								name: 'makerFee',
								type: 'uint256',
							},
							{
								internalType: 'uint256',
								name: 'takerFeeDelayedOrder',
								type: 'uint256',
							},
							{
								internalType: 'uint256',
								name: 'makerFeeDelayedOrder',
								type: 'uint256',
							},
							{
								internalType: 'uint256',
								name: 'takerFeeOffchainDelayedOrder',
								type: 'uint256',
							},
							{
								internalType: 'uint256',
								name: 'makerFeeOffchainDelayedOrder',
								type: 'uint256',
							},
						],
						internalType: 'struct PerpsV2MarketData.FeeRates',
						name: 'feeRates',
						type: 'tuple',
					},
				],
				internalType: 'struct PerpsV2MarketData.MarketSummary[]',
				name: '',
				type: 'tuple[]',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'globals',
		outputs: [
			{
				components: [
					{
						internalType: 'uint256',
						name: 'minInitialMargin',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'liquidationFeeRatio',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'minKeeperFee',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'maxKeeperFee',
						type: 'uint256',
					},
				],
				internalType: 'struct PerpsV2MarketData.FuturesGlobals',
				name: '',
				type: 'tuple',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [
			{
				internalType: 'contract IPerpsV2MarketViews',
				name: 'market',
				type: 'address',
			},
		],
		name: 'marketDetails',
		outputs: [
			{
				components: [
					{
						internalType: 'address',
						name: 'market',
						type: 'address',
					},
					{
						internalType: 'bytes32',
						name: 'baseAsset',
						type: 'bytes32',
					},
					{
						internalType: 'bytes32',
						name: 'marketKey',
						type: 'bytes32',
					},
					{
						components: [
							{
								internalType: 'uint256',
								name: 'takerFee',
								type: 'uint256',
							},
							{
								internalType: 'uint256',
								name: 'makerFee',
								type: 'uint256',
							},
							{
								internalType: 'uint256',
								name: 'takerFeeDelayedOrder',
								type: 'uint256',
							},
							{
								internalType: 'uint256',
								name: 'makerFeeDelayedOrder',
								type: 'uint256',
							},
							{
								internalType: 'uint256',
								name: 'takerFeeOffchainDelayedOrder',
								type: 'uint256',
							},
							{
								internalType: 'uint256',
								name: 'makerFeeOffchainDelayedOrder',
								type: 'uint256',
							},
						],
						internalType: 'struct PerpsV2MarketData.FeeRates',
						name: 'feeRates',
						type: 'tuple',
					},
					{
						components: [
							{
								internalType: 'uint256',
								name: 'maxLeverage',
								type: 'uint256',
							},
							{
								internalType: 'uint256',
								name: 'maxMarketValue',
								type: 'uint256',
							},
						],
						internalType: 'struct PerpsV2MarketData.MarketLimits',
						name: 'limits',
						type: 'tuple',
					},
					{
						components: [
							{
								internalType: 'uint256',
								name: 'maxFundingVelocity',
								type: 'uint256',
							},
							{
								internalType: 'uint256',
								name: 'skewScale',
								type: 'uint256',
							},
						],
						internalType: 'struct PerpsV2MarketData.FundingParameters',
						name: 'fundingParameters',
						type: 'tuple',
					},
					{
						components: [
							{
								internalType: 'uint256',
								name: 'marketSize',
								type: 'uint256',
							},
							{
								components: [
									{
										internalType: 'uint256',
										name: 'long',
										type: 'uint256',
									},
									{
										internalType: 'uint256',
										name: 'short',
										type: 'uint256',
									},
								],
								internalType: 'struct PerpsV2MarketData.Sides',
								name: 'sides',
								type: 'tuple',
							},
							{
								internalType: 'uint256',
								name: 'marketDebt',
								type: 'uint256',
							},
							{
								internalType: 'int256',
								name: 'marketSkew',
								type: 'int256',
							},
						],
						internalType: 'struct PerpsV2MarketData.MarketSizeDetails',
						name: 'marketSizeDetails',
						type: 'tuple',
					},
					{
						components: [
							{
								internalType: 'uint256',
								name: 'price',
								type: 'uint256',
							},
							{
								internalType: 'bool',
								name: 'invalid',
								type: 'bool',
							},
						],
						internalType: 'struct PerpsV2MarketData.PriceDetails',
						name: 'priceDetails',
						type: 'tuple',
					},
				],
				internalType: 'struct PerpsV2MarketData.MarketData',
				name: '',
				type: 'tuple',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [
			{
				internalType: 'bytes32',
				name: 'marketKey',
				type: 'bytes32',
			},
		],
		name: 'marketDetailsForKey',
		outputs: [
			{
				components: [
					{
						internalType: 'address',
						name: 'market',
						type: 'address',
					},
					{
						internalType: 'bytes32',
						name: 'baseAsset',
						type: 'bytes32',
					},
					{
						internalType: 'bytes32',
						name: 'marketKey',
						type: 'bytes32',
					},
					{
						components: [
							{
								internalType: 'uint256',
								name: 'takerFee',
								type: 'uint256',
							},
							{
								internalType: 'uint256',
								name: 'makerFee',
								type: 'uint256',
							},
							{
								internalType: 'uint256',
								name: 'takerFeeDelayedOrder',
								type: 'uint256',
							},
							{
								internalType: 'uint256',
								name: 'makerFeeDelayedOrder',
								type: 'uint256',
							},
							{
								internalType: 'uint256',
								name: 'takerFeeOffchainDelayedOrder',
								type: 'uint256',
							},
							{
								internalType: 'uint256',
								name: 'makerFeeOffchainDelayedOrder',
								type: 'uint256',
							},
						],
						internalType: 'struct PerpsV2MarketData.FeeRates',
						name: 'feeRates',
						type: 'tuple',
					},
					{
						components: [
							{
								internalType: 'uint256',
								name: 'maxLeverage',
								type: 'uint256',
							},
							{
								internalType: 'uint256',
								name: 'maxMarketValue',
								type: 'uint256',
							},
						],
						internalType: 'struct PerpsV2MarketData.MarketLimits',
						name: 'limits',
						type: 'tuple',
					},
					{
						components: [
							{
								internalType: 'uint256',
								name: 'maxFundingVelocity',
								type: 'uint256',
							},
							{
								internalType: 'uint256',
								name: 'skewScale',
								type: 'uint256',
							},
						],
						internalType: 'struct PerpsV2MarketData.FundingParameters',
						name: 'fundingParameters',
						type: 'tuple',
					},
					{
						components: [
							{
								internalType: 'uint256',
								name: 'marketSize',
								type: 'uint256',
							},
							{
								components: [
									{
										internalType: 'uint256',
										name: 'long',
										type: 'uint256',
									},
									{
										internalType: 'uint256',
										name: 'short',
										type: 'uint256',
									},
								],
								internalType: 'struct PerpsV2MarketData.Sides',
								name: 'sides',
								type: 'tuple',
							},
							{
								internalType: 'uint256',
								name: 'marketDebt',
								type: 'uint256',
							},
							{
								internalType: 'int256',
								name: 'marketSkew',
								type: 'int256',
							},
						],
						internalType: 'struct PerpsV2MarketData.MarketSizeDetails',
						name: 'marketSizeDetails',
						type: 'tuple',
					},
					{
						components: [
							{
								internalType: 'uint256',
								name: 'price',
								type: 'uint256',
							},
							{
								internalType: 'bool',
								name: 'invalid',
								type: 'bool',
							},
						],
						internalType: 'struct PerpsV2MarketData.PriceDetails',
						name: 'priceDetails',
						type: 'tuple',
					},
				],
				internalType: 'struct PerpsV2MarketData.MarketData',
				name: '',
				type: 'tuple',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [
			{
				internalType: 'address[]',
				name: 'markets',
				type: 'address[]',
			},
		],
		name: 'marketSummaries',
		outputs: [
			{
				components: [
					{
						internalType: 'address',
						name: 'market',
						type: 'address',
					},
					{
						internalType: 'bytes32',
						name: 'asset',
						type: 'bytes32',
					},
					{
						internalType: 'bytes32',
						name: 'key',
						type: 'bytes32',
					},
					{
						internalType: 'uint256',
						name: 'maxLeverage',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'price',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'marketSize',
						type: 'uint256',
					},
					{
						internalType: 'int256',
						name: 'marketSkew',
						type: 'int256',
					},
					{
						internalType: 'uint256',
						name: 'marketDebt',
						type: 'uint256',
					},
					{
						internalType: 'int256',
						name: 'currentFundingRate',
						type: 'int256',
					},
					{
						internalType: 'int256',
						name: 'currentFundingVelocity',
						type: 'int256',
					},
					{
						components: [
							{
								internalType: 'uint256',
								name: 'takerFee',
								type: 'uint256',
							},
							{
								internalType: 'uint256',
								name: 'makerFee',
								type: 'uint256',
							},
							{
								internalType: 'uint256',
								name: 'takerFeeDelayedOrder',
								type: 'uint256',
							},
							{
								internalType: 'uint256',
								name: 'makerFeeDelayedOrder',
								type: 'uint256',
							},
							{
								internalType: 'uint256',
								name: 'takerFeeOffchainDelayedOrder',
								type: 'uint256',
							},
							{
								internalType: 'uint256',
								name: 'makerFeeOffchainDelayedOrder',
								type: 'uint256',
							},
						],
						internalType: 'struct PerpsV2MarketData.FeeRates',
						name: 'feeRates',
						type: 'tuple',
					},
				],
				internalType: 'struct PerpsV2MarketData.MarketSummary[]',
				name: '',
				type: 'tuple[]',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [
			{
				internalType: 'bytes32[]',
				name: 'marketKeys',
				type: 'bytes32[]',
			},
		],
		name: 'marketSummariesForKeys',
		outputs: [
			{
				components: [
					{
						internalType: 'address',
						name: 'market',
						type: 'address',
					},
					{
						internalType: 'bytes32',
						name: 'asset',
						type: 'bytes32',
					},
					{
						internalType: 'bytes32',
						name: 'key',
						type: 'bytes32',
					},
					{
						internalType: 'uint256',
						name: 'maxLeverage',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'price',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'marketSize',
						type: 'uint256',
					},
					{
						internalType: 'int256',
						name: 'marketSkew',
						type: 'int256',
					},
					{
						internalType: 'uint256',
						name: 'marketDebt',
						type: 'uint256',
					},
					{
						internalType: 'int256',
						name: 'currentFundingRate',
						type: 'int256',
					},
					{
						internalType: 'int256',
						name: 'currentFundingVelocity',
						type: 'int256',
					},
					{
						components: [
							{
								internalType: 'uint256',
								name: 'takerFee',
								type: 'uint256',
							},
							{
								internalType: 'uint256',
								name: 'makerFee',
								type: 'uint256',
							},
							{
								internalType: 'uint256',
								name: 'takerFeeDelayedOrder',
								type: 'uint256',
							},
							{
								internalType: 'uint256',
								name: 'makerFeeDelayedOrder',
								type: 'uint256',
							},
							{
								internalType: 'uint256',
								name: 'takerFeeOffchainDelayedOrder',
								type: 'uint256',
							},
							{
								internalType: 'uint256',
								name: 'makerFeeOffchainDelayedOrder',
								type: 'uint256',
							},
						],
						internalType: 'struct PerpsV2MarketData.FeeRates',
						name: 'feeRates',
						type: 'tuple',
					},
				],
				internalType: 'struct PerpsV2MarketData.MarketSummary[]',
				name: '',
				type: 'tuple[]',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [
			{
				internalType: 'bytes32',
				name: 'marketKey',
				type: 'bytes32',
			},
		],
		name: 'parameters',
		outputs: [
			{
				components: [
					{
						internalType: 'uint256',
						name: 'takerFee',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'makerFee',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'takerFeeDelayedOrder',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'makerFeeDelayedOrder',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'takerFeeOffchainDelayedOrder',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'makerFeeOffchainDelayedOrder',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'maxLeverage',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'maxMarketValue',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'maxFundingVelocity',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'skewScale',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'nextPriceConfirmWindow',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'delayedOrderConfirmWindow',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'minDelayTimeDelta',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'maxDelayTimeDelta',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'offchainDelayedOrderMinAge',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'offchainDelayedOrderMaxAge',
						type: 'uint256',
					},
					{
						internalType: 'bytes32',
						name: 'offchainMarketKey',
						type: 'bytes32',
					},
					{
						internalType: 'uint256',
						name: 'offchainPriceDivergence',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'liquidationPremiumMultiplier',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'liquidationBufferRatio',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'maxLiquidationDelta',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'maxPD',
						type: 'uint256',
					},
				],
				internalType: 'struct IPerpsV2MarketSettings.Parameters',
				name: '',
				type: 'tuple',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [
			{
				internalType: 'contract IPerpsV2MarketViews',
				name: 'market',
				type: 'address',
			},
			{
				internalType: 'address',
				name: 'account',
				type: 'address',
			},
		],
		name: 'positionDetails',
		outputs: [
			{
				components: [
					{
						components: [
							{
								internalType: 'uint64',
								name: 'id',
								type: 'uint64',
							},
							{
								internalType: 'uint64',
								name: 'lastFundingIndex',
								type: 'uint64',
							},
							{
								internalType: 'uint128',
								name: 'margin',
								type: 'uint128',
							},
							{
								internalType: 'uint128',
								name: 'lastPrice',
								type: 'uint128',
							},
							{
								internalType: 'int128',
								name: 'size',
								type: 'int128',
							},
						],
						internalType: 'struct IPerpsV2MarketBaseTypes.Position',
						name: 'position',
						type: 'tuple',
					},
					{
						internalType: 'int256',
						name: 'notionalValue',
						type: 'int256',
					},
					{
						internalType: 'int256',
						name: 'profitLoss',
						type: 'int256',
					},
					{
						internalType: 'int256',
						name: 'accruedFunding',
						type: 'int256',
					},
					{
						internalType: 'uint256',
						name: 'remainingMargin',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'accessibleMargin',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'liquidationPrice',
						type: 'uint256',
					},
					{
						internalType: 'bool',
						name: 'canLiquidatePosition',
						type: 'bool',
					},
				],
				internalType: 'struct PerpsV2MarketData.PositionData',
				name: '',
				type: 'tuple',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [
			{
				internalType: 'bytes32',
				name: 'marketKey',
				type: 'bytes32',
			},
			{
				internalType: 'address',
				name: 'account',
				type: 'address',
			},
		],
		name: 'positionDetailsForMarketKey',
		outputs: [
			{
				components: [
					{
						components: [
							{
								internalType: 'uint64',
								name: 'id',
								type: 'uint64',
							},
							{
								internalType: 'uint64',
								name: 'lastFundingIndex',
								type: 'uint64',
							},
							{
								internalType: 'uint128',
								name: 'margin',
								type: 'uint128',
							},
							{
								internalType: 'uint128',
								name: 'lastPrice',
								type: 'uint128',
							},
							{
								internalType: 'int128',
								name: 'size',
								type: 'int128',
							},
						],
						internalType: 'struct IPerpsV2MarketBaseTypes.Position',
						name: 'position',
						type: 'tuple',
					},
					{
						internalType: 'int256',
						name: 'notionalValue',
						type: 'int256',
					},
					{
						internalType: 'int256',
						name: 'profitLoss',
						type: 'int256',
					},
					{
						internalType: 'int256',
						name: 'accruedFunding',
						type: 'int256',
					},
					{
						internalType: 'uint256',
						name: 'remainingMargin',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'accessibleMargin',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'liquidationPrice',
						type: 'uint256',
					},
					{
						internalType: 'bool',
						name: 'canLiquidatePosition',
						type: 'bool',
					},
				],
				internalType: 'struct PerpsV2MarketData.PositionData',
				name: '',
				type: 'tuple',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'resolverProxy',
		outputs: [
			{
				internalType: 'contract IAddressResolver',
				name: '',
				type: 'address',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
] as const

export class PerpsV2MarketData__factory {
	static readonly abi = _abi
	static createInterface(): PerpsV2MarketDataInterface {
		return new utils.Interface(_abi) as PerpsV2MarketDataInterface
	}
	static connect(address: string, signerOrProvider: Signer | Provider): PerpsV2MarketData {
		return new Contract(address, _abi, signerOrProvider) as PerpsV2MarketData
	}
}
