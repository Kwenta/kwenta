import Wei from '@synthetixio/wei';
import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import TabButton from 'components/Button/TabButton';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import FuturesIcon from 'components/Nav/FuturesIcon';
import { TabPanel } from 'components/Tab';
import * as Text from 'components/Text';
import { ETH_ADDRESS, ETH_COINGECKO_ADDRESS } from 'constants/currency';
import Connector from 'containers/Connector';
import { FuturesAccountTypes } from 'queries/futures/types';
import { SynthSymbol } from 'sdk/data/synths';
import { CompetitionBanner } from 'sections/shared/components/CompetitionBanner';
import { selectBalances } from 'state/balances/selectors';
import { sdk } from 'state/config';
import { fetchTokenList } from 'state/exchange/actions';
import {
	// selectActiveCrossPositionsCount,
	selectActiveIsolatedPositionsCount,
	selectFuturesPortfolio,
} from 'state/futures/selectors';
import { useAppSelector, useFetchAction } from 'state/hooks';
import { selectSynthsMap } from 'state/wallet/selectors';
import { formatDollars, toWei, zeroBN } from 'utils/formatters/number';
import logError from 'utils/logError';

import FuturesMarketsTable from '../FuturesMarketsTable';
import FuturesPositionsTable from '../FuturesPositionsTable';
import { MarketsTab } from '../Markets/Markets';
import MobileDashboard from '../MobileDashboard';
import PortfolioChart from '../PortfolioChart';
import SynthBalancesTable from '../SynthBalancesTable';

export enum PositionsTab {
	CROSS_MARGIN = 'cross margin',
	ISOLATED_MARGIN = 'isolated margin',
	SPOT = 'spot',
}

