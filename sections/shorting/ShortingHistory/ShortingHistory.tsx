import { FC, useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import synthetix, { Synth } from 'lib/synthetix';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import Select from 'components/Select';

import { appReadyState } from 'store/app';
import { CapitalizedText, GridDiv } from 'styles/common';
import { SYNTHS_MAP } from 'constants/currency';
import { HistoricalShortPosition } from 'queries/collateral/subgraph/types';
import useShortHistoryQuery from 'queries/collateral/subgraph/useShortHistoryQuery';

import ShortingHistoryTable from './ShortingHistoryTable';

const day = 86400 * 1000;

const ShortingHistory: FC = () => {
	const { t } = useTranslation();
	const isAppReady = useRecoilValue(appReadyState);
	const shortHistoryQuery = useShortHistoryQuery();

	const synthsAvailableToShort = useMemo(() => {
		if (isAppReady) {
			return synthetix.js!.synths.filter((synth) =>
				[SYNTHS_MAP.sBTC, SYNTHS_MAP.sETH].includes(synth.name)
			);
		}
		return [];
	}, [isAppReady]);

	const synthFilterList = useMemo(
		() => [
			{ label: t('shorting.history.assetsSort.allAssets'), key: 'ALL_SYNTHS' },
			...synthsAvailableToShort.map((synth) => ({ label: synth.name, key: synth.name })),
		],
		[t, synthsAvailableToShort]
	);

	const datesFilterList = useMemo(
		() => [
			{ label: t('shorting.history.datesSort.allDates'), key: 'ALL_DATES' },
			{ label: t('shorting.history.datesSort.pastWeek'), key: 'PAST_WEEK' },
			{ label: t('shorting.history.datesSort.pastMonth'), key: 'PAST_MONTH' },
			{ label: t('shorting.history.datesSort.pastYear'), key: 'PAST_YEAR' },
		],
		[t]
	);

	const shortSizeFilterList = useMemo(
		() => [
			{ label: t('shorting.history.sizesSort.allSizes'), key: 'ALL_SIZES' },
			{ label: '< 1000', key: 'LTET1000' },
			{ label: '1000 < x < 10,000', key: 'GT1000LTET10000' },
			{ label: '10,000 < x < 100,000', key: 'GT10000LTET100000' },
			{ label: '100,000 < x < 1,000,000', key: 'GT100000LTET1000000' },
			{ label: '1,000,000+', key: 'GT1000000' },
		],
		[t]
	);
	const [synthFilter, setSynthFilter] = useState(synthFilterList[0]);
	const [datesFilter, setDatesFilter] = useState(datesFilterList[0]);
	const [shortSize, setShortSize] = useState(shortSizeFilterList[0]);

	// eslint-disable-next-line
	const synths = synthetix.js?.synths || [];

	const createSynthTypeFilter = useCallback(
		(synths: Synth[], synthFilter: string) => (short: HistoricalShortPosition) =>
			synths
				.filter((synth) => synth.name === synthFilter || synthFilter === 'ALL_SYNTHS')
				.map((synth) => synth.name)
				.indexOf(short.synthBorrowed) !== -1,
		[]
	);

	const createDatesTypeFilter = useCallback(
		(datesFilter: string) => (short: HistoricalShortPosition) => {
			const currentTime = new Date().getTime();

			switch (datesFilter) {
				case datesFilterList[1].key:
					return short.createdAt > currentTime - day * 7;
				case datesFilterList[2].key:
					return short.createdAt > currentTime - day * 30;
				case datesFilterList[3].key:
					return short.createdAt > currentTime - day * 365;
				default:
					return true;
			}
		},
		[datesFilterList]
	);

	const createShortSizeFilter = useCallback(
		(shortSize: string) => (short: HistoricalShortPosition) => {
			switch (shortSize) {
				case shortSizeFilterList[1].key:
					return short.synthBorrowedAmount <= 1000;
				case shortSizeFilterList[2].key:
					return 1000 < short.synthBorrowedAmount && short.synthBorrowedAmount <= 10000;
				case shortSizeFilterList[3].key:
					return 10000 < short.synthBorrowedAmount && short.synthBorrowedAmount <= 100000;
				case shortSizeFilterList[4].key:
					return 100000 < short.synthBorrowedAmount && short.synthBorrowedAmount <= 1000000;
				case shortSizeFilterList[5].key:
					return short.synthBorrowedAmount >= 1000000;
				default:
					return true;
			}
		},
		[shortSizeFilterList]
	);

	const shortHistory = useMemo(() => shortHistoryQuery.data || [], [shortHistoryQuery.data]);

	const filteredShortHistory = useMemo(
		() =>
			shortHistory
				.filter(createSynthTypeFilter(synths, synthFilter.key))
				.filter(createDatesTypeFilter(datesFilter.key))
				.filter(createShortSizeFilter(shortSize.key)),
		[
			shortHistory,
			shortSize.key,
			datesFilter.key,
			synthFilter.key,
			synths,
			createSynthTypeFilter,
			createDatesTypeFilter,
			createShortSizeFilter,
		]
	);

	return (
		<>
			<Filters>
				<Select
					inputId="synth-filter-list"
					formatOptionLabel={(option: any) => <CapitalizedText>{option.label}</CapitalizedText>}
					options={synthFilterList}
					value={synthFilter}
					onChange={(option: any) => {
						if (option) {
							setSynthFilter(option);
						}
					}}
				/>
				<Select
					inputId="date-filter-list"
					formatOptionLabel={(option: any) => <CapitalizedText>{option.label}</CapitalizedText>}
					options={datesFilterList}
					value={datesFilter}
					onChange={(option: any) => {
						if (option) {
							setDatesFilter(option);
						}
					}}
				/>
				<Select
					inputId="short-size-list"
					formatOptionLabel={(option: any) => <CapitalizedText>{option.label}</CapitalizedText>}
					options={shortSizeFilterList}
					value={shortSize}
					onChange={(option: any) => {
						if (option) {
							setShortSize(option);
						}
					}}
				/>
			</Filters>
			<ShortingHistoryTable
				shortHistory={filteredShortHistory}
				isLoaded={shortHistoryQuery.isSuccess}
				isLoading={shortHistoryQuery.isLoading}
			/>
		</>
	);
};

const Filters = styled(GridDiv)`
	grid-template-columns: repeat(3, 1fr);
	grid-gap: 18px;
	margin-top: 30px;
`;

export default ShortingHistory;
