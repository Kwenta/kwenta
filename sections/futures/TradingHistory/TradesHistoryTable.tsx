import { FC, useMemo, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled, { css } from 'styled-components';

import Table, { TableHeader } from 'components/Table';
import { NO_VALUE } from 'constants/placeholder';
import { blockExplorer } from 'containers/Connector/Connector';
import useGetFuturesTrades from 'queries/futures/useGetFuturesTrades';
import { FuturesTrade } from 'sdk/types/futures';
import { selectMarketKey } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { NumericValue } from 'styles/common';
import { formatNumber } from 'utils/formatters/number';

type TradesHistoryTableProps = {
	mobile?: boolean;
};

enum TableColumnAccessor {
	Amount = 'amount',
	Price = 'price',
	Time = 'time',
}

const TradesHistoryTable: FC<TradesHistoryTableProps> = ({ mobile }) => {
	const { t } = useTranslation();
	const marketKey = useAppSelector(selectMarketKey);
	const futuresTradesQuery = useGetFuturesTrades(marketKey);

	let data = useMemo(() => {
		const futuresTradesPages = futuresTradesQuery?.data?.pages ?? [];
		// initially the currencyKey would as null
		// the fetch would return [null]
		if (futuresTradesPages[0] === null) return [];

		const futuresTrades =
			futuresTradesPages.length > 0
				? futuresTradesPages
						.flat()
						.filter((value) => !!value)
						.map((trade: FuturesTrade | null) => {
							return {
								value: Number(trade?.price),
								amount: Number(trade?.size),
								time: Number(trade?.timestamp),
								id: trade?.txnHash,
								orderType: trade?.orderType,
							};
						})
				: [];
		return [...new Set(futuresTrades)];
	}, [futuresTradesQuery.data]);

	const observer = useRef<IntersectionObserver | null>(null);
	const lastElementRef = useCallback(
		(node) => {
			if (futuresTradesQuery.isLoading || data.length < 16) return;
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
		[futuresTradesQuery, data]
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
			<div>
				<TableMainHeader>Trade History</TableMainHeader>
				<StyledTable
					data={data}
					isLoading={futuresTradesQuery.isLoading}
					lastRef={lastElementRef}
					mobile={mobile}
					onTableRowClick={(row) =>
						row.original.id !== NO_VALUE
							? window.open(`${blockExplorer.txLink(row.original.id)}`)
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
									<DirectionalValue negative={negative} normal={normal}>
										{cellProps.row.original.amount !== NO_VALUE
											? `${formatNumber(numValue, {
													minDecimals: numDecimals,
											  })} ${normal ? '💀' : ''}`
											: NO_VALUE}
									</DirectionalValue>
								);
							},
							width: 100,
						},
						{
							Header: <TableHeader>{t('futures.market.history.price-label')}</TableHeader>,
							accessor: TableColumnAccessor.Price,
							Cell: (cellProps: CellProps<any>) => {
								const formatOptions = {
									suggestDecimals: true,
								};

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
			</div>
		</HistoryContainer>
	);
};

export default TradesHistoryTable;

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

const TableMainHeader = styled.div`
	font-size: 13px;
	color: ${(props) => props.theme.colors.selectedTheme.text.value};
	padding: 20px 15px;
	border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
`;

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

const PriceValue = styled(NumericValue)`
	font-size: 13px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	padding-left: 5px;
`;

const TimeValue = styled.p`
	font-size: 13px;
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	text-decoration: underline;
`;

const DirectionalValue = styled(PriceValue)<{ negative?: boolean; normal?: boolean }>`
	padding-left: 4px;
	white-space: nowrap;
	color: ${(props) =>
		props.normal
			? props.theme.colors.selectedTheme.button.text.primary
			: props.negative
			? props.theme.colors.selectedTheme.green
			: props.theme.colors.selectedTheme.red};
`;
