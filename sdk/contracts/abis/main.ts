export const ExchangerABI = [
	'function getAmountsForExchange(uint sourceAmount, bytes32 sourceCurrencyKey, bytes32 destinationCurrencyKey) external view returns (uint amountReceived, uint fee, uint exchangeFeeRate)',
	'function dynamicFeeRateForExchange(bytes32 sourceCurrencyKey, bytes32 destinationCurrencyKey) external view returns (uint feeRate, bool tooVolatile)',
	'function maxSecsLeftInWaitingPeriod(address account, bytes32 currencyKey) public view returns (uint)',
	'function settlementOwing(address account, bytes32 currencyKey) public view returns (uint reclaimAmount, uint rebateAmount, uint numEntries)',
	'function feeRateForExchange(bytes32 sourceCurrencyKey, bytes32 destinationCurrencyKey) external view returns (uint)',
];

export const SystemStatusABI = [
	'function futuresMarketSuspension(bytes32 marketKey) external view returns (bool suspended, uint248 reason)',
];

export const ExchangeRatesABI = [
	'function ratesForCurrencies(bytes32[] currencyKeys) external view returns (uint[])',
];

export const SynthUtilABI = [
	'function synthsBalances(address account) external view returns (bytes32[], uint[], uint[])',
	'function synthsRates() external view returns (bytes32[], uint[])',
];

export const SystemSettingsABI = [
	'function exchangeFeeRate(bytes32 currencyKey) external view returns (uint)',
];

export const SynthRedeemerABI = [
	'function balanceOf(IERC20 synthProxy, address account) external view returns (uint balanceOfInsUSD)',
	'event SynthDeprecated(address synth, uint rateToRedeem, uint totalSynthSupply, uint supplyInsUSD)',
];

export const FuturesMarketDataABI = [
	'function globals() external view returns (FuturesGlobals)',
	'function allMarketSummaries() external view returns (MarketSummary[])',
	'function positionDetailsForMarketKey(bytes32 marketKey, address account) external view returns (PositionData)',
];

export const FuturesMarketSettingsABI = [
	'function maxMarketValueUSD(bytes32 _marketKey) public view returns (uint)',
];

export const FuturesMarketABI = [
	'function orderFee(int sizeDelta) external view returns (uint fee, bool invalid)',
	'function canLiquidate(address account) external view returns (bool)',
	'function postTradeDetails(int sizeDelta, address sender) external view returns (uint margin, int size, uint price, uint liqPrice, uint fee, IFuturesMarketBaseTypes.Status status)',
];

export const SynthABI = [];

export const SynthetixABI = [
	'function exchangeAtomically(bytes32 sourceCurrencyKey, uint sourceAmount, bytes32 destinationCurrencyKey, bytes32 trackingCode, uint minAmount) external returns (uint amountReceived)',
	'function exchangeWithTracking(bytes32 sourceCurrencyKey, uint sourceAmount, bytes32 destinationCurrencyKey, address rewardAddress, bytes32 trackingCode) external returns (uint amountReceived)',
];

export const SynthSwapABI = [
	'function swapInto(bytes32 _destSynthCurrencyKey, bytes calldata _data) external payable returns (uint)',
	'function swapOutOf(bytes32 _sourceSynthCurrencyKey, uint _sourceAmount, bytes calldata _data) external returns (uint);',
	'function uniswapSwapInto(bytes32 _destSynthCurrencyKey, address _sourceTokenAddress, uint _amount, bytes calldata _data) external payable returns (uint)',
	'function uniswapSwapOutOf(bytes32 _sourceSynthCurrencyKey, address _destTokenAddress, uint _amountOfSynth, uint _expectedAmountOfSUSDFromSwap, bytes calldata _data) external returns (uint)',
];
