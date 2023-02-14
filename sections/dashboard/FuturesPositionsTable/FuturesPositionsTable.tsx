import Link from 'next/link';
import { useRouter } from 'next/router';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled, { useTheme } from 'styled-components';

import LinkArrow from 'assets/svg/app/link-arrow.svg';
import MarketBadge from 'components/Badge/MarketBadge';
import Button from 'components/Button';
import ChangePercent from 'components/ChangePercent';
import Currency from 'components/Currency';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import Table, { TableNoResults } from 'components/Table';
import { EXTERNAL_LINKS } from 'constants/links';
import { NO_VALUE } from 'constants/placeholder';
import ROUTES from 'constants/routes';
import Connector from 'containers/Connector';
import useIsL2 from 'hooks/useIsL2';
import useNetworkSwitcher from 'hooks/useNetworkSwitcher';
import { FuturesAccountType } from 'queries/futures/subgraph';
import PositionType from 'sections/futures/PositionType';
import {
	selectCrossMarginPositions,
	selectIsolatedMarginPositions,
	selectMarketAsset,
	selectMarkets,
	selectPositionHistory,
} from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import media from 'styles/media';
import { formatNumber } from 'utils/formatters/number';
import { getSynthDescription } from 'utils/futures';

import MobilePositionRow from './MobilePositionRow';

type FuturesPositionTableProps = {
	accountType: FuturesAccountType;
	showCurrentMarket?: boolean;
};

const LegacyLink = () => {
	const { t } = useTranslation();
	const theme = useTheme();
	return (
		<ButtonContainer>
			<Button
				fullWidth
				variant="flat"
				size="sm"
				noOutline={true}
				textTransform="none"
				onClick={() => window.open(EXTERNAL_LINKS.Trade.V1, '_blank', 'noopener noreferrer')}
			>
				{t('dashboard.overview.futures-positions-table.legacy-link')}
				<StyledArrow fill={theme.colors.selectedTheme.text.value} />
			</Button>
		</ButtonContainer>
	);
};

