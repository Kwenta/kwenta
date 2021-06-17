import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';
import { CellProps } from 'react-table';
import { useRouter } from 'next/router';

import ChangePercent from 'components/ChangePercent';
import Table from 'components/Table';

import {
	GridDiv,
	FlexDivRow,
	IconButton,
	GridDivCenteredRow,
	FlexDivCentered,
} from 'styles/common';
import { Subheader } from '../common';
import { SYNTHS_MAP } from 'constants/currency';
import { formatCurrency, formatPercent } from 'utils/formatters/number';

import NoNotificationIcon from 'assets/svg/app/no-notifications.svg';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import SearchIcon from 'assets/svg/app/search.svg';
import ROUTES from 'constants/routes';

type MarketsProps = {};

// @TODO: extract to types
type FutureMarkets = {
	name: string;
	baseKey: string;
	quoteKey: string;
	price: number;
	changeAmount: number;
	changePercent: number;
	fundingRate: number;
};

const Markets: React.FC<MarketsProps> = ({}) => {
	const { t } = useTranslation();
	const router = useRouter();

	const markets = [
		{
			name: 'sBTC-sUSD',
			baseKey: SYNTHS_MAP.sUSD,
			quoteKey: SYNTHS_MAP.sBTC,
			price: 10000,
			changeAmount: 250,
			changePercent: 0.52,
			fundingRate: 0.005,
		},
		{
			name: 'sETH-sUSD',
			baseKey: SYNTHS_MAP.sUSD,
			quoteKey: SYNTHS_MAP.sETH,
			price: 2000,
			changeAmount: 250,
			changePercent: 0.22,
			fundingRate: 0.005,
		},
	];

	const [isLoaded] = useState<boolean>(true);
	const [isLoading] = useState<boolean>(false);

	const columnsDeps = useMemo(() => [], []);

	return (
		<StyledGridDiv>
			<HeaderRow>
				<Subheader>{t('futures.markets.title')}</Subheader>
				<IconButton>
					<Svg src={SearchIcon} />
				</IconButton>
			</HeaderRow>
			<StyledTable
				palette="primary"
				onTableRowClick={(row) => {
					const {
						original: { baseKey, quoteKey },
					} = row;
					router.push(ROUTES.Futures.MarketPair(baseKey, quoteKey));
				}}
				columns={[
					{
						Header: <StyledTableHeader>{t('futures.markets.table.market')}</StyledTableHeader>,
						accessor: 'marketName',
						Cell: (cellProps: CellProps<FutureMarkets>) => (
							<FlexDivCentered>
								<CurrencyIcon currencyKey={cellProps.row.original.quoteKey} />
								<StyledMarketName>{cellProps.row.original.name}</StyledMarketName>
							</FlexDivCentered>
						),
						sortable: true,
						width: 200,
					},
					{
						Header: <StyledTableHeader>{t('futures.markets.table.price')}</StyledTableHeader>,
						accessor: 'price',
						sortType: 'basic',
						Cell: (cellProps: CellProps<FutureMarkets>) => (
							<span>
								<StyledCurrencyKey>{SYNTHS_MAP.sUSD}</StyledCurrencyKey>
								<StyledCurrency>
									{formatCurrency(SYNTHS_MAP.sUSD, cellProps.row.original.price, { sign: '$' })}
								</StyledCurrency>
							</span>
						),
						width: 200,
						sortable: true,
					},
					{
						Header: <StyledTableHeader>{t('futures.markets.table.change')}</StyledTableHeader>,
						accessor: 'change',
						sortType: 'basic',
						Cell: (cellProps: CellProps<FutureMarkets>) => (
							<span>
								<StyledCurrencyKey>{SYNTHS_MAP.sUSD}</StyledCurrencyKey>
								<StyledCurrency>
									{formatCurrency(SYNTHS_MAP.sUSD, cellProps.row.original.changeAmount)}
								</StyledCurrency>
								<ChangePercent value={cellProps.row.original.changePercent} />
							</span>
						),
						width: 200,
						sortable: true,
					},
					{
						Header: <StyledTableHeader>{t('futures.markets.table.funding')}</StyledTableHeader>,
						accessor: 'funding',
						sortType: 'basic',
						Cell: (cellProps: CellProps<FutureMarkets>) => (
							<StyledPercent>{formatPercent(cellProps.row.original.fundingRate)}</StyledPercent>
						),
						width: 200,
						sortable: true,
					},
				]}
				columnsDeps={columnsDeps}
				data={markets}
				isLoading={isLoading && !isLoaded}
				noResultsMessage={
					isLoaded && markets.length === 0 ? (
						<TableNoResults>
							<Svg src={NoNotificationIcon} />
							{t('dashboard.transactions.table.no-results')}
						</TableNoResults>
					) : undefined
				}
				showPagination={true}
			/>
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

const StyledTable = styled(Table)`
	margin-top: 16px;
`;

const StyledTableHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.blueberry};
	text-transform: capitalize;
`;

const StyledMarketName = styled.div`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 12px;
	margin-left: 4px;
`;

const StyledCurrencyKey = styled.span`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 12px;
	margin-right: 4px;
`;

const StyledCurrency = styled.span`
	color: ${(props) => props.theme.colors.silver};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 12px;
	margin-right: 4px;
`;

const StyledPercent = styled.span`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 12px;
`;

const TableNoResults = styled(GridDivCenteredRow)`
	padding: 50px 0;
	justify-content: center;
	background-color: ${(props) => props.theme.colors.elderberry};
	margin-top: -2px;
	justify-items: center;
	grid-gap: 10px;
`;
