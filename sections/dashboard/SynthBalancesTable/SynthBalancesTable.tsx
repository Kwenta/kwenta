import { CurrencyKey } from '@synthetixio/contracts-interface';
import { SynthBalance } from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import { FC, ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps, Row } from 'react-table';
import styled from 'styled-components';

import ChangePercent from 'components/ChangePercent';
import Currency from 'components/Currency';
import { MobileHiddenView, MobileOnlyView } from 'components/Media';
import Table, { TableNoResults } from 'components/Table';
import { Body, NumericValue } from 'components/Text';
import { NO_VALUE } from 'constants/placeholder';
import Connector from 'containers/Connector';
import { getDisplayAsset } from 'sdk/utils/futures';
import { selectBalances } from 'state/balances/selectors';
import { useAppSelector } from 'state/hooks';
import { selectPreviousDayPrices, selectPrices } from 'state/prices/selectors';
import { sortWei } from 'utils/balances';
import { formatNumber, zeroBN } from 'utils/formatters/number';
import { isDecimalFour } from 'utils/futures';

type Cell = {
	synth: CurrencyKey;
	description: string | undefined;
	balance: Wei;
	usdBalance: Wei;
	price: Wei | null;
	priceChange: Wei | undefined;
};

const conditionalRender = <T,>(prop: T, children: ReactElement) =>
	!prop ? <Body>{NO_VALUE}</Body> : children;

type SynthBalancesTableProps = {
	exchangeTokens: {
		synth: string;
		description: string;
		balance: Wei;
		usdBalance: Wei;
		price: Wei;
		priceChange: Wei;
	}[];
};

const SynthBalancesTable: FC<SynthBalancesTableProps> = ({ exchangeTokens }) => {
	const { t } = useTranslation();
	const { synthsMap } = Connector.useContainer();
	const prices = useAppSelector(selectPrices);
	const pastRates = useAppSelector(selectPreviousDayPrices);
	const { synthBalances } = useAppSelector(selectBalances);

	const synthTokens = useMemo(() => {
		return synthBalances.map((synthBalance: SynthBalance) => {
			const { currencyKey, balance, usdBalance } = synthBalance;
			const price = prices[currencyKey].onChain;
			const pastPrice = pastRates.find((price) => price.synth === getDisplayAsset(currencyKey));
			const description = synthsMap?.[currencyKey]?.description ?? '';

			return {
				synth: currencyKey,
				description,
				balance,
				usdBalance,
				price,
				priceChange:
					currencyKey === 'sUSD' ? zeroBN : price?.sub(pastPrice?.rate ?? zeroBN).div(price),
			};
		});
	}, [pastRates, prices, synthBalances, synthsMap]);

	const data = [...exchangeTokens, ...synthTokens].sort((a, b) =>
		sortWei(a.usdBalance, b.usdBalance, 'descending')
	);

	return (
		<>
			<MobileHiddenView>
				<div>
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
								Header: <div>{t('dashboard.overview.synth-balances-table.market')}</div>,
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
												{synthsMap[cellProps.row.original.synth]
													? t('common.currency.synthetic-currency-name', {
															currencyName: cellProps.row.original.description,
													  })
													: cellProps.row.original.description}
											</StyledValue>
										</MarketContainer>
									);
								},
								width: 198,
							},
							{
								Header: <div>{t('dashboard.overview.synth-balances-table.amount')}</div>,
								accessor: 'amount',
								Cell: (cellProps: CellProps<Cell>) => {
									return conditionalRender<Cell['balance']>(
										cellProps.row.original.balance,
										<AmountCol>
											<Body mono>{formatNumber(cellProps.row.original.balance ?? 0)}</Body>
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
								Header: <div>{t('dashboard.overview.synth-balances-table.value-in-usd')}</div>,
								accessor: 'valueInUSD',
								Cell: (cellProps: CellProps<Cell>) => {
									return conditionalRender<Cell['usdBalance']>(
										cellProps.row.original.usdBalance,
										<Currency.Price
											currencyKey="sUSD"
											price={cellProps.row.original.usdBalance}
											sign="$"
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
								Header: <div>{t('dashboard.overview.synth-balances-table.oracle-price')}</div>,
								accessor: 'price',
								Cell: (cellProps: CellProps<Cell>) => {
									return conditionalRender<Cell['price']>(
										cellProps.row.original.price,
										<Currency.Price
											currencyKey="sUSD"
											price={cellProps.row.original.price!}
											sign="$"
											conversionRate={1}
											formatOptions={{
												minDecimals: isDecimalFour(cellProps.row.original.synth) ? 4 : 2,
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
								Header: <div>{t('dashboard.overview.synth-balances-table.daily-change')}</div>,
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
				</div>
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
									<div>Market</div>
									<div>Oracle</div>
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
												currencyKey="sUSD"
												price={cellProps.row.original.price ?? 0}
												sign="$"
												formatOptions={{
													minDecimals: isDecimalFour(cellProps.row.original.synth) ? 4 : 2,
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
									<div>Amount</div>
									<div>USD Value</div>
								</div>
							),
							accessor: 'amount',
							Cell: (cellProps: CellProps<Cell>) => {
								return (
									<div>
										<div>{formatNumber(cellProps.row.original.balance ?? 0)}</div>
										<Currency.Price
											currencyKey="sUSD"
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
									<div>24H Change</div>
								</div>
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

const StyledText = styled.div`
	display: flex;
	align-items: center;
	grid-column: 2;
	grid-row: 1;
	margin-bottom: -4px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
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
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
`;

const StyledMobileTable = styled(Table)`
	border-radius: initial;
	border-top: none;
	border-right: none;
	border-left: none;
`;

export default SynthBalancesTable;
