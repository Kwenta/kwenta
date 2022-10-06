import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useMemo, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled, { useTheme } from 'styled-components';

import DepositArrow from 'assets/svg/futures/deposit-arrow.svg';
import WithdrawArrow from 'assets/svg/futures/withdraw-arrow.svg';
import SegmentedControl from 'components/SegmentedControl';
import { ISOLATED_MARGIN_ORDER_TYPES } from 'constants/futures';
import Connector from 'containers/Connector';
import {
	balancesState,
	leverageSideState,
	marketInfoState,
	orderTypeState,
	positionState,
} from 'store/futures';
import { zeroBN } from 'utils/formatters/number';

import FeeInfoBox from '../FeeInfoBox';
import LeverageInput from '../LeverageInput';
import MarketInfoBox from '../MarketInfoBox';
import OrderSizing from '../OrderSizing';
import PositionButtons from '../PositionButtons';
import DepositMarginModal from './DepositMarginModal';
import ManagePosition from './ManagePosition';
import MarketsDropdown from './MarketsDropdown';
import NextPrice from './NextPrice';
import TradePanelHeader from './TradePanelHeader';
import WithdrawMarginModal from './WithdrawMarginModal';

type Props = {
	isMobile?: boolean;
};

const TradeIsolatedMargin = ({ isMobile }: Props) => {
	const { openConnectModal: connectWallet } = useConnectModal();
	const { walletAddress } = Connector.useContainer();
	const { colors } = useTheme();

	const [leverageSide, setLeverageSide] = useRecoilState(leverageSideState);
	const position = useRecoilValue(positionState);
	const marketInfo = useRecoilValue(marketInfoState);
	const { susdWalletBalance } = useRecoilValue(balancesState);

	const [orderType, setOrderType] = useRecoilState(orderTypeState);
	const [openModal, setOpenModal] = useState<'deposit' | 'withdraw' | null>(null);

	const headerButtons = useMemo(() => {
		if (!walletAddress) {
			return [
				{
					i18nTitle: 'futures.market.trade.button.connect-wallet',
					onClick: connectWallet,
				},
			];
		}
		const transferButtons = !marketInfo?.isSuspended
			? [
					{
						i18nTitle: 'futures.market.trade.button.deposit',
						icon: <DepositArrow stroke={colors.selectedTheme.yellow} />,
						onClick: () => setOpenModal('deposit'),
					},
			  ]
			: [];

		if (position?.remainingMargin?.gt(zeroBN) && !marketInfo?.isSuspended) {
			transferButtons.push({
				i18nTitle: 'futures.market.trade.button.withdraw',
				icon: <WithdrawArrow stroke={colors.selectedTheme.yellow} />,
				onClick: () => setOpenModal('withdraw'),
			});
		}
		return transferButtons;
	}, [
		walletAddress,
		position?.remainingMargin,
		marketInfo?.isSuspended,
		colors.selectedTheme.yellow,
		connectWallet,
	]);

	return (
		<div>
			{!isMobile && <MarketsDropdown />}

			<TradePanelHeader accountType={'isolated_margin'} buttons={headerButtons} />

			{!isMobile && <MarketInfoBox />}

			<StyledSegmentedControl
				styleType="check"
				values={ISOLATED_MARGIN_ORDER_TYPES}
				selectedIndex={ISOLATED_MARGIN_ORDER_TYPES.indexOf(orderType)}
				onChange={(oType: number) => {
					setOrderType(oType === 0 ? 'market' : 'next-price');
				}}
			/>

			{orderType === 'next-price' && <NextPrice />}

			<PositionButtons selected={leverageSide} onSelect={setLeverageSide} />

			<OrderSizing />

			<LeverageInput />

			<ManagePosition />

			<FeeInfoBox />
			{openModal === 'deposit' && (
				<DepositMarginModal sUSDBalance={susdWalletBalance} onDismiss={() => setOpenModal(null)} />
			)}

			{openModal === 'withdraw' && <WithdrawMarginModal onDismiss={() => setOpenModal(null)} />}
		</div>
	);
};

export default TradeIsolatedMargin;

const StyledSegmentedControl = styled(SegmentedControl)`
	margin-bottom: 16px;
`;
