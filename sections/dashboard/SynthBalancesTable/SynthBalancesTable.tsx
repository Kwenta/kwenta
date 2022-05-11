import { Rates, SynthBalance } from '@synthetixio/queries';
import { FC, ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled from 'styled-components';
import Currency from 'components/Currency';
import { NO_VALUE } from 'constants/placeholder';
import Connector from 'containers/Connector';
import { DEFAULT_DATA } from './constants';
import Table from 'components/Table';
import { Price } from 'queries/rates/types';
import * as _ from 'lodash/fp';
import { CurrencyKey, Synths } from '@synthetixio/contracts-interface';
import Wei from '@synthetixio/wei';
import { formatNumber } from 'utils/formatters/number';
import useLaggedDailyPrice from 'queries/rates/useLaggedDailyPrice';
import ChangePercent from 'components/ChangePercent';

type SynthBalancesTableProps = {
	exchangeRates: Rates | null;
	synthBalances: SynthBalance[];
};

type Cell = {
	synth: CurrencyKey;
	description: string | undefined;
	balance: Wei;
	usdBalance: Wei;
	price: Wei | null;
	priceChange: number | undefined;
};

const calculatePriceChange = (current: Wei | null, past: Price | undefined): number | undefined => {
	if (_.isNil(current)) {
		return undefined;
	}
	const currentPrice = current.toNumber();
	if (_.isNil(past)) {
		return currentPrice;
	}
	const pastPrice = past.price;
	const priceChange = (currentPrice - pastPrice) / currentPrice;
	return priceChange;
};

const conditionalRender = <T,>(prop: T, children: ReactElement): ReactElement =>
	_.isNil(prop) ? <DefaultCell>{NO_VALUE}</DefaultCell> : children;

const SynthBalancesTable: FC<SynthBalancesTableProps> = ({
	exchangeRates,
	synthBalances,
}: SynthBalancesTableProps) => {
	const { t } = useTranslation();
	const { synthsMap } = Connector.useContainer();

	const synthNames = synthBalances.map(({ currencyKey }) => currencyKey);
	const dailyPriceChangesQuery = useLaggedDailyPrice(synthNames);

	let data = useMemo(() => {
		const dailyPriceChanges: Price[] = dailyPriceChangesQuery?.data ?? [];
		return synthBalances.length > 0
			? synthBalances.map((synthBalance: SynthBalance, i: number) => {
					const { currencyKey, balance, usdBalance } = synthBalance;

					const price = exchangeRates && exchangeRates[currencyKey];
					const pastPrice = dailyPriceChanges.find((price: Price) => price.synth === currencyKey);

					const description = synthsMap != null ? synthsMap[currencyKey]?.description : '';
					return {
						synth: currencyKey,
						description,
						balance,
						usdBalance,
						price,
						priceChange: calculatePriceChange(price, pastPrice),
					};
			  })
			: DEFAULT_DATA;
	}, [dailyPriceChangesQuery?.data, exchangeRates, synthBalances, synthsMap]);

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
						Cell: (cellProps: CellProps<Cell>) => {
							return conditionalRender<Cell['synth']>(
								cellProps.row.original.synth,
								<MarketContainer>
									<IconContainer>
										<StyledCurrencyIcon currencyKey={cellProps.row.original.synth} />
									</IconContainer>
									<StyledText>{cellProps.row.original.synth}</StyledText>
									<StyledValue>
										{t('common.currency.synthetic-currency-name', {
											currencyName: cellProps.row.original.description,
										})}
									</StyledValue>
								</MarketContainer>
							);
						},
						width: 198,
					},
					{
						Header: (
							<TableHeader>{t('dashboard.overview.synth-balances-table.amount')}</TableHeader>
						),
						accessor: 'amount',
						Cell: (cellProps: CellProps<Cell>) => {
							return conditionalRender<Cell['balance']>(
								cellProps.row.original.balance,
								<AmountCol>
									<p>{formatNumber(cellProps.row.original.balance ?? 0)}</p>
								</AmountCol>
							);
						},
						width: 198,
						sortable: true,
					},
					{
						Header: (
							<TableHeader>{t('dashboard.overview.synth-balances-table.value-in-usd')}</TableHeader>
						),
						accessor: 'valueInUSD',
						Cell: (cellProps: CellProps<Cell>) => {
							return conditionalRender<Cell['usdBalance']>(
								cellProps.row.original.usdBalance,
								<Currency.Price
									currencyKey={Synths.sUSD}
									price={cellProps.row.original.usdBalance}
									sign={'$'}
									conversionRate={1}
								/>
							);
						},
						width: 198,
						sortable: true,
					},
					{
						Header: (
							<TableHeader>{t('dashboard.overview.synth-balances-table.oracle-price')}</TableHeader>
						),
						accessor: 'price',
						Cell: (cellProps: CellProps<Cell>) => {
							return conditionalRender<Cell['price']>(
								cellProps.row.original.price,
								<Currency.Price
									currencyKey={Synths.sUSD}
									price={cellProps.row.original.price!}
									sign={'$'}
									conversionRate={1}
									formatOptions={{ minDecimals: 2 }}
								/>
							);
						},
						width: 198,
						sortable: true,
					},
					{
						Header: (
							<TableHeader>{t('dashboard.overview.synth-balances-table.daily-change')}</TableHeader>
						),
						accessor: 'priceChange',
						Cell: (cellProps: CellProps<any>) => {
							return conditionalRender<Cell['priceChange']>(
								cellProps.row.original.priceChange,
								<ChangePercent
									value={cellProps.row.original.priceChange}
									decimals={2}
									className="change-pct"
								/>
							);
						},
						sortable: true,
						width: 105,
					},
				]}
			/>
		</TableContainer>
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

const AmountCol = styled.div`
	justify-self: flex-end;
`;

export default SynthBalancesTable;
