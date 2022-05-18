/* eslint-disable react/forbid-foreign-prop-types */
import React, { useMemo, useState, useCallback } from 'react';
import styled from 'styled-components';
import { castArray } from 'lodash';
import { useRouter } from 'next/router';
import useSynthetixQueries from '@synthetixio/queries';

import { TabPanel } from 'components/Tab';
import TabButton from 'components/Button/TabButton';

import PositionCard from '../PositionCard';
import Trades from '../Trades';
import ProfitCalculator from '../ProfitCalculator';
import Transfers from '../Transfers';

import ROUTES from 'constants/routes';
import { CurrencyKey, Synths } from 'constants/currency';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import OpenOrdersTable from './OpenOrdersTable';
import { FuturesPosition } from 'queries/futures/types';

import CalculatorIcon from 'assets/svg/futures/calculator-icon.svg';
import OrderHistoryIcon from 'assets/svg/futures/icon-order-history.svg';
import OpenPositionsIcon from 'assets/svg/futures/icon-open-positions.svg';
import PositionIcon from 'assets/svg/futures/icon-position.svg';
import TransfersIcon from 'assets/svg/futures/icon-transfers.svg';
import useGetFuturesMarginTransfers from 'queries/futures/useGetFuturesMarginTransfers';
import FuturesPositionsTable from 'sections/dashboard/FuturesPositionsTable';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import useGetFuturesPositionForAccount from 'queries/futures/useGetFuturesPositionForAccount';
import { FuturesTrade } from 'queries/futures/types';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';
import useGetFuturesTradesForAccount from 'queries/futures/useGetFuturesTradesForAccount';

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
	position: FuturesPosition | null;
	openOrders: any[];
	refetch(): void;
};

const UserInfo: React.FC<UserInfoProps> = ({ marketAsset, position, openOrders, refetch }) => {
	const router = useRouter();
	const { useExchangeRatesQuery } = useSynthetixQueries();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const walletAddress = useRecoilValue(walletAddressState);
	const futuresMarketsQuery = useGetFuturesMarkets();
	const futuresMarkets = futuresMarketsQuery?.data ?? [];
	const otherFuturesMarkets = futuresMarkets.filter((market) => market.asset !== marketAsset) ?? [];

	const futuresPositionQuery = useGetFuturesPositionForAccount();
	const futuresPositionHistory = futuresPositionQuery?.data ?? [];

	const [openProfitCalcModal, setOpenProfitCalcModal] = useState<boolean>(false);

	const marginTransfersQuery = useGetFuturesMarginTransfers(marketAsset);
	const marginTransfers = useMemo(
		() => (marginTransfersQuery.isSuccess ? marginTransfersQuery?.data ?? [] : []),
		[marginTransfersQuery.isSuccess, marginTransfersQuery.data]
	);

	const futuresTradesQuery = useGetFuturesTradesForAccount(marketAsset, walletAddress);

	const history: FuturesTrade[] = useMemo(
		() => (futuresTradesQuery.isSuccess ? futuresTradesQuery?.data ?? [] : []),
		[futuresTradesQuery.isSuccess, futuresTradesQuery.data]
	);

	const exchangeRates = useMemo(
		() => (exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null),
		[exchangeRatesQuery.isSuccess, exchangeRatesQuery.data]
	);

	const marketAssetRate = useMemo(
		() => getExchangeRatesForCurrencies(exchangeRates, marketAsset, Synths.sUSD),
		[exchangeRates, marketAsset]
	);

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

	const handleOpenProfitCalc = useCallback(() => {
		setOpenProfitCalcModal(!openProfitCalcModal);
	}, [openProfitCalcModal]);

	const TABS = useMemo(
		() => [
			{
				name: FuturesTab.POSITION,
				label: 'Position',
				active: activeTab === FuturesTab.POSITION,
				icon: <PositionIcon />,
				onClick: () => router.push(ROUTES.Markets.Position(marketAsset)),
			},
			{
				name: FuturesTab.ORDERS,
				label: 'Open Orders',
				badge: openOrders?.length,
				active: activeTab === FuturesTab.ORDERS,
				icon: <OpenPositionsIcon />,
				onClick: () => router.push(ROUTES.Markets.Orders(marketAsset)),
			},
			{
				name: FuturesTab.TRADES,
				label: 'Trades',
				badge: undefined,
				active: activeTab === FuturesTab.TRADES,
				icon: <OrderHistoryIcon />,
				onClick: () => router.push(ROUTES.Markets.Trades(marketAsset)),
			},
			{
				name: FuturesTab.TRANSFERS,
				label: 'Transfers',
				badge: undefined,
				disabled: false, // leave this until we determine a disbaled state
				active: activeTab === FuturesTab.TRANSFERS,
				icon: <TransfersIcon />,
				onClick: () => router.push(ROUTES.Markets.Transfers(marketAsset)),
			},
		],
		[activeTab, router, marketAsset, openOrders?.length]
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
						icon={<CalculatorIcon />}
						onClick={handleOpenProfitCalc}
					/>
				</TabRight>
			</TabButtonsContainer>

			<TabPanel name={FuturesTab.POSITION} activeTab={activeTab}>
				<PositionCard
					position={position}
					currencyKey={marketAsset}
					currencyKeyRate={marketAssetRate}
				/>
				<FuturesPositionsTable
					futuresMarkets={otherFuturesMarkets}
					futuresPositionHistory={futuresPositionHistory}
				/>
			</TabPanel>
			<TabPanel name={FuturesTab.ORDERS} activeTab={activeTab}>
				<OpenOrdersTable
					currencyKey={marketAsset}
					position={position}
					openOrders={openOrders}
					refetch={refetch}
				/>
			</TabPanel>
			<TabPanel name={FuturesTab.TRADES} activeTab={activeTab}>
				<Trades
					history={history}
					isLoading={futuresTradesQuery.isLoading}
					isLoaded={futuresTradesQuery.isFetched}
					marketAsset={marketAsset}
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
