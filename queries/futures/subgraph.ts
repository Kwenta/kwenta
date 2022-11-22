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
export type AtomicSynthExchangeFilter = {
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
	account_gt?: string | null;
	account_lt?: string | null;
	account_gte?: string | null;
	account_lte?: string | null;
	account_in?: string[];
	account_not_in?: string[];
	account_contains?: string | null;
	account_contains_nocase?: string | null;
	account_not_contains?: string | null;
	account_not_contains_nocase?: string | null;
	account_starts_with?: string | null;
	account_starts_with_nocase?: string | null;
	account_not_starts_with?: string | null;
	account_not_starts_with_nocase?: string | null;
	account_ends_with?: string | null;
	account_ends_with_nocase?: string | null;
	account_not_ends_with?: string | null;
	account_not_ends_with_nocase?: string | null;
	account_?: ExchangerFilter | null;
	fromSynth?: string | null;
	fromSynth_not?: string | null;
	fromSynth_gt?: string | null;
	fromSynth_lt?: string | null;
	fromSynth_gte?: string | null;
	fromSynth_lte?: string | null;
	fromSynth_in?: string[];
	fromSynth_not_in?: string[];
	fromSynth_contains?: string | null;
	fromSynth_contains_nocase?: string | null;
	fromSynth_not_contains?: string | null;
	fromSynth_not_contains_nocase?: string | null;
	fromSynth_starts_with?: string | null;
	fromSynth_starts_with_nocase?: string | null;
	fromSynth_not_starts_with?: string | null;
	fromSynth_not_starts_with_nocase?: string | null;
	fromSynth_ends_with?: string | null;
	fromSynth_ends_with_nocase?: string | null;
	fromSynth_not_ends_with?: string | null;
	fromSynth_not_ends_with_nocase?: string | null;
	fromSynth_?: SynthFilter | null;
	toSynth?: string | null;
	toSynth_not?: string | null;
	toSynth_gt?: string | null;
	toSynth_lt?: string | null;
	toSynth_gte?: string | null;
	toSynth_lte?: string | null;
	toSynth_in?: string[];
	toSynth_not_in?: string[];
	toSynth_contains?: string | null;
	toSynth_contains_nocase?: string | null;
	toSynth_not_contains?: string | null;
	toSynth_not_contains_nocase?: string | null;
	toSynth_starts_with?: string | null;
	toSynth_starts_with_nocase?: string | null;
	toSynth_not_starts_with?: string | null;
	toSynth_not_starts_with_nocase?: string | null;
	toSynth_ends_with?: string | null;
	toSynth_ends_with_nocase?: string | null;
	toSynth_not_ends_with?: string | null;
	toSynth_not_ends_with_nocase?: string | null;
	toSynth_?: SynthFilter | null;
	fromAmount?: WeiSource | null;
	fromAmount_not?: WeiSource | null;
	fromAmount_gt?: WeiSource | null;
	fromAmount_lt?: WeiSource | null;
	fromAmount_gte?: WeiSource | null;
	fromAmount_lte?: WeiSource | null;
	fromAmount_in?: WeiSource[];
	fromAmount_not_in?: WeiSource[];
	fromAmountInUSD?: WeiSource | null;
	fromAmountInUSD_not?: WeiSource | null;
	fromAmountInUSD_gt?: WeiSource | null;
	fromAmountInUSD_lt?: WeiSource | null;
	fromAmountInUSD_gte?: WeiSource | null;
	fromAmountInUSD_lte?: WeiSource | null;
	fromAmountInUSD_in?: WeiSource[];
	fromAmountInUSD_not_in?: WeiSource[];
	toAmount?: WeiSource | null;
	toAmount_not?: WeiSource | null;
	toAmount_gt?: WeiSource | null;
	toAmount_lt?: WeiSource | null;
	toAmount_gte?: WeiSource | null;
	toAmount_lte?: WeiSource | null;
	toAmount_in?: WeiSource[];
	toAmount_not_in?: WeiSource[];
	toAmountInUSD?: WeiSource | null;
	toAmountInUSD_not?: WeiSource | null;
	toAmountInUSD_gt?: WeiSource | null;
	toAmountInUSD_lt?: WeiSource | null;
	toAmountInUSD_gte?: WeiSource | null;
	toAmountInUSD_lte?: WeiSource | null;
	toAmountInUSD_in?: WeiSource[];
	toAmountInUSD_not_in?: WeiSource[];
	feesInUSD?: WeiSource | null;
	feesInUSD_not?: WeiSource | null;
	feesInUSD_gt?: WeiSource | null;
	feesInUSD_lt?: WeiSource | null;
	feesInUSD_gte?: WeiSource | null;
	feesInUSD_lte?: WeiSource | null;
	feesInUSD_in?: WeiSource[];
	feesInUSD_not_in?: WeiSource[];
	toAddress?: string | null;
	toAddress_not?: string | null;
	toAddress_in?: string[];
	toAddress_not_in?: string[];
	toAddress_contains?: string | null;
	toAddress_not_contains?: string | null;
	timestamp?: WeiSource | null;
	timestamp_not?: WeiSource | null;
	timestamp_gt?: WeiSource | null;
	timestamp_lt?: WeiSource | null;
	timestamp_gte?: WeiSource | null;
	timestamp_lte?: WeiSource | null;
	timestamp_in?: WeiSource[];
	timestamp_not_in?: WeiSource[];
	gasPrice?: WeiSource | null;
	gasPrice_not?: WeiSource | null;
	gasPrice_gt?: WeiSource | null;
	gasPrice_lt?: WeiSource | null;
	gasPrice_gte?: WeiSource | null;
	gasPrice_lte?: WeiSource | null;
	gasPrice_in?: WeiSource[];
	gasPrice_not_in?: WeiSource[];
	_change_block?: any | null;
};
export type AtomicSynthExchangeResult = {
	id: string;
	account: Partial<ExchangerResult>;
	fromSynth: Partial<SynthResult> | null;
	toSynth: Partial<SynthResult> | null;
	fromAmount: Wei;
	fromAmountInUSD: Wei;
	toAmount: Wei;
	toAmountInUSD: Wei;
	feesInUSD: Wei;
	toAddress: string;
	timestamp: Wei;
	gasPrice: Wei;
};
export type AtomicSynthExchangeFields = {
	id: true;
	account: ExchangerFields;
	fromSynth: SynthFields;
	toSynth: SynthFields;
	fromAmount: true;
	fromAmountInUSD: true;
	toAmount: true;
	toAmountInUSD: true;
	feesInUSD: true;
	toAddress: true;
	timestamp: true;
	gasPrice: true;
};
export type AtomicSynthExchangeArgs<K extends keyof AtomicSynthExchangeResult> = {
	[Property in keyof Pick<AtomicSynthExchangeFields, K>]: AtomicSynthExchangeFields[Property];
};
export const getAtomicSynthExchangeById = async function <
	K extends keyof AtomicSynthExchangeResult
