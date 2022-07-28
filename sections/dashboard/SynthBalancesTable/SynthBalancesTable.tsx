import { CurrencyKey, Synths } from '@synthetixio/contracts-interface';
import { Rates, SynthBalance } from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import * as _ from 'lodash/fp';
import { FC, ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps, Row } from 'react-table';
import styled from 'styled-components';

import ChangePercent from 'components/ChangePercent';
import Currency from 'components/Currency';
import { MobileHiddenView, MobileOnlyView } from 'components/Media';
import Table, { TableNoResults } from 'components/Table';
import { NO_VALUE } from 'constants/placeholder';
import Connector from 'containers/Connector';
import { Price } from 'queries/rates/types';
import useLaggedDailyPrice from 'queries/rates/useLaggedDailyPrice';
import { formatNumber, zeroBN } from 'utils/formatters/number';
import { isEurForex } from 'utils/futures';

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
	priceChange: Wei | undefined;
};

const calculatePriceChange = (current: Wei | null, past: Price | undefined) => {
	if (_.isNil(current) || _.isNil(past)) {
		return undefined;
	}

	const priceChange = current.sub(past.price).div(current);

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
		return synthBalances.map((synthBalance: SynthBalance) => {
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
		});
	}, [dailyPriceChangesQuery?.data, exchangeRates, synthBalances, synthsMap]);

	return (
		<>
			<MobileHiddenView>
				<TableContainer>
					<Table
						data={data}
						showPagination
						highlightRowsOnHover
						noResultsMessage={
							<TableNoResults>
								{t('dashboard.overview.synth-balances-table.no-result')}
							</TableNoResults>
						}
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
								sortType: useMemo(
									() => (rowA: Row<Cell>, rowB: Row<Cell>) => {
										const rowOne = rowA.original.balance ?? wei(0);
										const rowTwo = rowB.original.balance ?? wei(0);
										return rowOne.toSortable() > rowTwo.toSortable() ? 1 : -1;
									},
									[]
								),
							},
							{
								Header: (
									<TableHeader>
										{t('dashboard.overview.synth-balances-table.value-in-usd')}
									</TableHeader>
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
								sortType: useMemo(
									() => (rowA: Row<Cell>, rowB: Row<Cell>) => {
										const rowOne = rowA.original.usdBalance ?? wei(0);
										const rowTwo = rowB.original.usdBalance ?? wei(0);
										return rowOne.toSortable() > rowTwo.toSortable() ? 1 : -1;
									},
									[]
								),
							},
							{
								Header: (
									<TableHeader>
										{t('dashboard.overview.synth-balances-table.oracle-price')}
									</TableHeader>
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
											formatOptions={{
												minDecimals: isEurForex(cellProps.row.original.synth) ? 4 : 2,
											}}
										/>
									);
								},
								width: 198,
								sortable: true,
								sortType: useMemo(
									() => (rowA: Row<Cell>, rowB: Row<Cell>) => {
										const rowOne = rowA.original.price ?? zeroBN;
										const rowTwo = rowB.original.price ?? zeroBN;
										return rowOne.toSortable() > rowTwo.toSortable() ? 1 : -1;
									},
									[]
								),
							},
							{
								Header: (
									<TableHeader>
										{t('dashboard.overview.synth-balances-table.daily-change')}
									</TableHeader>
								),
								accessor: 'priceChange',
								Cell: (cellProps: CellProps<Cell>) => {
									return conditionalRender<Cell['priceChange']>(
										cellProps.row.original.priceChange,
										<ChangePercent
											value={cellProps.row.original.priceChange ?? zeroBN}
											decimals={2}
											className="change-pct"
										/>
									);
								},
								sortable: true,
								sortType: useMemo(
									() => (rowA: Row<Cell>, rowB: Row<Cell>) => {
										const rowOne = rowA.original.priceChange ?? zeroBN;
										const rowTwo = rowB.original.priceChange ?? zeroBN;

										return rowOne.toSortable() > rowTwo.toSortable() ? 1 : -1;
									},
									[]
								),
								width: 105,
							},
						]}
					/>
				</TableContainer>
			</MobileHiddenView>
			<MobileOnlyView>
				<StyledMobileTable
					data={data}
					noResultsMessage={
						<TableNoResults>
							{t('dashboard.overview.synth-balances-table.no-result')}
						</TableNoResults>
					}
					columns={[
						{
							Header: () => (
								<div>
									<TableHeader>Market</TableHeader>
									<TableHeader>Oracle</TableHeader>
								</div>
							),
							accessor: 'market',
							Cell: (cellProps: CellProps<Cell>) => {
								return (
									<div>
										<MarketContainer>
											<IconContainer>
												<StyledCurrencyIcon currencyKey={cellProps.row.original.synth} />
											</IconContainer>
											<StyledText>{cellProps.row.original.synth}</StyledText>
											<Currency.Price
												currencyKey={Synths.sUSD}
												price={cellProps.row.original.price ?? 0}
												sign="$"
												formatOptions={{
													minDecimals: isEurForex(cellProps.row.original.synth) ? 4 : 2,
												}}
											/>
										</MarketContainer>
									</div>
								);
							},
							width: 130,
						},
						{
							Header: () => (
								<div>
									<TableHeader>Amount</TableHeader>
									<TableHeader>USD Value</TableHeader>
								</div>
							),
							accessor: 'amount',
							Cell: (cellProps: CellProps<Cell>) => {
								return (
									<div>
										<div>{formatNumber(cellProps.row.original.balance ?? 0)}</div>
										<Currency.Price
											currencyKey={Synths.sUSD}
											price={cellProps.row.original.usdBalance ?? 0}
											sign="$"
										/>
									</div>
								);
							},
							width: 120,
						},
						{
							Header: () => (
								<div>
									<TableHeader>24H Change</TableHeader>
								</div>
							),
							accessor: 'priceChange',
							Cell: (cellProps: CellProps<Cell>) => {
								return conditionalRender<Cell['priceChange']>(
									cellProps.row.original.priceChange,
									<ChangePercent
										value={cellProps.row.original.priceChange ?? 0}
										decimals={2}
										className="change-pct"
									/>
								);
							},
							sortable: true,
							sortType: (rowA: Row<Cell>, rowB: Row<Cell>) => {
								const rowOne = rowA.original.priceChange ?? zeroBN;
								const rowTwo = rowB.original.priceChange ?? zeroBN;

								return rowOne.toSortable() > rowTwo.toSortable() ? 1 : -1;
							},
							width: 120,
						},
					]}
				/>
			</MobileOnlyView>
		</>
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
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 12px;
	grid-column: 2;
	grid-row: 2;
`;

const DefaultCell = styled.p`
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
`;

const TableContainer = styled.div``;

const TableHeader = styled.div``;

const StyledText = styled.div`
	display: flex;
	align-items: center;
	grid-column: 2;
	grid-row: 1;
	margin-bottom: -4px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	font-family: ${(props) => props.theme.fonts.bold};
`;

const MarketContainer = styled.div`
	display: grid;
	grid-template-rows: auto auto;
	grid-template-columns: auto auto;
	align-items: center;
`;

const AmountCol = styled.div`
	justify-self: flex-end;
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
`;

const StyledMobileTable = styled(Table)`
	border-radius: initial;
	border-top: none;
	border-right: none;
	border-left: none;
`;

export default SynthBalancesTable;
