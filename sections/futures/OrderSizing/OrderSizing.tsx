import { debounce } from 'lodash';
import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import CustomInput from 'components/Input/CustomInput';
import { Synths } from 'constants/currency';
import { useFuturesContext } from 'contexts/FuturesContext';
import {
	crossMarginAvailableMarginState,
	currentMarketState,
	futuresAccountTypeState,
	positionState,
	tradeSizeState,
} from 'store/futures';
import { FlexDivRow } from 'styles/common';
import { zeroBN } from 'utils/formatters/number';

type OrderSizingProps = {
	disabled?: boolean;
};

const OrderSizing: React.FC<OrderSizingProps> = ({ disabled }) => {
	const { nativeSize, susdSize } = useRecoilValue(tradeSizeState);
	const marketAsset = useRecoilValue(currentMarketState);
	const freeCrossMargin = useRecoilValue(crossMarginAvailableMarginState);
	const position = useRecoilValue(positionState);
	const selectedAccountType = useRecoilValue(futuresAccountTypeState);

	const [usdValue, setUsdValue] = useState(susdSize);
	const [assetValue, setAssetValue] = useState(nativeSize);

	useEffect(() => {
		if (susdSize !== usdValue) {
			setUsdValue(susdSize);
		}
		if (assetValue !== nativeSize) {
			setAssetValue(nativeSize);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [susdSize, nativeSize]);

	const { onTradeAmountChange, onTradeAmountSUSDChange, maxUsdInputAmount } = useFuturesContext();

	const handleSetMax = () => {
		onTradeAmountSUSDChange(Number(maxUsdInputAmount).toFixed(0));
	};

	// eslint-disable-next-line
	const debounceOnChangeUsd = useCallback(
		debounce((value) => {
			onTradeAmountSUSDChange(value);
		}, 500),
		[debounce, onTradeAmountSUSDChange]
	);

	useEffect(() => {
		return () => debounceOnChangeUsd?.cancel();
	}, [debounceOnChangeUsd]);

	// eslint-disable-next-line
	const debounceOnChangeAssetValue = useCallback(
		debounce((value) => {
			onTradeAmountChange(value);
		}, 500),
		[debounce, onTradeAmountChange]
	);

	const onChangeUsdValue = (_: ChangeEvent<HTMLInputElement>, v: string) => {
		setUsdValue(v);
		debounceOnChangeUsd(v);
	};

	const onChangeAssetValue = (_: ChangeEvent<HTMLInputElement>, v: string) => {
		setAssetValue(v);
		debounceOnChangeAssetValue(v);
	};

	const isDisabled = useMemo(() => {
		const remaining =
			selectedAccountType === 'isolated_margin'
				? position?.remainingMargin || zeroBN
				: freeCrossMargin;
		return remaining.lte(0) || disabled;
	}, [position?.remainingMargin, disabled, selectedAccountType, freeCrossMargin]);

	return (
		<OrderSizingContainer>
			<OrderSizingRow>
				<OrderSizingTitle>
					Amount&nbsp; —<span>&nbsp; Set order size</span>
				</OrderSizingTitle>
				<MaxButton onClick={handleSetMax}>Max</MaxButton>
			</OrderSizingRow>

			<CustomInput
				disabled={isDisabled}
				right={marketAsset || Synths.sUSD}
				value={assetValue}
				placeholder="0.0"
				onChange={onChangeAssetValue}
				style={{
					marginBottom: '-1px',
					borderBottom: 'none',
					borderBottomRightRadius: '0px',
					borderBottomLeftRadius: '0px',
				}}
			/>

			<CustomInput
				dataTestId="set-order-size-amount-susd"
				disabled={isDisabled}
				right={Synths.sUSD}
				value={usdValue}
				placeholder="0.0"
				onChange={onChangeUsdValue}
				style={{
					borderTopRightRadius: '0px',
					borderTopLeftRadius: '0px',
				}}
			/>
		</OrderSizingContainer>
	);
};

const OrderSizingContainer = styled.div`
	margin-top: 28px;
	margin-bottom: 16px;
`;

const OrderSizingTitle = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	font-size: 13px;

	span {
		color: ${(props) => props.theme.colors.selectedTheme.gray};
	}
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

export default OrderSizing;