>(
	url: string,
	options: SingleQueryOptions,
	args: AtomicSynthExchangeArgs<K>
): Promise<Pick<AtomicSynthExchangeResult, K>> {
	const res = await axios.post(url, {
		query: generateGql('atomicSynthExchange', options, args),
	});
	const r = res.data as any;
	if (r.errors && r.errors.length) {
		throw new Error(r.errors[0].message);
	}
	const obj = r.data[Object.keys(r.data)[0]] as any;
	const formattedObj: any = {};
	if (obj['id']) formattedObj['id'] = obj['id'];
	if (obj['account']) formattedObj['account'] = obj['account'];
	if (obj['fromSynth']) formattedObj['fromSynth'] = obj['fromSynth'];
	if (obj['toSynth']) formattedObj['toSynth'] = obj['toSynth'];
	if (obj['fromAmount']) formattedObj['fromAmount'] = wei(obj['fromAmount']);
	if (obj['fromAmountInUSD']) formattedObj['fromAmountInUSD'] = wei(obj['fromAmountInUSD']);
	if (obj['toAmount']) formattedObj['toAmount'] = wei(obj['toAmount']);
	if (obj['toAmountInUSD']) formattedObj['toAmountInUSD'] = wei(obj['toAmountInUSD']);
	if (obj['feesInUSD']) formattedObj['feesInUSD'] = wei(obj['feesInUSD']);
	if (obj['toAddress']) formattedObj['toAddress'] = obj['toAddress'];
	if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
	if (obj['gasPrice']) formattedObj['gasPrice'] = wei(obj['gasPrice'], 0);
	return formattedObj as Pick<AtomicSynthExchangeResult, K>;
};
export const getAtomicSynthExchanges = async function <K extends keyof AtomicSynthExchangeResult>(
	url: string,
	options: MultiQueryOptions<AtomicSynthExchangeFilter, AtomicSynthExchangeResult>,
	args: AtomicSynthExchangeArgs<K>
): Promise<Pick<AtomicSynthExchangeResult, K>[]> {
	const paginatedOptions: Partial<MultiQueryOptions<
		AtomicSynthExchangeFilter,
		AtomicSynthExchangeResult
	>> = { ...options };
	let paginationKey: keyof AtomicSynthExchangeFilter | null = null;
	let paginationValue = '';
	if (options.first && options.first > MAX_PAGE) {
		paginatedOptions.first = MAX_PAGE;
		paginatedOptions.orderBy = options.orderBy || 'id';
		paginatedOptions.orderDirection = options.orderDirection || 'asc';
		paginationKey = (paginatedOptions.orderBy +
			(paginatedOptions.orderDirection === 'asc'
				? '_gt'
				: '_lt')) as keyof AtomicSynthExchangeFilter;
		paginatedOptions.where = { ...options.where };
	}
	let results: Pick<AtomicSynthExchangeResult, K>[] = [];
	do {
		if (paginationKey && paginationValue)
			paginatedOptions.where![paginationKey] = paginationValue as any;
		const res = await axios.post(url, {
			query: generateGql('atomicSynthExchanges', paginatedOptions, args),
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
			if (obj['fromSynth']) formattedObj['fromSynth'] = obj['fromSynth'];
			if (obj['toSynth']) formattedObj['toSynth'] = obj['toSynth'];
			if (obj['fromAmount']) formattedObj['fromAmount'] = wei(obj['fromAmount']);
			if (obj['fromAmountInUSD']) formattedObj['fromAmountInUSD'] = wei(obj['fromAmountInUSD']);
			if (obj['toAmount']) formattedObj['toAmount'] = wei(obj['toAmount']);
			if (obj['toAmountInUSD']) formattedObj['toAmountInUSD'] = wei(obj['toAmountInUSD']);
			if (obj['feesInUSD']) formattedObj['feesInUSD'] = wei(obj['feesInUSD']);
			if (obj['toAddress']) formattedObj['toAddress'] = obj['toAddress'];
			if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
			if (obj['gasPrice']) formattedObj['gasPrice'] = wei(obj['gasPrice'], 0);
			return formattedObj as Pick<AtomicSynthExchangeResult, K>;
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
export type CrossMarginAccountFilter = {
	id?: string | null;
	id_not?: string | null;
	id_gt?: string | null;
	id_lt?: string | null;
	id_gte?: string | null;
	id_lte?: string | null;
	id_in?: string[];
	id_not_in?: string[];
	owner?: string | null;
	owner_not?: string | null;
	owner_in?: string[];
	owner_not_in?: string[];
	owner_contains?: string | null;
	owner_not_contains?: string | null;
	_change_block?: any | null;
};
export type CrossMarginAccountResult = {
	id: string;
	owner: string;
};
export type CrossMarginAccountFields = {
	id: true;
	owner: true;
};
export type CrossMarginAccountArgs<K extends keyof CrossMarginAccountResult> = {
	[Property in keyof Pick<CrossMarginAccountFields, K>]: CrossMarginAccountFields[Property];
};
export const getCrossMarginAccountById = async function <K extends keyof CrossMarginAccountResult>(
	url: string,
	options: SingleQueryOptions,
	args: CrossMarginAccountArgs<K>
): Promise<Pick<CrossMarginAccountResult, K>> {
	const res = await axios.post(url, {
		query: generateGql('crossMarginAccount', options, args),
	});
	const r = res.data as any;
	if (r.errors && r.errors.length) {
		throw new Error(r.errors[0].message);
	}
	const obj = r.data[Object.keys(r.data)[0]] as any;
	const formattedObj: any = {};
	if (obj['id']) formattedObj['id'] = obj['id'];
	if (obj['owner']) formattedObj['owner'] = obj['owner'];
	return formattedObj as Pick<CrossMarginAccountResult, K>;
};
export const getCrossMarginAccounts = async function <K extends keyof CrossMarginAccountResult>(
	url: string,
	options: MultiQueryOptions<CrossMarginAccountFilter, CrossMarginAccountResult>,
	args: CrossMarginAccountArgs<K>
): Promise<Pick<CrossMarginAccountResult, K>[]> {
	const paginatedOptions: Partial<MultiQueryOptions<
		CrossMarginAccountFilter,
		CrossMarginAccountResult
	>> = { ...options };
	let paginationKey: keyof CrossMarginAccountFilter | null = null;
	let paginationValue = '';
	if (options.first && options.first > MAX_PAGE) {
		paginatedOptions.first = MAX_PAGE;
		paginatedOptions.orderBy = options.orderBy || 'id';
		paginatedOptions.orderDirection = options.orderDirection || 'asc';
		paginationKey = (paginatedOptions.orderBy +
			(paginatedOptions.orderDirection === 'asc'
				? '_gt'
				: '_lt')) as keyof CrossMarginAccountFilter;
		paginatedOptions.where = { ...options.where };
	}
	let results: Pick<CrossMarginAccountResult, K>[] = [];
	do {
		if (paginationKey && paginationValue)
			paginatedOptions.where![paginationKey] = paginationValue as any;
		const res = await axios.post(url, {
			query: generateGql('crossMarginAccounts', paginatedOptions, args),
		});
		const r = res.data as any;
		if (r.errors && r.errors.length) {
			throw new Error(r.errors[0].message);
		}
		const rawResults = r.data[Object.keys(r.data)[0]] as any[];
		const newResults = rawResults.map((obj) => {
			const formattedObj: any = {};
			if (obj['id']) formattedObj['id'] = obj['id'];
			if (obj['owner']) formattedObj['owner'] = obj['owner'];
			return formattedObj as Pick<CrossMarginAccountResult, K>;
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
export type CrossMarginAccountTransferFilter = {
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
	abstractAccount?: string | null;
	abstractAccount_not?: string | null;
	abstractAccount_in?: string[];
	abstractAccount_not_in?: string[];
	abstractAccount_contains?: string | null;
	abstractAccount_not_contains?: string | null;
	timestamp?: WeiSource | null;
	timestamp_not?: WeiSource | null;
	timestamp_gt?: WeiSource | null;
	timestamp_lt?: WeiSource | null;
	timestamp_gte?: WeiSource | null;
	timestamp_lte?: WeiSource | null;
	timestamp_in?: WeiSource[];
	timestamp_not_in?: WeiSource[];
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
export type CrossMarginAccountTransferResult = {
	id: string;
	account: string;
	abstractAccount: string;
	timestamp: Wei;
	size: Wei;
	txHash: string;
};
export type CrossMarginAccountTransferFields = {
	id: true;
	account: true;
	abstractAccount: true;
	timestamp: true;
	size: true;
	txHash: true;
};
export type CrossMarginAccountTransferArgs<K extends keyof CrossMarginAccountTransferResult> = {
	[Property in keyof Pick<
		CrossMarginAccountTransferFields,
		K
	>]: CrossMarginAccountTransferFields[Property];
};
export const getCrossMarginAccountTransferById = async function <
	K extends keyof CrossMarginAccountTransferResult
>(
	url: string,
	options: SingleQueryOptions,
	args: CrossMarginAccountTransferArgs<K>
): Promise<Pick<CrossMarginAccountTransferResult, K>> {
	const res = await axios.post(url, {
		query: generateGql('crossMarginAccountTransfer', options, args),
	});
	const r = res.data as any;
	if (r.errors && r.errors.length) {
		throw new Error(r.errors[0].message);
	}
	const obj = r.data[Object.keys(r.data)[0]] as any;
	const formattedObj: any = {};
	if (obj['id']) formattedObj['id'] = obj['id'];
	if (obj['account']) formattedObj['account'] = obj['account'];
	if (obj['abstractAccount']) formattedObj['abstractAccount'] = obj['abstractAccount'];
	if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
	if (obj['size']) formattedObj['size'] = wei(obj['size'], 0);
	if (obj['txHash']) formattedObj['txHash'] = obj['txHash'];
	return formattedObj as Pick<CrossMarginAccountTransferResult, K>;
};
export const getCrossMarginAccountTransfers = async function <
	K extends keyof CrossMarginAccountTransferResult
>(
	url: string,
	options: MultiQueryOptions<CrossMarginAccountTransferFilter, CrossMarginAccountTransferResult>,
	args: CrossMarginAccountTransferArgs<K>
): Promise<Pick<CrossMarginAccountTransferResult, K>[]> {
	const paginatedOptions: Partial<MultiQueryOptions<
		CrossMarginAccountTransferFilter,
		CrossMarginAccountTransferResult
	>> = { ...options };
	let paginationKey: keyof CrossMarginAccountTransferFilter | null = null;
	let paginationValue = '';
	if (options.first && options.first > MAX_PAGE) {
		paginatedOptions.first = MAX_PAGE;
		paginatedOptions.orderBy = options.orderBy || 'id';
		paginatedOptions.orderDirection = options.orderDirection || 'asc';
		paginationKey = (paginatedOptions.orderBy +
			(paginatedOptions.orderDirection === 'asc'
				? '_gt'
				: '_lt')) as keyof CrossMarginAccountTransferFilter;
		paginatedOptions.where = { ...options.where };
	}
	let results: Pick<CrossMarginAccountTransferResult, K>[] = [];
	do {
		if (paginationKey && paginationValue)
			paginatedOptions.where![paginationKey] = paginationValue as any;
		const res = await axios.post(url, {
			query: generateGql('crossMarginAccountTransfers', paginatedOptions, args),
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
			if (obj['abstractAccount']) formattedObj['abstractAccount'] = obj['abstractAccount'];
			if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
			if (obj['size']) formattedObj['size'] = wei(obj['size'], 0);
			if (obj['txHash']) formattedObj['txHash'] = obj['txHash'];
			return formattedObj as Pick<CrossMarginAccountTransferResult, K>;
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
export type ExchangerFilter = {
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
	period?: WeiSource | null;
	period_not?: WeiSource | null;
	period_gt?: WeiSource | null;
	period_lt?: WeiSource | null;
	period_gte?: WeiSource | null;
	period_lte?: WeiSource | null;
	period_in?: WeiSource[];
	period_not_in?: WeiSource[];
	bucketMagnitude?: WeiSource | null;
	bucketMagnitude_not?: WeiSource | null;
	bucketMagnitude_gt?: WeiSource | null;
	bucketMagnitude_lt?: WeiSource | null;
	bucketMagnitude_gte?: WeiSource | null;
	bucketMagnitude_lte?: WeiSource | null;
	bucketMagnitude_in?: WeiSource[];
	bucketMagnitude_not_in?: WeiSource[];
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
	synth_?: SynthFilter | null;
	firstSeen?: WeiSource | null;
	firstSeen_not?: WeiSource | null;
	firstSeen_gt?: WeiSource | null;
	firstSeen_lt?: WeiSource | null;
	firstSeen_gte?: WeiSource | null;
	firstSeen_lte?: WeiSource | null;
	firstSeen_in?: WeiSource[];
	firstSeen_not_in?: WeiSource[];
	lastSeen?: WeiSource | null;
	lastSeen_not?: WeiSource | null;
	lastSeen_gt?: WeiSource | null;
	lastSeen_lt?: WeiSource | null;
	lastSeen_gte?: WeiSource | null;
	lastSeen_lte?: WeiSource | null;
	lastSeen_in?: WeiSource[];
	lastSeen_not_in?: WeiSource[];
	trades?: WeiSource | null;
	trades_not?: WeiSource | null;
	trades_gt?: WeiSource | null;
	trades_lt?: WeiSource | null;
	trades_gte?: WeiSource | null;
	trades_lte?: WeiSource | null;
	trades_in?: WeiSource[];
	trades_not_in?: WeiSource[];
	exchangeUSDTally?: WeiSource | null;
	exchangeUSDTally_not?: WeiSource | null;
	exchangeUSDTally_gt?: WeiSource | null;
	exchangeUSDTally_lt?: WeiSource | null;
	exchangeUSDTally_gte?: WeiSource | null;
	exchangeUSDTally_lte?: WeiSource | null;
	exchangeUSDTally_in?: WeiSource[];
	exchangeUSDTally_not_in?: WeiSource[];
	totalFeesGeneratedInUSD?: WeiSource | null;
	totalFeesGeneratedInUSD_not?: WeiSource | null;
	totalFeesGeneratedInUSD_gt?: WeiSource | null;
	totalFeesGeneratedInUSD_lt?: WeiSource | null;
	totalFeesGeneratedInUSD_gte?: WeiSource | null;
	totalFeesGeneratedInUSD_lte?: WeiSource | null;
	totalFeesGeneratedInUSD_in?: WeiSource[];
	totalFeesGeneratedInUSD_not_in?: WeiSource[];
	balances?: string[];
	balances_not?: string[];
	balances_contains?: string[];
	balances_contains_nocase?: string[];
	balances_not_contains?: string[];
	balances_not_contains_nocase?: string[];
	balances_?: LatestSynthBalanceFilter | null;
	exchanges_?: SynthExchangeFilter | null;
	_change_block?: any | null;
};
export type ExchangerResult = {
	id: string;
	timestamp: Wei;
	period: Wei;
	bucketMagnitude: Wei;
	synth: Partial<SynthResult> | null;
	firstSeen: Wei;
	lastSeen: Wei;
	trades: Wei;
	exchangeUSDTally: Wei;
	totalFeesGeneratedInUSD: Wei;
	balances: Partial<LatestSynthBalanceResult>[];
	exchanges: Partial<SynthExchangeResult>[];
};
export type ExchangerFields = {
	id: true;
	timestamp: true;
	period: true;
	bucketMagnitude: true;
	synth: SynthFields;
	firstSeen: true;
	lastSeen: true;
	trades: true;
	exchangeUSDTally: true;
	totalFeesGeneratedInUSD: true;
	balances: LatestSynthBalanceFields;
	exchanges: SynthExchangeFields;
};
export type ExchangerArgs<K extends keyof ExchangerResult> = {
	[Property in keyof Pick<ExchangerFields, K>]: ExchangerFields[Property];
};
export const getExchangerById = async function <K extends keyof ExchangerResult>(
	url: string,
	options: SingleQueryOptions,
	args: ExchangerArgs<K>
): Promise<Pick<ExchangerResult, K>> {
	const res = await axios.post(url, {
		query: generateGql('exchanger', options, args),
	});
	const r = res.data as any;
	if (r.errors && r.errors.length) {
		throw new Error(r.errors[0].message);
	}
	const obj = r.data[Object.keys(r.data)[0]] as any;
	const formattedObj: any = {};
	if (obj['id']) formattedObj['id'] = obj['id'];
	if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
	if (obj['period']) formattedObj['period'] = wei(obj['period'], 0);
	if (obj['bucketMagnitude']) formattedObj['bucketMagnitude'] = wei(obj['bucketMagnitude'], 0);
	if (obj['synth']) formattedObj['synth'] = obj['synth'];
	if (obj['firstSeen']) formattedObj['firstSeen'] = wei(obj['firstSeen'], 0);
	if (obj['lastSeen']) formattedObj['lastSeen'] = wei(obj['lastSeen'], 0);
	if (obj['trades']) formattedObj['trades'] = wei(obj['trades'], 0);
	if (obj['exchangeUSDTally']) formattedObj['exchangeUSDTally'] = wei(obj['exchangeUSDTally']);
	if (obj['totalFeesGeneratedInUSD'])
		formattedObj['totalFeesGeneratedInUSD'] = wei(obj['totalFeesGeneratedInUSD']);
	if (obj['balances']) formattedObj['balances'] = obj['balances'];
	if (obj['exchanges']) formattedObj['exchanges'] = obj['exchanges'];
	return formattedObj as Pick<ExchangerResult, K>;
};
export const getExchangers = async function <K extends keyof ExchangerResult>(
	url: string,
	options: MultiQueryOptions<ExchangerFilter, ExchangerResult>,
	args: ExchangerArgs<K>
): Promise<Pick<ExchangerResult, K>[]> {
	const paginatedOptions: Partial<MultiQueryOptions<ExchangerFilter, ExchangerResult>> = {
		...options,
	};
	let paginationKey: keyof ExchangerFilter | null = null;
	let paginationValue = '';
	if (options.first && options.first > MAX_PAGE) {
		paginatedOptions.first = MAX_PAGE;
		paginatedOptions.orderBy = options.orderBy || 'id';
		paginatedOptions.orderDirection = options.orderDirection || 'asc';
		paginationKey = (paginatedOptions.orderBy +
			(paginatedOptions.orderDirection === 'asc' ? '_gt' : '_lt')) as keyof ExchangerFilter;
		paginatedOptions.where = { ...options.where };
	}
	let results: Pick<ExchangerResult, K>[] = [];
	do {
		if (paginationKey && paginationValue)
			paginatedOptions.where![paginationKey] = paginationValue as any;
		const res = await axios.post(url, {
			query: generateGql('exchangers', paginatedOptions, args),
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
			if (obj['period']) formattedObj['period'] = wei(obj['period'], 0);
			if (obj['bucketMagnitude']) formattedObj['bucketMagnitude'] = wei(obj['bucketMagnitude'], 0);
			if (obj['synth']) formattedObj['synth'] = obj['synth'];
			if (obj['firstSeen']) formattedObj['firstSeen'] = wei(obj['firstSeen'], 0);
			if (obj['lastSeen']) formattedObj['lastSeen'] = wei(obj['lastSeen'], 0);
			if (obj['trades']) formattedObj['trades'] = wei(obj['trades'], 0);
			if (obj['exchangeUSDTally']) formattedObj['exchangeUSDTally'] = wei(obj['exchangeUSDTally']);
			if (obj['totalFeesGeneratedInUSD'])
				formattedObj['totalFeesGeneratedInUSD'] = wei(obj['totalFeesGeneratedInUSD']);
			if (obj['balances']) formattedObj['balances'] = obj['balances'];
			if (obj['exchanges']) formattedObj['exchanges'] = obj['exchanges'];
			return formattedObj as Pick<ExchangerResult, K>;
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
export type FuturesAggregateStatFilter = {
	id?: string | null;
	id_not?: string | null;
	id_gt?: string | null;
	id_lt?: string | null;
	id_gte?: string | null;
	id_lte?: string | null;
	id_in?: string[];
	id_not_in?: string[];
	period?: WeiSource | null;
	period_not?: WeiSource | null;
	period_gt?: WeiSource | null;
	period_lt?: WeiSource | null;
	period_gte?: WeiSource | null;
	period_lte?: WeiSource | null;
	period_in?: WeiSource[];
	period_not_in?: WeiSource[];
	timestamp?: WeiSource | null;
	timestamp_not?: WeiSource | null;
	timestamp_gt?: WeiSource | null;
	timestamp_lt?: WeiSource | null;
	timestamp_gte?: WeiSource | null;
	timestamp_lte?: WeiSource | null;
	timestamp_in?: WeiSource[];
	timestamp_not_in?: WeiSource[];
	asset?: string | null;
	asset_not?: string | null;
	asset_in?: string[];
	asset_not_in?: string[];
	asset_contains?: string | null;
	asset_not_contains?: string | null;
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
	feesKwenta?: WeiSource | null;
	feesKwenta_not?: WeiSource | null;
	feesKwenta_gt?: WeiSource | null;
	feesKwenta_lt?: WeiSource | null;
	feesKwenta_gte?: WeiSource | null;
	feesKwenta_lte?: WeiSource | null;
	feesKwenta_in?: WeiSource[];
	feesKwenta_not_in?: WeiSource[];
	feesSynthetix?: WeiSource | null;
	feesSynthetix_not?: WeiSource | null;
	feesSynthetix_gt?: WeiSource | null;
	feesSynthetix_lt?: WeiSource | null;
	feesSynthetix_gte?: WeiSource | null;
	feesSynthetix_lte?: WeiSource | null;
	feesSynthetix_in?: WeiSource[];
	feesSynthetix_not_in?: WeiSource[];
	_change_block?: any | null;
};
export type FuturesAggregateStatResult = {
	id: string;
	period: Wei;
	timestamp: Wei;
	asset: string;
	trades: Wei;
	volume: Wei;
	feesKwenta: Wei;
	feesSynthetix: Wei;
};
export type FuturesAggregateStatFields = {
	id: true;
	period: true;
	timestamp: true;
	asset: true;
	trades: true;
	volume: true;
	feesKwenta: true;
	feesSynthetix: true;
};
export type FuturesAggregateStatArgs<K extends keyof FuturesAggregateStatResult> = {
	[Property in keyof Pick<FuturesAggregateStatFields, K>]: FuturesAggregateStatFields[Property];
};
export const getFuturesAggregateStatById = async function <
	K extends keyof FuturesAggregateStatResult
>(
	url: string,
	options: SingleQueryOptions,
	args: FuturesAggregateStatArgs<K>
): Promise<Pick<FuturesAggregateStatResult, K>> {
	const res = await axios.post(url, {
		query: generateGql('futuresAggregateStat', options, args),
	});
	const r = res.data as any;
	if (r.errors && r.errors.length) {
		throw new Error(r.errors[0].message);
	}
	const obj = r.data[Object.keys(r.data)[0]] as any;
	const formattedObj: any = {};
	if (obj['id']) formattedObj['id'] = obj['id'];
	if (obj['period']) formattedObj['period'] = wei(obj['period'], 0);
	if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
	if (obj['asset']) formattedObj['asset'] = obj['asset'];
	if (obj['trades']) formattedObj['trades'] = wei(obj['trades'], 0);
	if (obj['volume']) formattedObj['volume'] = wei(obj['volume'], 0);
	if (obj['feesKwenta']) formattedObj['feesKwenta'] = wei(obj['feesKwenta'], 0);
	if (obj['feesSynthetix']) formattedObj['feesSynthetix'] = wei(obj['feesSynthetix'], 0);
	return formattedObj as Pick<FuturesAggregateStatResult, K>;
};
export const getFuturesAggregateStats = async function <K extends keyof FuturesAggregateStatResult>(
	url: string,
	options: MultiQueryOptions<FuturesAggregateStatFilter, FuturesAggregateStatResult>,
	args: FuturesAggregateStatArgs<K>
): Promise<Pick<FuturesAggregateStatResult, K>[]> {
	const paginatedOptions: Partial<MultiQueryOptions<
		FuturesAggregateStatFilter,
		FuturesAggregateStatResult
	>> = { ...options };
	let paginationKey: keyof FuturesAggregateStatFilter | null = null;
	let paginationValue = '';
	if (options.first && options.first > MAX_PAGE) {
		paginatedOptions.first = MAX_PAGE;
		paginatedOptions.orderBy = options.orderBy || 'id';
		paginatedOptions.orderDirection = options.orderDirection || 'asc';
		paginationKey = (paginatedOptions.orderBy +
			(paginatedOptions.orderDirection === 'asc'
				? '_gt'
				: '_lt')) as keyof FuturesAggregateStatFilter;
		paginatedOptions.where = { ...options.where };
	}
	let results: Pick<FuturesAggregateStatResult, K>[] = [];
	do {
		if (paginationKey && paginationValue)
			paginatedOptions.where![paginationKey] = paginationValue as any;
		const res = await axios.post(url, {
			query: generateGql('futuresAggregateStats', paginatedOptions, args),
		});
		const r = res.data as any;
		if (r.errors && r.errors.length) {
			throw new Error(r.errors[0].message);
		}
		const rawResults = r.data[Object.keys(r.data)[0]] as any[];
		const newResults = rawResults.map((obj) => {
			const formattedObj: any = {};
			if (obj['id']) formattedObj['id'] = obj['id'];
			if (obj['period']) formattedObj['period'] = wei(obj['period'], 0);
			if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
			if (obj['asset']) formattedObj['asset'] = obj['asset'];
			if (obj['trades']) formattedObj['trades'] = wei(obj['trades'], 0);
			if (obj['volume']) formattedObj['volume'] = wei(obj['volume'], 0);
			if (obj['feesKwenta']) formattedObj['feesKwenta'] = wei(obj['feesKwenta'], 0);
			if (obj['feesSynthetix']) formattedObj['feesSynthetix'] = wei(obj['feesSynthetix'], 0);
			return formattedObj as Pick<FuturesAggregateStatResult, K>;
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
	totalTraders?: WeiSource | null;
	totalTraders_not?: WeiSource | null;
	totalTraders_gt?: WeiSource | null;
	totalTraders_lt?: WeiSource | null;
	totalTraders_gte?: WeiSource | null;
	totalTraders_lte?: WeiSource | null;
	totalTraders_in?: WeiSource[];
	totalTraders_not_in?: WeiSource[];
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
	totalTraders: Wei;
	totalVolume: Wei;
	averageTradeSize: Wei;
};
export type FuturesCumulativeStatFields = {
	id: true;
	totalLiquidations: true;
	totalTrades: true;
	totalTraders: true;
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
	if (obj['totalTraders']) formattedObj['totalTraders'] = wei(obj['totalTraders'], 0);
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
			if (obj['totalTraders']) formattedObj['totalTraders'] = wei(obj['totalTraders'], 0);
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
export type FuturesHourlyStatFilter = {
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
export type FuturesHourlyStatResult = {
	id: string;
	asset: string;
	trades: Wei;
	volume: Wei;
	timestamp: Wei;
};
export type FuturesHourlyStatFields = {
	id: true;
	asset: true;
	trades: true;
	volume: true;
	timestamp: true;
};
export type FuturesHourlyStatArgs<K extends keyof FuturesHourlyStatResult> = {
	[Property in keyof Pick<FuturesHourlyStatFields, K>]: FuturesHourlyStatFields[Property];
};
export const getFuturesHourlyStatById = async function <K extends keyof FuturesHourlyStatResult>(
	url: string,
	options: SingleQueryOptions,
	args: FuturesHourlyStatArgs<K>
): Promise<Pick<FuturesHourlyStatResult, K>> {
	const res = await axios.post(url, {
		query: generateGql('futuresHourlyStat', options, args),
	});
	const r = res.data as any;
	if (r.errors && r.errors.length) {
		throw new Error(r.errors[0].message);
	}
	const obj = r.data[Object.keys(r.data)[0]] as any;
	const formattedObj: any = {};
	if (obj['id']) formattedObj['id'] = obj['id'];
	if (obj['asset']) formattedObj['asset'] = obj['asset'];
	if (obj['trades']) formattedObj['trades'] = wei(obj['trades'], 0);
	if (obj['volume']) formattedObj['volume'] = wei(obj['volume'], 0);
	if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
	return formattedObj as Pick<FuturesHourlyStatResult, K>;
};
export const getFuturesHourlyStats = async function <K extends keyof FuturesHourlyStatResult>(
	url: string,
	options: MultiQueryOptions<FuturesHourlyStatFilter, FuturesHourlyStatResult>,
	args: FuturesHourlyStatArgs<K>
): Promise<Pick<FuturesHourlyStatResult, K>[]> {
	const paginatedOptions: Partial<MultiQueryOptions<
		FuturesHourlyStatFilter,
		FuturesHourlyStatResult
	>> = { ...options };
	let paginationKey: keyof FuturesHourlyStatFilter | null = null;
	let paginationValue = '';
	if (options.first && options.first > MAX_PAGE) {
		paginatedOptions.first = MAX_PAGE;
		paginatedOptions.orderBy = options.orderBy || 'id';
		paginatedOptions.orderDirection = options.orderDirection || 'asc';
		paginationKey = (paginatedOptions.orderBy +
			(paginatedOptions.orderDirection === 'asc' ? '_gt' : '_lt')) as keyof FuturesHourlyStatFilter;
		paginatedOptions.where = { ...options.where };
	}
	let results: Pick<FuturesHourlyStatResult, K>[] = [];
	do {
		if (paginationKey && paginationValue)
			paginatedOptions.where![paginationKey] = paginationValue as any;
		const res = await axios.post(url, {
			query: generateGql('futuresHourlyStats', paginatedOptions, args),
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
			if (obj['trades']) formattedObj['trades'] = wei(obj['trades'], 0);
			if (obj['volume']) formattedObj['volume'] = wei(obj['volume'], 0);
			if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
			return formattedObj as Pick<FuturesHourlyStatResult, K>;
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
export type FuturesMarginAccountFilter = {
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
	margin?: WeiSource | null;
	margin_not?: WeiSource | null;
	margin_gt?: WeiSource | null;
	margin_lt?: WeiSource | null;
	margin_gte?: WeiSource | null;
	margin_lte?: WeiSource | null;
	margin_in?: WeiSource[];
	margin_not_in?: WeiSource[];
	deposits?: WeiSource | null;
	deposits_not?: WeiSource | null;
	deposits_gt?: WeiSource | null;
	deposits_lt?: WeiSource | null;
	deposits_gte?: WeiSource | null;
	deposits_lte?: WeiSource | null;
	deposits_in?: WeiSource[];
	deposits_not_in?: WeiSource[];
	withdrawals?: WeiSource | null;
	withdrawals_not?: WeiSource | null;
	withdrawals_gt?: WeiSource | null;
	withdrawals_lt?: WeiSource | null;
	withdrawals_gte?: WeiSource | null;
	withdrawals_lte?: WeiSource | null;
	withdrawals_in?: WeiSource[];
	withdrawals_not_in?: WeiSource[];
	_change_block?: any | null;
};
export type FuturesMarginAccountResult = {
	id: string;
	timestamp: Wei;
	account: string;
	market: string;
	asset: string;
	margin: Wei;
	deposits: Wei;
	withdrawals: Wei;
};
export type FuturesMarginAccountFields = {
	id: true;
	timestamp: true;
	account: true;
	market: true;
	asset: true;
	margin: true;
	deposits: true;
	withdrawals: true;
};
export type FuturesMarginAccountArgs<K extends keyof FuturesMarginAccountResult> = {
	[Property in keyof Pick<FuturesMarginAccountFields, K>]: FuturesMarginAccountFields[Property];
};
export const getFuturesMarginAccountById = async function <
	K extends keyof FuturesMarginAccountResult
>(
	url: string,
	options: SingleQueryOptions,
	args: FuturesMarginAccountArgs<K>
): Promise<Pick<FuturesMarginAccountResult, K>> {
	const res = await axios.post(url, {
		query: generateGql('futuresMarginAccount', options, args),
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
	if (obj['margin']) formattedObj['margin'] = wei(obj['margin'], 0);
	if (obj['deposits']) formattedObj['deposits'] = wei(obj['deposits'], 0);
	if (obj['withdrawals']) formattedObj['withdrawals'] = wei(obj['withdrawals'], 0);
	return formattedObj as Pick<FuturesMarginAccountResult, K>;
};
export const getFuturesMarginAccounts = async function <K extends keyof FuturesMarginAccountResult>(
	url: string,
	options: MultiQueryOptions<FuturesMarginAccountFilter, FuturesMarginAccountResult>,
	args: FuturesMarginAccountArgs<K>
): Promise<Pick<FuturesMarginAccountResult, K>[]> {
	const paginatedOptions: Partial<MultiQueryOptions<
		FuturesMarginAccountFilter,
		FuturesMarginAccountResult
	>> = { ...options };
	let paginationKey: keyof FuturesMarginAccountFilter | null = null;
	let paginationValue = '';
	if (options.first && options.first > MAX_PAGE) {
		paginatedOptions.first = MAX_PAGE;
		paginatedOptions.orderBy = options.orderBy || 'id';
		paginatedOptions.orderDirection = options.orderDirection || 'asc';
		paginationKey = (paginatedOptions.orderBy +
			(paginatedOptions.orderDirection === 'asc'
				? '_gt'
				: '_lt')) as keyof FuturesMarginAccountFilter;
		paginatedOptions.where = { ...options.where };
	}
	let results: Pick<FuturesMarginAccountResult, K>[] = [];
	do {
		if (paginationKey && paginationValue)
			paginatedOptions.where![paginationKey] = paginationValue as any;
		const res = await axios.post(url, {
			query: generateGql('futuresMarginAccounts', paginatedOptions, args),
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
			if (obj['margin']) formattedObj['margin'] = wei(obj['margin'], 0);
			if (obj['deposits']) formattedObj['deposits'] = wei(obj['deposits'], 0);
			if (obj['withdrawals']) formattedObj['withdrawals'] = wei(obj['withdrawals'], 0);
			return formattedObj as Pick<FuturesMarginAccountResult, K>;
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
	marketStats_?: FuturesCumulativeStatFilter | null;
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
	abstractAccount?: string | null;
	abstractAccount_not?: string | null;
	abstractAccount_in?: string[];
	abstractAccount_not_in?: string[];
	abstractAccount_contains?: string | null;
	abstractAccount_not_contains?: string | null;
	orderId?: WeiSource | null;
	orderId_not?: WeiSource | null;
	orderId_gt?: WeiSource | null;
	orderId_lt?: WeiSource | null;
	orderId_gte?: WeiSource | null;
	orderId_lte?: WeiSource | null;
	orderId_in?: WeiSource[];
	orderId_not_in?: WeiSource[];
	targetRoundId?: WeiSource | null;
	targetRoundId_not?: WeiSource | null;
	targetRoundId_gt?: WeiSource | null;
	targetRoundId_lt?: WeiSource | null;
	targetRoundId_gte?: WeiSource | null;
	targetRoundId_lte?: WeiSource | null;
	targetRoundId_in?: WeiSource[];
	targetRoundId_not_in?: WeiSource[];
	targetPrice?: WeiSource | null;
	targetPrice_not?: WeiSource | null;
	targetPrice_gt?: WeiSource | null;
	targetPrice_lt?: WeiSource | null;
	targetPrice_gte?: WeiSource | null;
	targetPrice_lte?: WeiSource | null;
	targetPrice_in?: WeiSource[];
	targetPrice_not_in?: WeiSource[];
	marginDelta?: WeiSource | null;
	marginDelta_not?: WeiSource | null;
	marginDelta_gt?: WeiSource | null;
	marginDelta_lt?: WeiSource | null;
	marginDelta_gte?: WeiSource | null;
	marginDelta_lte?: WeiSource | null;
	marginDelta_in?: WeiSource[];
	marginDelta_not_in?: WeiSource[];
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
	keeper?: string | null;
	keeper_not?: string | null;
	keeper_in?: string[];
	keeper_not_in?: string[];
	keeper_contains?: string | null;
	keeper_not_contains?: string | null;
	_change_block?: any | null;
};
export type FuturesOrderResult = {
	id: string;
	size: Wei;
	asset: string;
	market: string;
	account: string;
	abstractAccount: string;
	orderId: Wei;
	targetRoundId: Wei;
	targetPrice: Wei;
	marginDelta: Wei;
	timestamp: Wei;
	orderType: Partial<FuturesOrderType>;
	status: Partial<FuturesOrderStatus>;
	keeper: string;
};
export type FuturesOrderFields = {
	id: true;
	size: true;
	asset: true;
	market: true;
	account: true;
	abstractAccount: true;
	orderId: true;
	targetRoundId: true;
	targetPrice: true;
	marginDelta: true;
	timestamp: true;
	orderType: true;
	status: true;
	keeper: true;
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
	if (obj['abstractAccount']) formattedObj['abstractAccount'] = obj['abstractAccount'];
	if (obj['orderId']) formattedObj['orderId'] = wei(obj['orderId'], 0);
	if (obj['targetRoundId']) formattedObj['targetRoundId'] = wei(obj['targetRoundId'], 0);
	if (obj['targetPrice']) formattedObj['targetPrice'] = wei(obj['targetPrice'], 0);
	if (obj['marginDelta']) formattedObj['marginDelta'] = wei(obj['marginDelta'], 0);
	if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
	if (obj['orderType']) formattedObj['orderType'] = obj['orderType'];
	if (obj['status']) formattedObj['status'] = obj['status'];
	if (obj['keeper']) formattedObj['keeper'] = obj['keeper'];
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
			if (obj['abstractAccount']) formattedObj['abstractAccount'] = obj['abstractAccount'];
			if (obj['orderId']) formattedObj['orderId'] = wei(obj['orderId'], 0);
			if (obj['targetRoundId']) formattedObj['targetRoundId'] = wei(obj['targetRoundId'], 0);
			if (obj['targetPrice']) formattedObj['targetPrice'] = wei(obj['targetPrice'], 0);
			if (obj['marginDelta']) formattedObj['marginDelta'] = wei(obj['marginDelta'], 0);
			if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
			if (obj['orderType']) formattedObj['orderType'] = obj['orderType'];
			if (obj['status']) formattedObj['status'] = obj['status'];
			if (obj['keeper']) formattedObj['keeper'] = obj['keeper'];
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
	abstractAccount?: string | null;
	abstractAccount_not?: string | null;
	abstractAccount_in?: string[];
	abstractAccount_not_in?: string[];
	abstractAccount_contains?: string | null;
	abstractAccount_not_contains?: string | null;
	accountType?: FuturesAccountType | null;
	accountType_not?: FuturesAccountType | null;
	accountType_in?: FuturesAccountType[];
	accountType_not_in?: FuturesAccountType[];
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
	initialMargin?: WeiSource | null;
	initialMargin_not?: WeiSource | null;
	initialMargin_gt?: WeiSource | null;
	initialMargin_lt?: WeiSource | null;
	initialMargin_gte?: WeiSource | null;
	initialMargin_lte?: WeiSource | null;
	initialMargin_in?: WeiSource[];
	initialMargin_not_in?: WeiSource[];
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
	pnlWithFeesPaid?: WeiSource | null;
	pnlWithFeesPaid_not?: WeiSource | null;
	pnlWithFeesPaid_gt?: WeiSource | null;
	pnlWithFeesPaid_lt?: WeiSource | null;
	pnlWithFeesPaid_gte?: WeiSource | null;
	pnlWithFeesPaid_lte?: WeiSource | null;
	pnlWithFeesPaid_in?: WeiSource[];
	pnlWithFeesPaid_not_in?: WeiSource[];
	netTransfers?: WeiSource | null;
	netTransfers_not?: WeiSource | null;
	netTransfers_gt?: WeiSource | null;
	netTransfers_lt?: WeiSource | null;
	netTransfers_gte?: WeiSource | null;
	netTransfers_lte?: WeiSource | null;
	netTransfers_in?: WeiSource[];
	netTransfers_not_in?: WeiSource[];
	totalDeposits?: WeiSource | null;
	totalDeposits_not?: WeiSource | null;
	totalDeposits_gt?: WeiSource | null;
	totalDeposits_lt?: WeiSource | null;
	totalDeposits_gte?: WeiSource | null;
	totalDeposits_lte?: WeiSource | null;
	totalDeposits_in?: WeiSource[];
	totalDeposits_not_in?: WeiSource[];
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
	abstractAccount: string;
	accountType: Partial<FuturesAccountType>;
	isOpen: boolean;
	isLiquidated: boolean;
	trades: Wei;
	totalVolume: Wei;
	size: Wei;
	initialMargin: Wei;
	margin: Wei;
	pnl: Wei;
	feesPaid: Wei;
	netFunding: Wei;
	pnlWithFeesPaid: Wei;
	netTransfers: Wei;
	totalDeposits: Wei;
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
	abstractAccount: true;
	accountType: true;
	isOpen: true;
	isLiquidated: true;
	trades: true;
	totalVolume: true;
	size: true;
	initialMargin: true;
	margin: true;
	pnl: true;
	feesPaid: true;
	netFunding: true;
	pnlWithFeesPaid: true;
	netTransfers: true;
	totalDeposits: true;
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
	if (obj['abstractAccount']) formattedObj['abstractAccount'] = obj['abstractAccount'];
	if (obj['accountType']) formattedObj['accountType'] = obj['accountType'];
	if (obj['isOpen']) formattedObj['isOpen'] = obj['isOpen'];
	if (obj['isLiquidated']) formattedObj['isLiquidated'] = obj['isLiquidated'];
	if (obj['trades']) formattedObj['trades'] = wei(obj['trades'], 0);
	if (obj['totalVolume']) formattedObj['totalVolume'] = wei(obj['totalVolume'], 0);
	if (obj['size']) formattedObj['size'] = wei(obj['size'], 0);
	if (obj['initialMargin']) formattedObj['initialMargin'] = wei(obj['initialMargin'], 0);
	if (obj['margin']) formattedObj['margin'] = wei(obj['margin'], 0);
	if (obj['pnl']) formattedObj['pnl'] = wei(obj['pnl'], 0);
	if (obj['feesPaid']) formattedObj['feesPaid'] = wei(obj['feesPaid'], 0);
	if (obj['netFunding']) formattedObj['netFunding'] = wei(obj['netFunding'], 0);
	if (obj['pnlWithFeesPaid']) formattedObj['pnlWithFeesPaid'] = wei(obj['pnlWithFeesPaid'], 0);
	if (obj['netTransfers']) formattedObj['netTransfers'] = wei(obj['netTransfers'], 0);
	if (obj['totalDeposits']) formattedObj['totalDeposits'] = wei(obj['totalDeposits'], 0);
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
			if (obj['abstractAccount']) formattedObj['abstractAccount'] = obj['abstractAccount'];
			if (obj['accountType']) formattedObj['accountType'] = obj['accountType'];
			if (obj['isOpen']) formattedObj['isOpen'] = obj['isOpen'];
			if (obj['isLiquidated']) formattedObj['isLiquidated'] = obj['isLiquidated'];
			if (obj['trades']) formattedObj['trades'] = wei(obj['trades'], 0);
			if (obj['totalVolume']) formattedObj['totalVolume'] = wei(obj['totalVolume'], 0);
			if (obj['size']) formattedObj['size'] = wei(obj['size'], 0);
			if (obj['initialMargin']) formattedObj['initialMargin'] = wei(obj['initialMargin'], 0);
			if (obj['margin']) formattedObj['margin'] = wei(obj['margin'], 0);
			if (obj['pnl']) formattedObj['pnl'] = wei(obj['pnl'], 0);
			if (obj['feesPaid']) formattedObj['feesPaid'] = wei(obj['feesPaid'], 0);
			if (obj['netFunding']) formattedObj['netFunding'] = wei(obj['netFunding'], 0);
			if (obj['pnlWithFeesPaid']) formattedObj['pnlWithFeesPaid'] = wei(obj['pnlWithFeesPaid'], 0);
			if (obj['netTransfers']) formattedObj['netTransfers'] = wei(obj['netTransfers'], 0);
			if (obj['totalDeposits']) formattedObj['totalDeposits'] = wei(obj['totalDeposits'], 0);
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
	crossMarginVolume?: WeiSource | null;
	crossMarginVolume_not?: WeiSource | null;
	crossMarginVolume_gt?: WeiSource | null;
	crossMarginVolume_lt?: WeiSource | null;
	crossMarginVolume_gte?: WeiSource | null;
	crossMarginVolume_lte?: WeiSource | null;
	crossMarginVolume_in?: WeiSource[];
	crossMarginVolume_not_in?: WeiSource[];
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
	crossMarginVolume: Wei;
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
	crossMarginVolume: true;
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
	if (obj['crossMarginVolume'])
		formattedObj['crossMarginVolume'] = wei(obj['crossMarginVolume'], 0);
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
			if (obj['crossMarginVolume'])
				formattedObj['crossMarginVolume'] = wei(obj['crossMarginVolume'], 0);
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
	abstractAccount?: string | null;
	abstractAccount_not?: string | null;
	abstractAccount_in?: string[];
	abstractAccount_not_in?: string[];
	abstractAccount_contains?: string | null;
	abstractAccount_not_contains?: string | null;
	accountType?: FuturesAccountType | null;
	accountType_not?: FuturesAccountType | null;
	accountType_in?: FuturesAccountType[];
	accountType_not_in?: FuturesAccountType[];
	margin?: WeiSource | null;
	margin_not?: WeiSource | null;
	margin_gt?: WeiSource | null;
	margin_lt?: WeiSource | null;
	margin_gte?: WeiSource | null;
	margin_lte?: WeiSource | null;
	margin_in?: WeiSource[];
	margin_not_in?: WeiSource[];
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
	orderType?: FuturesOrderType | null;
	orderType_not?: FuturesOrderType | null;
	orderType_in?: FuturesOrderType[];
	orderType_not_in?: FuturesOrderType[];
	_change_block?: any | null;
};
export type FuturesTradeResult = {
	id: string;
	timestamp: Wei;
	account: string;
	abstractAccount: string;
	accountType: Partial<FuturesAccountType>;
	margin: Wei;
	size: Wei;
	asset: string;
	price: Wei;
	positionId: string;
	positionSize: Wei;
	positionClosed: boolean;
	pnl: Wei;
	feesPaid: Wei;
	orderType: Partial<FuturesOrderType>;
};
export type FuturesTradeFields = {
	id: true;
	timestamp: true;
	account: true;
	abstractAccount: true;
	accountType: true;
	margin: true;
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
	if (obj['abstractAccount']) formattedObj['abstractAccount'] = obj['abstractAccount'];
	if (obj['accountType']) formattedObj['accountType'] = obj['accountType'];
	if (obj['margin']) formattedObj['margin'] = wei(obj['margin'], 0);
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
			if (obj['abstractAccount']) formattedObj['abstractAccount'] = obj['abstractAccount'];
			if (obj['accountType']) formattedObj['accountType'] = obj['accountType'];
			if (obj['margin']) formattedObj['margin'] = wei(obj['margin'], 0);
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
	aggregator?: string | null;
	aggregator_not?: string | null;
	aggregator_in?: string[];
	aggregator_not_in?: string[];
	aggregator_contains?: string | null;
	aggregator_not_contains?: string | null;
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
export type LatestRateResult = {
	id: string;
	rate: Wei;
	aggregator: string;
	timestamp: Wei;
};
export type LatestRateFields = {
	id: true;
	rate: true;
	aggregator: true;
	timestamp: true;
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
	if (obj['aggregator']) formattedObj['aggregator'] = obj['aggregator'];
	if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
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
			if (obj['aggregator']) formattedObj['aggregator'] = obj['aggregator'];
			if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
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
export type LatestSynthBalanceFilter = {
	id?: string | null;
	id_not?: string | null;
	id_gt?: string | null;
	id_lt?: string | null;
	id_gte?: string | null;
	id_lte?: string | null;
	id_in?: string[];
	id_not_in?: string[];
	amount?: WeiSource | null;
	amount_not?: WeiSource | null;
	amount_gt?: WeiSource | null;
	amount_lt?: WeiSource | null;
	amount_gte?: WeiSource | null;
	amount_lte?: WeiSource | null;
	amount_in?: WeiSource[];
	amount_not_in?: WeiSource[];
	address?: string | null;
	address_not?: string | null;
	address_in?: string[];
	address_not_in?: string[];
	address_contains?: string | null;
	address_not_contains?: string | null;
	account?: string | null;
	account_not?: string | null;
	account_gt?: string | null;
	account_lt?: string | null;
	account_gte?: string | null;
	account_lte?: string | null;
	account_in?: string[];
	account_not_in?: string[];
	account_contains?: string | null;
	account_contains_nocase?: string | null;
	account_not_contains?: string | null;
	account_not_contains_nocase?: string | null;
	account_starts_with?: string | null;
	account_starts_with_nocase?: string | null;
	account_not_starts_with?: string | null;
	account_not_starts_with_nocase?: string | null;
	account_ends_with?: string | null;
	account_ends_with_nocase?: string | null;
	account_not_ends_with?: string | null;
	account_not_ends_with_nocase?: string | null;
	timestamp?: WeiSource | null;
	timestamp_not?: WeiSource | null;
	timestamp_gt?: WeiSource | null;
	timestamp_lt?: WeiSource | null;
	timestamp_gte?: WeiSource | null;
	timestamp_lte?: WeiSource | null;
	timestamp_in?: WeiSource[];
	timestamp_not_in?: WeiSource[];
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
	synth_?: SynthFilter | null;
	_change_block?: any | null;
};
export type LatestSynthBalanceResult = {
	id: string;
	amount: Wei;
	address: string;
	account: string;
	timestamp: Wei;
	synth: Partial<SynthResult> | null;
};
export type LatestSynthBalanceFields = {
	id: true;
	amount: true;
	address: true;
	account: true;
	timestamp: true;
	synth: SynthFields;
};
export type LatestSynthBalanceArgs<K extends keyof LatestSynthBalanceResult> = {
	[Property in keyof Pick<LatestSynthBalanceFields, K>]: LatestSynthBalanceFields[Property];
};
export const getLatestSynthBalanceById = async function <K extends keyof LatestSynthBalanceResult>(
	url: string,
	options: SingleQueryOptions,
	args: LatestSynthBalanceArgs<K>
): Promise<Pick<LatestSynthBalanceResult, K>> {
	const res = await axios.post(url, {
		query: generateGql('latestSynthBalance', options, args),
	});
	const r = res.data as any;
	if (r.errors && r.errors.length) {
		throw new Error(r.errors[0].message);
	}
	const obj = r.data[Object.keys(r.data)[0]] as any;
	const formattedObj: any = {};
	if (obj['id']) formattedObj['id'] = obj['id'];
	if (obj['amount']) formattedObj['amount'] = wei(obj['amount']);
	if (obj['address']) formattedObj['address'] = obj['address'];
	if (obj['account']) formattedObj['account'] = obj['account'];
	if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
	if (obj['synth']) formattedObj['synth'] = obj['synth'];
	return formattedObj as Pick<LatestSynthBalanceResult, K>;
};
export const getLatestSynthBalances = async function <K extends keyof LatestSynthBalanceResult>(
	url: string,
	options: MultiQueryOptions<LatestSynthBalanceFilter, LatestSynthBalanceResult>,
	args: LatestSynthBalanceArgs<K>
): Promise<Pick<LatestSynthBalanceResult, K>[]> {
	const paginatedOptions: Partial<MultiQueryOptions<
		LatestSynthBalanceFilter,
		LatestSynthBalanceResult
	>> = { ...options };
	let paginationKey: keyof LatestSynthBalanceFilter | null = null;
	let paginationValue = '';
	if (options.first && options.first > MAX_PAGE) {
		paginatedOptions.first = MAX_PAGE;
		paginatedOptions.orderBy = options.orderBy || 'id';
		paginatedOptions.orderDirection = options.orderDirection || 'asc';
		paginationKey = (paginatedOptions.orderBy +
			(paginatedOptions.orderDirection === 'asc'
				? '_gt'
				: '_lt')) as keyof LatestSynthBalanceFilter;
		paginatedOptions.where = { ...options.where };
	}
	let results: Pick<LatestSynthBalanceResult, K>[] = [];
	do {
		if (paginationKey && paginationValue)
			paginatedOptions.where![paginationKey] = paginationValue as any;
		const res = await axios.post(url, {
			query: generateGql('latestSynthBalances', paginatedOptions, args),
		});
		const r = res.data as any;
		if (r.errors && r.errors.length) {
			throw new Error(r.errors[0].message);
		}
		const rawResults = r.data[Object.keys(r.data)[0]] as any[];
		const newResults = rawResults.map((obj) => {
			const formattedObj: any = {};
			if (obj['id']) formattedObj['id'] = obj['id'];
			if (obj['amount']) formattedObj['amount'] = wei(obj['amount']);
			if (obj['address']) formattedObj['address'] = obj['address'];
			if (obj['account']) formattedObj['account'] = obj['account'];
			if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
			if (obj['synth']) formattedObj['synth'] = obj['synth'];
			return formattedObj as Pick<LatestSynthBalanceResult, K>;
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
export type SynthFilter = {
	id?: string | null;
	id_not?: string | null;
	id_gt?: string | null;
	id_lt?: string | null;
	id_gte?: string | null;
	id_lte?: string | null;
	id_in?: string[];
	id_not_in?: string[];
	name?: string | null;
	name_not?: string | null;
	name_gt?: string | null;
	name_lt?: string | null;
	name_gte?: string | null;
	name_lte?: string | null;
	name_in?: string[];
	name_not_in?: string[];
	name_contains?: string | null;
	name_contains_nocase?: string | null;
	name_not_contains?: string | null;
	name_not_contains_nocase?: string | null;
	name_starts_with?: string | null;
	name_starts_with_nocase?: string | null;
	name_not_starts_with?: string | null;
	name_not_starts_with_nocase?: string | null;
	name_ends_with?: string | null;
	name_ends_with_nocase?: string | null;
	name_not_ends_with?: string | null;
	name_not_ends_with_nocase?: string | null;
	symbol?: string | null;
	symbol_not?: string | null;
	symbol_gt?: string | null;
	symbol_lt?: string | null;
	symbol_gte?: string | null;
	symbol_lte?: string | null;
	symbol_in?: string[];
	symbol_not_in?: string[];
	symbol_contains?: string | null;
	symbol_contains_nocase?: string | null;
	symbol_not_contains?: string | null;
	symbol_not_contains_nocase?: string | null;
	symbol_starts_with?: string | null;
	symbol_starts_with_nocase?: string | null;
	symbol_not_starts_with?: string | null;
	symbol_not_starts_with_nocase?: string | null;
	symbol_ends_with?: string | null;
	symbol_ends_with_nocase?: string | null;
	symbol_not_ends_with?: string | null;
	symbol_not_ends_with_nocase?: string | null;
	totalSupply?: WeiSource | null;
	totalSupply_not?: WeiSource | null;
	totalSupply_gt?: WeiSource | null;
	totalSupply_lt?: WeiSource | null;
	totalSupply_gte?: WeiSource | null;
	totalSupply_lte?: WeiSource | null;
	totalSupply_in?: WeiSource[];
	totalSupply_not_in?: WeiSource[];
	_change_block?: any | null;
};
export type SynthResult = {
	id: string;
	name: string;
	symbol: string;
	totalSupply: Wei;
};
export type SynthFields = {
	id: true;
	name: true;
	symbol: true;
	totalSupply: true;
};
export type SynthArgs<K extends keyof SynthResult> = {
	[Property in keyof Pick<SynthFields, K>]: SynthFields[Property];
};
export const getSynthById = async function <K extends keyof SynthResult>(
	url: string,
	options: SingleQueryOptions,
	args: SynthArgs<K>
): Promise<Pick<SynthResult, K>> {
	const res = await axios.post(url, {
		query: generateGql('synth', options, args),
	});
	const r = res.data as any;
	if (r.errors && r.errors.length) {
		throw new Error(r.errors[0].message);
	}
	const obj = r.data[Object.keys(r.data)[0]] as any;
	const formattedObj: any = {};
	if (obj['id']) formattedObj['id'] = obj['id'];
	if (obj['name']) formattedObj['name'] = obj['name'];
	if (obj['symbol']) formattedObj['symbol'] = obj['symbol'];
	if (obj['totalSupply']) formattedObj['totalSupply'] = wei(obj['totalSupply']);
	return formattedObj as Pick<SynthResult, K>;
};
export const getSynths = async function <K extends keyof SynthResult>(
	url: string,
	options: MultiQueryOptions<SynthFilter, SynthResult>,
	args: SynthArgs<K>
): Promise<Pick<SynthResult, K>[]> {
	const paginatedOptions: Partial<MultiQueryOptions<SynthFilter, SynthResult>> = { ...options };
	let paginationKey: keyof SynthFilter | null = null;
	let paginationValue = '';
	if (options.first && options.first > MAX_PAGE) {
		paginatedOptions.first = MAX_PAGE;
		paginatedOptions.orderBy = options.orderBy || 'id';
		paginatedOptions.orderDirection = options.orderDirection || 'asc';
		paginationKey = (paginatedOptions.orderBy +
			(paginatedOptions.orderDirection === 'asc' ? '_gt' : '_lt')) as keyof SynthFilter;
		paginatedOptions.where = { ...options.where };
	}
	let results: Pick<SynthResult, K>[] = [];
	do {
		if (paginationKey && paginationValue)
			paginatedOptions.where![paginationKey] = paginationValue as any;
		const res = await axios.post(url, {
			query: generateGql('synths', paginatedOptions, args),
		});
		const r = res.data as any;
		if (r.errors && r.errors.length) {
			throw new Error(r.errors[0].message);
		}
		const rawResults = r.data[Object.keys(r.data)[0]] as any[];
		const newResults = rawResults.map((obj) => {
			const formattedObj: any = {};
			if (obj['id']) formattedObj['id'] = obj['id'];
			if (obj['name']) formattedObj['name'] = obj['name'];
			if (obj['symbol']) formattedObj['symbol'] = obj['symbol'];
			if (obj['totalSupply']) formattedObj['totalSupply'] = wei(obj['totalSupply']);
			return formattedObj as Pick<SynthResult, K>;
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
export type SynthBalanceFilter = {
	id?: string | null;
	id_not?: string | null;
	id_gt?: string | null;
	id_lt?: string | null;
	id_gte?: string | null;
	id_lte?: string | null;
	id_in?: string[];
	id_not_in?: string[];
	amount?: WeiSource | null;
	amount_not?: WeiSource | null;
	amount_gt?: WeiSource | null;
	amount_lt?: WeiSource | null;
	amount_gte?: WeiSource | null;
	amount_lte?: WeiSource | null;
	amount_in?: WeiSource[];
	amount_not_in?: WeiSource[];
	address?: string | null;
	address_not?: string | null;
	address_in?: string[];
	address_not_in?: string[];
	address_contains?: string | null;
	address_not_contains?: string | null;
	account?: string | null;
	account_not?: string | null;
	account_gt?: string | null;
	account_lt?: string | null;
	account_gte?: string | null;
	account_lte?: string | null;
	account_in?: string[];
	account_not_in?: string[];
	account_contains?: string | null;
	account_contains_nocase?: string | null;
	account_not_contains?: string | null;
	account_not_contains_nocase?: string | null;
	account_starts_with?: string | null;
	account_starts_with_nocase?: string | null;
	account_not_starts_with?: string | null;
	account_not_starts_with_nocase?: string | null;
	account_ends_with?: string | null;
	account_ends_with_nocase?: string | null;
	account_not_ends_with?: string | null;
	account_not_ends_with_nocase?: string | null;
	timestamp?: WeiSource | null;
	timestamp_not?: WeiSource | null;
	timestamp_gt?: WeiSource | null;
	timestamp_lt?: WeiSource | null;
	timestamp_gte?: WeiSource | null;
	timestamp_lte?: WeiSource | null;
	timestamp_in?: WeiSource[];
	timestamp_not_in?: WeiSource[];
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
	synth_?: SynthFilter | null;
	_change_block?: any | null;
};
export type SynthBalanceResult = {
	id: string;
	amount: Wei;
	address: string;
	account: string;
	timestamp: Wei;
	synth: Partial<SynthResult> | null;
};
export type SynthBalanceFields = {
	id: true;
	amount: true;
	address: true;
	account: true;
	timestamp: true;
	synth: SynthFields;
};
export type SynthBalanceArgs<K extends keyof SynthBalanceResult> = {
	[Property in keyof Pick<SynthBalanceFields, K>]: SynthBalanceFields[Property];
};
export const getSynthBalanceById = async function <K extends keyof SynthBalanceResult>(
	url: string,
	options: SingleQueryOptions,
	args: SynthBalanceArgs<K>
): Promise<Pick<SynthBalanceResult, K>> {
	const res = await axios.post(url, {
		query: generateGql('synthBalance', options, args),
	});
	const r = res.data as any;
	if (r.errors && r.errors.length) {
		throw new Error(r.errors[0].message);
	}
	const obj = r.data[Object.keys(r.data)[0]] as any;
	const formattedObj: any = {};
	if (obj['id']) formattedObj['id'] = obj['id'];
	if (obj['amount']) formattedObj['amount'] = wei(obj['amount']);
	if (obj['address']) formattedObj['address'] = obj['address'];
	if (obj['account']) formattedObj['account'] = obj['account'];
	if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
	if (obj['synth']) formattedObj['synth'] = obj['synth'];
	return formattedObj as Pick<SynthBalanceResult, K>;
};
export const getSynthBalances = async function <K extends keyof SynthBalanceResult>(
	url: string,
	options: MultiQueryOptions<SynthBalanceFilter, SynthBalanceResult>,
	args: SynthBalanceArgs<K>
): Promise<Pick<SynthBalanceResult, K>[]> {
	const paginatedOptions: Partial<MultiQueryOptions<SynthBalanceFilter, SynthBalanceResult>> = {
		...options,
	};
	let paginationKey: keyof SynthBalanceFilter | null = null;
	let paginationValue = '';
	if (options.first && options.first > MAX_PAGE) {
		paginatedOptions.first = MAX_PAGE;
		paginatedOptions.orderBy = options.orderBy || 'id';
		paginatedOptions.orderDirection = options.orderDirection || 'asc';
		paginationKey = (paginatedOptions.orderBy +
			(paginatedOptions.orderDirection === 'asc' ? '_gt' : '_lt')) as keyof SynthBalanceFilter;
		paginatedOptions.where = { ...options.where };
	}
	let results: Pick<SynthBalanceResult, K>[] = [];
	do {
		if (paginationKey && paginationValue)
			paginatedOptions.where![paginationKey] = paginationValue as any;
		const res = await axios.post(url, {
			query: generateGql('synthBalances', paginatedOptions, args),
		});
		const r = res.data as any;
		if (r.errors && r.errors.length) {
			throw new Error(r.errors[0].message);
		}
		const rawResults = r.data[Object.keys(r.data)[0]] as any[];
		const newResults = rawResults.map((obj) => {
			const formattedObj: any = {};
			if (obj['id']) formattedObj['id'] = obj['id'];
			if (obj['amount']) formattedObj['amount'] = wei(obj['amount']);
			if (obj['address']) formattedObj['address'] = obj['address'];
			if (obj['account']) formattedObj['account'] = obj['account'];
			if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
			if (obj['synth']) formattedObj['synth'] = obj['synth'];
			return formattedObj as Pick<SynthBalanceResult, K>;
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
export type SynthByCurrencyKeyFilter = {
	id?: string | null;
	id_not?: string | null;
	id_gt?: string | null;
	id_lt?: string | null;
	id_gte?: string | null;
	id_lte?: string | null;
	id_in?: string[];
	id_not_in?: string[];
	proxyAddress?: string | null;
	proxyAddress_not?: string | null;
	proxyAddress_in?: string[];
	proxyAddress_not_in?: string[];
	proxyAddress_contains?: string | null;
	proxyAddress_not_contains?: string | null;
	_change_block?: any | null;
};
export type SynthByCurrencyKeyResult = {
	id: string;
	proxyAddress: string;
};
export type SynthByCurrencyKeyFields = {
	id: true;
	proxyAddress: true;
};
export type SynthByCurrencyKeyArgs<K extends keyof SynthByCurrencyKeyResult> = {
	[Property in keyof Pick<SynthByCurrencyKeyFields, K>]: SynthByCurrencyKeyFields[Property];
};
export const getSynthByCurrencyKeyById = async function <K extends keyof SynthByCurrencyKeyResult>(
	url: string,
	options: SingleQueryOptions,
	args: SynthByCurrencyKeyArgs<K>
): Promise<Pick<SynthByCurrencyKeyResult, K>> {
	const res = await axios.post(url, {
		query: generateGql('synthByCurrencyKey', options, args),
	});
	const r = res.data as any;
	if (r.errors && r.errors.length) {
		throw new Error(r.errors[0].message);
	}
	const obj = r.data[Object.keys(r.data)[0]] as any;
	const formattedObj: any = {};
	if (obj['id']) formattedObj['id'] = obj['id'];
	if (obj['proxyAddress']) formattedObj['proxyAddress'] = obj['proxyAddress'];
	return formattedObj as Pick<SynthByCurrencyKeyResult, K>;
};
export const getSynthByCurrencyKeys = async function <K extends keyof SynthByCurrencyKeyResult>(
	url: string,
	options: MultiQueryOptions<SynthByCurrencyKeyFilter, SynthByCurrencyKeyResult>,
	args: SynthByCurrencyKeyArgs<K>
): Promise<Pick<SynthByCurrencyKeyResult, K>[]> {
	const paginatedOptions: Partial<MultiQueryOptions<
		SynthByCurrencyKeyFilter,
		SynthByCurrencyKeyResult
	>> = { ...options };
	let paginationKey: keyof SynthByCurrencyKeyFilter | null = null;
	let paginationValue = '';
	if (options.first && options.first > MAX_PAGE) {
		paginatedOptions.first = MAX_PAGE;
		paginatedOptions.orderBy = options.orderBy || 'id';
		paginatedOptions.orderDirection = options.orderDirection || 'asc';
		paginationKey = (paginatedOptions.orderBy +
			(paginatedOptions.orderDirection === 'asc'
				? '_gt'
				: '_lt')) as keyof SynthByCurrencyKeyFilter;
		paginatedOptions.where = { ...options.where };
	}
	let results: Pick<SynthByCurrencyKeyResult, K>[] = [];
	do {
		if (paginationKey && paginationValue)
			paginatedOptions.where![paginationKey] = paginationValue as any;
		const res = await axios.post(url, {
			query: generateGql('synthByCurrencyKeys', paginatedOptions, args),
		});
		const r = res.data as any;
		if (r.errors && r.errors.length) {
			throw new Error(r.errors[0].message);
		}
		const rawResults = r.data[Object.keys(r.data)[0]] as any[];
		const newResults = rawResults.map((obj) => {
			const formattedObj: any = {};
			if (obj['id']) formattedObj['id'] = obj['id'];
			if (obj['proxyAddress']) formattedObj['proxyAddress'] = obj['proxyAddress'];
			return formattedObj as Pick<SynthByCurrencyKeyResult, K>;
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
export type SynthExchangeFilter = {
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
	account_gt?: string | null;
	account_lt?: string | null;
	account_gte?: string | null;
	account_lte?: string | null;
	account_in?: string[];
	account_not_in?: string[];
	account_contains?: string | null;
	account_contains_nocase?: string | null;
	account_not_contains?: string | null;
	account_not_contains_nocase?: string | null;
	account_starts_with?: string | null;
	account_starts_with_nocase?: string | null;
	account_not_starts_with?: string | null;
	account_not_starts_with_nocase?: string | null;
	account_ends_with?: string | null;
	account_ends_with_nocase?: string | null;
	account_not_ends_with?: string | null;
	account_not_ends_with_nocase?: string | null;
	account_?: ExchangerFilter | null;
	fromSynth?: string | null;
	fromSynth_not?: string | null;
	fromSynth_gt?: string | null;
	fromSynth_lt?: string | null;
	fromSynth_gte?: string | null;
	fromSynth_lte?: string | null;
	fromSynth_in?: string[];
	fromSynth_not_in?: string[];
	fromSynth_contains?: string | null;
	fromSynth_contains_nocase?: string | null;
	fromSynth_not_contains?: string | null;
	fromSynth_not_contains_nocase?: string | null;
	fromSynth_starts_with?: string | null;
	fromSynth_starts_with_nocase?: string | null;
	fromSynth_not_starts_with?: string | null;
	fromSynth_not_starts_with_nocase?: string | null;
	fromSynth_ends_with?: string | null;
	fromSynth_ends_with_nocase?: string | null;
	fromSynth_not_ends_with?: string | null;
	fromSynth_not_ends_with_nocase?: string | null;
	fromSynth_?: SynthFilter | null;
	toSynth?: string | null;
	toSynth_not?: string | null;
	toSynth_gt?: string | null;
	toSynth_lt?: string | null;
	toSynth_gte?: string | null;
	toSynth_lte?: string | null;
	toSynth_in?: string[];
	toSynth_not_in?: string[];
	toSynth_contains?: string | null;
	toSynth_contains_nocase?: string | null;
	toSynth_not_contains?: string | null;
	toSynth_not_contains_nocase?: string | null;
	toSynth_starts_with?: string | null;
	toSynth_starts_with_nocase?: string | null;
	toSynth_not_starts_with?: string | null;
	toSynth_not_starts_with_nocase?: string | null;
	toSynth_ends_with?: string | null;
	toSynth_ends_with_nocase?: string | null;
	toSynth_not_ends_with?: string | null;
	toSynth_not_ends_with_nocase?: string | null;
	toSynth_?: SynthFilter | null;
	fromAmount?: WeiSource | null;
	fromAmount_not?: WeiSource | null;
	fromAmount_gt?: WeiSource | null;
	fromAmount_lt?: WeiSource | null;
	fromAmount_gte?: WeiSource | null;
	fromAmount_lte?: WeiSource | null;
	fromAmount_in?: WeiSource[];
	fromAmount_not_in?: WeiSource[];
	fromAmountInUSD?: WeiSource | null;
	fromAmountInUSD_not?: WeiSource | null;
	fromAmountInUSD_gt?: WeiSource | null;
	fromAmountInUSD_lt?: WeiSource | null;
	fromAmountInUSD_gte?: WeiSource | null;
	fromAmountInUSD_lte?: WeiSource | null;
	fromAmountInUSD_in?: WeiSource[];
	fromAmountInUSD_not_in?: WeiSource[];
	toAmount?: WeiSource | null;
	toAmount_not?: WeiSource | null;
	toAmount_gt?: WeiSource | null;
	toAmount_lt?: WeiSource | null;
	toAmount_gte?: WeiSource | null;
	toAmount_lte?: WeiSource | null;
	toAmount_in?: WeiSource[];
	toAmount_not_in?: WeiSource[];
	toAmountInUSD?: WeiSource | null;
	toAmountInUSD_not?: WeiSource | null;
	toAmountInUSD_gt?: WeiSource | null;
	toAmountInUSD_lt?: WeiSource | null;
	toAmountInUSD_gte?: WeiSource | null;
	toAmountInUSD_lte?: WeiSource | null;
	toAmountInUSD_in?: WeiSource[];
	toAmountInUSD_not_in?: WeiSource[];
	feesInUSD?: WeiSource | null;
	feesInUSD_not?: WeiSource | null;
	feesInUSD_gt?: WeiSource | null;
	feesInUSD_lt?: WeiSource | null;
	feesInUSD_gte?: WeiSource | null;
	feesInUSD_lte?: WeiSource | null;
	feesInUSD_in?: WeiSource[];
	feesInUSD_not_in?: WeiSource[];
	toAddress?: string | null;
	toAddress_not?: string | null;
	toAddress_in?: string[];
	toAddress_not_in?: string[];
	toAddress_contains?: string | null;
	toAddress_not_contains?: string | null;
	timestamp?: WeiSource | null;
	timestamp_not?: WeiSource | null;
	timestamp_gt?: WeiSource | null;
	timestamp_lt?: WeiSource | null;
	timestamp_gte?: WeiSource | null;
	timestamp_lte?: WeiSource | null;
	timestamp_in?: WeiSource[];
	timestamp_not_in?: WeiSource[];
	gasPrice?: WeiSource | null;
	gasPrice_not?: WeiSource | null;
	gasPrice_gt?: WeiSource | null;
	gasPrice_lt?: WeiSource | null;
	gasPrice_gte?: WeiSource | null;
	gasPrice_lte?: WeiSource | null;
	gasPrice_in?: WeiSource[];
	gasPrice_not_in?: WeiSource[];
	_change_block?: any | null;
};
export type SynthExchangeResult = {
	id: string;
	account: Partial<ExchangerResult>;
	fromSynth: Partial<SynthResult> | null;
	toSynth: Partial<SynthResult> | null;
	fromAmount: Wei;
	fromAmountInUSD: Wei;
	toAmount: Wei;
	toAmountInUSD: Wei;
	feesInUSD: Wei;
	toAddress: string;
	timestamp: Wei;
	gasPrice: Wei;
};
export type SynthExchangeFields = {
	id: true;
	account: ExchangerFields;
	fromSynth: SynthFields;
	toSynth: SynthFields;
	fromAmount: true;
	fromAmountInUSD: true;
	toAmount: true;
	toAmountInUSD: true;
	feesInUSD: true;
	toAddress: true;
	timestamp: true;
	gasPrice: true;
};
export type SynthExchangeArgs<K extends keyof SynthExchangeResult> = {
	[Property in keyof Pick<SynthExchangeFields, K>]: SynthExchangeFields[Property];
};
export const getSynthExchangeById = async function <K extends keyof SynthExchangeResult>(
	url: string,
	options: SingleQueryOptions,
	args: SynthExchangeArgs<K>
): Promise<Pick<SynthExchangeResult, K>> {
	const res = await axios.post(url, {
		query: generateGql('synthExchange', options, args),
	});
	const r = res.data as any;
	if (r.errors && r.errors.length) {
		throw new Error(r.errors[0].message);
	}
	const obj = r.data[Object.keys(r.data)[0]] as any;
	const formattedObj: any = {};
	if (obj['id']) formattedObj['id'] = obj['id'];
	if (obj['account']) formattedObj['account'] = obj['account'];
	if (obj['fromSynth']) formattedObj['fromSynth'] = obj['fromSynth'];
	if (obj['toSynth']) formattedObj['toSynth'] = obj['toSynth'];
	if (obj['fromAmount']) formattedObj['fromAmount'] = wei(obj['fromAmount']);
	if (obj['fromAmountInUSD']) formattedObj['fromAmountInUSD'] = wei(obj['fromAmountInUSD']);
	if (obj['toAmount']) formattedObj['toAmount'] = wei(obj['toAmount']);
	if (obj['toAmountInUSD']) formattedObj['toAmountInUSD'] = wei(obj['toAmountInUSD']);
	if (obj['feesInUSD']) formattedObj['feesInUSD'] = wei(obj['feesInUSD']);
	if (obj['toAddress']) formattedObj['toAddress'] = obj['toAddress'];
	if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
	if (obj['gasPrice']) formattedObj['gasPrice'] = wei(obj['gasPrice'], 0);
	return formattedObj as Pick<SynthExchangeResult, K>;
};
export const getSynthExchanges = async function <K extends keyof SynthExchangeResult>(
	url: string,
	options: MultiQueryOptions<SynthExchangeFilter, SynthExchangeResult>,
	args: SynthExchangeArgs<K>
): Promise<Pick<SynthExchangeResult, K>[]> {
	const paginatedOptions: Partial<MultiQueryOptions<SynthExchangeFilter, SynthExchangeResult>> = {
		...options,
	};
	let paginationKey: keyof SynthExchangeFilter | null = null;
	let paginationValue = '';
	if (options.first && options.first > MAX_PAGE) {
		paginatedOptions.first = MAX_PAGE;
		paginatedOptions.orderBy = options.orderBy || 'id';
		paginatedOptions.orderDirection = options.orderDirection || 'asc';
		paginationKey = (paginatedOptions.orderBy +
			(paginatedOptions.orderDirection === 'asc' ? '_gt' : '_lt')) as keyof SynthExchangeFilter;
		paginatedOptions.where = { ...options.where };
	}
	let results: Pick<SynthExchangeResult, K>[] = [];
	do {
		if (paginationKey && paginationValue)
			paginatedOptions.where![paginationKey] = paginationValue as any;
		const res = await axios.post(url, {
			query: generateGql('synthExchanges', paginatedOptions, args),
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
			if (obj['fromSynth']) formattedObj['fromSynth'] = obj['fromSynth'];
			if (obj['toSynth']) formattedObj['toSynth'] = obj['toSynth'];
			if (obj['fromAmount']) formattedObj['fromAmount'] = wei(obj['fromAmount']);
			if (obj['fromAmountInUSD']) formattedObj['fromAmountInUSD'] = wei(obj['fromAmountInUSD']);
			if (obj['toAmount']) formattedObj['toAmount'] = wei(obj['toAmount']);
			if (obj['toAmountInUSD']) formattedObj['toAmountInUSD'] = wei(obj['toAmountInUSD']);
			if (obj['feesInUSD']) formattedObj['feesInUSD'] = wei(obj['feesInUSD']);
			if (obj['toAddress']) formattedObj['toAddress'] = obj['toAddress'];
			if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
			if (obj['gasPrice']) formattedObj['gasPrice'] = wei(obj['gasPrice'], 0);
			return formattedObj as Pick<SynthExchangeResult, K>;
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
export type TotalFilter = {
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
	period?: WeiSource | null;
	period_not?: WeiSource | null;
	period_gt?: WeiSource | null;
	period_lt?: WeiSource | null;
	period_gte?: WeiSource | null;
	period_lte?: WeiSource | null;
	period_in?: WeiSource[];
	period_not_in?: WeiSource[];
	bucketMagnitude?: WeiSource | null;
	bucketMagnitude_not?: WeiSource | null;
	bucketMagnitude_gt?: WeiSource | null;
	bucketMagnitude_lt?: WeiSource | null;
	bucketMagnitude_gte?: WeiSource | null;
	bucketMagnitude_lte?: WeiSource | null;
	bucketMagnitude_in?: WeiSource[];
	bucketMagnitude_not_in?: WeiSource[];
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
	synth_?: SynthFilter | null;
	trades?: WeiSource | null;
	trades_not?: WeiSource | null;
	trades_gt?: WeiSource | null;
	trades_lt?: WeiSource | null;
	trades_gte?: WeiSource | null;
	trades_lte?: WeiSource | null;
	trades_in?: WeiSource[];
	trades_not_in?: WeiSource[];
	newExchangers?: WeiSource | null;
	newExchangers_not?: WeiSource | null;
	newExchangers_gt?: WeiSource | null;
	newExchangers_lt?: WeiSource | null;
	newExchangers_gte?: WeiSource | null;
	newExchangers_lte?: WeiSource | null;
	newExchangers_in?: WeiSource[];
	newExchangers_not_in?: WeiSource[];
	exchangers?: WeiSource | null;
	exchangers_not?: WeiSource | null;
	exchangers_gt?: WeiSource | null;
	exchangers_lt?: WeiSource | null;
	exchangers_gte?: WeiSource | null;
	exchangers_lte?: WeiSource | null;
	exchangers_in?: WeiSource[];
	exchangers_not_in?: WeiSource[];
	exchangeUSDTally?: WeiSource | null;
	exchangeUSDTally_not?: WeiSource | null;
	exchangeUSDTally_gt?: WeiSource | null;
	exchangeUSDTally_lt?: WeiSource | null;
	exchangeUSDTally_gte?: WeiSource | null;
	exchangeUSDTally_lte?: WeiSource | null;
	exchangeUSDTally_in?: WeiSource[];
	exchangeUSDTally_not_in?: WeiSource[];
	totalFeesGeneratedInUSD?: WeiSource | null;
	totalFeesGeneratedInUSD_not?: WeiSource | null;
	totalFeesGeneratedInUSD_gt?: WeiSource | null;
	totalFeesGeneratedInUSD_lt?: WeiSource | null;
	totalFeesGeneratedInUSD_gte?: WeiSource | null;
	totalFeesGeneratedInUSD_lte?: WeiSource | null;
	totalFeesGeneratedInUSD_in?: WeiSource[];
	totalFeesGeneratedInUSD_not_in?: WeiSource[];
	_change_block?: any | null;
};
export type TotalResult = {
	id: string;
	timestamp: Wei;
	period: Wei;
	bucketMagnitude: Wei;
	synth: Partial<SynthResult> | null;
	trades: Wei;
	newExchangers: Wei;
	exchangers: Wei;
	exchangeUSDTally: Wei;
	totalFeesGeneratedInUSD: Wei;
};
export type TotalFields = {
	id: true;
	timestamp: true;
	period: true;
	bucketMagnitude: true;
	synth: SynthFields;
	trades: true;
	newExchangers: true;
	exchangers: true;
	exchangeUSDTally: true;
	totalFeesGeneratedInUSD: true;
};
export type TotalArgs<K extends keyof TotalResult> = {
	[Property in keyof Pick<TotalFields, K>]: TotalFields[Property];
};
export const getTotalById = async function <K extends keyof TotalResult>(
	url: string,
	options: SingleQueryOptions,
	args: TotalArgs<K>
): Promise<Pick<TotalResult, K>> {
	const res = await axios.post(url, {
		query: generateGql('total', options, args),
	});
	const r = res.data as any;
	if (r.errors && r.errors.length) {
		throw new Error(r.errors[0].message);
	}
	const obj = r.data[Object.keys(r.data)[0]] as any;
	const formattedObj: any = {};
	if (obj['id']) formattedObj['id'] = obj['id'];
	if (obj['timestamp']) formattedObj['timestamp'] = wei(obj['timestamp'], 0);
	if (obj['period']) formattedObj['period'] = wei(obj['period'], 0);
	if (obj['bucketMagnitude']) formattedObj['bucketMagnitude'] = wei(obj['bucketMagnitude'], 0);
	if (obj['synth']) formattedObj['synth'] = obj['synth'];
	if (obj['trades']) formattedObj['trades'] = wei(obj['trades'], 0);
	if (obj['newExchangers']) formattedObj['newExchangers'] = wei(obj['newExchangers'], 0);
	if (obj['exchangers']) formattedObj['exchangers'] = wei(obj['exchangers'], 0);
	if (obj['exchangeUSDTally']) formattedObj['exchangeUSDTally'] = wei(obj['exchangeUSDTally']);
	if (obj['totalFeesGeneratedInUSD'])
		formattedObj['totalFeesGeneratedInUSD'] = wei(obj['totalFeesGeneratedInUSD']);
	return formattedObj as Pick<TotalResult, K>;
};
export const getTotals = async function <K extends keyof TotalResult>(
	url: string,
	options: MultiQueryOptions<TotalFilter, TotalResult>,
	args: TotalArgs<K>
): Promise<Pick<TotalResult, K>[]> {
	const paginatedOptions: Partial<MultiQueryOptions<TotalFilter, TotalResult>> = { ...options };
	let paginationKey: keyof TotalFilter | null = null;
	let paginationValue = '';
	if (options.first && options.first > MAX_PAGE) {
		paginatedOptions.first = MAX_PAGE;
		paginatedOptions.orderBy = options.orderBy || 'id';
		paginatedOptions.orderDirection = options.orderDirection || 'asc';
		paginationKey = (paginatedOptions.orderBy +
			(paginatedOptions.orderDirection === 'asc' ? '_gt' : '_lt')) as keyof TotalFilter;
		paginatedOptions.where = { ...options.where };
	}
	let results: Pick<TotalResult, K>[] = [];
	do {
		if (paginationKey && paginationValue)
			paginatedOptions.where![paginationKey] = paginationValue as any;
		const res = await axios.post(url, {
			query: generateGql('totals', paginatedOptions, args),
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
			if (obj['period']) formattedObj['period'] = wei(obj['period'], 0);
			if (obj['bucketMagnitude']) formattedObj['bucketMagnitude'] = wei(obj['bucketMagnitude'], 0);
			if (obj['synth']) formattedObj['synth'] = obj['synth'];
			if (obj['trades']) formattedObj['trades'] = wei(obj['trades'], 0);
			if (obj['newExchangers']) formattedObj['newExchangers'] = wei(obj['newExchangers'], 0);
			if (obj['exchangers']) formattedObj['exchangers'] = wei(obj['exchangers'], 0);
			if (obj['exchangeUSDTally']) formattedObj['exchangeUSDTally'] = wei(obj['exchangeUSDTally']);
			if (obj['totalFeesGeneratedInUSD'])
				formattedObj['totalFeesGeneratedInUSD'] = wei(obj['totalFeesGeneratedInUSD']);
			return formattedObj as Pick<TotalResult, K>;
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

// additional types
export type FuturesAccountType = 'isolated_margin' | 'cross_margin';
export type FuturesOrderType = 'NextPrice' | 'Limit' | 'Market' | 'StopMarket';
export type FuturesOrderStatus = 'Pending' | 'Filled' | 'Cancelled' | 'Open';
