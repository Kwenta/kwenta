import React from 'react';
import styled from 'styled-components';
import Wei from '@synthetixio/wei';

import { Synths } from 'constants/currency';
import CustomInput from 'components/Input/CustomInput';
import { FlexDivRow } from 'styles/common';

type OrderSizingProps = {
	assetRate: Wei;
	amount: string;
	amountSUSD: string;
	disabled?: boolean;
	onAmountChange: (value: string) => void;
	onAmountSUSDChange: (value: string) => void;
	onLeverageChange: (value: string) => void;
	marketAsset: string | null;
	maxLeverage: Wei;
	totalMargin: Wei;
};

const OrderSizing: React.FC<OrderSizingProps> = ({
	marketAsset,
	amount,
	amountSUSD,
	disabled,
	onAmountChange,
	onAmountSUSDChange,
	onLeverageChange,
	maxLeverage,
	totalMargin,
}) => {
	const handleSetMax = () => {
		const maxOrderSizeUSDValue = Number(maxLeverage.mul(totalMargin)).toFixed(0);
		onAmountSUSDChange(maxOrderSizeUSDValue);
		onLeverageChange(Number(maxLeverage).toString().substring(0, 4));
	};

	return (
		<OrderSizingContainer>
			<OrderSizingRow>
				<OrderSizingTitle>
					Amount&nbsp; —<span>&nbsp; Set order size</span>
				</OrderSizingTitle>
				<MaxButton onClick={handleSetMax}>Max</MaxButton>
			</OrderSizingRow>

			<CustomInput
				disabled={disabled}
				right={marketAsset || Synths.sUSD}
				value={amount}
				placeholder="0.0"
				onChange={(_, v) => onAmountChange(v)}
				style={{
					marginBottom: '-1px',
					borderBottom: 'none',
					borderBottomRightRadius: '0px',
					borderBottomLeftRadius: '0px',
				}}
			/>

			<CustomInput
				disabled={disabled}
				right={Synths.sUSD}
				value={amountSUSD}
				placeholder="0.0"
				onChange={(_, v) => onAmountSUSDChange(v)}
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
	font-size: 12px;

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
	font-size: 11px;
	line-height: 11px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	background-color: transparent;
	border: none;
	cursor: pointer;
`;

export default OrderSizing;
