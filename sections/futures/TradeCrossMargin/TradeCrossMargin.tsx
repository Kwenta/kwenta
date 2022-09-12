import { wei } from '@synthetixio/wei';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled from 'styled-components';

import DepositArrow from 'assets/svg/futures/deposit-arrow.svg';
import WithdrawArrow from 'assets/svg/futures/withdraw-arrow.svg';
import StyledSlider from 'components/Slider/StyledSlider';
import Connector from 'containers/Connector';
import { useFuturesContext } from 'contexts/FuturesContext';
import {
	futuresAccountState,
	futuresAccountTypeState,
	leverageSideState,
	futuresTradeInputsState,
} from 'store/futures';
import { BorderedPanel, FlexDivRow } from 'styles/common';

import CrossMarginOnboard from '../CrossMarginOnboard';
import FeeInfoBox from '../FeeInfoBox';
import OrderSizing from '../OrderSizing';
import PositionButtons from '../PositionButtons';
import ManagePosition from '../Trade/ManagePosition';
import MarketsDropdown from '../Trade/MarketsDropdown';
import TradePanelHeader from '../Trade/TradePanelHeader';
import CreateAccount from './CreateAccount';
import MarginInfoBox from './CrossMarginInfoBox';
import CrossMarginUnsupported from './CrossMarginUnsupported';
import DepositWithdrawCrossMargin from './DepositWithdrawCrossMargin';

type Props = {
	isMobile?: boolean;
};

export default function TradeCrossMargin({ isMobile }: Props) {
	const { t } = useTranslation();
	const { walletAddress } = Connector.useContainer();

	const [leverageSide, setLeverageSide] = useRecoilState(leverageSideState);
	const { crossMarginAddress, crossMarginAvailable } = useRecoilValue(futuresAccountState);
	const selectedAccountType = useRecoilValue(futuresAccountTypeState);
	const { susdSize } = useRecoilValue(futuresTradeInputsState);

	const { onTradeAmountSUSDChange, maxUsdInputAmount } = useFuturesContext();

	const [percent, setPercent] = useState(0);
	const [usdAmount, setUsdAmount] = useState(susdSize);
	const [showOnboard, setShowOnboard] = useState(false);
	const [openTransferModal, setOpenTransferModal] = useState<'deposit' | 'withdraw' | null>(null);

	// eslint-disable-next-line
	const onChangeMarginPercent = useCallback(
		(value, commit = false) => {
			setPercent(value);
			const fraction = value / 100;
			const usdAmount = maxUsdInputAmount.mul(fraction).toString();
			const usdValue = Number(usdAmount).toFixed(0);
			setUsdAmount(usdValue);
			onTradeAmountSUSDChange(usdValue, commit);
		},
		[onTradeAmountSUSDChange, maxUsdInputAmount]
	);

	useEffect(() => {
		if (susdSize !== usdAmount) {
			if (!susdSize || maxUsdInputAmount.eq(0)) {
				setPercent(0);
				return;
			}

			const percent = wei(susdSize).div(maxUsdInputAmount).mul(100).toNumber();
			setPercent(Number(percent.toFixed(2)));
		}
		// eslint-disable-next-line
	}, [susdSize]);

	return (
		<>
			<CrossMarginOnboard onClose={() => setShowOnboard(false)} isOpen={showOnboard} />

			{!walletAddress ? (
				<MessageContainer>{t('futures.market.trade.cross-margin.connect-wallet')}</MessageContainer>
			) : !crossMarginAvailable ? (
				<CrossMarginUnsupported />
			) : !crossMarginAddress ? (
				<CreateAccount onShowOnboard={() => setShowOnboard(true)} />
			) : (
				<>
					{!isMobile && <MarketsDropdown />}

					<TradePanelHeader
						accountType={selectedAccountType}
						buttons={[
							{
								i18nTitle: 'futures.market.trade.button.deposit',
								Icon: DepositArrow,
								onClick: () => setOpenTransferModal('deposit'),
							},
							{
								i18nTitle: 'futures.market.trade.button.withdraw',
								Icon: WithdrawArrow,
								onClick: () => setOpenTransferModal('withdraw'),
							},
						]}
					/>
					{}
					<MarginInfoBox />
					<OrderSizing />
					<SliderRow>
						<StyledSlider
							minValue={0}
							maxValue={100}
							step={1}
							defaultValue={percent}
							value={percent}
							onChange={(_, value) => onChangeMarginPercent(value, false)}
							onChangeCommitted={(_, value) => onChangeMarginPercent(value, true)}
							marks={[
								{ value: 0, label: `0%` },
								{ value: 100, label: `100%` },
							]}
							valueLabelDisplay="on"
							valueLabelFormat={(v) => `${v}%`}
							$currentMark={percent}
						/>
					</SliderRow>
					<PositionButtons selected={leverageSide} onSelect={setLeverageSide} />
					<ManagePosition />
					<FeeInfoBox />
					{openTransferModal && (
						<DepositWithdrawCrossMargin
							defaultTab={openTransferModal}
							onDismiss={() => setOpenTransferModal(null)}
						/>
					)}
				</>
			)}
		</>
	);
}

const SliderRow = styled(FlexDivRow)`
	margin-top: 8px;
	margin-bottom: 32px;
	position: relative;
`;

const MessageContainer = styled(BorderedPanel)`
	text-align: center;
	padding: 20px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`;
