import { wei } from '@synthetixio/wei';
import { debounce } from 'lodash';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled from 'styled-components';

import CrossMarginIcon from 'assets/svg/futures/cross-margin-icon.svg';
import Button from 'components/Button';
import StyledSlider from 'components/Slider/StyledSlider';
import ROUTES from 'constants/routes';
import { useFuturesContext } from 'contexts/FuturesContext';
import {
	crossMarginAvailableMarginState,
	futuresAccountState,
	leverageSideState,
	positionState,
	tradeSizeSUSDState,
} from 'store/futures';
import { walletAddressState } from 'store/wallet';
import { BorderedPanel, FlexDivRow } from 'styles/common';
import { zeroBN } from 'utils/formatters/number';

import CrossMarginOnboard from '../CrossMarginOnboard';
import CrossMarginFAQ from '../CrossMarginOnboard/CrossMarginFAQ';
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
	const { crossMarginAddress, crossMarginAvailable } = useRecoilValue(futuresAccountState);
	const walletAddress = useRecoilValue(walletAddressState);
	const usdSize = useRecoilValue(tradeSizeSUSDState);

	const { t } = useTranslation();
	const { onTradeAmountSUSDChange, selectedLeverage, maxUsdInputAmount } = useFuturesContext();

	const currentMargin = (position?.remainingMargin || zeroBN).toNumber();
	const totalMargin = freeMargin.add(currentMargin).toNumber();

	const [percent, setPercent] = useState(0);
	const [showOnboard, setShowOnboard] = useState(false);
	const [usdAmount, setUsdAmount] = useState(usdSize);

	const sizeRange =
		leverageSide === 'long'
			? maxUsdInputAmount.sub(position?.position?.notionalValue || '0')
			: maxUsdInputAmount.add(position?.position?.notionalValue || '0');

	// eslint-disable-next-line
	const onChangeMarginPercent = useCallback(
		debounce((value) => {
			const fraction = value / 100;
			const usdAmount = sizeRange.mul(fraction).toString();
			const usdValue = Number(usdAmount).toFixed(0);
			setUsdAmount(usdValue);
			onTradeAmountSUSDChange(usdValue);
		}, 500),
		[debounce, onTradeAmountSUSDChange, selectedLeverage, totalMargin, sizeRange, usdAmount]
	);

	useEffect(() => {
		if (usdSize !== usdAmount) {
			if (!usdSize) {
				setPercent(0);
				return;
			}

			const percent = wei(usdSize).div(sizeRange).mul(100).toNumber();
			setPercent(Number(percent.toFixed(2)));
		}
		// eslint-disable-next-line
	}, [usdSize]);

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
				<MessageContainer>{t('futures.market.trade.cross-margin.connect-wallet')}</MessageContainer>
			) : !crossMarginAvailable ? (
				<MessageContainer>
					<Title>{t('futures.market.trade.cross-margin.title')}</Title>
					<UnsupportedMessage>
						{t('futures.market.trade.cross-margin.unsupported')}{' '}
					</UnsupportedMessage>
					<IsolatedLink>
						<Link href={ROUTES.Markets.Home('isolated_margin')}>Switch to isolated margin</Link>
					</IsolatedLink>
				</MessageContainer>
			) : !crossMarginAddress ? (
				<>
					<CreateAccountContainer>
						<Title>{t('futures.market.trade.cross-margin.title')}</Title>

						<CreateAccountButton variant="flat" onClick={() => setShowOnboard(true)}>
							{t('futures.market.trade.cross-margin.create-account')}
						</CreateAccountButton>
					</CreateAccountContainer>
					<FAQContainer>
						<CrossMarginIcon height="21px" width="30px" />
						<Title yellow>{t('futures.market.trade.cross-margin.faq-title')}</Title>
						<Questions>
							<CrossMarginFAQ />
						</Questions>
					</FAQContainer>
				</>
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
	padding: 50px 30px;
	text-align: center;
`;

const FAQContainer = styled(BorderedPanel)`
	color: white;
	padding: 30px;
	margin-top: 20px;
`;

const Title = styled.div<{ yellow?: boolean }>`
	font-family: ${(props) => props.theme.fonts.monoBold};
	font-size: 23px;
	color: ${(props) =>
		props.yellow
			? props.theme.colors.selectedTheme.yellow
			: props.theme.colors.selectedTheme.button.text};
`;

const CreateAccountButton = styled(Button)`
	color: ${(props) => props.theme.colors.selectedTheme.yellow};
	font-size: 12px;
	padding: 8px 11px;
	width: 120px;
	margin-top: 14px;
	border-radius: 30px;
`;

const MessageContainer = styled(BorderedPanel)`
	text-align: center;
	padding: 20px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`;

const IsolatedLink = styled.div`
	margin-top: 12px;
`;

const Questions = styled.div`
	margin-top: 10px;
	border-top: ${(props) => `${props.theme.colors.selectedTheme.border}`};
`;

const UnsupportedMessage = styled.div`
	margin-top: 12px;
`;
