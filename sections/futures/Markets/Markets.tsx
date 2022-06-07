import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { useRouter } from 'next/router';

import Table from 'components/Table';

import { GridDiv, FlexDivRow, GridDivCenteredRow, FlexDivCentered } from 'styles/common';
import { Subheader } from '../common';
import { Synths } from 'constants/currency';
import { formatCurrency } from 'utils/formatters/number';

import NoNotificationIcon from 'assets/svg/app/no-notifications.svg';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import ROUTES from 'constants/routes';

import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import { FuturesMarket } from 'queries/futures/types';

const Markets: React.FC = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const futuresMarketsQuery = useGetFuturesMarkets();
	const markets = futuresMarketsQuery?.data ?? [];

	return (
		<StyledGridDiv>
			<HeaderRow>
				<Subheader>{t('futures.markets.title')}</Subheader>
			</HeaderRow>
			<TableContainer>
				<StyledTable
					palette="primary"
					onTableRowClick={(row) => {
						const {
							original: { asset },
						} = row;
						router.push(ROUTES.Markets.MarketPair(asset));
					}}
					columns={[
						{
							Header: <StyledTableHeader>{t('futures.markets.table.market')}</StyledTableHeader>,
							accessor: 'asset',
							Cell: (cellProps: CellProps<FuturesMarket>) => (
								<FlexDivCentered>
									<CurrencyIcon currencyKey={cellProps.value} />
									<StyledMarketName>{`${cellProps.value}/${Synths.sUSD}`}</StyledMarketName>
								</FlexDivCentered>
							),
							sortable: true,
							width: 215,
						},
						{
							Header: <StyledTableHeader>{t('futures.markets.table.price')}</StyledTableHeader>,
							accessor: 'price',
							sortType: 'basic',
							Cell: (cellProps: CellProps<FuturesMarket>) => (
								<span>
									<StyledCurrency>
										{formatCurrency(Synths.sUSD, cellProps.value, {
											sign: '$',
										})}
									</StyledCurrency>
								</span>
							),
							width: 'auto',
							sortable: true,
						},
					]}
					columnsDeps={[markets]}
					data={markets}
					isLoading={futuresMarketsQuery?.isLoading && markets.length > 0}
					noResultsMessage={
						futuresMarketsQuery?.isFetched && markets.length === 0 ? (
							<TableNoResults>
								<NoNotificationIcon />
								{t('dashboard.transactions.table.no-results')}
							</TableNoResults>
						) : undefined
					}
					showPagination={true}
					hideHeaders
				/>
			</TableContainer>
		</StyledGridDiv>
	);
};
export default Markets;

const StyledGridDiv = styled(GridDiv)`
	margin: 24px 0px;
`;

const HeaderRow = styled(FlexDivRow)`
	justify-content: space-between;
`;

const TableContainer = styled.div`
	margin-top: 16px;
`;

const StyledTable = styled(Table)``;

const StyledTableHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.blueberry};
	text-transform: capitalize;
`;

const StyledMarketName = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 12px;
	margin-left: 10px;
`;

const StyledCurrency = styled.span`
	color: ${(props) => props.theme.colors.silver};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 12px;
	//margin-right: 4px;
`;

const TableNoResults = styled(GridDivCenteredRow)`
	padding: 50px 0;
	justify-content: center;
	background-color: ${(props) => props.theme.colors.elderberry};
	margin-top: -2px;
	justify-items: center;
	grid-gap: 10px;
`;
