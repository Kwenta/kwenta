import { Rates, SynthBalance } from '@synthetixio/queries';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled from 'styled-components';
import Currency from '../../../components/Currency';
import { NO_VALUE } from '../../../constants/placeholder';
import Connector from '../../../containers/Connector';
import { DEFAULT_DATA } from './constants';
import Table from 'components/Table';

type SynthBalancesTableProps = {
	exchangeRates: Rates | null;
	synthBalances: SynthBalance[];
};

const SynthBalancesTable: FC<SynthBalancesTableProps> = ({
	exchangeRates,
	synthBalances,
}: SynthBalancesTableProps) => {
	const { t } = useTranslation();
	const { synthsMap } = Connector.useContainer();
	console.log('synthBalances ', synthBalances);
	let data = useMemo(() => {
		return synthBalances.length > 0
			? synthBalances.map((synthBalance: SynthBalance, i: number) => {
					const { currencyKey } = synthBalance;

					const description = synthsMap != null ? synthsMap[currencyKey]?.description : '';
					return {
						synth: currencyKey,
						description,
					};
			  })
			: DEFAULT_DATA;
	}, [synthBalances, synthsMap]);

	return (
		<TableContainer>
			<StyledTable
				data={data}
				showPagination={true}
				highlightRowsOnHover
				columns={[
					{
						Header: (
							<TableHeader>{t('dashboard.overview.synth-balances-table.market')}</TableHeader>
						),
						accessor: 'market',
						Cell: (cellProps: CellProps<any>) => {
							return cellProps.row.original.synth === NO_VALUE ? (
								<DefaultCell>{NO_VALUE}</DefaultCell>
							) : (
								<Currency.Name
									currencyKey={cellProps.row.original.synth}
									name={t('common.currency.synthetic-currency-name', {
										currencyName: cellProps.row.original.description,
									})}
									showIcon={true}
								/>
							);
						},
						width: 198,
					},
				]}
			/>
		</TableContainer>
	);
};

const PnlContainer = styled.div`
	display: flex;
	flex-direction: column;
`;

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

const DefaultCell = styled.p``;

const TableContainer = styled.div``;

const StyledTable = styled(Table)`
	/* margin-top: 20px; */
`;

const TableHeader = styled.div``;

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

export default SynthBalancesTable;
