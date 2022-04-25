/* eslint-disable react/forbid-foreign-prop-types */
import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { castArray } from 'lodash';
import { useRouter } from 'next/router';
import useSynthetixQueries from '@synthetixio/queries';

import { TabPanel } from 'components/Tab';
import TabButton from 'components/Button/TabButton';

import PositionCard from '../PositionCard';
import Trades from '../Trades';
import ProfitCalculator from '../ProfitCalculator';

import ROUTES from 'constants/routes';
import useGetFuturesPositionForMarket from 'queries/futures/useGetFuturesPositionForMarket';
import useGetFuturesPositionHistory from 'queries/futures/useGetFuturesMarketPositionHistory';
import { CurrencyKey, Synths } from 'constants/currency';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import { getMarketKey } from 'utils/futures';
import Connector from 'containers/Connector';

import calculatorIcon from 'assets/svg/futures/calculator-icon.svg';

enum FuturesTab {
	POSITION = 'position',
	ORDERS = 'orders',
	TRADES = 'trades',
	CALCULATOR = 'calculator',
}

const FutureTabs = Object.values(FuturesTab);

type UserInfoProps = {
	marketAsset: CurrencyKey;
};

const UserInfo: React.FC<UserInfoProps> = ({ marketAsset }) => {
	const router = useRouter();
	const { useExchangeRatesQuery } = useSynthetixQueries();
	const { network } = Connector.useContainer();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const futuresMarketPositionQuery = useGetFuturesPositionForMarket(
		getMarketKey(marketAsset, network.id),
		{
			refetchInterval: 6000,
		}
	);
	const futuresPositionHistoryQuery = useGetFuturesPositionHistory(marketAsset);
	const futuresMarketsPosition = futuresMarketPositionQuery?.data ?? null;
	const [openProfitCalcModal, setOpenProfitCalcModal] = useState<boolean>(false);

	const exchangeRates = useMemo(
		() => (exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null),
		[exchangeRatesQuery.isSuccess, exchangeRatesQuery.data]
	);

	const marketAssetRate = useMemo(
		() => getExchangeRatesForCurrencies(exchangeRates, marketAsset, Synths.sUSD),
		[exchangeRates, marketAsset]
	);

	const positionHistory = futuresPositionHistoryQuery?.data ?? null;

	const tabQuery = useMemo(() => {
		if (router.query.market) {
			const tab = castArray(router.query.market)[1] as FuturesTab;
			if (FutureTabs.includes(tab)) {
				return tab;
			}
		}
		return null;
	}, [router]);

	const activeTab = tabQuery != null ? tabQuery : FuturesTab.POSITION;

	const TABS = useMemo(
		() => [
			{
				name: FuturesTab.POSITION,
				label: 'Open Position',
				active: activeTab === FuturesTab.POSITION,
				onClick: () => router.push(ROUTES.Markets.Position(marketAsset)),
			},
			{
				name: FuturesTab.TRADES,
				label: 'Order History',
				badge: positionHistory?.length,
				disabled: true,
				active: activeTab === FuturesTab.TRADES,
				onClick: () => router.push(ROUTES.Markets.Trades(marketAsset)),
			},
			{
				name: FuturesTab.CALCULATOR,
				label: 'Calculator',
				icon: calculatorIcon,
				active: activeTab === FuturesTab.CALCULATOR,
				onClick: () => handleOpenProfitCalc(),
			},
		],
		[activeTab, router, marketAsset, positionHistory]
	);

	const handleOpenProfitCalc = () => {
		setOpenProfitCalcModal(!openProfitCalcModal);
	};

	return (
		<>
			<TabButtonsContainer>
				<TabLeft>
					{/* POSITION tab */}
					<TabButton
						key={TABS[0].name}
						title={TABS[0].label}
						badge={TABS[0].badge}
						active={TABS[0].active}
						disabled={TABS[0].disabled}
						onClick={TABS[0].onClick}
					/>
					{/* TRADES tab */}
					<TabButton
						key={TABS[1].name}
						title={TABS[1].label}
						badge={TABS[1].badge}
						active={TABS[1].active}
						disabled={TABS[1].disabled}
						onClick={TABS[1].onClick}
					/>
				</TabLeft>
				<TabRight>
					{/* CALCULATOR tab */}
					<TabButton
						key={TABS[2].name}
						title={TABS[2].label}
						badge={TABS[2].badge}
						icon={TABS[2].icon}
						active={TABS[2].active}
						disabled={TABS[2].disabled}
						onClick={TABS[2].onClick}
					/>
				</TabRight>
			</TabButtonsContainer>
			<TabPanel name={FuturesTab.POSITION} activeTab={activeTab}>
				<PositionCard
					position={futuresMarketsPosition ?? null}
					currencyKey={marketAsset}
					currencyKeyRate={marketAssetRate}
					onPositionClose={() =>
						setTimeout(() => {
							futuresPositionHistoryQuery.refetch();
							futuresMarketPositionQuery.refetch();
						}, 5 * 1000)
					}
				/>
			</TabPanel>
			<TabPanel name={FuturesTab.TRADES} activeTab={activeTab}>
				<Trades
					history={positionHistory}
					isLoading={futuresPositionHistoryQuery.isLoading}
					isLoaded={futuresPositionHistoryQuery.isFetched}
				/>
			</TabPanel>
			{openProfitCalcModal ? (
				<ProfitCalculator
					marketAsset={marketAsset}
					marketAssetRate={marketAssetRate}
					setOpenProfitCalcModal={setOpenProfitCalcModal}
				/>
			) : null}
		</>
	);
};

const TabButtonsContainer = styled.div`
	display: grid;
	grid-gap: 0rem;
	grid-template-columns: repeat(2, 1fr);

	margin-top: 16px;
	margin-bottom: 16px;

	& > button {
		height: 38px;
		font-size: 13px;

		&:not(:last-of-type) {
			margin-right: 14px;
		}
	}
`;

const TabLeft = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: left;
	grid-gap: 12px;
`;

const TabRight = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: right;
`;

export default UserInfo;
