import { useRouter } from 'next/router';
import React, { useMemo, useState, useCallback, useEffect, memo } from 'react';
import styled from 'styled-components';

import CalculatorIcon from 'assets/svg/futures/calculator-icon.svg';
import TransfersIcon from 'assets/svg/futures/deposit-withdraw-arrows.svg';
import OpenPositionsIcon from 'assets/svg/futures/icon-open-positions.svg';
import OrderHistoryIcon from 'assets/svg/futures/icon-order-history.svg';
import PositionIcon from 'assets/svg/futures/icon-position.svg';
import UploadIcon from 'assets/svg/futures/upload-icon.svg';
import TabButton from 'components/Button/TabButton';
import Spacer from 'components/Spacer';
import { TabPanel } from 'components/Tab';
import ROUTES from 'constants/routes';
import { fetchAllTradesForAccount } from 'state/futures/actions';
import {
	selectActiveSmartPositionsCount,
	selectActiveIsolatedPositionsCount,
	selectFuturesType,
	selectMarketAsset,
	selectOpenDelayedOrders,
	selectPosition,
	selectAllConditionalOrders,
} from 'state/futures/selectors';
import { useAppSelector, useFetchAction, useAppDispatch } from 'state/hooks';
import { selectWallet } from 'state/wallet/selectors';

import ProfitCalculator from '../ProfitCalculator';
import ShareModal from '../ShareModal';
import Trades from '../Trades';
import Transfers from '../Transfers';
import ConditionalOrdersTable from './ConditionalOrdersTable';
import OpenDelayedOrdersTable from './OpenDelayedOrdersTable';
import PositionsTable from './PositionsTable';

enum FuturesTab {
	POSITION = 'position',
	ORDERS = 'orders',
	CONDITIONAL_ORDERS = 'conditional_orders',
	TRADES = 'trades',
	CALCULATOR = 'calculator',
	TRANSFERS = 'transfers',
	SHARE = 'share',
}

const FutureTabs = Object.values(FuturesTab);

