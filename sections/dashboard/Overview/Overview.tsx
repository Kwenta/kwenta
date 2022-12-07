import Wei from '@synthetixio/wei';
import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import styled from 'styled-components';
import { erc20ABI, useContractRead } from 'wagmi';

import TabButton from 'components/Button/TabButton';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import FuturesIcon from 'components/Nav/FuturesIcon';
import { TabPanel } from 'components/Tab';
import { KWENTA_TOKEN_ADDRESS } from 'constants/address';
import { ETH_ADDRESS, ETH_COINGECKO_ADDRESS } from 'constants/currency';
import Connector from 'containers/Connector';
import useIsL2 from 'hooks/useIsL2';
import { FuturesAccountTypes } from 'queries/futures/types';
import { CompetitionBanner } from 'sections/shared/components/CompetitionBanner';
import { selectBalances } from 'state/balances/selectors';
import { sdk } from 'state/config';
import {
	selectCrossMarginPositions,
	selectFuturesPortfolio,
	selectIsolatedMarginPositions,
} from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { activePositionsTabState } from 'store/ui';
import { formatDollars, toWei, weiFromWei, zeroBN } from 'utils/formatters/number';
import logError from 'utils/logError';

import FuturesMarketsTable from '../FuturesMarketsTable';
import FuturesPositionsTable from '../FuturesPositionsTable';
import { MarketsTab } from '../Markets/Markets';
import MobileDashboard from '../MobileDashboard';
import PortfolioChart from '../PortfolioChart';
import SpotMarketsTable from '../SpotMarketsTable';
import SynthBalancesTable from '../SynthBalancesTable';

const kwentaAddress = KWENTA_TOKEN_ADDRESS['10'].toLowerCase();

export enum PositionsTab {
	CROSS_MARGIN = 'cross margin',
	ISOLATED_MARGIN = 'isolated margin',
	SPOT = 'spot',
}

const Overview: FC = () => {
	const { t } = useTranslation();

	const balances = useAppSelector(selectBalances);
	const portfolio = useAppSelector(selectFuturesPortfolio);
	const crossPositions = useAppSelector(selectCrossMarginPositions);
	const isolatedPositions = useAppSelector(selectIsolatedMarginPositions);

	const [activePositionsTab, setActivePositionsTab] = useRecoilState<PositionsTab>(
		activePositionsTabState
	);
	const [activeMarketsTab, setActiveMarketsTab] = useState<MarketsTab>(MarketsTab.FUTURES);

	const { network, walletAddress, synthsMap } = Connector.useContainer();

	const { tokenBalances } = useAppSelector(({ balances }) => balances);
	// Only available on Optimism mainnet
	const oneInchEnabled = network.id === 10;

	const isL2 = useIsL2();

	const [exchangeTokens, setExchangeTokens] = useState<any>([]);
	const [kwentaBalance, setKwentaBalance] = useState(zeroBN);

	useContractRead({
		address: KWENTA_TOKEN_ADDRESS['10'],
		abi: erc20ABI,
		functionName: 'balanceOf',
		args: [walletAddress!],
		watch: false,
		enabled: !!walletAddress && isL2,
		onSettled(data, error) {
			if (error) logError(error);
			if (data) {
				setKwentaBalance(weiFromWei(data));
			}
		},
	});

	const noKwentaFound = !Object.values(tokenBalances).find(
		(token: any) => token.token.address.toLowerCase() === kwentaAddress
	);

	useEffect(() => {
		const initExchangeTokens = async () => {
			try {
				const kwentaTokenObj = {
					Kwenta: {
						balance: kwentaBalance,
						token: {
							address: kwentaAddress,
							symbol: 'KWENTA',
							name: 'Kwenta',
						},
					},
				};

				const allTokens =
					oneInchEnabled && noKwentaFound && kwentaBalance.gt(0)
						? { ...kwentaTokenObj, ...tokenBalances }
						: tokenBalances;

				const exchangeBalances: {
					name: string;
					currencyKey: string;
					balance: Wei;
					address: string;
				}[] = oneInchEnabled
					? Object.values(allTokens)
							.filter((token: any) => !synthsMap[token.token.symbol])
							.map((value: any) => {
								return {
									name: value.token.name,
									currencyKey: value.token.symbol,
									balance: toWei(value.balance),
									address:
										value.token.address === ETH_ADDRESS
											? ETH_COINGECKO_ADDRESS
											: value.token.address,
								};
							})
					: [];

				const tokenAddresses = oneInchEnabled
					? [
							...Object.values(tokenBalances).map((value: any) =>
								value.token.address.toLowerCase()
							),
							noKwentaFound ? [kwentaAddress] : [],
					  ]
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
	}, [kwentaBalance, noKwentaFound, oneInchEnabled, synthsMap, tokenBalances]);

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
				badge: isolatedPositions.length,
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
		crossPositions,
		isolatedPositions,
		exchangeTokens,
		balances.totalUSDBalance,
		t,
		activePositionsTab,
		portfolio.crossMarginFutures,
		portfolio.isolatedMarginFutures,
		setActivePositionsTab,
	]);

	const MARKETS_TABS = useMemo(
		() => [
			{
				name: MarketsTab.FUTURES,
				label: t('dashboard.overview.markets-tabs.futures'),
				active: activeMarketsTab === MarketsTab.FUTURES,
				onClick: () => setActiveMarketsTab(MarketsTab.FUTURES),
			},
			{
				name: MarketsTab.SPOT,
				label: t('dashboard.overview.markets-tabs.spot'),
				active: activeMarketsTab === MarketsTab.SPOT,
				onClick: () => setActiveMarketsTab(MarketsTab.SPOT),
			},
		],
		[activeMarketsTab, setActiveMarketsTab, t]
	);

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

				<TabButtonsContainer>
					{MARKETS_TABS.map(({ name, label, active, onClick }) => (
						<TabButton key={name} title={label} active={active} onClick={onClick} />
					))}
				</TabButtonsContainer>
				<TabPanel name={MarketsTab.FUTURES} activeTab={activeMarketsTab}>
					<FuturesMarketsTable />
				</TabPanel>

				<TabPanel name={MarketsTab.SPOT} activeTab={activeMarketsTab}>
					<SpotMarketsTable />
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

export default Overview;
