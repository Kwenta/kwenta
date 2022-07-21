import { FC, useMemo, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { useRecoilValue } from 'recoil';
import styled, { css } from 'styled-components';

import LoaderIcon from 'assets/svg/app/loader.svg';
import Table from 'components/Table';
import { DEFAULT_FIAT_EURO_DECIMALS } from 'constants/defaults';
import { EXTERNAL_LINKS } from 'constants/links';
import { NO_VALUE } from 'constants/placeholder';
import { FuturesTrade } from 'queries/futures/types';
import useGetFuturesTrades from 'queries/futures/useGetFuturesTrades';
import { currentMarketState } from 'store/futures';
import { isL2MainnetState } from 'store/wallet';
import { CapitalizedText, NumericValue } from 'styles/common';
import { formatNumber } from 'utils/formatters/number';
import { isEurForex } from 'utils/futures';

type TradesHistoryTableProps = {
	numberOfTrades: number;
	mobile?: boolean;
};

enum TableColumnAccessor {
	Amount = 'amount',
	Price = 'price',
	Time = 'time',
}

const TradesHistoryTable: FC<TradesHistoryTableProps> = ({ numberOfTrades, mobile }) => {
	const { t } = useTranslation();
	const currencyKey = useRecoilValue(currentMarketState);
	const futuresTradesQuery = useGetFuturesTrades(currencyKey);
	const isL2Mainnet = useRecoilValue(isL2MainnetState);

	let data = useMemo(() => {
		const futuresTradesPages = futuresTradesQuery?.data?.pages ?? [];
		// initially the currencyKey would as null
		// the fetch would return [null]
		if (futuresTradesPages[0] === null) return [];

		const futuresTrades =
			futuresTradesPages.length > 0
				? futuresTradesPages.flat().map((trade: FuturesTrade | null) => {
						return {
							value: Number(trade?.price),
							amount: Number(trade?.size),
							time: Number(trade?.timestamp),
							id: trade?.txnHash,
							currencyKey,
							orderType: trade?.orderType,
						};
				  })
				: [];
		return [...new Set(futuresTrades)];
	}, [futuresTradesQuery.data, currencyKey]);

	const observer = useRef<IntersectionObserver | null>(null);
	const lastElementRef = useCallback(
		(node) => {
			if (futuresTradesQuery.isLoading) return;
			if (observer) {
				if (observer.current) {
					observer.current.disconnect();
				}

				observer.current = new IntersectionObserver((entries) => {
					if (entries[0].isIntersecting) {
						futuresTradesQuery.fetchNextPage();
					}
				});
			}
			if (node) {
				observer.current?.observe(node);
			}
		},
		[futuresTradesQuery]
	);

	const calTimeDelta = (time: number) => {
		const timeDelta = (Date.now() - time * 1000) / 1000;

		if (timeDelta === 0) {
			return NO_VALUE;
		} else if (timeDelta < 60) {
			// less than 1m
			return `${t('common.time.n-sec-ago', { timeDelta: Math.floor(timeDelta) })}`;
		} else if (timeDelta < 3600) {
			// less than 1h
			return `${t('common.time.n-min-ago', { timeDelta: Math.floor(timeDelta / 60) })}`;
		} else if (timeDelta < 86400) {
			// less than 1d
			return `${t('common.time.n-hr-ago', { timeDelta: Math.floor(timeDelta / 3600) })}`;
		} else {
			// greater than 1d
			return `${t('common.time.n-day-ago', {
				timeDelta: Math.floor(timeDelta / 86400),
			})}`;
		}
	};

	return (
		<HistoryContainer mobile={mobile}>
			<TableContainer>
				<StyledTable
					data={data}
					isLoading={futuresTradesQuery.isLoading}
					lastRef={lastElementRef}
					pageSize={numberOfTrades}
					showPagination
					mobile={mobile}
					onTableRowClick={(row) =>
						row.original.id !== NO_VALUE
							? isL2Mainnet
								? window.open(`${EXTERNAL_LINKS.Explorer.Optimism}/${row.original.id}`)
								: window.open(`${EXTERNAL_LINKS.Explorer.OptimismKovan}/${row.original.id}`)
							: undefined
					}
					highlightRowsOnHover
					columns={[
						{
							Header: <TableHeader>{t('futures.market.history.amount-label')}</TableHeader>,
							accessor: TableColumnAccessor.Amount,
							Cell: (cellProps: CellProps<any>) => {
								const numValue = Math.abs(cellProps.row.original.amount / 1e18);
								const numDecimals =
									numValue === 0 ? 2 : numValue < 1 ? 4 : numValue >= 100000 ? 0 : 2;

								const normal = cellProps.row.original.orderType === 'Liquidation';
								const negative = cellProps.row.original.amount > 0;

								return (
									<>
										<div>
											<DirectionalValue negative={negative} normal={normal}>
												{cellProps.row.original.amount !== NO_VALUE
													? `${formatNumber(numValue, {
															minDecimals: numDecimals,
													  })} ${normal ? '💀' : ''}`
													: NO_VALUE}
											</DirectionalValue>
										</div>
									</>
								);
							},
							width: 100,
						},
						{
							Header: <TableHeader>{t('futures.market.history.price-label')}</TableHeader>,
							accessor: TableColumnAccessor.Price,
							Cell: (cellProps: CellProps<any>) => {
								const formatOptions = isEurForex(cellProps.row.original.currencyKey)
									? { minDecimals: DEFAULT_FIAT_EURO_DECIMALS }
									: {};

								return (
									<PriceValue>
										$
										{cellProps.row.original.value !== NO_VALUE
											? formatNumber(cellProps.row.original.value / 1e18, formatOptions)
											: NO_VALUE}
									</PriceValue>
								);
							},
							width: 110,
						},
						{
							Header: <TableHeader>{t('futures.market.history.time-label')}</TableHeader>,
							accessor: TableColumnAccessor.Time,
							Cell: (cellProps: CellProps<any>) => {
								return (
									<TimeValue>
										{cellProps.row.original.time !== NO_VALUE
											? calTimeDelta(cellProps.row.original.time)
											: NO_VALUE}
									</TimeValue>
								);
							},
							width: 70,
						},
					]}
				/>
				<Loading isLoading={futuresTradesQuery.isFetchingNextPage}>
					<LoaderIcon />
				</Loading>
			</TableContainer>
		</HistoryContainer>
	);
};

export default TradesHistoryTable;

const Loading = styled.div<{ isLoading: boolean }>`
	height: 0px;
	transform: translateY(8px);
	text-align: center;
	visibility: ${(props) => (props.isLoading ? 'show' : 'hidden')};
`;

const HistoryContainer = styled.div<{ mobile?: boolean }>`
	width: 100%;
	margin-bottom: 16px;
	box-sizing: border-box;

	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 10px;

	${(props) =>
		props.mobile &&
		css`
			margin-bottom: 0;
		`}
`;

const TableContainer = styled.div``;

const TableAlignment = css`
	justify-content: space-between;
	& > div:first-child {
		flex: 60 60 0 !important;
	}
	& > div:nth-child(2) {
		flex: 100 100 0 !important;
		justify-content: center;
	}
	& > div:last-child {
		flex: 70 70 0 !important;
		justify-content: flex-end;
		padding-right: 20px;
	}
`;

const StyledTable = styled(Table)<{ mobile?: boolean }>`
	border: 0px;

	${(props) =>
		!props.mobile &&
		css`
			height: 695px;
		`}

	${(props) =>
		props.mobile &&
		css`
			height: 242px;
		`}

	.table-row {
		${TableAlignment}
	}
	.table-body-row {
		${TableAlignment}
		padding: 0;
	}

	.table-body-row {
		padding: 0;
	}
`;

const TableHeader = styled(CapitalizedText)`
	font-size: 13px;
	font-family: ${(props) => props.theme.fonts.regular};
`;

const PriceValue = styled(NumericValue)`
	font-size: 13px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	padding-left: 5px;
`;

const TimeValue = styled.p`
	font-size: 13px;
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	text-decoration: underline;
`;

const DirectionalValue = styled(PriceValue)<{ negative?: boolean; normal?: boolean }>`
	padding-left: 4px;
	color: ${(props) =>
		props.normal
			? props.theme.colors.selectedTheme.button.text
			: props.negative
			? props.theme.colors.selectedTheme.green
			: props.theme.colors.selectedTheme.red};
`;
