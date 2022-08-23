import React from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import CustomInput from 'components/Input/CustomInput';
import { useFuturesContext } from 'contexts/FuturesContext';
import {
	currentMarketState,
	maxLeverageState,
	tradeSizeState,
	tradeSizeSUSDState,
} from 'store/futures';
import { FlexDivRow } from 'styles/common';

type OrderSizingProps = {
	disabled?: boolean;
};

const OrderSizing: React.FC<OrderSizingProps> = ({ disabled }) => {
	const tradeSize = useRecoilValue(tradeSizeState);
	const tradeSizeSUSD = useRecoilValue(tradeSizeSUSDState);
	const marketAsset = useRecoilValue(currentMarketState);
	const maxLeverage = useRecoilValue(maxLeverageState);

	const {
		onTradeAmountChange,
		onTradeAmountSUSDChange,
		onLeverageChange,
		remainingMargin,
	} = useFuturesContext();

	const handleSetMax = () => {
		const maxOrderSizeUSDValue = Number(maxLeverage.mul(remainingMargin)).toFixed(0);
		onTradeAmountSUSDChange(maxOrderSizeUSDValue);
		onLeverageChange(Number(maxLeverage).toString().substring(0, 4));
	};

	const isDisabled = React.useMemo(() => {
		return remainingMargin.lte(0) || disabled;
	}, [remainingMargin, disabled]);

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
				right={marketAsset || 'sUSD'}
				value={tradeSize}
				placeholder="0.0"
				onChange={(_, v) => onTradeAmountChange(v)}
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
				right={'sUSD'}
				value={tradeSizeSUSD}
				placeholder="0.0"
				onChange={(_, v) => onTradeAmountSUSDChange(v)}
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
	padding: 0 14px;
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
