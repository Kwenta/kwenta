import Wei, { WeiSource, wei } from '@synthetixio/wei';
import axios from 'codegen-graph-ts/build/src/lib/axios';
import generateGql from 'codegen-graph-ts/build/src/lib/gql';

export type SingleQueryOptions = {
	id: string;
	block?:
		| {
				number: number;
		  }
		| {
				hash: string;
		  };
};
export type MultiQueryOptions<T, R> = {
	skip?: number;
	first?: number;
	where?: T;
	block?:
		| {
				number: number;
		  }
		| {
				hash: string;
		  };
	orderBy?: keyof R;
	orderDirection?: 'asc' | 'desc';
};
const MAX_PAGE = 1000;
export type CandleFilter = {
	id?: string | null;
	id_not?: string | null;
	id_gt?: string | null;
	id_lt?: string | null;
	id_gte?: string | null;
	id_lte?: string | null;
	id_in?: string[];
	id_not_in?: string[];
	synth?: string | null;
	synth_not?: string | null;
	synth_gt?: string | null;
	synth_lt?: string | null;
	synth_gte?: string | null;
	synth_lte?: string | null;
	synth_in?: string[];
	synth_not_in?: string[];
	synth_contains?: string | null;
	synth_contains_nocase?: string | null;
	synth_not_contains?: string | null;
	synth_not_contains_nocase?: string | null;
	synth_starts_with?: string | null;
	synth_starts_with_nocase?: string | null;
	synth_not_starts_with?: string | null;
	synth_not_starts_with_nocase?: string | null;
	synth_ends_with?: string | null;
	synth_ends_with_nocase?: string | null;
	synth_not_ends_with?: string | null;
	synth_not_ends_with_nocase?: string | null;
	open?: WeiSource | null;
	open_not?: WeiSource | null;
	open_gt?: WeiSource | null;
	open_lt?: WeiSource | null;
	open_gte?: WeiSource | null;
	open_lte?: WeiSource | null;
	open_in?: WeiSource[];
	open_not_in?: WeiSource[];
	high?: WeiSource | null;
	high_not?: WeiSource | null;
	high_gt?: WeiSource | null;
	high_lt?: WeiSource | null;
	high_gte?: WeiSource | null;
	high_lte?: WeiSource | null;
	high_in?: WeiSource[];
	high_not_in?: WeiSource[];
	low?: WeiSource | null;
	low_not?: WeiSource | null;
	low_gt?: WeiSource | null;
	low_lt?: WeiSource | null;
	low_gte?: WeiSource | null;
	low_lte?: WeiSource | null;
	low_in?: WeiSource[];
	low_not_in?: WeiSource[];
	close?: WeiSource | null;
	close_not?: WeiSource | null;
	close_gt?: WeiSource | null;
	close_lt?: WeiSource | null;
	close_gte?: WeiSource | null;
	close_lte?: WeiSource | null;
	close_in?: WeiSource[];
	close_not_in?: WeiSource[];
	average?: WeiSource | null;
	average_not?: WeiSource | null;
	average_gt?: WeiSource | null;
	average_lt?: WeiSource | null;
	average_gte?: WeiSource | null;
	average_lte?: WeiSource | null;
	average_in?: WeiSource[];
	average_not_in?: WeiSource[];
	timestamp?: WeiSource | null;
	timestamp_not?: WeiSource | null;
	timestamp_gt?: WeiSource | null;
	timestamp_lt?: WeiSource | null;
	timestamp_gte?: WeiSource | null;
	timestamp_lte?: WeiSource | null;
	timestamp_in?: WeiSource[];
	timestamp_not_in?: WeiSource[];
	period?: WeiSource | null;
	period_not?: WeiSource | null;
	period_gt?: WeiSource | null;
	period_lt?: WeiSource | null;
	period_gte?: WeiSource | null;
	period_lte?: WeiSource | null;
	period_in?: WeiSource[];
	period_not_in?: WeiSource[];
	aggregatedPrices?: WeiSource | null;
	aggregatedPrices_not?: WeiSource | null;
	aggregatedPrices_gt?: WeiSource | null;
	aggregatedPrices_lt?: WeiSource | null;
	aggregatedPrices_gte?: WeiSource | null;
	aggregatedPrices_lte?: WeiSource | null;
	aggregatedPrices_in?: WeiSource[];
	aggregatedPrices_not_in?: WeiSource[];
	_change_block?: any | null;
};
export type CandleResult = {
	id: string;
	synth: string;
	open: Wei;
	high: Wei;
	low: Wei;
	close: Wei;
	average: Wei;
	timestamp: Wei;
	period: Wei;
	aggregatedPrices: Wei;
};
export type CandleFields = {
	id: true;
	synth: true;
	open: true;
	high: true;
	low: true;
	close: true;
	average: true;
	timestamp: true;
	period: true;
	aggregatedPrices: true;
};
export type CandleArgs<K extends keyof CandleResult> = {
	[Property in keyof Pick<CandleFields, K>]: CandleFields[Property];
};
export const getCandleById = async function <K extends keyof CandleResult>(
	url: string,
	options: SingleQueryOptions,
	args: CandleArgs<K>
): Promise<Pick<CandleResult, K>> {
	const res = await axios.post(url, {
		query: generateGql('candle', options, args),
	});
	const r = res.data as any;
	if (r.errors && r.errors.length) {
		throw new Error(r.errors[0].message);
	}
	const obj = r.data[Object.keys(r.data)[0]] as any;
	const formattedObj: any = {};
	if (obj['id']) formattedObj['id'] = obj['id'];
	if (obj['synth']) formattedObj['synth'] = obj['synth'];
	if (obj['open']) formattedObj['open'] = wei(obj['open']);
	if (obj['high']) formattedObj['high'] = wei(obj['high']);
	if (obj['low']) formattedObj['low'] = wei(obj['low']);
	if (obj['close']) formattedObj['close'] = wei(obj['close']);
	if (obj['average']) formattedObj['average'] = wei(obj['average']);
	if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
	if (obj['period']) formattedObj['period'] = wei(obj['period'], 0);
	if (obj['aggregatedPrices']) formattedObj['aggregatedPrices'] = wei(obj['aggregatedPrices'], 0);
	return formattedObj as Pick<CandleResult, K>;
};
export const getCandles = async function <K extends keyof CandleResult>(
	url: string,
	options: MultiQueryOptions<CandleFilter, CandleResult>,
	args: CandleArgs<K>
): Promise<Pick<CandleResult, K>[]> {
	const paginatedOptions: Partial<MultiQueryOptions<CandleFilter, CandleResult>> = { ...options };
	let paginationKey: keyof CandleFilter | null = null;
	let paginationValue = '';
	if (options.first && options.first > MAX_PAGE) {
		paginatedOptions.first = MAX_PAGE;
		paginatedOptions.orderBy = options.orderBy || 'id';
		paginatedOptions.orderDirection = options.orderDirection || 'asc';
		paginationKey = (paginatedOptions.orderBy +
			(paginatedOptions.orderDirection === 'asc' ? '_gt' : '_lt')) as keyof CandleFilter;
		paginatedOptions.where = { ...options.where };
	}
	let results: Pick<CandleResult, K>[] = [];
	do {
		if (paginationKey && paginationValue)
			paginatedOptions.where![paginationKey] = paginationValue as any;
		const res = await axios.post(url, {
			query: generateGql('candles', paginatedOptions, args),
		});
		const r = res.data as any;
		if (r.errors && r.errors.length) {
			throw new Error(r.errors[0].message);
		}
		const rawResults = r.data[Object.keys(r.data)[0]] as any[];
		const newResults = rawResults.map((obj) => {
			const formattedObj: any = {};
			if (obj['id']) formattedObj['id'] = obj['id'];
			if (obj['synth']) formattedObj['synth'] = obj['synth'];
			if (obj['open']) formattedObj['open'] = wei(obj['open']);
			if (obj['high']) formattedObj['high'] = wei(obj['high']);
			if (obj['low']) formattedObj['low'] = wei(obj['low']);
			if (obj['close']) formattedObj['close'] = wei(obj['close']);
			if (obj['average']) formattedObj['average'] = wei(obj['average']);
			if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
			if (obj['period']) formattedObj['period'] = wei(obj['period'], 0);
			if (obj['aggregatedPrices'])
				formattedObj['aggregatedPrices'] = wei(obj['aggregatedPrices'], 0);
			return formattedObj as Pick<CandleResult, K>;
		});
		results = results.concat(newResults);
		if (newResults.length < 1000) {
			break;
		}
		if (paginationKey) {
			paginationValue = rawResults[rawResults.length - 1][paginatedOptions.orderBy!];
		}
	} while (paginationKey && options.first && results.length < options.first);
	return options.first ? results.slice(0, options.first) : results;
};
export type FundingRateUpdateFilter = {
	id?: string | null;
	id_not?: string | null;
	id_gt?: string | null;
	id_lt?: string | null;
	id_gte?: string | null;
	id_lte?: string | null;
	id_in?: string[];
	id_not_in?: string[];
	timestamp?: WeiSource | null;
	timestamp_not?: WeiSource | null;
	timestamp_gt?: WeiSource | null;
	timestamp_lt?: WeiSource | null;
	timestamp_gte?: WeiSource | null;
	timestamp_lte?: WeiSource | null;
	timestamp_in?: WeiSource[];
	timestamp_not_in?: WeiSource[];
	market?: string | null;
	market_not?: string | null;
	market_in?: string[];
	market_not_in?: string[];
	market_contains?: string | null;
	market_not_contains?: string | null;
	sequenceLength?: WeiSource | null;
	sequenceLength_not?: WeiSource | null;
	sequenceLength_gt?: WeiSource | null;
	sequenceLength_lt?: WeiSource | null;
	sequenceLength_gte?: WeiSource | null;
	sequenceLength_lte?: WeiSource | null;
	sequenceLength_in?: WeiSource[];
	sequenceLength_not_in?: WeiSource[];
	funding?: WeiSource | null;
	funding_not?: WeiSource | null;
	funding_gt?: WeiSource | null;
	funding_lt?: WeiSource | null;
	funding_gte?: WeiSource | null;
	funding_lte?: WeiSource | null;
	funding_in?: WeiSource[];
	funding_not_in?: WeiSource[];
	_change_block?: any | null;
};
export type FundingRateUpdateResult = {
	id: string;
	timestamp: Wei;
	market: string;
	sequenceLength: Wei;
	funding: Wei;
};
export type FundingRateUpdateFields = {
	id: true;
	timestamp: true;
	market: true;
	sequenceLength: true;
	funding: true;
};
export type FundingRateUpdateArgs<K extends keyof FundingRateUpdateResult> = {
	[Property in keyof Pick<FundingRateUpdateFields, K>]: FundingRateUpdateFields[Property];
};
export const getFundingRateUpdateById = async function <K extends keyof FundingRateUpdateResult>(
	url: string,
	options: SingleQueryOptions,
	args: FundingRateUpdateArgs<K>
): Promise<Pick<FundingRateUpdateResult, K>> {
	const res = await axios.post(url, {
		query: generateGql('fundingRateUpdate', options, args),
	});
	const r = res.data as any;
	if (r.errors && r.errors.length) {
		throw new Error(r.errors[0].message);
	}
	const obj = r.data[Object.keys(r.data)[0]] as any;
	const formattedObj: any = {};
	if (obj['id']) formattedObj['id'] = obj['id'];
	if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
	if (obj['market']) formattedObj['market'] = obj['market'];
	if (obj['sequenceLength']) formattedObj['sequenceLength'] = wei(obj['sequenceLength'], 0);
	if (obj['funding']) formattedObj['funding'] = wei(obj['funding'], 0);
	return formattedObj as Pick<FundingRateUpdateResult, K>;
};
export const getFundingRateUpdates = async function <K extends keyof FundingRateUpdateResult>(
	url: string,
	options: MultiQueryOptions<FundingRateUpdateFilter, FundingRateUpdateResult>,
	args: FundingRateUpdateArgs<K>
): Promise<Pick<FundingRateUpdateResult, K>[]> {
	const paginatedOptions: Partial<MultiQueryOptions<
		FundingRateUpdateFilter,
		FundingRateUpdateResult
	>> = { ...options };
	let paginationKey: keyof FundingRateUpdateFilter | null = null;
	let paginationValue = '';
	if (options.first && options.first > MAX_PAGE) {
		paginatedOptions.first = MAX_PAGE;
		paginatedOptions.orderBy = options.orderBy || 'id';
		paginatedOptions.orderDirection = options.orderDirection || 'asc';
		paginationKey = (paginatedOptions.orderBy +
			(paginatedOptions.orderDirection === 'asc' ? '_gt' : '_lt')) as keyof FundingRateUpdateFilter;
		paginatedOptions.where = { ...options.where };
	}
	let results: Pick<FundingRateUpdateResult, K>[] = [];
	do {
		if (paginationKey && paginationValue)
			paginatedOptions.where![paginationKey] = paginationValue as any;
		const res = await axios.post(url, {
			query: generateGql('fundingRateUpdates', paginatedOptions, args),
		});
		const r = res.data as any;
		if (r.errors && r.errors.length) {
			throw new Error(r.errors[0].message);
		}
		const rawResults = r.data[Object.keys(r.data)[0]] as any[];
		const newResults = rawResults.map((obj) => {
			const formattedObj: any = {};
			if (obj['id']) formattedObj['id'] = obj['id'];
			if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
			if (obj['market']) formattedObj['market'] = obj['market'];
			if (obj['sequenceLength']) formattedObj['sequenceLength'] = wei(obj['sequenceLength'], 0);
			if (obj['funding']) formattedObj['funding'] = wei(obj['funding'], 0);
			return formattedObj as Pick<FundingRateUpdateResult, K>;
		});
		results = results.concat(newResults);
		if (newResults.length < 1000) {
			break;
		}
		if (paginationKey) {
			paginationValue = rawResults[rawResults.length - 1][paginatedOptions.orderBy!];
		}
	} while (paginationKey && options.first && results.length < options.first);
	return options.first ? results.slice(0, options.first) : results;
};
export type FuturesCumulativeStatFilter = {
	id?: string | null;
	id_not?: string | null;
	id_gt?: string | null;
	id_lt?: string | null;
	id_gte?: string | null;
	id_lte?: string | null;
	id_in?: string[];
	id_not_in?: string[];
	totalLiquidations?: WeiSource | null;
	totalLiquidations_not?: WeiSource | null;
	totalLiquidations_gt?: WeiSource | null;
	totalLiquidations_lt?: WeiSource | null;
	totalLiquidations_gte?: WeiSource | null;
	totalLiquidations_lte?: WeiSource | null;
	totalLiquidations_in?: WeiSource[];
	totalLiquidations_not_in?: WeiSource[];
	totalTrades?: WeiSource | null;
	totalTrades_not?: WeiSource | null;
	totalTrades_gt?: WeiSource | null;
	totalTrades_lt?: WeiSource | null;
	totalTrades_gte?: WeiSource | null;
	totalTrades_lte?: WeiSource | null;
	totalTrades_in?: WeiSource[];
	totalTrades_not_in?: WeiSource[];
	totalVolume?: WeiSource | null;
	totalVolume_not?: WeiSource | null;
	totalVolume_gt?: WeiSource | null;
	totalVolume_lt?: WeiSource | null;
	totalVolume_gte?: WeiSource | null;
	totalVolume_lte?: WeiSource | null;
	totalVolume_in?: WeiSource[];
	totalVolume_not_in?: WeiSource[];
	averageTradeSize?: WeiSource | null;
	averageTradeSize_not?: WeiSource | null;
	averageTradeSize_gt?: WeiSource | null;
	averageTradeSize_lt?: WeiSource | null;
	averageTradeSize_gte?: WeiSource | null;
	averageTradeSize_lte?: WeiSource | null;
	averageTradeSize_in?: WeiSource[];
	averageTradeSize_not_in?: WeiSource[];
	_change_block?: any | null;
};
export type FuturesCumulativeStatResult = {
	id: string;
	totalLiquidations: Wei;
	totalTrades: Wei;
	totalVolume: Wei;
	averageTradeSize: Wei;
};
export type FuturesCumulativeStatFields = {
	id: true;
	totalLiquidations: true;
	totalTrades: true;
	totalVolume: true;
	averageTradeSize: true;
};
export type FuturesCumulativeStatArgs<K extends keyof FuturesCumulativeStatResult> = {
	[Property in keyof Pick<FuturesCumulativeStatFields, K>]: FuturesCumulativeStatFields[Property];
};
export const getFuturesCumulativeStatById = async function <
	K extends keyof FuturesCumulativeStatResult
