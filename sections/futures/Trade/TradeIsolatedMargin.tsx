import useSynthetixQueries from '@synthetixio/queries';
import React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled from 'styled-components';

import DepositArrow from 'assets/svg/futures/deposit-arrow.svg';
import WithdrawArrow from 'assets/svg/futures/withdraw-arrow.svg';
import SegmentedControl from 'components/SegmentedControl';
import { leverageSideState, marketInfoState, orderTypeState, positionState } from 'store/futures';
import { walletAddressState } from 'store/wallet';
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
	const [leverageSide, setLeverageSide] = useRecoilState(leverageSideState);
	const walletAddress = useRecoilValue(walletAddressState);
	const position = useRecoilValue(positionState);
	const marketInfo = useRecoilValue(marketInfoState);

	const [orderType, setOrderType] = useRecoilState(orderTypeState);
	const [openModal, setOpenModal] = React.useState<'deposit' | 'withdraw' | null>(null);

	const { useSynthsBalancesQuery } = useSynthetixQueries();
	const synthsBalancesQuery = useSynthsBalancesQuery(walletAddress);
	const sUSDBalance = synthsBalancesQuery?.data?.balancesMap?.['sUSD']?.balance ?? zeroBN;

	const transferButtons = !marketInfo?.isSuspended
		? [
				{
					i18nTitle: 'futures.market.trade.button.deposit',
					Icon: DepositArrow,
					onClick: () => setOpenModal('deposit'),
				},
		  ]
		: [];

	if (position?.remainingMargin?.gt(zeroBN) && !marketInfo?.isSuspended) {
		transferButtons.push({
			i18nTitle: 'futures.market.trade.button.withdraw',
			Icon: WithdrawArrow,
			onClick: () => setOpenModal('withdraw'),
		});
	}

	return (
		<div>
			{!isMobile && <MarketsDropdown />}

			<TradePanelHeader accountType={'isolated_margin'} buttons={transferButtons} />

			{!isMobile && <MarketInfoBox />}

			<StyledSegmentedControl
				values={['Market', 'Next-Price']}
				selectedIndex={orderType}
				onChange={setOrderType}
			/>

			{orderType === 1 && <NextPrice />}

			<PositionButtons selected={leverageSide} onSelect={setLeverageSide} />

			<OrderSizing />

			<LeverageInput />

			<ManagePosition />

			<FeeInfoBox />
			{openModal === 'deposit' && (
				<DepositMarginModal sUSDBalance={sUSDBalance} onDismiss={() => setOpenModal(null)} />
			)}

			{openModal === 'withdraw' && <WithdrawMarginModal onDismiss={() => setOpenModal(null)} />}
		</div>
	);
};

export default TradeIsolatedMargin;

const StyledSegmentedControl = styled(SegmentedControl)`
	margin-bottom: 16px;
`;
