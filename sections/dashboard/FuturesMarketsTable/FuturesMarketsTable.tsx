import Table from 'components/Table';
import { FC, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled from 'styled-components';
import Connector from 'containers/Connector';

import Currency from 'components/Currency';
import PositionType from 'components/Text/PositionType';
import ChangePercent from 'components/ChangePercent';
import { Synths } from 'constants/currency';
import { DEFAULT_DATA } from './constants'

type FuturesMarketsTableProps = {
};

const FuturesMarketsTable: FC<FuturesMarketsTableProps> = ({ }: FuturesMarketsTableProps) => {
	const { t } = useTranslation();
	const { synthsMap } = Connector.useContainer();

	const getSynthDescription = useCallback(
		(synth: string) => {
			return t('common.currency.synthetic-currency-name', {
				currencyName: synthsMap[synth] ? synthsMap[synth].description : '',
			});
		},
		[t, synthsMap]
	);
	
	let data = useMemo(() => {
		return []
	}, [synthsMap]);

	return (
		<TableContainer>
			<StyledTable
				data={data.length > 0 ? data : DEFAULT_DATA}
				columns={[
					{
						Header: <TableHeader>{t('dashboard.overview.futures-markets-table.market')}</TableHeader>,
						accessor: 'market',
						Cell: (cellProps: CellProps<any>) => {
							return cellProps.row.original.market === '-' ? <DefaultCell>-</DefaultCell> :
							<MarketContainer>
								<IconContainer>
									<StyledCurrencyIcon currencyKey={cellProps.row.original.market} />
								</IconContainer>
								<StyledText>
									{cellProps.row.original.market}/sUSD
								</StyledText>
								<StyledValue>{cellProps.row.original.description}</StyledValue>
							</MarketContainer>
						},
						width: 250,
					},
					{
						Header: <TableHeader>{t('dashboard.overview.futures-markets-table.index-price')}</TableHeader>,
						accessor: 'indexPrice',
						Cell: (cellProps: CellProps<any>) => {
							return cellProps.row.original.position === '-' ? <DefaultCell>-</DefaultCell> :
								<PositionType side={cellProps.row.original.position} />
						},
						width: 100,
					},
					{
						Header: <TableHeader>{t('dashboard.overview.futures-markets-table.daily-change')}</TableHeader>,
						accessor: 'dailyChange',
						Cell: (cellProps: CellProps<any>) => {
							return cellProps.row.original.avgOpenClose === '-' ? <DefaultCell>-</DefaultCell> :
							<Currency.Price
								currencyKey={Synths.sUSD}
								price={cellProps.row.original.avgOpenClose}
								sign={'$'}
								conversionRate={1}
							/>
						},
						width: 125,
					},
					{
						Header: <TableHeader>{t('dashboard.overview.futures-markets-table.hourly-funding')}</TableHeader>,
						accessor: 'hourlyFunding',
						Cell: (cellProps: CellProps<any>) => {
							return cellProps.row.original.pnl === '-' ? <DefaultCell>-</DefaultCell> :
							<PnlContainer>
								<ChangePercent
									value={cellProps.row.original.pnlPct}
									className="change-pct"
								/>
								(<Currency.Price
									currencyKey={Synths.sUSD}
									price={cellProps.row.original.pnl}
									sign={'$'}
									conversionRate={1}
								/>)
							</PnlContainer>
						},
						width: 125,
					},
					{
						Header: <TableHeader>{t('dashboard.overview.futures-markets-table.open-interest')}</TableHeader>,
						accessor: 'openInterest',
						Cell: (cellProps: CellProps<any>) => {
							return cellProps.row.original.margin === '-' ? <DefaultCell>-</DefaultCell> :
							<Currency.Price
								currencyKey={Synths.sUSD}
								price={cellProps.row.original.margin}
								sign={'$'}
								conversionRate={1}
							/>
						},
						width: 125,
					},
					{
						Header: <TableHeader>{t('dashboard.overview.futures-markets-table.daily-volume')}</TableHeader>,
						accessor: 'dailyVolume',
						Cell: (cellProps: CellProps<any>) => {
							return cellProps.row.original.margin === '-' ? <DefaultCell>-</DefaultCell> :
								<Currency.Price
									currencyKey={Synths.sUSD}
									price={cellProps.row.original.margin}
									sign={'$'}
									conversionRate={1}
								/>
						},
						width: 125,
					},
				]}
			/>
		</TableContainer>
	);
};

const PnlContainer = styled.div`
	display: flex;
	flex-direction: flex-row;
	align-items: center;

	.change-pct {
		margin-right: 4px;
	}
`

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

const DefaultCell = styled.p``

const TableContainer = styled.div`
	margin-top: 16px;
	margin-bottom: '40px';
`;

const StyledTable = styled(Table)`
	margin-top: '20px';
`;

const TableHeader = styled.div`
`;

const StyledText = styled.div`
	grid-column: 2;
	grid-row: 1;
`;

const MarketContainer = styled.div`
	display: grid;
	grid-template-rows: auto auto;
	grid-template-columns: auto auto;
	align-items: center;
`;

export default FuturesMarketsTable;
