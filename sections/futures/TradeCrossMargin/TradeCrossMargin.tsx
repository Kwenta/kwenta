import { wei } from '@synthetixio/wei';
import { debounce } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled from 'styled-components';

import CrossMarginIcon from 'assets/svg/futures/cross-margin-icon.svg';
import Button from 'components/Button';
import StyledSlider from 'components/Slider/StyledSlider';
import { useFuturesContext } from 'contexts/FuturesContext';
import {
	crossMarginAvailableMarginState,
	crossMarginLeverageState,
	futuresAccountState,
	leverageSideState,
	positionState,
} from 'store/futures';
import { walletAddressState } from 'store/wallet';
import { BorderedPanel, FlexDivRow } from 'styles/common';
import { zeroBN } from 'utils/formatters/number';

import CrossMarginOnboard from '../CrossMarginOnboard';
import OrderSizing from '../OrderSizing';
import PositionButtons from '../PositionButtons';
import ManagePosition from '../Trade/ManagePosition';
import MarketsDropdown from '../Trade/MarketsDropdown';
import FeesBox from './CrossMarginFeesBox';
import MarginInfoBox from './MarginInfoBox';

export default function TradeCrossMargin() {
	const [leverageSide, setLeverageSide] = useRecoilState(leverageSideState);
	const freeMargin = useRecoilValue(crossMarginAvailableMarginState);
	const position = useRecoilValue(positionState);
	const leverage = useRecoilValue(crossMarginLeverageState);
	const { crossMarginAddress } = useRecoilValue(futuresAccountState);
	const walletAddress = useRecoilValue(walletAddressState);

	const { onTradeAmountSUSDChange } = useFuturesContext();

	const currentMargin = (position?.remainingMargin || zeroBN).toNumber();
	const totalMargin = freeMargin.add(currentMargin).toNumber();

	const [percent, setPercent] = useState(0);
	const [showOnboard, setShowOnboard] = useState(false);

	// eslint-disable-next-line
	const onChangeMarginPercent = useCallback(
		debounce((value) => {
			const maxSize = wei(leverage).mul(totalMargin);
			const sizeRange =
				leverageSide === 'long'
					? maxSize.sub(position?.position?.notionalValue || '0')
					: maxSize.add(position?.position?.notionalValue || '0');
			const fraction = value / 100;
			const usdAmount = sizeRange.mul(fraction).toString();
			onTradeAmountSUSDChange(Number(usdAmount).toFixed(0));
		}, 500),
		[debounce, onTradeAmountSUSDChange, leverage, totalMargin]
	);

	useEffect(() => {
		return () => onChangeMarginPercent?.cancel();
	}, [onChangeMarginPercent]);

	const onChangeSlider = (_: React.ChangeEvent<{}>, value: number | number[]) => {
		setPercent(value as number);
		onChangeMarginPercent(value);
	};

	return (
		<>
			<CrossMarginOnboard onClose={() => setShowOnboard(false)} isOpen={showOnboard} />
			{!walletAddress ? (
				<ConnectWallet>Connect your wallet to start trading</ConnectWallet>
			) : !crossMarginAddress ? (
				<CreateAccountContainer>
					<CrossMarginIcon height="21px" width="30px" />
					<Title>Cross Margin FAQ's</Title>
					<CreateAccountButton onClick={() => setShowOnboard(true)}>
						Create Account
					</CreateAccountButton>
				</CreateAccountContainer>
			) : (
				<>
					<MarketsDropdown />
					<MarginInfoBox />
					<OrderSizing />
					<SliderRow>
						<StyledSlider
							minValue={0}
							maxValue={100}
							step={1}
							defaultValue={percent}
							value={percent}
							onChange={onChangeSlider}
							onChangeCommitted={() => {}}
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

const CreateAccountContainer = styled(BorderedPanel)`
	color: white;
	padding: 30px;
`;

const Title = styled.div`
	font-family: ${(props) => props.theme.fonts.monoBold};
	font-size: 23px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
`;

const CreateAccountButton = styled(Button)`
	color: ${(props) => props.theme.colors.selectedTheme.yellow};
	font-size: 11px;
	padding: 12px 14px;
	width: 120px;
	margin-top: 14px;
`;

const ConnectWallet = styled(BorderedPanel)`
	text-align: center;
	padding: 20px;
`;
