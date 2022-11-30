import { wei } from '@synthetixio/wei';
import { debounce } from 'lodash';
import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import SwitchAssetArrows from 'assets/svg/futures/switch-arrows.svg';
import CustomInput from 'components/Input/CustomInput';
import InputTitle from 'components/Input/InputTitle';
import { useFuturesContext } from 'contexts/FuturesContext';
import {
	selectMarketKey,
	selectMarketAssetRate,
	selectCrossMarginBalanceInfo,
	selectPosition,
} from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import {
	futuresAccountTypeState,
	simulatedTradeState,
	futuresTradeInputsState,
	orderTypeState,
	futuresOrderPriceState,
	leverageSideState,
} from 'store/futures';
import { FlexDivRow } from 'styles/common';
import { floorNumber, isZero, zeroBN } from 'utils/formatters/number';
import { getDisplayAsset } from 'utils/futures';

import OrderSizeSlider from './OrderSizeSlider';

type OrderSizingProps = {
	isMobile?: boolean;
	disabled?: boolean;
};

const OrderSizing: React.FC<OrderSizingProps> = ({ disabled, isMobile }) => {
	const { onTradeAmountChange, maxUsdInputAmount } = useFuturesContext();

	const { nativeSize, susdSize } = useRecoilValue(futuresTradeInputsState);
	const simulatedTrade = useRecoilValue(simulatedTradeState);

	const { freeMargin: freeCrossMargin } = useAppSelector(selectCrossMarginBalanceInfo);
	const position = useAppSelector(selectPosition);
	const selectedAccountType = useRecoilValue(futuresAccountTypeState);
	const orderType = useRecoilValue(orderTypeState);
	const marketAssetRate = useAppSelector(selectMarketAssetRate);
	const orderPrice = useRecoilValue(futuresOrderPriceState);
	const selectedLeverageSide = useRecoilValue(leverageSideState);

	const marketKey = useAppSelector(selectMarketKey);

	const [usdValue, setUsdValue] = useState(susdSize);
	const [assetValue, setAssetValue] = useState(nativeSize);
	const [assetInputType, setAssetInputType] = useState<'usd' | 'native'>('usd');

	const tradePrice = useMemo(() => (orderPrice ? wei(orderPrice) : marketAssetRate), [
		orderPrice,
		marketAssetRate,
	]);
	const maxNativeValue = useMemo(
		() => (!isZero(tradePrice) ? maxUsdInputAmount.div(tradePrice) : zeroBN),
		[tradePrice, maxUsdInputAmount]
	);

	useEffect(
		() => {
			if (simulatedTrade && simulatedTrade.susdSize !== susdSize) {
				setUsdValue(simulatedTrade.susdSize);
			} else if (susdSize !== usdValue) {
				setUsdValue(susdSize);
			}

			if (simulatedTrade && simulatedTrade.nativeSize !== nativeSize) {
				setAssetValue(simulatedTrade.nativeSize);
			} else if (assetValue !== nativeSize) {
				setAssetValue(nativeSize);
			}
		},
		// Don't want to react to internal value changes
		// eslint-disable-next-line
		[
			susdSize,
			nativeSize,
			simulatedTrade?.susdSize,
			simulatedTrade?.nativeSize,
			setUsdValue,
			setAssetValue,
		]
	);

	const handleSetMax = () => {
		if (assetInputType === 'usd') {
			onTradeAmountChange(String(floorNumber(maxUsdInputAmount)), tradePrice, 'usd');
		} else {
			onTradeAmountChange(String(floorNumber(maxNativeValue)), tradePrice, 'native');
		}
	};

	const handleSetPositionSize = () => {
		onTradeAmountChange(position?.position?.size.toString() ?? '0', tradePrice, 'native');
	};

	// eslint-disable-next-line
	const debounceOnChangeValue = useCallback(
		debounce((value, assetType) => {
			onTradeAmountChange(value, tradePrice, assetType);
		}, 500),
		[debounce, onTradeAmountChange]
	);

	useEffect(() => {
		return () => debounceOnChangeValue?.cancel();
	}, [debounceOnChangeValue]);

	const onChangeValue = (_: ChangeEvent<HTMLInputElement>, v: string) => {
		assetInputType === 'usd' ? setUsdValue(v) : setAssetValue(v);
		debounceOnChangeValue(v, assetInputType);
	};

	const isDisabled = useMemo(() => {
		const remaining =
			selectedAccountType === 'isolated_margin'
				? position?.remainingMargin || zeroBN
				: freeCrossMargin;
		return remaining.lte(0) || disabled;
	}, [position?.remainingMargin, disabled, selectedAccountType, freeCrossMargin]);

	const showPosSizeHelper =
		position?.position?.size &&
		(orderType === 'limit' || orderType === 'stop market') &&
		position?.position.side !== selectedLeverageSide;

	const invalid =
		(assetInputType === 'usd' && usdValue !== '' && maxUsdInputAmount.lte(usdValue || 0)) ||
		(assetInputType === 'native' && assetValue !== '' && maxNativeValue.lte(assetValue || 0));

	return (
		<>
			<OrderSizingContainer>
				<OrderSizingRow>
					<InputTitle>
						Amount&nbsp; —<span>&nbsp; Set order size</span>
					</InputTitle>
					<InputHelpers>
						<MaxButton onClick={handleSetMax}>Max</MaxButton>
						{showPosSizeHelper && (
							<MaxButton onClick={handleSetPositionSize}>Position Size</MaxButton>
						)}
					</InputHelpers>
				</OrderSizingRow>

				<CustomInput
					invalid={invalid}
					dataTestId={'set-order-size-amount-susd' + (isMobile ? '-mobile' : '-desktop')}
					disabled={isDisabled}
					right={
						<InputButton
							onClick={() => setAssetInputType(assetInputType === 'usd' ? 'native' : 'usd')}
						>
							{assetInputType === 'usd' ? 'sUSD' : getDisplayAsset(marketKey)}{' '}
							<span>{<SwitchAssetArrows />}</span>
						</InputButton>
					}
					value={assetInputType === 'usd' ? usdValue : assetValue}
					placeholder="0.00"
					onChange={onChangeValue}
				/>
			</OrderSizingContainer>
			{selectedAccountType === 'cross_margin' && <OrderSizeSlider />}
		</>
	);
};

const OrderSizingContainer = styled.div`
	margin-top: 28px;
	margin-bottom: 16px;
`;

const OrderSizingRow = styled(FlexDivRow)`
	width: 100%;
	align-items: center;
	margin-bottom: 8px;
	cursor: default;
`;

const MaxButton = styled.button`
	text-decoration: underline;
	font-variant: small-caps;
	text-transform: lowercase;
	font-size: 13px;
	line-height: 11px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	background-color: transparent;
	border: none;
	cursor: pointer;
`;

const InputButton = styled.button`
	height: 22px;
	padding: 3px 2px 4px 10px;
	border: none;
	background: transparent;
	font-size: 16px;
	line-height: 16px;
	color: ${(props) => props.theme.colors.selectedTheme.text.label};
	cursor: pointer;
	&:hover {
		svg > path {
			fill: ${(props) => props.theme.colors.selectedTheme.input.hover};
		}
	}
`;

const InputHelpers = styled.div`
	display: flex;
`;

export default OrderSizing;