const FuturesPositionsTable: FC<FuturesPositionTableProps> = ({
	accountType,
	showCurrentMarket = true,
}) => {
	const { t } = useTranslation();
	const { synthsMap } = Connector.useContainer();
	const router = useRouter();
	const { switchToL2 } = useNetworkSwitcher();

	const isL2 = useIsL2();

	const isolatedPositions = useAppSelector(selectIsolatedMarginPositions);
	const crossMarginPositions = useAppSelector(selectCrossMarginPositions);
	const positionHistory = useAppSelector(selectPositionHistory);
	const currentMarket = useAppSelector(selectMarketAsset);
	const futuresMarkets = useAppSelector(selectMarkets);

	let data = useMemo(() => {
		const positions = accountType === 'cross_margin' ? crossMarginPositions : isolatedPositions;
		return positions
			.map((position) => {
				const market = futuresMarkets.find((market) => market.asset === position.asset);
				const description = getSynthDescription(position.asset, synthsMap, t);
				const thisPositionHistory = positionHistory.find((ph) => {
					return ph.isOpen && ph.asset === position.asset;
				});

				return {
					market,
					position: position.position,
					description,
					avgEntryPrice: thisPositionHistory?.avgEntryPrice,
				};
			})
			.filter(
				(position) =>
					position.position &&
					position.market &&
					(position?.market?.asset !== currentMarket || showCurrentMarket)
			);
	}, [
		isolatedPositions,
		crossMarginPositions,
		accountType,
		futuresMarkets,
		positionHistory,
		currentMarket,
		synthsMap,
		t,
		showCurrentMarket,
	]);

	return (
		<>
			<DesktopOnlyView>
				<div>
					<LegacyLink />
					<Table
						data={data}
						showPagination
						onTableRowClick={(row) =>
							router.push(ROUTES.Markets.MarketPair(row.original.market.asset, accountType))
						}
						noResultsMessage={
							!isL2 ? (
								<TableNoResults>
									{t('common.l2-cta')}
									<div onClick={switchToL2}>{t('homepage.l2.cta-buttons.switch-l2')}</div>
								</TableNoResults>
							) : (
								<TableNoResults>
									{!showCurrentMarket ? (
										t('dashboard.overview.futures-positions-table.no-result')
									) : (
										<Link href={ROUTES.Markets.Home(accountType)}>
											<div>{t('common.perp-cta')}</div>
										</Link>
									)}
								</TableNoResults>
							)
						}
						highlightRowsOnHover
						columns={[
							{
								Header: (
									<TableHeader>
										{t('dashboard.overview.futures-positions-table.market')}
									</TableHeader>
								),
								accessor: 'market',
								Cell: (cellProps: CellProps<any>) => {
									return (
										<MarketContainer>
											<IconContainer>
												<StyledCurrencyIcon currencyKey={cellProps.row.original.market.marketKey} />
											</IconContainer>
											<StyledText>
												{cellProps.row.original.market.marketName}
												<MarketBadge
													currencyKey={cellProps.row.original.market.marketKey}
													isFuturesMarketClosed={cellProps.row.original.market.isSuspended}
													futuresClosureReason={cellProps.row.original.market.marketClosureReason}
												/>
											</StyledText>
											<StyledValue>{cellProps.row.original.description}</StyledValue>
										</MarketContainer>
									);
								},
								width: 198,
							},
							{
								Header: (
									<TableHeader>{t('dashboard.overview.futures-positions-table.side')}</TableHeader>
								),
								accessor: 'position',
								Cell: (cellProps: CellProps<any>) => {
									return <PositionType side={cellProps.row.original.position.side} />;
								},
								width: 90,
							},
							{
								Header: (
									<TableHeader>
										{t('dashboard.overview.futures-positions-table.notionalValue')}
									</TableHeader>
								),
								accessor: 'notionalValue',
								Cell: (cellProps: CellProps<any>) => {
									const formatOptions = cellProps.row.original.position.notionalValue.gte(1e6)
										? { truncate: true }
										: {};

									return (
										<Currency.Price
											currencyKey="sUSD"
											price={cellProps.row.original.position.notionalValue}
											sign="$"
											conversionRate={1}
											formatOptions={formatOptions}
										/>
									);
								},
								width: 90,
							},
							{
								Header: (
									<TableHeader>
										{t('dashboard.overview.futures-positions-table.leverage')}
									</TableHeader>
								),
								accessor: 'leverage',
								Cell: (cellProps: CellProps<any>) => {
									return (
										<DefaultCell>
											{formatNumber(cellProps.row.original.position.leverage ?? 0)}x
										</DefaultCell>
									);
								},
								width: 90,
							},
							{
								Header: (
									<TableHeader>{t('dashboard.overview.futures-positions-table.pnl')}</TableHeader>
								),
								accessor: 'pnl',
								Cell: (cellProps: CellProps<any>) => {
									return (
										<PnlContainer>
											<ChangePercent value={cellProps.row.original.position.pnlPct} />
											<div>
												<Currency.Price
													currencyKey="sUSD"
													price={cellProps.row.original.position.pnl}
													sign="$"
													conversionRate={1}
												/>
											</div>
										</PnlContainer>
									);
								},
								width: 125,
							},
							{
								Header: (
									<TableHeader>
										{t('dashboard.overview.futures-positions-table.avg-entry')}
									</TableHeader>
								),
								accessor: 'avgEntryPrice',
								Cell: (cellProps: CellProps<any>) => {
									const formatOptions = {
										suggestDecimals: true,
									};
									return cellProps.row.original.avgEntryPrice === undefined ? (
										<DefaultCell>{NO_VALUE}</DefaultCell>
									) : (
										<Currency.Price
											currencyKey="sUSD"
											price={cellProps.row.original.avgEntryPrice}
											sign="$"
											conversionRate={1}
											formatOptions={formatOptions}
										/>
									);
								},
								width: 125,
							},
							{
								Header: (
									<TableHeader>
										{t('dashboard.overview.futures-positions-table.liquidationPrice')}
									</TableHeader>
								),
								accessor: 'liquidationPrice',
								Cell: (cellProps: CellProps<any>) => {
									const formatOptions = {
										suggestDecimals: true,
									};
									return (
										<Currency.Price
											currencyKey="sUSD"
											price={cellProps.row.original.position.liquidationPrice}
											sign="$"
											conversionRate={1}
											formatOptions={formatOptions}
										/>
									);
								},
								width: 115,
							},
						]}
					/>
				</div>
			</DesktopOnlyView>
			<MobileOrTabletView>
				<LegacyLink />
				<OpenPositionsHeader>
					<div>{t('dashboard.overview.futures-positions-table.mobile.market')}</div>
					<OpenPositionsRightHeader>
						<div>{t('dashboard.overview.futures-positions-table.mobile.price')}</div>
						<div>{t('dashboard.overview.futures-positions-table.mobile.pnl')}</div>
					</OpenPositionsRightHeader>
				</OpenPositionsHeader>
				<div style={{ margin: '0 15px' }}>
					{data.length === 0 ? (
						<NoPositionsText>
							<Link href={ROUTES.Markets.Home(accountType)}>
								<div>{t('common.perp-cta')}</div>
							</Link>
						</NoPositionsText>
					) : (
						data.map((row) => (
							<MobilePositionRow
								onClick={() =>
									router.push(ROUTES.Markets.MarketPair(row.market?.asset ?? 'sETH', accountType))
								}
								key={row.market?.asset}
								row={row}
							/>
						))
					)}
				</div>
			</MobileOrTabletView>
		</>
	);
};

const ButtonContainer = styled.div`
	margin: 8px 0px 16px;

	${media.lessThan('md')`
		margin: 8px 15px 16px;
	`};
`;

const StyledArrow = styled(LinkArrow)`
	margin-left: 2px;
	width: 9px;
	height: 9px;
`;

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
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 12px;
	grid-column: 2;
	grid-row: 2;
`;

const DefaultCell = styled.p`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
`;

const TableHeader = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
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

const OpenPositionsHeader = styled.div`
	display: flex;
	justify-content: space-between;
	margin: 15px 15px 8px;
	padding: 0 10px;

	& > div {
		color: ${(props) => props.theme.colors.selectedTheme.gray};
	}

	& > div:first-child {
		width: 125px;
		margin-right: 30px;
	}
`;

const OpenPositionsRightHeader = styled.div`
	display: flex;
	flex: 1;
	justify-content: space-between;
`;

const NoPositionsText = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.text.value};
	margin: 20px 0;
	font-size: 16px;
	text-align: center;
	text-decoration: underline;
`;

export default FuturesPositionsTable;