const Overview: FC = () => {
	const { t } = useTranslation();

	const balances = useAppSelector(selectBalances);
	const portfolio = useAppSelector(selectFuturesPortfolio);
	const isolatedPositionsCount = useAppSelector(selectActiveIsolatedPositionsCount);
	// const crossPositionsCount = useAppSelector(selectActiveCrossPositionsCount);

	const [activePositionsTab, setActivePositionsTab] = useState<PositionsTab>(
		PositionsTab.ISOLATED_MARGIN
	);
	const [activeMarketsTab] = useState<MarketsTab>(MarketsTab.FUTURES);

	const { network } = Connector.useContainer();
	const synthsMap = useAppSelector(selectSynthsMap);

	const { tokenBalances } = useAppSelector(({ balances }) => balances);
	// Only available on Optimism mainnet
	const oneInchEnabled = network.id === 10;

	const [exchangeTokens, setExchangeTokens] = useState<any>([]);

	useFetchAction(fetchTokenList, { dependencies: [network] });

	useEffect(() => {
		const initExchangeTokens = async () => {
			try {
				const exchangeBalances = oneInchEnabled
					? Object.values(tokenBalances)
							.filter((token) => !synthsMap[token.token.symbol as SynthSymbol])
							.map((value) => ({
								name: value.token.name,
								currencyKey: value.token.symbol,
								balance: toWei(value.balance),
								address:
									value.token.address === ETH_ADDRESS ? ETH_COINGECKO_ADDRESS : value.token.address,
							}))
					: [];

				const tokenAddresses = oneInchEnabled
					? [...Object.values(tokenBalances).map((value) => value.token.address.toLowerCase())]
					: [];

				const coinGeckoPrices = await sdk.exchange.batchGetCoingeckoPrices(tokenAddresses, true);

				const _exchangeTokens = exchangeBalances.map((exchangeToken) => {
					const { name, currencyKey, balance, address } = exchangeToken;

					const price = coinGeckoPrices ? toWei(coinGeckoPrices[address]?.usd?.toString()) : zeroBN;
					const priceChange = coinGeckoPrices
						? toWei(coinGeckoPrices[address]?.usd_24h_change?.toString()).div(100)
						: zeroBN;

					const usdBalance = balance.mul(price);

					return {
						synth: currencyKey,
						description: name,
						balance,
						usdBalance,
						price,
						priceChange,
					};
				});

				setExchangeTokens(_exchangeTokens);
			} catch (e) {
				logError(e);
			}
		};

		(async () => {
			await initExchangeTokens();
		})();
	}, [oneInchEnabled, synthsMap, tokenBalances]);

	const POSITIONS_TABS = useMemo(() => {
		const exchangeTokenBalances = exchangeTokens.reduce(
			(initial: Wei, { usdBalance }: { usdBalance: Wei }) => initial.add(usdBalance),
			zeroBN
		);
		return [
			// {
			// 	name: PositionsTab.CROSS_MARGIN,
			// 	label: t('dashboard.overview.positions-tabs.cross-margin'),
			// 	badge: crossPositions.length,
			// 	titleIcon: <FuturesIcon type="cross_margin" />,
			// 	active: activePositionsTab === PositionsTab.CROSS_MARGIN,
			// 	detail: formatDollars(portfolio.crossMarginFutures),
			// 	disabled: false,
			// 	onClick: () => setActivePositionsTab(PositionsTab.CROSS_MARGIN),
			// },
			{
				name: PositionsTab.ISOLATED_MARGIN,
				label: t('dashboard.overview.positions-tabs.isolated-margin'),
				badge: isolatedPositionsCount,
				active: activePositionsTab === PositionsTab.ISOLATED_MARGIN,
				titleIcon: <FuturesIcon type="isolated_margin" />,
				detail: formatDollars(portfolio.isolatedMarginFutures),
				disabled: false,
				onClick: () => setActivePositionsTab(PositionsTab.ISOLATED_MARGIN),
			},
			{
				name: PositionsTab.SPOT,
				label: t('dashboard.overview.positions-tabs.spot'),
				active: activePositionsTab === PositionsTab.SPOT,
				detail: formatDollars(balances.totalUSDBalance.add(exchangeTokenBalances)),
				disabled: false,
				onClick: () => setActivePositionsTab(PositionsTab.SPOT),
			},
		];
	}, [
		// crossPositionsCount,
		isolatedPositionsCount,
		exchangeTokens,
		balances.totalUSDBalance,
		t,
		activePositionsTab,
		// portfolio.crossMarginFutures,
		portfolio.isolatedMarginFutures,
		setActivePositionsTab,
	]);

	return (
		<>
			<DesktopOnlyView>
				<CompetitionBanner />

				<PortfolioChart
					exchangeTokenBalances={exchangeTokens.reduce(
						(initial: Wei, { usdBalance }: { usdBalance: Wei }) => initial.add(usdBalance),
						zeroBN
					)}
				/>

				<TabButtonsContainer>
					{POSITIONS_TABS.map(({ name, label, ...rest }) => (
						<TabButton key={name} title={label} {...rest} />
					))}
				</TabButtonsContainer>
				<TabPanel name={PositionsTab.CROSS_MARGIN} activeTab={activePositionsTab}>
					<FuturesPositionsTable accountType={FuturesAccountTypes.CROSS_MARGIN} />
				</TabPanel>

				<TabPanel name={PositionsTab.ISOLATED_MARGIN} activeTab={activePositionsTab}>
					<FuturesPositionsTable accountType={FuturesAccountTypes.ISOLATED_MARGIN} />
				</TabPanel>

				<TabPanel name={PositionsTab.SPOT} activeTab={activePositionsTab}>
					<SynthBalancesTable exchangeTokens={exchangeTokens} />
				</TabPanel>
				<SubHeading>{t('dashboard.overview.markets-tabs.futures')}</SubHeading>
				<TabPanel name={MarketsTab.FUTURES} activeTab={activeMarketsTab}>
					<FuturesMarketsTable />
				</TabPanel>
			</DesktopOnlyView>
			<MobileOrTabletView>
				<MobileDashboard exchangeTokens={exchangeTokens} />
			</MobileOrTabletView>
		</>
	);
};

const TabButtonsContainer = styled.div`
	display: flex;
	margin-top: 16px;
	margin-bottom: 16px;

	& > button {
		&:not(:last-of-type) {
			margin-right: 14px;
		}
	}
`;

const SubHeading = styled(Text.Heading).attrs({ variant: 'h4' })`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 16px;
	margin-top: 20px;
	font-variant: all-small-caps;
	color: ${(props) => props.theme.colors.selectedTheme.yellow};
`;

export default Overview;
