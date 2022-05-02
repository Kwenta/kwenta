/* eslint-disable react/forbid-foreign-prop-types */
import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { castArray } from 'lodash';
import { useRouter } from 'next/router';
import useSynthetixQueries from '@synthetixio/queries';
import { Svg } from 'react-optimized-image';

import { TabPanel } from 'components/Tab';
import TabButton from 'components/Button/TabButton';

import PositionCard from '../PositionCard';
import Trades from '../Trades';
import ProfitCalculator from '../ProfitCalculator';
import Transfers from '../Transfers';

import ROUTES from 'constants/routes';
import useGetFuturesPositionForMarket from 'queries/futures/useGetFuturesPositionForMarket';
import useGetFuturesPositionHistory from 'queries/futures/useGetFuturesMarketPositionHistory';
import { CurrencyKey, Synths } from 'constants/currency';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import { getMarketKey } from 'utils/futures';
import Connector from 'containers/Connector';

import calculatorIcon from 'assets/svg/futures/calculator-icon.svg';
import OrderHistoryIcon from 'assets/svg/futures/icon-order-history.svg';
import PositionIcon from 'assets/svg/futures/icon-position.svg';
import TransfersIcon from 'assets/svg/futures/icon-transfers.svg';
import OpenPositionsIcon from 'assets/svg/futures/icon-open-positions.svg';
import useGetFuturesMarginTransfers from 'queries/futures/useGetFuturesMarginTransfers';
import FuturesPositionsTable from 'sections/dashboard/FuturesPositionsTable';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import useGetFuturesPositionForAccount from 'queries/futures/useGetFuturesPositionForAccount';

enum FuturesTab {
	POSITION = 'position',
	ORDERS = 'orders',
	TRADES = 'trades',
	CALCULATOR = 'calculator',
	TRANSFERS = 'transfers',
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

	const futuresMarketsQuery = useGetFuturesMarkets();
	const futuresMarkets = futuresMarketsQuery?.data ?? [];
	const otherFuturesMarkets = futuresMarkets.filter((market) => market.asset !== marketAsset) ?? [];

	const futuresPositionQuery = useGetFuturesPositionForAccount();
	const futuresPositionHistory = futuresPositionQuery?.data ?? [];

	const futuresPositionHistoryQuery = useGetFuturesPositionHistory(marketAsset);
	const futuresMarketsPosition = futuresMarketPositionQuery?.data ?? null;
	const [openProfitCalcModal, setOpenProfitCalcModal] = useState<boolean>(false);

	const marginTransfersQuery = useGetFuturesMarginTransfers(marketAsset);

	const marginTransfers = useMemo(
		() => (marginTransfersQuery.isSuccess ? marginTransfersQuery?.data ?? [] : []),
		[marginTransfersQuery.isSuccess, marginTransfersQuery.data]
	);

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
				label: 'Position',
				active: activeTab === FuturesTab.POSITION,
				icon: <Svg src={PositionIcon} />,
				onClick: () => router.push(ROUTES.Markets.Position(marketAsset)),
			},
			// {
			// 	name: FuturesTab.ORDERS,
			// 	label: 'Open Orders',
			// 	badge: undefined,
			// 	disabled: true,
			// 	active: activeTab === FuturesTab.ORDERS,
			// 	icon: <Svg src={OpenPositionsIcon} />,
			// 	onClick: () => router.push(ROUTES.Markets.Orders(marketAsset)),
			// },
			// {
			// 	name: FuturesTab.TRADES,
			// 	label: 'Order History',
			// 	badge: undefined,
			// 	disabled: true,
			// 	active: activeTab === FuturesTab.TRADES,
			// 	icon: <Svg src={OrderHistoryIcon} />,
			// 	onClick: () => router.push(ROUTES.Markets.Trades(marketAsset)),
			// },
			{
				name: FuturesTab.TRANSFERS,
				label: 'Transfers',
				badge: undefined,
				disabled: false,
				active: activeTab === FuturesTab.TRANSFERS,
				icon: <Svg src={TransfersIcon} />,
				onClick: () => router.push(ROUTES.Markets.Transfers(marketAsset)),
			},
		],
		[activeTab, router, marketAsset]
	);

	return (
		<>
			<TabButtonsContainer>
				<TabLeft>
					{TABS.map(({ name, label, badge, active, disabled, onClick, icon }) => (
						<TabButton
							key={name}
							title={label}
							badge={badge}
							active={active}
							disabled={disabled}
							onClick={onClick}
							icon={icon}
						/>
					))}
				</TabLeft>
				<TabRight>
					{/* CALCULATOR tab */}
					<TabButton
						key={FuturesTab.CALCULATOR}
						title="Calculator"
						icon={<Svg src={calculatorIcon} />}
						onClick={() => setOpenProfitCalcModal(!openProfitCalcModal)}
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
				<FuturesPositionsTable
					futuresMarkets={otherFuturesMarkets}
					futuresPositionHistory={futuresPositionHistory}
				/>
			</TabPanel>
			<TabPanel name={FuturesTab.ORDERS} activeTab={activeTab}>
				{/* TODO */}
			</TabPanel>
			<TabPanel name={FuturesTab.TRADES} activeTab={activeTab}>
				<Trades
					history={positionHistory}
					isLoading={futuresPositionHistoryQuery.isLoading}
					isLoaded={futuresPositionHistoryQuery.isFetched}
				/>
			</TabPanel>
			<TabPanel name={FuturesTab.TRANSFERS} activeTab={activeTab}>
				<Transfers
					marginTransfers={marginTransfers}
					isLoading={marginTransfersQuery.isLoading}
					isLoaded={marginTransfersQuery.isFetched}
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