>(
	url: string,
	options: SingleQueryOptions,
	args: FuturesCumulativeStatArgs<K>
): Promise<Pick<FuturesCumulativeStatResult, K>> {
	const res = await axios.post(url, {
		query: generateGql('futuresCumulativeStat', options, args),
	});
	const r = res.data as any;
	if (r.errors && r.errors.length) {
		throw new Error(r.errors[0].message);
	}
	const obj = r.data[Object.keys(r.data)[0]] as any;
	const formattedObj: any = {};
	if (obj['id']) formattedObj['id'] = obj['id'];
	if (obj['totalLiquidations'])
		formattedObj['totalLiquidations'] = wei(obj['totalLiquidations'], 0);
	if (obj['totalTrades']) formattedObj['totalTrades'] = wei(obj['totalTrades'], 0);
	if (obj['totalVolume']) formattedObj['totalVolume'] = wei(obj['totalVolume'], 0);
	if (obj['averageTradeSize']) formattedObj['averageTradeSize'] = wei(obj['averageTradeSize'], 0);
	return formattedObj as Pick<FuturesCumulativeStatResult, K>;
};
export const getFuturesCumulativeStats = async function <
	K extends keyof FuturesCumulativeStatResult
>(
	url: string,
	options: MultiQueryOptions<FuturesCumulativeStatFilter, FuturesCumulativeStatResult>,
	args: FuturesCumulativeStatArgs<K>
): Promise<Pick<FuturesCumulativeStatResult, K>[]> {
	const paginatedOptions: Partial<MultiQueryOptions<
		FuturesCumulativeStatFilter,
		FuturesCumulativeStatResult
	>> = { ...options };
	let paginationKey: keyof FuturesCumulativeStatFilter | null = null;
	let paginationValue = '';
	if (options.first && options.first > MAX_PAGE) {
		paginatedOptions.first = MAX_PAGE;
		paginatedOptions.orderBy = options.orderBy || 'id';
		paginatedOptions.orderDirection = options.orderDirection || 'asc';
		paginationKey = (paginatedOptions.orderBy +
			(paginatedOptions.orderDirection === 'asc'
				? '_gt'
				: '_lt')) as keyof FuturesCumulativeStatFilter;
		paginatedOptions.where = { ...options.where };
	}
	let results: Pick<FuturesCumulativeStatResult, K>[] = [];
	do {
		if (paginationKey && paginationValue)
			paginatedOptions.where![paginationKey] = paginationValue as any;
		const res = await axios.post(url, {
			query: generateGql('futuresCumulativeStats', paginatedOptions, args),
		});
		const r = res.data as any;
		if (r.errors && r.errors.length) {
			throw new Error(r.errors[0].message);
		}
		const rawResults = r.data[Object.keys(r.data)[0]] as any[];
		const newResults = rawResults.map((obj) => {
			const formattedObj: any = {};
			if (obj['id']) formattedObj['id'] = obj['id'];
			if (obj['totalLiquidations'])
				formattedObj['totalLiquidations'] = wei(obj['totalLiquidations'], 0);
			if (obj['totalTrades']) formattedObj['totalTrades'] = wei(obj['totalTrades'], 0);
			if (obj['totalVolume']) formattedObj['totalVolume'] = wei(obj['totalVolume'], 0);
			if (obj['averageTradeSize'])
				formattedObj['averageTradeSize'] = wei(obj['averageTradeSize'], 0);
			return formattedObj as Pick<FuturesCumulativeStatResult, K>;
		});
		results = results.concat(newResults);
		if (newResults.length < 1000) {
			break;
		}
		if (paginationKey) {
			paginationValue = rawResults[rawResults.length - 1][paginatedOptions.orderBy!];
		}
	} while (paginationKey && options.first && results.length < options.first);
	return options.first ? results.slice(0, options.first) : results;
};
export type FuturesMarginTransferFilter = {
	id?: string | null;
	id_not?: string | null;
	id_gt?: string | null;
	id_lt?: string | null;
	id_gte?: string | null;
	id_lte?: string | null;
	id_in?: string[];
	id_not_in?: string[];
	timestamp?: WeiSource | null;
	timestamp_not?: WeiSource | null;
	timestamp_gt?: WeiSource | null;
	timestamp_lt?: WeiSource | null;
	timestamp_gte?: WeiSource | null;
	timestamp_lte?: WeiSource | null;
	timestamp_in?: WeiSource[];
	timestamp_not_in?: WeiSource[];
	account?: string | null;
	account_not?: string | null;
	account_in?: string[];
	account_not_in?: string[];
	account_contains?: string | null;
	account_not_contains?: string | null;
	market?: string | null;
	market_not?: string | null;
	market_in?: string[];
	market_not_in?: string[];
	market_contains?: string | null;
	market_not_contains?: string | null;
	asset?: string | null;
	asset_not?: string | null;
	asset_in?: string[];
	asset_not_in?: string[];
	asset_contains?: string | null;
	asset_not_contains?: string | null;
	size?: WeiSource | null;
	size_not?: WeiSource | null;
	size_gt?: WeiSource | null;
	size_lt?: WeiSource | null;
	size_gte?: WeiSource | null;
	size_lte?: WeiSource | null;
	size_in?: WeiSource[];
	size_not_in?: WeiSource[];
	txHash?: string | null;
	txHash_not?: string | null;
	txHash_gt?: string | null;
	txHash_lt?: string | null;
	txHash_gte?: string | null;
	txHash_lte?: string | null;
	txHash_in?: string[];
	txHash_not_in?: string[];
	txHash_contains?: string | null;
	txHash_contains_nocase?: string | null;
	txHash_not_contains?: string | null;
	txHash_not_contains_nocase?: string | null;
	txHash_starts_with?: string | null;
	txHash_starts_with_nocase?: string | null;
	txHash_not_starts_with?: string | null;
	txHash_not_starts_with_nocase?: string | null;
	txHash_ends_with?: string | null;
	txHash_ends_with_nocase?: string | null;
	txHash_not_ends_with?: string | null;
	txHash_not_ends_with_nocase?: string | null;
	_change_block?: any | null;
};
export type FuturesMarginTransferResult = {
	id: string;
	timestamp: Wei;
	account: string;
	market: string;
	asset: string;
	size: Wei;
	txHash: string;
};
export type FuturesMarginTransferFields = {
	id: true;
	timestamp: true;
	account: true;
	market: true;
	asset: true;
	size: true;
	txHash: true;
};
export type FuturesMarginTransferArgs<K extends keyof FuturesMarginTransferResult> = {
	[Property in keyof Pick<FuturesMarginTransferFields, K>]: FuturesMarginTransferFields[Property];
};
export const getFuturesMarginTransferById = async function <
	K extends keyof FuturesMarginTransferResult
