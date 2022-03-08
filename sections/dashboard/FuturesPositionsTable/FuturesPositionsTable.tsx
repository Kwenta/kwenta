import Table from 'components/Table';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';
import Wei, { wei } from '@synthetixio/wei';

import Currency from 'components/Currency';
import PositionType from 'components/Text/PositionType';
import ChangePercent from 'components/ChangePercent';
import { Synths } from 'constants/currency';
import { PositionHistory, FuturesMarket } from 'queries/futures/types';

type FuturesPositionTableProps = {
	futuresPositions: PositionHistory[]
	futuresMarkets: FuturesMarket[]
};

const FuturesPositionsTable: FC<FuturesPositionTableProps> = ({ futuresPositions, futuresMarkets }: FuturesPositionTableProps) => {
	const { t } = useTranslation();
	
	let data = useMemo(() => {
		return futuresPositions
			.map((position: PositionHistory, i: number) => {
				const market = futuresMarkets.find(({ asset }) => asset === position.asset);
				console.log(position)
				console.log(market)
			
				return {
					market: position.asset,
					position: position.side,
					avgOpenClose: position.entryPrice.toNumber(),
					pnl: position.entryPrice.sub(market.price).toNumber(),
					pnlPct: position.entryPrice.sub(market.price).div(position.entryPrice),
					margin: position.margin.toNumber()
				}
			})
	}, [futuresPositions]);

	return (
		<TableContainer>
			<StyledTable
				data={data}
				columns={[
					{
						Header: <TableHeader>{t('dashboard.overview.futures-positions-table.market')}</TableHeader>,
						accessor: 'market',
						Cell: (cellProps: CellProps<any>) => (
							<StyledOrderType>
								{cellProps.row.original.market}/sUSD
							</StyledOrderType>
						),
						width: 150,
					},
					{
						Header: <TableHeader>{t('dashboard.overview.futures-positions-table.position')}</TableHeader>,
						accessor: 'position',
						Cell: (cellProps: CellProps<any>) => (
							<PositionType side={cellProps.row.original.position} />
						),
						width: 100,
					},
					{
						Header: <TableHeader>{t('dashboard.overview.futures-positions-table.avg-open-close')}</TableHeader>,
						accessor: 'avgOpenClose',
						Cell: (cellProps: CellProps<any>) => (
							<Currency.Price
								currencyKey={Synths.sUSD}
								price={cellProps.row.original.avgOpenClose}
								sign={'$'}
								conversionRate={1}
							/>
						),
						width: 125,
					},
					{
						Header: <TableHeader>{t('dashboard.overview.futures-positions-table.pnl')}</TableHeader>,
						accessor: 'pnl',
						Cell: (cellProps: CellProps<any>) => (
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
						),
						width: 125,
					},
					{
						Header: <TableHeader>{t('dashboard.overview.futures-positions-table.margin')}</TableHeader>,
						accessor: 'margin',
						Cell: (cellProps: CellProps<any>) => (
							<Currency.Price
								currencyKey={Synths.sUSD}
								price={cellProps.row.original.margin}
								sign={'$'}
								conversionRate={1}
							/>
						),
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

const ColorCodedPrice = styled(Currency.Price)`
	align-items: right;
	color: ${(props) =>
		props.price > 0
			? props.theme.colors.green
			: props.price < 0
			? props.theme.colors.red
			: props.theme.colors.white};
`;

const TableContainer = styled.div<{ compact: boolean | undefined }>`
	margin-top: 16px;
	margin-bottom: ${({ compact }) => (compact ? '0' : '40px')};
`;

const StyledTable = styled(Table)<{ compact: boolean | undefined }>`
	margin-top: ${({ compact }) => (compact ? '0' : '20px')};
`;

const TableHeader = styled.div`
`;

const TableTitle = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
`;

const StyledOrderType = styled.div`
`;

export default FuturesPositionsTable;
