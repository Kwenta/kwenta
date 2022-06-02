import Table from 'components/Table';
import { EXTERNAL_LINKS } from 'constants/links';
import { NO_VALUE } from 'constants/placeholder';
import { FuturesTrade } from 'queries/futures/types';
import useGetFuturesTrades from 'queries/futures/useGetFuturesTrades';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { useRecoilValue } from 'recoil';

import { isL2MainnetState } from 'store/wallet';
import styled from 'styled-components';
import { CapitalizedText, FlexDivRowCentered, NumericValue } from 'styles/common';
import { formatNumber } from 'utils/formatters/number';
import { DEFAULT_FIAT_EURO_DECIMALS } from 'constants/defaults';
import { isEurForex } from 'utils/futures';

type TradesHistoryTableProps = {
	currencyKey: string | undefined;
	numberOfTrades: number;
};

const TradesHistoryTable: FC<TradesHistoryTableProps> = ({ currencyKey, numberOfTrades }) => {
	const { t } = useTranslation();
	const futuresTradesQuery = useGetFuturesTrades(currencyKey);
	const isL2Mainnet = useRecoilValue(isL2MainnetState);

	let data = useMemo(() => {
		const futuresTrades = futuresTradesQuery?.data ?? [];
		return futuresTrades.length > 0
			? futuresTrades.map((trade: FuturesTrade) => {
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
	}, [futuresTradesQuery.data, currencyKey]);

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
		<HistoryContainer>
			<HistoryLabelContainer>
				<HistoryLabel>{t('futures.market.history.history-label')}</HistoryLabel>
				<LastTradesLabel>
					{t('futures.market.history.last-n-trades', { numberOfTrades: numberOfTrades })}
				</LastTradesLabel>
			</HistoryLabelContainer>
			<TableContainer>
				<StyledTable
					data={data}
					pageSize={numberOfTrades}
					showPagination={true}
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
							accessor: 'Amount',
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
							accessor: 'Price',
							Cell: (cellProps: CellProps<any>) => {
								const formatOptions = isEurForex(cellProps.row.original.currencyKey)
									? { minDecimals: DEFAULT_FIAT_EURO_DECIMALS }
									: {};

								return (
									<PriceValue>
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
							accessor: 'Time',
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
			</TableContainer>
		</HistoryContainer>
	);
};

export default TradesHistoryTable;

const HistoryContainer = styled.div`
	width: 100%;
	margin-bottom: 16px;
	box-sizing: border-box;

	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 10px;
`;

const HistoryLabelContainer = styled(FlexDivRowCentered)`
	justify-content: space-between;
	padding: 12px 18px;
	border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
`;

const HistoryLabel = styled(CapitalizedText)`
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
`;

const LastTradesLabel = styled(CapitalizedText)`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`;
const TableContainer = styled.div``;

const StyledTable = styled(Table)`
	border: 0px;
	height: 695px;

	.table-body-row {
		padding: 0;
	}
`;

const TableHeader = styled(CapitalizedText)`
	font-family: ${(props) => props.theme.fonts.regular};
`;

const PriceValue = styled(NumericValue)`
	font-size: 11px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	padding-left: 5px;
`;

const TimeValue = styled.p`
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