>(
	url: string,
	options: SingleQueryOptions,
	args: FuturesMarginTransferArgs<K>
): Promise<Pick<FuturesMarginTransferResult, K>> {
	const res = await axios.post(url, {
		query: generateGql('futuresMarginTransfer', options, args),
	});
	const r = res.data as any;
	if (r.errors && r.errors.length) {
		throw new Error(r.errors[0].message);
	}
	const obj = r.data[Object.keys(r.data)[0]] as any;
	const formattedObj: any = {};
	if (obj['id']) formattedObj['id'] = obj['id'];
	if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
	if (obj['account']) formattedObj['account'] = obj['account'];
	if (obj['market']) formattedObj['market'] = obj['market'];
	if (obj['asset']) formattedObj['asset'] = obj['asset'];
	if (obj['size']) formattedObj['size'] = wei(obj['size'], 0);
	if (obj['txHash']) formattedObj['txHash'] = obj['txHash'];
	return formattedObj as Pick<FuturesMarginTransferResult, K>;
};
export const getFuturesMarginTransfers = async function <
	K extends keyof FuturesMarginTransferResult
>(
	url: string,
	options: MultiQueryOptions<FuturesMarginTransferFilter, FuturesMarginTransferResult>,
	args: FuturesMarginTransferArgs<K>
): Promise<Pick<FuturesMarginTransferResult, K>[]> {
	const paginatedOptions: Partial<MultiQueryOptions<
		FuturesMarginTransferFilter,
		FuturesMarginTransferResult
	>> = { ...options };
	let paginationKey: keyof FuturesMarginTransferFilter | null = null;
	let paginationValue = '';
	if (options.first && options.first > MAX_PAGE) {
		paginatedOptions.first = MAX_PAGE;
		paginatedOptions.orderBy = options.orderBy || 'id';
		paginatedOptions.orderDirection = options.orderDirection || 'asc';
		paginationKey = (paginatedOptions.orderBy +
			(paginatedOptions.orderDirection === 'asc'
				? '_gt'
				: '_lt')) as keyof FuturesMarginTransferFilter;
		paginatedOptions.where = { ...options.where };
	}
	let results: Pick<FuturesMarginTransferResult, K>[] = [];
	do {
		if (paginationKey && paginationValue)
			paginatedOptions.where![paginationKey] = paginationValue as any;
		const res = await axios.post(url, {
			query: generateGql('futuresMarginTransfers', paginatedOptions, args),
		});
		const r = res.data as any;
		if (r.errors && r.errors.length) {
			throw new Error(r.errors[0].message);
		}
		const rawResults = r.data[Object.keys(r.data)[0]] as any[];
		const newResults = rawResults.map((obj) => {
			const formattedObj: any = {};
			if (obj['id']) formattedObj['id'] = obj['id'];
			if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
			if (obj['account']) formattedObj['account'] = obj['account'];
			if (obj['market']) formattedObj['market'] = obj['market'];
			if (obj['asset']) formattedObj['asset'] = obj['asset'];
			if (obj['size']) formattedObj['size'] = wei(obj['size'], 0);
			if (obj['txHash']) formattedObj['txHash'] = obj['txHash'];
			return formattedObj as Pick<FuturesMarginTransferResult, K>;
		});
		results = results.concat(newResults);
		if (newResults.length < 1000) {
			break;
		}
		if (paginationKey) {
			paginationValue = rawResults[rawResults.length - 1][paginatedOptions.orderBy!];
		}
	} while (paginationKey && options.first && results.length < options.first);
	return options.first ? results.slice(0, options.first) : results;
};
export type FuturesMarketFilter = {
	id?: string | null;
	id_not?: string | null;
	id_gt?: string | null;
	id_lt?: string | null;
	id_gte?: string | null;
	id_lte?: string | null;
	id_in?: string[];
	id_not_in?: string[];
	asset?: string | null;
	asset_not?: string | null;
	asset_in?: string[];
	asset_not_in?: string[];
	asset_contains?: string | null;
	asset_not_contains?: string | null;
	marketStats?: string | null;
	marketStats_not?: string | null;
	marketStats_gt?: string | null;
	marketStats_lt?: string | null;
	marketStats_gte?: string | null;
	marketStats_lte?: string | null;
	marketStats_in?: string[];
	marketStats_not_in?: string[];
	marketStats_contains?: string | null;
	marketStats_contains_nocase?: string | null;
	marketStats_not_contains?: string | null;
	marketStats_not_contains_nocase?: string | null;
	marketStats_starts_with?: string | null;
	marketStats_starts_with_nocase?: string | null;
	marketStats_not_starts_with?: string | null;
	marketStats_not_starts_with_nocase?: string | null;
	marketStats_ends_with?: string | null;
	marketStats_ends_with_nocase?: string | null;
	marketStats_not_ends_with?: string | null;
	marketStats_not_ends_with_nocase?: string | null;
	_change_block?: any | null;
};
export type FuturesMarketResult = {
	id: string;
	asset: string;
	marketStats: Partial<FuturesCumulativeStatResult>;
};
export type FuturesMarketFields = {
	id: true;
	asset: true;
	marketStats: FuturesCumulativeStatFields;
};
export type FuturesMarketArgs<K extends keyof FuturesMarketResult> = {
	[Property in keyof Pick<FuturesMarketFields, K>]: FuturesMarketFields[Property];
};
export const getFuturesMarketById = async function <K extends keyof FuturesMarketResult>(
	url: string,
	options: SingleQueryOptions,
	args: FuturesMarketArgs<K>
): Promise<Pick<FuturesMarketResult, K>> {
	const res = await axios.post(url, {
		query: generateGql('futuresMarket', options, args),
	});
	const r = res.data as any;
	if (r.errors && r.errors.length) {
		throw new Error(r.errors[0].message);
	}
	const obj = r.data[Object.keys(r.data)[0]] as any;
	const formattedObj: any = {};
	if (obj['id']) formattedObj['id'] = obj['id'];
	if (obj['asset']) formattedObj['asset'] = obj['asset'];
	if (obj['marketStats']) formattedObj['marketStats'] = obj['marketStats'];
	return formattedObj as Pick<FuturesMarketResult, K>;
};
export const getFuturesMarkets = async function <K extends keyof FuturesMarketResult>(
	url: string,
	options: MultiQueryOptions<FuturesMarketFilter, FuturesMarketResult>,
	args: FuturesMarketArgs<K>
): Promise<Pick<FuturesMarketResult, K>[]> {
	const paginatedOptions: Partial<MultiQueryOptions<FuturesMarketFilter, FuturesMarketResult>> = {
		...options,
	};
	let paginationKey: keyof FuturesMarketFilter | null = null;
	let paginationValue = '';
	if (options.first && options.first > MAX_PAGE) {
		paginatedOptions.first = MAX_PAGE;
		paginatedOptions.orderBy = options.orderBy || 'id';
		paginatedOptions.orderDirection = options.orderDirection || 'asc';
		paginationKey = (paginatedOptions.orderBy +
			(paginatedOptions.orderDirection === 'asc' ? '_gt' : '_lt')) as keyof FuturesMarketFilter;
		paginatedOptions.where = { ...options.where };
	}
	let results: Pick<FuturesMarketResult, K>[] = [];
	do {
		if (paginationKey && paginationValue)
			paginatedOptions.where![paginationKey] = paginationValue as any;
		const res = await axios.post(url, {
			query: generateGql('futuresMarkets', paginatedOptions, args),
		});
		const r = res.data as any;
		if (r.errors && r.errors.length) {
			throw new Error(r.errors[0].message);
		}
		const rawResults = r.data[Object.keys(r.data)[0]] as any[];
		const newResults = rawResults.map((obj) => {
			const formattedObj: any = {};
			if (obj['id']) formattedObj['id'] = obj['id'];
			if (obj['asset']) formattedObj['asset'] = obj['asset'];
			if (obj['marketStats']) formattedObj['marketStats'] = obj['marketStats'];
			return formattedObj as Pick<FuturesMarketResult, K>;
		});
		results = results.concat(newResults);
		if (newResults.length < 1000) {
			break;
		}
		if (paginationKey) {
			paginationValue = rawResults[rawResults.length - 1][paginatedOptions.orderBy!];
		}
	} while (paginationKey && options.first && results.length < options.first);
	return options.first ? results.slice(0, options.first) : results;
};
export type FuturesOneMinStatFilter = {
	id?: string | null;
	id_not?: string | null;
	id_gt?: string | null;
	id_lt?: string | null;
	id_gte?: string | null;
	id_lte?: string | null;
	id_in?: string[];
	id_not_in?: string[];
	trades?: WeiSource | null;
	trades_not?: WeiSource | null;
	trades_gt?: WeiSource | null;
	trades_lt?: WeiSource | null;
	trades_gte?: WeiSource | null;
	trades_lte?: WeiSource | null;
	trades_in?: WeiSource[];
	trades_not_in?: WeiSource[];
	volume?: WeiSource | null;
	volume_not?: WeiSource | null;
	volume_gt?: WeiSource | null;
	volume_lt?: WeiSource | null;
	volume_gte?: WeiSource | null;
	volume_lte?: WeiSource | null;
	volume_in?: WeiSource[];
	volume_not_in?: WeiSource[];
	timestamp?: WeiSource | null;
	timestamp_not?: WeiSource | null;
	timestamp_gt?: WeiSource | null;
	timestamp_lt?: WeiSource | null;
	timestamp_gte?: WeiSource | null;
	timestamp_lte?: WeiSource | null;
	timestamp_in?: WeiSource[];
	timestamp_not_in?: WeiSource[];
	_change_block?: any | null;
};
export type FuturesOneMinStatResult = {
	id: string;
	trades: Wei;
	volume: Wei;
	timestamp: Wei;
};
export type FuturesOneMinStatFields = {
	id: true;
	trades: true;
	volume: true;
	timestamp: true;
};
export type FuturesOneMinStatArgs<K extends keyof FuturesOneMinStatResult> = {
	[Property in keyof Pick<FuturesOneMinStatFields, K>]: FuturesOneMinStatFields[Property];
};
export const getFuturesOneMinStatById = async function <K extends keyof FuturesOneMinStatResult>(
	url: string,
	options: SingleQueryOptions,
	args: FuturesOneMinStatArgs<K>
): Promise<Pick<FuturesOneMinStatResult, K>> {
	const res = await axios.post(url, {
		query: generateGql('futuresOneMinStat', options, args),
	});
	const r = res.data as any;
	if (r.errors && r.errors.length) {
		throw new Error(r.errors[0].message);
	}
	const obj = r.data[Object.keys(r.data)[0]] as any;
	const formattedObj: any = {};
	if (obj['id']) formattedObj['id'] = obj['id'];
	if (obj['trades']) formattedObj['trades'] = wei(obj['trades'], 0);
	if (obj['volume']) formattedObj['volume'] = wei(obj['volume'], 0);
	if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
	return formattedObj as Pick<FuturesOneMinStatResult, K>;
};
export const getFuturesOneMinStats = async function <K extends keyof FuturesOneMinStatResult>(
	url: string,
	options: MultiQueryOptions<FuturesOneMinStatFilter, FuturesOneMinStatResult>,
	args: FuturesOneMinStatArgs<K>
): Promise<Pick<FuturesOneMinStatResult, K>[]> {
	const paginatedOptions: Partial<MultiQueryOptions<
		FuturesOneMinStatFilter,
		FuturesOneMinStatResult
	>> = { ...options };
	let paginationKey: keyof FuturesOneMinStatFilter | null = null;
	let paginationValue = '';
	if (options.first && options.first > MAX_PAGE) {
		paginatedOptions.first = MAX_PAGE;
		paginatedOptions.orderBy = options.orderBy || 'id';
		paginatedOptions.orderDirection = options.orderDirection || 'asc';
		paginationKey = (paginatedOptions.orderBy +
			(paginatedOptions.orderDirection === 'asc' ? '_gt' : '_lt')) as keyof FuturesOneMinStatFilter;
		paginatedOptions.where = { ...options.where };
	}
	let results: Pick<FuturesOneMinStatResult, K>[] = [];
	do {
		if (paginationKey && paginationValue)
			paginatedOptions.where![paginationKey] = paginationValue as any;
		const res = await axios.post(url, {
			query: generateGql('futuresOneMinStats', paginatedOptions, args),
		});
		const r = res.data as any;
		if (r.errors && r.errors.length) {
			throw new Error(r.errors[0].message);
		}
		const rawResults = r.data[Object.keys(r.data)[0]] as any[];
		const newResults = rawResults.map((obj) => {
			const formattedObj: any = {};
			if (obj['id']) formattedObj['id'] = obj['id'];
			if (obj['trades']) formattedObj['trades'] = wei(obj['trades'], 0);
			if (obj['volume']) formattedObj['volume'] = wei(obj['volume'], 0);
			if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
			return formattedObj as Pick<FuturesOneMinStatResult, K>;
		});
		results = results.concat(newResults);
		if (newResults.length < 1000) {
			break;
		}
		if (paginationKey) {
			paginationValue = rawResults[rawResults.length - 1][paginatedOptions.orderBy!];
		}
	} while (paginationKey && options.first && results.length < options.first);
	return options.first ? results.slice(0, options.first) : results;
};
export type FuturesOrderFilter = {
	id?: string | null;
	id_not?: string | null;
	id_gt?: string | null;
	id_lt?: string | null;
	id_gte?: string | null;
	id_lte?: string | null;
	id_in?: string[];
	id_not_in?: string[];
	size?: WeiSource | null;
	size_not?: WeiSource | null;
	size_gt?: WeiSource | null;
	size_lt?: WeiSource | null;
	size_gte?: WeiSource | null;
	size_lte?: WeiSource | null;
	size_in?: WeiSource[];
	size_not_in?: WeiSource[];
	asset?: string | null;
	asset_not?: string | null;
	asset_in?: string[];
	asset_not_in?: string[];
	asset_contains?: string | null;
	asset_not_contains?: string | null;
	market?: string | null;
	market_not?: string | null;
	market_in?: string[];
	market_not_in?: string[];
	market_contains?: string | null;
	market_not_contains?: string | null;
	account?: string | null;
	account_not?: string | null;
	account_in?: string[];
	account_not_in?: string[];
	account_contains?: string | null;
	account_not_contains?: string | null;
	targetRoundId?: WeiSource | null;
	targetRoundId_not?: WeiSource | null;
	targetRoundId_gt?: WeiSource | null;
	targetRoundId_lt?: WeiSource | null;
	targetRoundId_gte?: WeiSource | null;
	targetRoundId_lte?: WeiSource | null;
	targetRoundId_in?: WeiSource[];
	targetRoundId_not_in?: WeiSource[];
	timestamp?: WeiSource | null;
	timestamp_not?: WeiSource | null;
	timestamp_gt?: WeiSource | null;
	timestamp_lt?: WeiSource | null;
	timestamp_gte?: WeiSource | null;
	timestamp_lte?: WeiSource | null;
	timestamp_in?: WeiSource[];
	timestamp_not_in?: WeiSource[];
	orderType?: FuturesOrderType | null;
	orderType_not?: FuturesOrderType | null;
	orderType_in?: FuturesOrderType[];
	orderType_not_in?: FuturesOrderType[];
	status?: FuturesOrderStatus | null;
	status_not?: FuturesOrderStatus | null;
	status_in?: FuturesOrderStatus[];
	status_not_in?: FuturesOrderStatus[];
};