const UserInfo: React.FC = memo(() => {
	const router = useRouter();
	const dispatch = useAppDispatch();

	const marketAsset = useAppSelector(selectMarketAsset);
	const position = useAppSelector(selectPosition);
	const smartPositionsCount = useAppSelector(selectActiveSmartPositionsCount);
	const isolatedPositionsCount = useAppSelector(selectActiveIsolatedPositionsCount);
	const walletAddress = useAppSelector(selectWallet);

	const openOrders = useAppSelector(selectOpenDelayedOrders);
	const conditionalOrders = useAppSelector(selectAllConditionalOrders);
	const accountType = useAppSelector(selectFuturesType);

	useFetchAction(fetchAllTradesForAccount, {
		dependencies: [walletAddress, accountType, position?.position?.size.toString()],
		disabled: !walletAddress,
	});

	const [showShareModal, setShowShareModal] = useState(false);
	const [hasOpenPosition, setHasOpenPosition] = useState(false);
	const [openProfitCalcModal, setOpenProfitCalcModal] = useState(false);

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
		setOpenProfitCalcModal((s) => !s);
	}, []);

	const handleOpenShareModal = useCallback(() => {
		setShowShareModal((s) => !s);
	}, []);

	const refetchTrades = useCallback(() => {
		dispatch(fetchAllTradesForAccount());
	}, [dispatch]);

	useEffect(() => {
		refetchTrades();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [position?.marketKey]);

	const TABS = useMemo(
		() => [
			{
				name: FuturesTab.POSITION,
				label: 'Position',
				badge: accountType === 'isolated_margin' ? isolatedPositionsCount : smartPositionsCount,
				active: activeTab === FuturesTab.POSITION,
				icon: <PositionIcon />,
				onClick: () =>
					router.push(ROUTES.Markets.Position(marketAsset, accountType), undefined, {
						scroll: false,
					}),
			},
			{
				name: FuturesTab.ORDERS,
				label: 'Pending',
				badge: openOrders?.length,
				active: activeTab === FuturesTab.ORDERS,
				icon: <OpenPositionsIcon />,
				onClick: () =>
					router.push(ROUTES.Markets.Orders(marketAsset, accountType), undefined, {
						scroll: false,
					}),
			},
			{
				name: FuturesTab.CONDITIONAL_ORDERS,
				label: 'Orders',
				badge: conditionalOrders.length,
				active: activeTab === FuturesTab.CONDITIONAL_ORDERS,
				icon: <OpenPositionsIcon />,
				onClick: () =>
					router.push(ROUTES.Markets.ConditionalOrders(marketAsset, accountType), undefined, {
						scroll: false,
					}),
			},
			{
				name: FuturesTab.TRADES,
				label: 'Trades',
				badge: undefined,
				active: activeTab === FuturesTab.TRADES,
				icon: <OrderHistoryIcon />,
				onClick: () =>
					router.push(ROUTES.Markets.Trades(marketAsset, accountType), undefined, {
						scroll: false,
					}),
			},
			{
				name: FuturesTab.TRANSFERS,
				label: 'Transfers',
				badge: undefined,
				disabled: false, // leave this until we determine a disbaled state
				active: activeTab === FuturesTab.TRANSFERS,
				icon: <TransfersIcon width={11} height={11} />,
				onClick: () =>
					router.push(ROUTES.Markets.Transfers(marketAsset, accountType), undefined, {
						scroll: false,
					}),
			},
		],
		[
			activeTab,
			router,
			marketAsset,
			openOrders?.length,
			accountType,
			isolatedPositionsCount,
			smartPositionsCount,
			conditionalOrders.length,
		]
	);

	useEffect(() => {
		setHasOpenPosition(!!position?.position);
	}, [position]);

	return (
		<UserInfoContainer>
			<TabButtonsContainer>
				<TabLeft>
					{TABS.map(({ name, label, badge, active, disabled, onClick, icon }) => (
						<TabButton
							inline
							key={name}
							title={label}
							badgeCount={badge}
							active={active}
							disabled={disabled}
							onClick={onClick}
							icon={icon}
						/>
					))}
				</TabLeft>
				<TabRight>
					{/* CALCULATOR tab */}
					<Spacer divider height={47} width={1} />
					<TabButton
						inline
						key={FuturesTab.CALCULATOR}
						title="Calculator"
						icon={<CalculatorIcon />}
						onClick={handleOpenProfitCalc}
					/>
					<TabButton
						inline
						key={FuturesTab.SHARE}
						title="Share"
						disabled={!hasOpenPosition}
						icon={<UploadIcon />}
						onClick={handleOpenShareModal}
					/>
				</TabRight>
			</TabButtonsContainer>

			<TabPanel name={FuturesTab.POSITION} activeTab={activeTab} fullHeight>
				<PositionsTable />
			</TabPanel>
			<TabPanel name={FuturesTab.ORDERS} activeTab={activeTab} fullHeight>
				<OpenDelayedOrdersTable />
			</TabPanel>
			<TabPanel name={FuturesTab.CONDITIONAL_ORDERS} activeTab={activeTab} fullHeight>
				<ConditionalOrdersTable />
			</TabPanel>
			<TabPanel name={FuturesTab.TRADES} activeTab={activeTab} fullHeight>
				<Trades />
			</TabPanel>
			<TabPanel name={FuturesTab.TRANSFERS} activeTab={activeTab} fullHeight>
				<Transfers />
			</TabPanel>

			{openProfitCalcModal && <ProfitCalculator setOpenProfitCalcModal={setOpenProfitCalcModal} />}
			{showShareModal && <ShareModal position={position} setShowShareModal={setShowShareModal} />}
		</UserInfoContainer>
	);
});

const UserInfoContainer = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	min-height: 300px;
	max-height: 300px;
	height: 300px;
	border-top: ${(props) => props.theme.colors.selectedTheme.border};
`;

const TabButtonsContainer = styled.div`
	display: grid;
	grid-gap: 15px;
	grid-template-columns: repeat(2, 1fr);

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
`;

const TabRight = styled.div`
	display: flex;
	justify-content: right;

	@media (max-width: 1182px) {
		justify-content: left;
	}
`;

export default UserInfo;
