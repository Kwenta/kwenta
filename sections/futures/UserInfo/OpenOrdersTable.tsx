import React from 'react';
import styled from 'styled-components';
import Table from 'components/Table';
import useGetFuturesOpenOrders from 'queries/futures/useGetFuturesOpenOrders';
import { CurrencyKey } from '@synthetixio/contracts-interface';
import { CellProps } from 'react-table';
import Currency from 'components/Currency';
import MarketBadge from 'components/Badge/MarketBadge';

type OpenOrdersTableProps = {
	currencyKey: CurrencyKey;
};

const OpenOrdersTable: React.FC<OpenOrdersTableProps> = ({ currencyKey }) => {
	const openOrdersQuery = useGetFuturesOpenOrders(currencyKey);

	const data = React.useMemo(() => {
		const openOrders = openOrdersQuery?.data ?? [];

		return openOrders.map((order) => ({
			asset: order.asset,
			market: order.market,
			size: order.size,
			timestamp: order.timestamp,
		}));
	}, [openOrdersQuery]);

	return (
		<Table
			data={data}
			highlightRowsOnHover
			columns={[
				{
					Header: <div>Market/Type</div>,
					accessor: 'market',
					Cell: (cellProps: CellProps<any>) => {
						return (
							<MarketContainer>
								<IconContainer>
									<StyledCurrencyIcon
										currencyKey={
											(cellProps.row.original.asset[0] !== 's' ? 's' : '') +
											cellProps.row.original.asset
										}
									/>
								</IconContainer>
								<StyledText>
									{cellProps.row.original.market}
									<MarketBadge currencyKey={cellProps.row.original.asset} />
								</StyledText>
								<StyledValue>Next-Price</StyledValue>
							</MarketContainer>
						);
					},
				},
				{
					Header: <div>Side</div>,
					accessor: 'side',
					Cell: (cellProps: CellProps<any>) => {
						return <div>-</div>;
					},
				},
				{
					Header: <div>Size</div>,
					accessor: 'size',
					Cell: (cellProps: CellProps<any>) => {
						return <div>{cellProps.row.original.size}</div>;
					},
				},
				{
					Header: <div>Parameters</div>,
					accessor: 'parameters',
					Cell: (cellProps: CellProps<any>) => {
						return <div>-</div>;
					},
				},
				{
					Header: <div>Actions</div>,
					accessor: 'action',
					Cell: (cellProps: CellProps<any>) => {
						return <div></div>;
					},
				},
			]}
		/>
	);
};

const StyledCurrencyIcon = styled(Currency.Icon)`
	width: 30px;
	height: 30px;
	margin-right: 8px;
`;

const IconContainer = styled.div`
	grid-column: 1;
	grid-row: 1 / span 2;
`;

const StyledValue = styled.div`
	color: ${(props) => props.theme.colors.common.secondaryGray};
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 12px;
	grid-column: 2;
	grid-row: 2;
`;

const StyledText = styled.div`
	display: flex;
	align-items: center;
	grid-column: 2;
	grid-row: 1;
	margin-bottom: -4px;
`;

const MarketContainer = styled.div`
	display: grid;
	grid-template-rows: auto auto;
	grid-template-columns: auto auto;
	align-items: center;
`;

export default OpenOrdersTable;