export type FuturesOrderType = 'NextPrice' | 'Limit' | 'Market' | 'Liquidation';
export type FuturesOrderStatus = 'Pending' | 'Filled' | 'Cancelled';

export type FuturesOrderResult = {
	id: string;
	size: Wei;
	asset: string;
	market: string;
	account: string;
	targetRoundId: Wei;
	timestamp: Wei;
	orderType: FuturesOrderType;
	status: FuturesOrderStatus;
};

export type FuturesOrderFields = {
	id: true;
	size: true;
	asset: true;
	market: true;
	account: true;
	targetRoundId: true;
	timestamp: true;
	orderType: true;
	status: true;
};

export type FuturesOrderArgs<K extends keyof FuturesOrderResult> = {
	[Property in keyof Pick<FuturesOrderFields, K>]: FuturesOrderFields[Property];
};
export const getFuturesOrderById = async function <K extends keyof FuturesOrderResult>(
	url: string,
	options: SingleQueryOptions,
	args: FuturesOrderArgs<K>
): Promise<Pick<FuturesOrderResult, K>> {
	const res = await axios.post(url, {
		query: generateGql('futuresOrder', options, args),
	});
	const r = res.data as any;
	if (r.errors && r.errors.length) {
		throw new Error(r.errors[0].message);
	}
	const obj = r.data[Object.keys(r.data)[0]] as any;
	const formattedObj: any = {};
	if (obj['id']) formattedObj['id'] = obj['id'];
	if (obj['size']) formattedObj['size'] = wei(obj['size'], 0);
	if (obj['asset']) formattedObj['asset'] = obj['asset'];
	if (obj['market']) formattedObj['market'] = obj['market'];
	if (obj['account']) formattedObj['account'] = obj['account'];
	if (obj['targetRoundId']) formattedObj['targetRoundId'] = wei(obj['targetRoundId'], 0);
	if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
	if (obj['orderType']) formattedObj['orderType'] = obj['orderType'];
	if (obj['status']) formattedObj['status'] = obj['status'];
	return formattedObj as Pick<FuturesOrderResult, K>;
};
export const getFuturesOrders = async function <K extends keyof FuturesOrderResult>(
	url: string,
	options: MultiQueryOptions<FuturesOrderFilter, FuturesOrderResult>,
	args: FuturesOrderArgs<K>
): Promise<Pick<FuturesOrderResult, K>[]> {
	const paginatedOptions: Partial<MultiQueryOptions<FuturesOrderFilter, FuturesOrderResult>> = {
		...options,
	};
	let paginationKey: keyof FuturesOrderFilter | null = null;
	let paginationValue = '';
	if (options.first && options.first > MAX_PAGE) {
		paginatedOptions.first = MAX_PAGE;
		paginatedOptions.orderBy = options.orderBy || 'id';
		paginatedOptions.orderDirection = options.orderDirection || 'asc';
		paginationKey = (paginatedOptions.orderBy +
			(paginatedOptions.orderDirection === 'asc' ? '_gt' : '_lt')) as keyof FuturesOrderFilter;
		paginatedOptions.where = { ...options.where };
	}
	let results: Pick<FuturesOrderResult, K>[] = [];
	do {
		if (paginationKey && paginationValue)
			paginatedOptions.where![paginationKey] = paginationValue as any;
		const res = await axios.post(url, {
			query: generateGql('futuresOrders', paginatedOptions, args),
		});
		const r = res.data as any;
		if (r.errors && r.errors.length) {
			throw new Error(r.errors[0].message);
		}
		const rawResults = r.data[Object.keys(r.data)[0]] as any[];
		const newResults = rawResults.map((obj) => {
			const formattedObj: any = {};
			if (obj['id']) formattedObj['id'] = obj['id'];
			if (obj['size']) formattedObj['size'] = wei(obj['size'], 0);
			if (obj['asset']) formattedObj['asset'] = obj['asset'];
			if (obj['market']) formattedObj['market'] = obj['market'];
			if (obj['account']) formattedObj['account'] = obj['account'];
			if (obj['targetRoundId']) formattedObj['targetRoundId'] = wei(obj['targetRoundId'], 0);
			if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
			if (obj['orderType']) formattedObj['orderType'] = obj['orderType'];
			if (obj['status']) formattedObj['status'] = obj['status'];
			return formattedObj as Pick<FuturesOrderResult, K>;
		});
		results = results.concat(newResults);
		if (newResults.length < 1000) {
			break;
		}
		if (paginationKey) {
			paginationValue = rawResults[rawResults.length - 1][paginatedOptions.orderBy!];
		}
	} while (paginationKey && options.first && results.length < options.first);
	return options.first ? results.slice(0, options.first) : results;
};
export type FuturesPositionFilter = {
	id?: string | null;
	id_not?: string | null;
	id_gt?: string | null;
	id_lt?: string | null;
	id_gte?: string | null;
	id_lte?: string | null;
	id_in?: string[];
	id_not_in?: string[];
	lastTxHash?: string | null;
	lastTxHash_not?: string | null;
	lastTxHash_in?: string[];
	lastTxHash_not_in?: string[];
	lastTxHash_contains?: string | null;
	lastTxHash_not_contains?: string | null;
	openTimestamp?: WeiSource | null;
	openTimestamp_not?: WeiSource | null;
	openTimestamp_gt?: WeiSource | null;
	openTimestamp_lt?: WeiSource | null;
	openTimestamp_gte?: WeiSource | null;
	openTimestamp_lte?: WeiSource | null;
	openTimestamp_in?: WeiSource[];
	openTimestamp_not_in?: WeiSource[];
	closeTimestamp?: WeiSource | null;
	closeTimestamp_not?: WeiSource | null;
	closeTimestamp_gt?: WeiSource | null;
	closeTimestamp_lt?: WeiSource | null;
	closeTimestamp_gte?: WeiSource | null;
	closeTimestamp_lte?: WeiSource | null;
	closeTimestamp_in?: WeiSource[];
	closeTimestamp_not_in?: WeiSource[];
	timestamp?: WeiSource | null;
	timestamp_not?: WeiSource | null;
	timestamp_gt?: WeiSource | null;
	timestamp_lt?: WeiSource | null;
	timestamp_gte?: WeiSource | null;
	timestamp_lte?: WeiSource | null;
	timestamp_in?: WeiSource[];
	timestamp_not_in?: WeiSource[];
	market?: string | null;
	market_not?: string | null;
	market_in?: string[];
	market_not_in?: string[];
	market_contains?: string | null;
	market_not_contains?: string | null;
	asset?: string | null;
	asset_not?: string | null;
	asset_in?: string[];
	asset_not_in?: string[];
	asset_contains?: string | null;
	asset_not_contains?: string | null;
	account?: string | null;
	account_not?: string | null;
	account_in?: string[];
	account_not_in?: string[];
	account_contains?: string | null;
	account_not_contains?: string | null;
	isOpen?: boolean | null;
	isOpen_not?: boolean | null;
	isOpen_in?: boolean[];
	isOpen_not_in?: boolean[];
	isLiquidated?: boolean | null;
	isLiquidated_not?: boolean | null;
	isLiquidated_in?: boolean[];
	isLiquidated_not_in?: boolean[];
	trades?: WeiSource | null;
	trades_not?: WeiSource | null;
	trades_gt?: WeiSource | null;
	trades_lt?: WeiSource | null;
	trades_gte?: WeiSource | null;
	trades_lte?: WeiSource | null;
	trades_in?: WeiSource[];
	trades_not_in?: WeiSource[];
	totalVolume?: WeiSource | null;
	totalVolume_not?: WeiSource | null;
	totalVolume_gt?: WeiSource | null;
	totalVolume_lt?: WeiSource | null;
	totalVolume_gte?: WeiSource | null;
	totalVolume_lte?: WeiSource | null;
	totalVolume_in?: WeiSource[];
	totalVolume_not_in?: WeiSource[];
	size?: WeiSource | null;
	size_not?: WeiSource | null;
	size_gt?: WeiSource | null;
	size_lt?: WeiSource | null;
	size_gte?: WeiSource | null;
	size_lte?: WeiSource | null;
	size_in?: WeiSource[];
	size_not_in?: WeiSource[];
	margin?: WeiSource | null;
	margin_not?: WeiSource | null;
	margin_gt?: WeiSource | null;
	margin_lt?: WeiSource | null;
	margin_gte?: WeiSource | null;
	margin_lte?: WeiSource | null;
	margin_in?: WeiSource[];
	margin_not_in?: WeiSource[];
	pnl?: WeiSource | null;
	pnl_not?: WeiSource | null;
	pnl_gt?: WeiSource | null;
	pnl_lt?: WeiSource | null;
	pnl_gte?: WeiSource | null;
	pnl_lte?: WeiSource | null;
	pnl_in?: WeiSource[];
	pnl_not_in?: WeiSource[];
	feesPaid?: WeiSource | null;
	feesPaid_not?: WeiSource | null;
	feesPaid_gt?: WeiSource | null;
	feesPaid_lt?: WeiSource | null;
	feesPaid_gte?: WeiSource | null;
	feesPaid_lte?: WeiSource | null;
	feesPaid_in?: WeiSource[];
	feesPaid_not_in?: WeiSource[];
	netFunding?: WeiSource | null;
	netFunding_not?: WeiSource | null;
	netFunding_gt?: WeiSource | null;
	netFunding_lt?: WeiSource | null;
	netFunding_gte?: WeiSource | null;
	netFunding_lte?: WeiSource | null;
	netFunding_in?: WeiSource[];
	netFunding_not_in?: WeiSource[];
	fundingIndex?: WeiSource | null;
	fundingIndex_not?: WeiSource | null;
	fundingIndex_gt?: WeiSource | null;
	fundingIndex_lt?: WeiSource | null;
	fundingIndex_gte?: WeiSource | null;
	fundingIndex_lte?: WeiSource | null;
	fundingIndex_in?: WeiSource[];
	fundingIndex_not_in?: WeiSource[];
	entryPrice?: WeiSource | null;
	entryPrice_not?: WeiSource | null;
	entryPrice_gt?: WeiSource | null;
	entryPrice_lt?: WeiSource | null;
	entryPrice_gte?: WeiSource | null;
	entryPrice_lte?: WeiSource | null;
	entryPrice_in?: WeiSource[];
	entryPrice_not_in?: WeiSource[];
	avgEntryPrice?: WeiSource | null;
	avgEntryPrice_not?: WeiSource | null;
	avgEntryPrice_gt?: WeiSource | null;
	avgEntryPrice_lt?: WeiSource | null;
	avgEntryPrice_gte?: WeiSource | null;
	avgEntryPrice_lte?: WeiSource | null;
	avgEntryPrice_in?: WeiSource[];
	avgEntryPrice_not_in?: WeiSource[];
	lastPrice?: WeiSource | null;
	lastPrice_not?: WeiSource | null;
	lastPrice_gt?: WeiSource | null;
	lastPrice_lt?: WeiSource | null;
	lastPrice_gte?: WeiSource | null;
	lastPrice_lte?: WeiSource | null;
	lastPrice_in?: WeiSource[];
	lastPrice_not_in?: WeiSource[];
	exitPrice?: WeiSource | null;
	exitPrice_not?: WeiSource | null;
	exitPrice_gt?: WeiSource | null;
	exitPrice_lt?: WeiSource | null;
	exitPrice_gte?: WeiSource | null;
	exitPrice_lte?: WeiSource | null;
	exitPrice_in?: WeiSource[];
	exitPrice_not_in?: WeiSource[];
	_change_block?: any | null;
};
export type FuturesPositionResult = {
	id: string;
	lastTxHash: string;
	openTimestamp: Wei;
	closeTimestamp: Wei | null;
	timestamp: Wei;
	market: string;
	asset: string;
	account: string;
	isOpen: boolean;
	isLiquidated: boolean;
	trades: Wei;
	totalVolume: Wei;
	size: Wei;
	margin: Wei;
	pnl: Wei;
	feesPaid: Wei;
	netFunding: Wei;
	fundingIndex: Wei;
	entryPrice: Wei;
	avgEntryPrice: Wei;
	lastPrice: Wei;
	exitPrice: Wei | null;
};
export type FuturesPositionFields = {
	id: true;
	lastTxHash: true;
	openTimestamp: true;
	closeTimestamp: true;
	timestamp: true;
	market: true;
	asset: true;
	account: true;
	isOpen: true;
	isLiquidated: true;
	trades: true;
	totalVolume: true;
	size: true;
	margin: true;
	pnl: true;
	feesPaid: true;
	netFunding: true;
	fundingIndex: true;
	entryPrice: true;
	avgEntryPrice: true;
	lastPrice: true;
	exitPrice: true;
};
export type FuturesPositionArgs<K extends keyof FuturesPositionResult> = {
	[Property in keyof Pick<FuturesPositionFields, K>]: FuturesPositionFields[Property];
};
export const getFuturesPositionById = async function <K extends keyof FuturesPositionResult>(
	url: string,
	options: SingleQueryOptions,
	args: FuturesPositionArgs<K>
): Promise<Pick<FuturesPositionResult, K>> {
	const res = await axios.post(url, {
		query: generateGql('futuresPosition', options, args),
	});
	const r = res.data as any;
	if (r.errors && r.errors.length) {
		throw new Error(r.errors[0].message);
	}
	const obj = r.data[Object.keys(r.data)[0]] as any;
	const formattedObj: any = {};
	if (obj['id']) formattedObj['id'] = obj['id'];
	if (obj['lastTxHash']) formattedObj['lastTxHash'] = obj['lastTxHash'];
	if (obj['openTimestamp']) formattedObj['openTimestamp'] = wei(obj['openTimestamp'], 0);
	if (obj['closeTimestamp']) formattedObj['closeTimestamp'] = wei(obj['closeTimestamp'], 0);
	if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
	if (obj['market']) formattedObj['market'] = obj['market'];
	if (obj['asset']) formattedObj['asset'] = obj['asset'];
	if (obj['account']) formattedObj['account'] = obj['account'];
	if (obj['isOpen']) formattedObj['isOpen'] = obj['isOpen'];
	if (obj['isLiquidated']) formattedObj['isLiquidated'] = obj['isLiquidated'];
	if (obj['trades']) formattedObj['trades'] = wei(obj['trades'], 0);
	if (obj['totalVolume']) formattedObj['totalVolume'] = wei(obj['totalVolume'], 0);
	if (obj['size']) formattedObj['size'] = wei(obj['size'], 0);
	if (obj['margin']) formattedObj['margin'] = wei(obj['margin'], 0);
	if (obj['pnl']) formattedObj['pnl'] = wei(obj['pnl'], 0);
	if (obj['feesPaid']) formattedObj['feesPaid'] = wei(obj['feesPaid'], 0);
	if (obj['netFunding']) formattedObj['netFunding'] = wei(obj['netFunding'], 0);
	if (obj['fundingIndex']) formattedObj['fundingIndex'] = wei(obj['fundingIndex'], 0);
	if (obj['entryPrice']) formattedObj['entryPrice'] = wei(obj['entryPrice'], 0);
	if (obj['avgEntryPrice']) formattedObj['avgEntryPrice'] = wei(obj['avgEntryPrice'], 0);
	if (obj['lastPrice']) formattedObj['lastPrice'] = wei(obj['lastPrice'], 0);
	if (obj['exitPrice']) formattedObj['exitPrice'] = wei(obj['exitPrice'], 0);
	return formattedObj as Pick<FuturesPositionResult, K>;
};
export const getFuturesPositions = async function <K extends keyof FuturesPositionResult>(
	url: string,
	options: MultiQueryOptions<FuturesPositionFilter, FuturesPositionResult>,
	args: FuturesPositionArgs<K>
): Promise<Pick<FuturesPositionResult, K>[]> {
	const paginatedOptions: Partial<MultiQueryOptions<
		FuturesPositionFilter,
		FuturesPositionResult
	>> = { ...options };
	let paginationKey: keyof FuturesPositionFilter | null = null;
	let paginationValue = '';
	if (options.first && options.first > MAX_PAGE) {
		paginatedOptions.first = MAX_PAGE;
		paginatedOptions.orderBy = options.orderBy || 'id';
		paginatedOptions.orderDirection = options.orderDirection || 'asc';
		paginationKey = (paginatedOptions.orderBy +
			(paginatedOptions.orderDirection === 'asc' ? '_gt' : '_lt')) as keyof FuturesPositionFilter;
		paginatedOptions.where = { ...options.where };
	}
	let results: Pick<FuturesPositionResult, K>[] = [];
	do {
		if (paginationKey && paginationValue)
			paginatedOptions.where![paginationKey] = paginationValue as any;
		const res = await axios.post(url, {
			query: generateGql('futuresPositions', paginatedOptions, args),
		});
		const r = res.data as any;
		if (r.errors && r.errors.length) {
			throw new Error(r.errors[0].message);
		}
		const rawResults = r.data[Object.keys(r.data)[0]] as any[];
		const newResults = rawResults.map((obj) => {
			const formattedObj: any = {};
			if (obj['id']) formattedObj['id'] = obj['id'];
			if (obj['lastTxHash']) formattedObj['lastTxHash'] = obj['lastTxHash'];
			if (obj['openTimestamp']) formattedObj['openTimestamp'] = wei(obj['openTimestamp'], 0);
			if (obj['closeTimestamp']) formattedObj['closeTimestamp'] = wei(obj['closeTimestamp'], 0);
			if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
			if (obj['market']) formattedObj['market'] = obj['market'];
			if (obj['asset']) formattedObj['asset'] = obj['asset'];
			if (obj['account']) formattedObj['account'] = obj['account'];
			if (obj['isOpen']) formattedObj['isOpen'] = obj['isOpen'];
			if (obj['isLiquidated']) formattedObj['isLiquidated'] = obj['isLiquidated'];
			if (obj['trades']) formattedObj['trades'] = wei(obj['trades'], 0);
			if (obj['totalVolume']) formattedObj['totalVolume'] = wei(obj['totalVolume'], 0);
			if (obj['size']) formattedObj['size'] = wei(obj['size'], 0);
			if (obj['margin']) formattedObj['margin'] = wei(obj['margin'], 0);
			if (obj['pnl']) formattedObj['pnl'] = wei(obj['pnl'], 0);
			if (obj['feesPaid']) formattedObj['feesPaid'] = wei(obj['feesPaid'], 0);
			if (obj['netFunding']) formattedObj['netFunding'] = wei(obj['netFunding'], 0);
			if (obj['fundingIndex']) formattedObj['fundingIndex'] = wei(obj['fundingIndex'], 0);
			if (obj['entryPrice']) formattedObj['entryPrice'] = wei(obj['entryPrice'], 0);
			if (obj['avgEntryPrice']) formattedObj['avgEntryPrice'] = wei(obj['avgEntryPrice'], 0);
			if (obj['lastPrice']) formattedObj['lastPrice'] = wei(obj['lastPrice'], 0);
			if (obj['exitPrice']) formattedObj['exitPrice'] = wei(obj['exitPrice'], 0);
			return formattedObj as Pick<FuturesPositionResult, K>;
		});
		results = results.concat(newResults);
		if (newResults.length < 1000) {
			break;
		}
		if (paginationKey) {
			paginationValue = rawResults[rawResults.length - 1][paginatedOptions.orderBy!];
		}
	} while (paginationKey && options.first && results.length < options.first);
	return options.first ? results.slice(0, options.first) : results;
};
export type FuturesStatFilter = {
	id?: string | null;
	id_not?: string | null;
	id_gt?: string | null;
	id_lt?: string | null;
	id_gte?: string | null;
	id_lte?: string | null;
	id_in?: string[];
	id_not_in?: string[];
	account?: string | null;
	account_not?: string | null;
	account_in?: string[];
	account_not_in?: string[];
	account_contains?: string | null;
	account_not_contains?: string | null;
	feesPaid?: WeiSource | null;
	feesPaid_not?: WeiSource | null;
	feesPaid_gt?: WeiSource | null;
	feesPaid_lt?: WeiSource | null;
	feesPaid_gte?: WeiSource | null;
	feesPaid_lte?: WeiSource | null;
	feesPaid_in?: WeiSource[];
	feesPaid_not_in?: WeiSource[];
	pnl?: WeiSource | null;
	pnl_not?: WeiSource | null;
	pnl_gt?: WeiSource | null;
	pnl_lt?: WeiSource | null;
	pnl_gte?: WeiSource | null;
	pnl_lte?: WeiSource | null;
	pnl_in?: WeiSource[];
	pnl_not_in?: WeiSource[];
	pnlWithFeesPaid?: WeiSource | null;
	pnlWithFeesPaid_not?: WeiSource | null;
	pnlWithFeesPaid_gt?: WeiSource | null;
	pnlWithFeesPaid_lt?: WeiSource | null;
	pnlWithFeesPaid_gte?: WeiSource | null;
	pnlWithFeesPaid_lte?: WeiSource | null;
	pnlWithFeesPaid_in?: WeiSource[];
	pnlWithFeesPaid_not_in?: WeiSource[];
	liquidations?: WeiSource | null;
	liquidations_not?: WeiSource | null;
	liquidations_gt?: WeiSource | null;
	liquidations_lt?: WeiSource | null;
	liquidations_gte?: WeiSource | null;
	liquidations_lte?: WeiSource | null;
	liquidations_in?: WeiSource[];
	liquidations_not_in?: WeiSource[];
	totalTrades?: WeiSource | null;
	totalTrades_not?: WeiSource | null;
	totalTrades_gt?: WeiSource | null;
	totalTrades_lt?: WeiSource | null;
	totalTrades_gte?: WeiSource | null;
	totalTrades_lte?: WeiSource | null;
	totalTrades_in?: WeiSource[];
	totalTrades_not_in?: WeiSource[];
	totalVolume?: WeiSource | null;
	totalVolume_not?: WeiSource | null;
	totalVolume_gt?: WeiSource | null;
	totalVolume_lt?: WeiSource | null;
	totalVolume_gte?: WeiSource | null;
	totalVolume_lte?: WeiSource | null;
	totalVolume_in?: WeiSource[];
	totalVolume_not_in?: WeiSource[];
	_change_block?: any | null;
};
export type FuturesStatResult = {
	id: string;
	account: string;
	feesPaid: Wei;
	pnl: Wei;
	pnlWithFeesPaid: Wei;
	liquidations: Wei;
	totalTrades: Wei;
	totalVolume: Wei;
};
export type FuturesStatFields = {
	id: true;
	account: true;
	feesPaid: true;
	pnl: true;
	pnlWithFeesPaid: true;
	liquidations: true;
	totalTrades: true;
	totalVolume: true;
};
export type FuturesStatArgs<K extends keyof FuturesStatResult> = {
	[Property in keyof Pick<FuturesStatFields, K>]: FuturesStatFields[Property];
};
export const getFuturesStatById = async function <K extends keyof FuturesStatResult>(
	url: string,
	options: SingleQueryOptions,
	args: FuturesStatArgs<K>
): Promise<Pick<FuturesStatResult, K>> {
	const res = await axios.post(url, {
		query: generateGql('futuresStat', options, args),
	});
	const r = res.data as any;
	if (r.errors && r.errors.length) {
		throw new Error(r.errors[0].message);
	}
	const obj = r.data[Object.keys(r.data)[0]] as any;
	const formattedObj: any = {};
	if (obj['id']) formattedObj['id'] = obj['id'];
	if (obj['account']) formattedObj['account'] = obj['account'];
	if (obj['feesPaid']) formattedObj['feesPaid'] = wei(obj['feesPaid'], 0);
	if (obj['pnl']) formattedObj['pnl'] = wei(obj['pnl'], 0);
	if (obj['pnlWithFeesPaid']) formattedObj['pnlWithFeesPaid'] = wei(obj['pnlWithFeesPaid'], 0);
	if (obj['liquidations']) formattedObj['liquidations'] = wei(obj['liquidations'], 0);
	if (obj['totalTrades']) formattedObj['totalTrades'] = wei(obj['totalTrades'], 0);
	if (obj['totalVolume']) formattedObj['totalVolume'] = wei(obj['totalVolume'], 0);
	return formattedObj as Pick<FuturesStatResult, K>;
};
export const getFuturesStats = async function <K extends keyof FuturesStatResult>(
	url: string,
	options: MultiQueryOptions<FuturesStatFilter, FuturesStatResult>,
	args: FuturesStatArgs<K>
): Promise<Pick<FuturesStatResult, K>[]> {
	const paginatedOptions: Partial<MultiQueryOptions<FuturesStatFilter, FuturesStatResult>> = {
		...options,
	};
	let paginationKey: keyof FuturesStatFilter | null = null;
	let paginationValue = '';
	if (options.first && options.first > MAX_PAGE) {
		paginatedOptions.first = MAX_PAGE;
		paginatedOptions.orderBy = options.orderBy || 'id';
		paginatedOptions.orderDirection = options.orderDirection || 'asc';
		paginationKey = (paginatedOptions.orderBy +
			(paginatedOptions.orderDirection === 'asc' ? '_gt' : '_lt')) as keyof FuturesStatFilter;
		paginatedOptions.where = { ...options.where };
	}
	let results: Pick<FuturesStatResult, K>[] = [];
	do {
		if (paginationKey && paginationValue)
			paginatedOptions.where![paginationKey] = paginationValue as any;
		const res = await axios.post(url, {
			query: generateGql('futuresStats', paginatedOptions, args),
		});
		const r = res.data as any;
		if (r.errors && r.errors.length) {
			throw new Error(r.errors[0].message);
		}
		const rawResults = r.data[Object.keys(r.data)[0]] as any[];
		const newResults = rawResults.map((obj) => {
			const formattedObj: any = {};
			if (obj['id']) formattedObj['id'] = obj['id'];
			if (obj['account']) formattedObj['account'] = obj['account'];
			if (obj['feesPaid']) formattedObj['feesPaid'] = wei(obj['feesPaid'], 0);
			if (obj['pnl']) formattedObj['pnl'] = wei(obj['pnl'], 0);
			if (obj['pnlWithFeesPaid']) formattedObj['pnlWithFeesPaid'] = wei(obj['pnlWithFeesPaid'], 0);
			if (obj['liquidations']) formattedObj['liquidations'] = wei(obj['liquidations'], 0);
			if (obj['totalTrades']) formattedObj['totalTrades'] = wei(obj['totalTrades'], 0);
			if (obj['totalVolume']) formattedObj['totalVolume'] = wei(obj['totalVolume'], 0);
			return formattedObj as Pick<FuturesStatResult, K>;
		});
		results = results.concat(newResults);
		if (newResults.length < 1000) {
			break;
		}
		if (paginationKey) {
			paginationValue = rawResults[rawResults.length - 1][paginatedOptions.orderBy!];
		}
	} while (paginationKey && options.first && results.length < options.first);
	return options.first ? results.slice(0, options.first) : results;
};
export type FuturesTradeFilter = {
	id?: string | null;
	id_not?: string | null;
	id_gt?: string | null;
	id_lt?: string | null;
	id_gte?: string | null;
	id_lte?: string | null;
	id_in?: string[];
	id_not_in?: string[];
	timestamp?: WeiSource | null;
	timestamp_not?: WeiSource | null;
	timestamp_gt?: WeiSource | null;
	timestamp_lt?: WeiSource | null;
	timestamp_gte?: WeiSource | null;
	timestamp_lte?: WeiSource | null;
	timestamp_in?: WeiSource[];
	timestamp_not_in?: WeiSource[];
	account?: string | null;
	account_not?: string | null;
	account_in?: string[];
	account_not_in?: string[];
	account_contains?: string | null;
	account_not_contains?: string | null;
	size?: WeiSource | null;
	size_not?: WeiSource | null;
	size_gt?: WeiSource | null;
	size_lt?: WeiSource | null;
	size_gte?: WeiSource | null;
	size_lte?: WeiSource | null;
	size_in?: WeiSource[];
	size_not_in?: WeiSource[];
	asset?: string | null;
	asset_not?: string | null;
	asset_in?: string[];
	asset_not_in?: string[];
	asset_contains?: string | null;
	asset_not_contains?: string | null;
	price?: WeiSource | null;
	price_not?: WeiSource | null;
	price_gt?: WeiSource | null;
	price_lt?: WeiSource | null;
	price_gte?: WeiSource | null;
	price_lte?: WeiSource | null;
	price_in?: WeiSource[];
	price_not_in?: WeiSource[];
	positionId?: string | null;
	positionId_not?: string | null;
	positionId_gt?: string | null;
	positionId_lt?: string | null;
	positionId_gte?: string | null;
	positionId_lte?: string | null;
	positionId_in?: string[];
	positionId_not_in?: string[];
	positionSize?: WeiSource | null;
	positionSize_not?: WeiSource | null;
	positionSize_gt?: WeiSource | null;
	positionSize_lt?: WeiSource | null;
	positionSize_gte?: WeiSource | null;
	positionSize_lte?: WeiSource | null;
	positionSize_in?: WeiSource[];
	positionSize_not_in?: WeiSource[];
	positionClosed?: boolean | null;
	positionClosed_not?: boolean | null;
	positionClosed_in?: boolean[];
	positionClosed_not_in?: boolean[];
	pnl?: WeiSource | null;
	pnl_not?: WeiSource | null;
	pnl_gt?: WeiSource | null;
	pnl_lt?: WeiSource | null;
	pnl_gte?: WeiSource | null;
	pnl_lte?: WeiSource | null;
	pnl_in?: WeiSource[];
	pnl_not_in?: WeiSource[];
	feesPaid?: WeiSource | null;
	feesPaid_not?: WeiSource | null;
	feesPaid_gt?: WeiSource | null;
	feesPaid_lt?: WeiSource | null;
	feesPaid_gte?: WeiSource | null;
	feesPaid_lte?: WeiSource | null;
	feesPaid_in?: WeiSource[];
	feesPaid_not_in?: WeiSource[];
	_change_block?: any | null;
};
export type FuturesTradeResult = {
	id: string;
	timestamp: Wei;
	account: string;
	size: Wei;
	asset: string;
	price: Wei;
	positionId: string;
	positionSize: Wei;
	positionClosed: boolean;
	pnl: Wei;
	feesPaid: Wei;
	orderType: FuturesOrderType;
};
export type FuturesTradeFields = {
	id: true;
	timestamp: true;
	account: true;
	size: true;
	asset: true;
	price: true;
	positionId: true;
	positionSize: true;
	positionClosed: true;
	pnl: true;
	feesPaid: true;
	orderType: true;
};
export type FuturesTradeArgs<K extends keyof FuturesTradeResult> = {
	[Property in keyof Pick<FuturesTradeFields, K>]: FuturesTradeFields[Property];
};
export const getFuturesTradeById = async function <K extends keyof FuturesTradeResult>(
	url: string,
	options: SingleQueryOptions,
	args: FuturesTradeArgs<K>
): Promise<Pick<FuturesTradeResult, K>> {
	const res = await axios.post(url, {
		query: generateGql('futuresTrade', options, args),
	});
	const r = res.data as any;
	if (r.errors && r.errors.length) {
		throw new Error(r.errors[0].message);
	}
	const obj = r.data[Object.keys(r.data)[0]] as any;
	const formattedObj: any = {};
	if (obj['id']) formattedObj['id'] = obj['id'];
	if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
	if (obj['account']) formattedObj['account'] = obj['account'];
	if (obj['size']) formattedObj['size'] = wei(obj['size'], 0);
	if (obj['asset']) formattedObj['asset'] = obj['asset'];
	if (obj['price']) formattedObj['price'] = wei(obj['price'], 0);
	if (obj['positionId']) formattedObj['positionId'] = obj['positionId'];
	if (obj['positionSize']) formattedObj['positionSize'] = wei(obj['positionSize'], 0);
	if (obj['positionClosed']) formattedObj['positionClosed'] = obj['positionClosed'];
	if (obj['pnl']) formattedObj['pnl'] = wei(obj['pnl'], 0);
	if (obj['feesPaid']) formattedObj['feesPaid'] = wei(obj['feesPaid'], 0);
	return formattedObj as Pick<FuturesTradeResult, K>;
};
export const getFuturesTrades = async function <K extends keyof FuturesTradeResult>(
	url: string,
	options: MultiQueryOptions<FuturesTradeFilter, FuturesTradeResult>,
	args: FuturesTradeArgs<K>
): Promise<Pick<FuturesTradeResult, K>[]> {
	const paginatedOptions: Partial<MultiQueryOptions<FuturesTradeFilter, FuturesTradeResult>> = {
		...options,
	};
	let paginationKey: keyof FuturesTradeFilter | null = null;
	let paginationValue = '';
	if (options.first && options.first > MAX_PAGE) {
		paginatedOptions.first = MAX_PAGE;
		paginatedOptions.orderBy = options.orderBy || 'id';
		paginatedOptions.orderDirection = options.orderDirection || 'asc';
		paginationKey = (paginatedOptions.orderBy +
			(paginatedOptions.orderDirection === 'asc' ? '_gt' : '_lt')) as keyof FuturesTradeFilter;
		paginatedOptions.where = { ...options.where };
	}
	let results: Pick<FuturesTradeResult, K>[] = [];
	do {
		if (paginationKey && paginationValue)
			paginatedOptions.where![paginationKey] = paginationValue as any;
		const res = await axios.post(url, {
			query: generateGql('futuresTrades', paginatedOptions, args),
		});
		const r = res.data as any;
		if (r.errors && r.errors.length) {
			throw new Error(r.errors[0].message);
		}
		const rawResults = r.data[Object.keys(r.data)[0]] as any[];
		const newResults = rawResults.map((obj) => {
			const formattedObj: any = {};
			if (obj['id']) formattedObj['id'] = obj['id'];
			if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
			if (obj['account']) formattedObj['account'] = obj['account'];
			if (obj['size']) formattedObj['size'] = wei(obj['size'], 0);
			if (obj['asset']) formattedObj['asset'] = obj['asset'];
			if (obj['price']) formattedObj['price'] = wei(obj['price'], 0);
			if (obj['positionId']) formattedObj['positionId'] = obj['positionId'];
			if (obj['positionSize']) formattedObj['positionSize'] = wei(obj['positionSize'], 0);
			if (obj['positionClosed']) formattedObj['positionClosed'] = obj['positionClosed'];
			if (obj['pnl']) formattedObj['pnl'] = wei(obj['pnl'], 0);
			if (obj['feesPaid']) formattedObj['feesPaid'] = wei(obj['feesPaid'], 0);
			if (obj['orderType']) formattedObj['orderType'] = obj['orderType'];
			return formattedObj as Pick<FuturesTradeResult, K>;
		});
		results = results.concat(newResults);
		if (newResults.length < 1000) {
			break;
		}
		if (paginationKey) {
			paginationValue = rawResults[rawResults.length - 1][paginatedOptions.orderBy!];
		}
	} while (paginationKey && options.first && results.length < options.first);
	return options.first ? results.slice(0, options.first) : results;
};
export type LatestRateFilter = {
	id?: string | null;
	id_not?: string | null;
	id_gt?: string | null;
	id_lt?: string | null;
	id_gte?: string | null;
	id_lte?: string | null;
	id_in?: string[];
	id_not_in?: string[];
	rate?: WeiSource | null;
	rate_not?: WeiSource | null;
	rate_gt?: WeiSource | null;
	rate_lt?: WeiSource | null;
	rate_gte?: WeiSource | null;
	rate_lte?: WeiSource | null;
	rate_in?: WeiSource[];
	rate_not_in?: WeiSource[];
	timestamp?: WeiSource | null;
	timestamp_not?: WeiSource | null;
	timestamp_gt?: WeiSource | null;
	timestamp_lt?: WeiSource | null;
	timestamp_gte?: WeiSource | null;
	timestamp_lte?: WeiSource | null;
	timestamp_in?: WeiSource[];
	timestamp_not_in?: WeiSource[];
	aggregator?: string | null;
	aggregator_not?: string | null;
	aggregator_in?: string[];
	aggregator_not_in?: string[];
	aggregator_contains?: string | null;
	aggregator_not_contains?: string | null;
	_change_block?: any | null;
};
export type LatestRateResult = {
	id: string;
	rate: Wei;
	timestamp: Wei;
	aggregator: string;
};
export type LatestRateFields = {
	id: true;
	rate: true;
	timestamp: true;
	aggregator: true;
};
export type LatestRateArgs<K extends keyof LatestRateResult> = {
	[Property in keyof Pick<LatestRateFields, K>]: LatestRateFields[Property];
};
export const getLatestRateById = async function <K extends keyof LatestRateResult>(
	url: string,
	options: SingleQueryOptions,
	args: LatestRateArgs<K>
): Promise<Pick<LatestRateResult, K>> {
	const res = await axios.post(url, {
		query: generateGql('latestRate', options, args),
	});
	const r = res.data as any;
	if (r.errors && r.errors.length) {
		throw new Error(r.errors[0].message);
	}
	const obj = r.data[Object.keys(r.data)[0]] as any;
	const formattedObj: any = {};
	if (obj['id']) formattedObj['id'] = obj['id'];
	if (obj['rate']) formattedObj['rate'] = wei(obj['rate']);
	if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
	if (obj['aggregator']) formattedObj['aggregator'] = obj['aggregator'];
	return formattedObj as Pick<LatestRateResult, K>;
};
export const getLatestRates = async function <K extends keyof LatestRateResult>(
	url: string,
	options: MultiQueryOptions<LatestRateFilter, LatestRateResult>,
	args: LatestRateArgs<K>
): Promise<Pick<LatestRateResult, K>[]> {
	const paginatedOptions: Partial<MultiQueryOptions<LatestRateFilter, LatestRateResult>> = {
		...options,
	};
	let paginationKey: keyof LatestRateFilter | null = null;
	let paginationValue = '';
	if (options.first && options.first > MAX_PAGE) {
		paginatedOptions.first = MAX_PAGE;
		paginatedOptions.orderBy = options.orderBy || 'id';
		paginatedOptions.orderDirection = options.orderDirection || 'asc';
		paginationKey = (paginatedOptions.orderBy +
			(paginatedOptions.orderDirection === 'asc' ? '_gt' : '_lt')) as keyof LatestRateFilter;
		paginatedOptions.where = { ...options.where };
	}
	let results: Pick<LatestRateResult, K>[] = [];
	do {
		if (paginationKey && paginationValue)
			paginatedOptions.where![paginationKey] = paginationValue as any;
		const res = await axios.post(url, {
			query: generateGql('latestRates', paginatedOptions, args),
		});
		const r = res.data as any;
		if (r.errors && r.errors.length) {
			throw new Error(r.errors[0].message);
		}
		const rawResults = r.data[Object.keys(r.data)[0]] as any[];
		const newResults = rawResults.map((obj) => {
			const formattedObj: any = {};
			if (obj['id']) formattedObj['id'] = obj['id'];
			if (obj['rate']) formattedObj['rate'] = wei(obj['rate']);
			if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
			if (obj['aggregator']) formattedObj['aggregator'] = obj['aggregator'];
			return formattedObj as Pick<LatestRateResult, K>;
		});
		results = results.concat(newResults);
		if (newResults.length < 1000) {
			break;
		}
		if (paginationKey) {
			paginationValue = rawResults[rawResults.length - 1][paginatedOptions.orderBy!];
		}
	} while (paginationKey && options.first && results.length < options.first);
	return options.first ? results.slice(0, options.first) : results;
};
export type RateUpdateFilter = {
	id?: string | null;
	id_not?: string | null;
	id_gt?: string | null;
	id_lt?: string | null;
	id_gte?: string | null;
	id_lte?: string | null;
	id_in?: string[];
	id_not_in?: string[];
	currencyKey?: string | null;
	currencyKey_not?: string | null;
	currencyKey_in?: string[];
	currencyKey_not_in?: string[];
	currencyKey_contains?: string | null;
	currencyKey_not_contains?: string | null;
	synth?: string | null;
	synth_not?: string | null;
	synth_gt?: string | null;
	synth_lt?: string | null;
	synth_gte?: string | null;
	synth_lte?: string | null;
	synth_in?: string[];
	synth_not_in?: string[];
	synth_contains?: string | null;
	synth_contains_nocase?: string | null;
	synth_not_contains?: string | null;
	synth_not_contains_nocase?: string | null;
	synth_starts_with?: string | null;
	synth_starts_with_nocase?: string | null;
	synth_not_starts_with?: string | null;
	synth_not_starts_with_nocase?: string | null;
	synth_ends_with?: string | null;
	synth_ends_with_nocase?: string | null;
	synth_not_ends_with?: string | null;
	synth_not_ends_with_nocase?: string | null;
	rate?: WeiSource | null;
	rate_not?: WeiSource | null;
	rate_gt?: WeiSource | null;
	rate_lt?: WeiSource | null;
	rate_gte?: WeiSource | null;
	rate_lte?: WeiSource | null;
	rate_in?: WeiSource[];
	rate_not_in?: WeiSource[];
	block?: WeiSource | null;
	block_not?: WeiSource | null;
	block_gt?: WeiSource | null;
	block_lt?: WeiSource | null;
	block_gte?: WeiSource | null;
	block_lte?: WeiSource | null;
	block_in?: WeiSource[];
	block_not_in?: WeiSource[];
	timestamp?: WeiSource | null;
	timestamp_not?: WeiSource | null;
	timestamp_gt?: WeiSource | null;
	timestamp_lt?: WeiSource | null;
	timestamp_gte?: WeiSource | null;
	timestamp_lte?: WeiSource | null;
	timestamp_in?: WeiSource[];
	timestamp_not_in?: WeiSource[];
	_change_block?: any | null;
};
export type RateUpdateResult = {
	id: string;
	currencyKey: string;
	synth: string;
	rate: Wei;
	block: Wei;
	timestamp: Wei;
};
export type RateUpdateFields = {
	id: true;
	currencyKey: true;
	synth: true;
	rate: true;
	block: true;
	timestamp: true;
};
export type RateUpdateArgs<K extends keyof RateUpdateResult> = {
	[Property in keyof Pick<RateUpdateFields, K>]: RateUpdateFields[Property];
};
export const getRateUpdateById = async function <K extends keyof RateUpdateResult>(
	url: string,
	options: SingleQueryOptions,
	args: RateUpdateArgs<K>
): Promise<Pick<RateUpdateResult, K>> {
	const res = await axios.post(url, {
		query: generateGql('rateUpdate', options, args),
	});
	const r = res.data as any;
	if (r.errors && r.errors.length) {
		throw new Error(r.errors[0].message);
	}
	const obj = r.data[Object.keys(r.data)[0]] as any;
	const formattedObj: any = {};
	if (obj['id']) formattedObj['id'] = obj['id'];
	if (obj['currencyKey']) formattedObj['currencyKey'] = obj['currencyKey'];
	if (obj['synth']) formattedObj['synth'] = obj['synth'];
	if (obj['rate']) formattedObj['rate'] = wei(obj['rate']);
	if (obj['block']) formattedObj['block'] = wei(obj['block'], 0);
	if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
	return formattedObj as Pick<RateUpdateResult, K>;
};
export const getRateUpdates = async function <K extends keyof RateUpdateResult>(
	url: string,
	options: MultiQueryOptions<RateUpdateFilter, RateUpdateResult>,
	args: RateUpdateArgs<K>
): Promise<Pick<RateUpdateResult, K>[]> {
	const paginatedOptions: Partial<MultiQueryOptions<RateUpdateFilter, RateUpdateResult>> = {
		...options,
	};
	let paginationKey: keyof RateUpdateFilter | null = null;
	let paginationValue = '';
	if (options.first && options.first > MAX_PAGE) {
		paginatedOptions.first = MAX_PAGE;
		paginatedOptions.orderBy = options.orderBy || 'id';
		paginatedOptions.orderDirection = options.orderDirection || 'asc';
		paginationKey = (paginatedOptions.orderBy +
			(paginatedOptions.orderDirection === 'asc' ? '_gt' : '_lt')) as keyof RateUpdateFilter;
		paginatedOptions.where = { ...options.where };
	}
	let results: Pick<RateUpdateResult, K>[] = [];
	do {
		if (paginationKey && paginationValue)
			paginatedOptions.where![paginationKey] = paginationValue as any;
		const res = await axios.post(url, {
			query: generateGql('rateUpdates', paginatedOptions, args),
		});
		const r = res.data as any;
		if (r.errors && r.errors.length) {
			throw new Error(r.errors[0].message);
		}
		const rawResults = r.data[Object.keys(r.data)[0]] as any[];
		const newResults = rawResults.map((obj) => {
			const formattedObj: any = {};
			if (obj['id']) formattedObj['id'] = obj['id'];
			if (obj['currencyKey']) formattedObj['currencyKey'] = obj['currencyKey'];
			if (obj['synth']) formattedObj['synth'] = obj['synth'];
			if (obj['rate']) formattedObj['rate'] = wei(obj['rate']);
			if (obj['block']) formattedObj['block'] = wei(obj['block'], 0);
			if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
			return formattedObj as Pick<RateUpdateResult, K>;
		});
		results = results.concat(newResults);
		if (newResults.length < 1000) {
			break;
		}
		if (paginationKey) {
			paginationValue = rawResults[rawResults.length - 1][paginatedOptions.orderBy!];
		}
	} while (paginationKey && options.first && results.length < options.first);
	return options.first ? results.slice(0, options.first) : results;
};
