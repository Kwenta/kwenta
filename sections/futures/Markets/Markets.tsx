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
import { formatCurrency, formatPercent, formatNumberFromBN } from 'utils/formatters/number';

import NoNotificationIcon from 'assets/svg/app/no-notifications.svg';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import SearchIcon from 'assets/svg/app/search.svg';
import ROUTES from 'constants/routes';

import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import { FuturesMarket } from 'queries/futures/useGetFuturesMarkets';

type MarketsProps = {
	markets: [FuturesMarket] | [];
};

const Markets: React.FC<MarketsProps> = ({ markets }) => {
	const { t } = useTranslation();
	const router = useRouter();
	const futuresMarketsQuery = useGetFuturesMarkets();

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
						original: { asset },
					} = row;
					router.push(ROUTES.Futures.Market.MarketPair(asset));
				}}
				columns={[
					{
						Header: <StyledTableHeader>{t('futures.markets.table.market')}</StyledTableHeader>,
						accessor: 'asset',
						Cell: (cellProps: CellProps<FuturesMarket>) => (
							<FlexDivCentered>
								<CurrencyIcon currencyKey={cellProps.value} />
								<StyledMarketName>{`${cellProps.value}/${SYNTHS_MAP.sUSD}`}</StyledMarketName>
							</FlexDivCentered>
						),
						sortable: true,
						width: 200,
					},
					{
						Header: <StyledTableHeader>{t('futures.markets.table.price')}</StyledTableHeader>,
						accessor: 'price',
						sortType: 'basic',
						Cell: (cellProps: CellProps<FuturesMarket>) => (
							<span>
								<StyledCurrencyKey>{SYNTHS_MAP.sUSD}</StyledCurrencyKey>
								<StyledCurrency>
									{formatCurrency(SYNTHS_MAP.sUSD, formatNumberFromBN(cellProps.value), {
										sign: '$',
									})}
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
						Cell: (cellProps: CellProps<FuturesMarket>) => (
							<span>
								--
								{/* <StyledCurrencyKey>{SYNTHS_MAP.sUSD}</StyledCurrencyKey>
								<StyledCurrency>
									{formatCurrency(SYNTHS_MAP.sUSD, cellProps.row.original.changeAmount)}
								</StyledCurrency>
								<ChangePercent value={cellProps.row.original.changePercent} /> */}
							</span>
						),
						width: 200,
						sortable: true,
					},
					{
						Header: <StyledTableHeader>{t('futures.markets.table.funding')}</StyledTableHeader>,
						accessor: 'currentFundingRate',
						sortType: 'basic',
						Cell: (cellProps: CellProps<FuturesMarket>) => (
							<StyledPercent>
								{formatPercent(formatNumberFromBN(cellProps.value.toString()))}
							</StyledPercent>
						),
						width: 200,
						sortable: true,
					},
				]}
				columnsDeps={[markets]}
				data={markets}
				isLoading={futuresMarketsQuery?.isLoading && markets.length > 0}
				noResultsMessage={
					futuresMarketsQuery?.isFetched && markets.length === 0 ? (
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
