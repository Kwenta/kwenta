import { useRouter } from 'next/router';
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import CalculatorIcon from 'assets/svg/futures/calculator-icon.svg';
import OpenPositionsIcon from 'assets/svg/futures/icon-open-positions.svg';
import OrderHistoryIcon from 'assets/svg/futures/icon-order-history.svg';
import PositionIcon from 'assets/svg/futures/icon-position.svg';
import TransfersIcon from 'assets/svg/futures/icon-transfers.svg';
import UploadIcon from 'assets/svg/futures/upload-icon.svg';
import TabButton from 'components/Button/TabButton';
import { TabPanel } from 'components/Tab';
import ROUTES from 'constants/routes';
import { PositionHistory } from 'queries/futures/types';
import { FuturesTrade } from 'queries/futures/types';
import useGetFuturesMarginTransfers from 'queries/futures/useGetFuturesMarginTransfers';
import useGetFuturesPositionForAccount from 'queries/futures/useGetFuturesPositionForAccount';
import useGetFuturesTradesForAccount from 'queries/futures/useGetFuturesTradesForAccount';
import FuturesPositionsTable from 'sections/dashboard/FuturesPositionsTable';
import {
	currentMarketState,
	futuresAccountState,
	openOrdersState,
	positionState,
} from 'store/futures';

import PositionCard from '../PositionCard';
import ProfitCalculator from '../ProfitCalculator';
import ShareModal from '../ShareModal';
import Trades from '../Trades';
import Transfers from '../Transfers';
import OrderHistory from './OrderHistory';

enum FuturesTab {
	POSITION = 'position',
	ORDERS = 'orders',
	TRADES = 'trades',
	CALCULATOR = 'calculator',
	TRANSFERS = 'transfers',
	SHARE = 'share',
}

const FutureTabs = Object.values(FuturesTab);

const UserInfo: React.FC = () => {
	const router = useRouter();
	const { walletAddress } = useRecoilValue(futuresAccountState);
	const position = useRecoilValue(positionState);
	const marketAsset = useRecoilValue(currentMarketState);
	const openOrders = useRecoilValue(openOrdersState);

	const futuresPositionQuery = useGetFuturesPositionForAccount();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const futuresPositionHistory = futuresPositionQuery?.data ?? [];

	const [showShareModal, setShowShareModal] = useState(false);
	const [hasOpenPosition, setHasOpenPosition] = useState(false);
	const [openProfitCalcModal, setOpenProfitCalcModal] = useState(false);

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

	const tabQuery = useMemo(() => {
		if (router.query.tab) {
			const tab = router.query.tab as FuturesTab;
			if (FutureTabs.includes(tab)) {
				return tab;
			}
		}
		return null;
	}, [router]);

	const activeTab = tabQuery ?? FuturesTab.POSITION;

	const handleOpenProfitCalc = useCallback(() => {
		setOpenProfitCalcModal(!openProfitCalcModal);
	}, [openProfitCalcModal]);

	const handleOpenShareModal = useCallback(() => {
		setShowShareModal(!showShareModal);
	}, [showShareModal]);

	const refetchTrades = useCallback(() => {
		futuresTradesQuery.refetch();
		marginTransfersQuery.refetch();
	}, [futuresTradesQuery, marginTransfersQuery]);

	useEffect(() => {
		refetchTrades();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [position]);

	const TABS = useMemo(
		() => [
			{
				name: FuturesTab.POSITION,
				label: 'Position',
				active: activeTab === FuturesTab.POSITION,
				icon: <PositionIcon />,
				onClick: () =>
					router.push(ROUTES.Markets.Position(marketAsset), undefined, { scroll: false }),
			},
			{
				name: FuturesTab.ORDERS,
				label: 'Orders',
				badge: openOrders?.length,
				active: activeTab === FuturesTab.ORDERS,
				icon: <OpenPositionsIcon />,
				onClick: () =>
					router.push(ROUTES.Markets.Orders(marketAsset), undefined, { scroll: false }),
			},
			{
				name: FuturesTab.TRADES,
				label: 'Trades',
				badge: undefined,
				active: activeTab === FuturesTab.TRADES,
				icon: <OrderHistoryIcon />,
				onClick: () =>
					router.push(ROUTES.Markets.Trades(marketAsset), undefined, { scroll: false }),
			},
			{
				name: FuturesTab.TRANSFERS,
				label: 'Transfers',
				badge: undefined,
				disabled: false, // leave this until we determine a disbaled state
				active: activeTab === FuturesTab.TRANSFERS,
				icon: <TransfersIcon />,
				onClick: () =>
					router.push(ROUTES.Markets.Transfers(marketAsset), undefined, { scroll: false }),
			},
		],
		[activeTab, router, marketAsset, openOrders?.length]
	);

	useEffect(() => {
		let currentPosition: PositionHistory[] = [];

		if (futuresPositionHistory.length > 0) {
			currentPosition = futuresPositionHistory.filter(
				(obj: PositionHistory) => obj.asset === marketAsset
			);

			setHasOpenPosition(currentPosition.length === 0 ? false : true);
		}
	}, [futuresPositionHistory, marketAsset]);

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
					<TabButton
						key={FuturesTab.SHARE}
						title="Share"
						disabled={!hasOpenPosition}
						icon={<UploadIcon />}
						onClick={handleOpenShareModal}
					/>
				</TabRight>
			</TabButtonsContainer>

			<TabPanel name={FuturesTab.POSITION} activeTab={activeTab}>
				<PositionCard />
				<FuturesPositionsTable
					futuresPositionHistory={futuresPositionHistory}
					showCurrentMarket={false}
				/>
			</TabPanel>
			<TabPanel name={FuturesTab.ORDERS} activeTab={activeTab}>
				<OrderHistory />
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

			{openProfitCalcModal && (
				<ProfitCalculator
					marketAsset={marketAsset}
					setOpenProfitCalcModal={setOpenProfitCalcModal}
				/>
			)}
			{showShareModal && (
				<ShareModal
					position={position}
					marketAsset={marketAsset}
					setShowShareModal={setShowShareModal}
					futuresPositionHistory={futuresPositionHistory}
				/>
			)}
		</>
	);
};

const TabButtonsContainer = styled.div`
	display: grid;
	grid-gap: 15px;
	grid-template-columns: repeat(2, 1fr);

	margin-top: 16px;
	margin-bottom: 16px;

	button {
		font-size: 13px;
	}

	@media (max-width: 1182px) {
		grid-template-columns: repeat(1, 1fr);
	}
`;

const TabLeft = styled.div`
	display: flex;
	justify-content: left;
	grid-gap: 12px;
`;

const TabRight = styled.div`
	display: flex;
	justify-content: right;
	grid-gap: 12px;

	@media (max-width: 1182px) {
		justify-content: left;
	}
`;

export default UserInfo;
