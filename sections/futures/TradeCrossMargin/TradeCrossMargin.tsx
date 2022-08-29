import { wei } from '@synthetixio/wei';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled from 'styled-components';

import StyledSlider from 'components/Slider/StyledSlider';
import { useFuturesContext } from 'contexts/FuturesContext';
import {
	futuresAccountState,
	futuresAccountTypeState,
	leverageSideState,
	tradeSizeState,
} from 'store/futures';
import { walletAddressState } from 'store/wallet';
import { BorderedPanel, FlexDivRow } from 'styles/common';

import OrderSizing from '../OrderSizing';
import PositionButtons from '../PositionButtons';
import ManagePosition from '../Trade/ManagePosition';
import MarketsDropdown from '../Trade/MarketsDropdown';
import TradePanelHeader from '../Trade/TradePanelHeader';
import CreateAccount from './CreateAccount';
import FeesBox from './CrossMarginFeesBox';
import CrossMarginUnsupported from './CrossMarginUnsupported';
import DepositWithdrawCrossMargin from './DepositWithdrawCrossMargin';
import MarginInfoBox from './MarginInfoBox';

type Props = {
	isMobile?: boolean;
};

export default function TradeCrossMargin({ isMobile }: Props) {
	const { t } = useTranslation();

	const [leverageSide, setLeverageSide] = useRecoilState(leverageSideState);
	const { crossMarginAddress, crossMarginAvailable } = useRecoilValue(futuresAccountState);
	const selectedAccountType = useRecoilValue(futuresAccountTypeState);

	const walletAddress = useRecoilValue(walletAddressState);
	const { susdSize } = useRecoilValue(tradeSizeState);

	const { onTradeAmountSUSDChange, maxUsdInputAmount } = useFuturesContext();

	const [percent, setPercent] = useState(0);
	const [usdAmount, setUsdAmount] = useState(susdSize);
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
			{!walletAddress ? (
				<MessageContainer>{t('futures.market.trade.cross-margin.connect-wallet')}</MessageContainer>
			) : !crossMarginAvailable ? (
				<CrossMarginUnsupported />
			) : !crossMarginAddress ? (
				<CreateAccount />
			) : (
				<>
					{isMobile && <MarketsDropdown />}

					<TradePanelHeader
						accountType={selectedAccountType}
						buttons={[
							{
								i18nTitle: 'futures.market.trade.button.deposit',
								onClick: () => setOpenTransferModal('deposit'),
							},
							{
								i18nTitle: 'futures.market.trade.button.withdraw',
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
					<FeesBox />
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
