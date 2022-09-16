import { wei } from '@synthetixio/wei';
import { debounce } from 'lodash';
import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import CustomInput from 'components/Input/CustomInput';
import InputTitle from 'components/Input/InputTitle';
import { useFuturesContext } from 'contexts/FuturesContext';
import {
	crossMarginAvailableMarginState,
	futuresAccountTypeState,
	simulatedTradeState,
	positionState,
	futuresTradeInputsState,
	orderTypeState,
	marketAssetRateState,
	futuresOrderPriceState,
} from 'store/futures';
import { FlexDivRow } from 'styles/common';
import { floorNumber, isZero, zeroBN } from 'utils/formatters/number';

type OrderSizingProps = {
	disabled?: boolean;
};

const OrderSizing: React.FC<OrderSizingProps> = ({ disabled }) => {
	const { onTradeAmountChange, maxUsdInputAmount } = useFuturesContext();

	const { nativeSize, susdSize } = useRecoilValue(futuresTradeInputsState);
	const simulatedTrade = useRecoilValue(simulatedTradeState);

	const freeCrossMargin = useRecoilValue(crossMarginAvailableMarginState);
	const position = useRecoilValue(positionState);
	const selectedAccountType = useRecoilValue(futuresAccountTypeState);
	const orderType = useRecoilValue(orderTypeState);
	const assetPrice = useRecoilValue(marketAssetRateState);
	const orderPrice = useRecoilValue(futuresOrderPriceState);

	const [usdValue, setUsdValue] = useState(susdSize);
	const [assetValue, setAssetValue] = useState(nativeSize);

	const tradePrice = useMemo(() => orderPrice || assetPrice, [orderPrice, assetPrice]);
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
		onTradeAmountChange(String(floorNumber(maxUsdInputAmount)), 'usd');
	};

	const handleSetPositionSize = () => {
		onTradeAmountChange(position?.position?.size.toString() ?? '0', 'native');
	};

	// eslint-disable-next-line
	const debounceOnChangeUsd = useCallback(
		debounce((value) => {
			onTradeAmountChange(value, 'usd');
		}, 500),
		[debounce, onTradeAmountChange]
	);

	useEffect(() => {
		return () => debounceOnChangeUsd?.cancel();
	}, [debounceOnChangeUsd]);

	// eslint-disable-next-line
	const debounceOnChangeAssetValue = useCallback(
		debounce((value) => {
			onTradeAmountChange(value, 'native');
		}, 500),
		[debounce, onTradeAmountChange]
	);

	const onChangeUsdValue = (_: ChangeEvent<HTMLInputElement>, v: string) => {
		// const validValue = wei(v || 0).gt(maxUsdInputAmount)
		// 	? String(floorNumber(maxUsdInputAmount, 4))
		// 	: v;
		const validValue = v;
		setUsdValue(validValue);
		debounceOnChangeUsd(validValue);
	};

	const onChangeAssetValue = (_: ChangeEvent<HTMLInputElement>, v: string) => {
		const validValue = wei(v || 0).gt(maxNativeValue) ? String(floorNumber(maxNativeValue, 4)) : v;
		setAssetValue(validValue);
		debounceOnChangeAssetValue(validValue);
	};

	const isDisabled = useMemo(() => {
		const remaining =
			selectedAccountType === 'isolated_margin'
				? position?.remainingMargin || zeroBN
				: freeCrossMargin;
		return remaining.lte(0) || disabled;
	}, [position?.remainingMargin, disabled, selectedAccountType, freeCrossMargin]);

	const showPosSizeHelper =
		position?.position?.size && (orderType === 'limit' || orderType === 'stop');

	return (
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
				invalid={!!usdValue && maxUsdInputAmount.lte(usdValue || 0)}
				dataTestId="set-order-size-amount-susd"
				disabled={isDisabled}
				right={'sUSD'}
				value={usdValue}
				placeholder="0.0"
				onChange={onChangeUsdValue}
			/>
		</OrderSizingContainer>
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
`;

const MaxButton = styled.button`
	text-decoration: underline;
	font-size: 13px;
	line-height: 11px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	background-color: transparent;
	border: none;
	cursor: pointer;
`;

const InputHelpers = styled.div`
	display: flex;
`;

export default OrderSizing;
