import React from 'react';
import styled from 'styled-components';

import { Synths } from 'constants/currency';
import CustomInput from 'components/Input/CustomInput';

type OrderSizingProps = {
	assetRate: number;
	amount: string;
	amountSUSD: string;
	onAmountChange: (value: string) => void;
	onAmountSUSDChange: (value: string) => void;
	marketAsset: string | null;
};

const OrderSizing: React.FC<OrderSizingProps> = ({
	marketAsset,
	amount,
	amountSUSD,
	onAmountChange,
	onAmountSUSDChange,
}) => {
	return (
		<OrderSizingContainer>
			<OrderSizingTitle>
				Amount <span>— Set order size</span>
			</OrderSizingTitle>

			<CustomInput
				right={marketAsset || Synths.sUSD}
				value={amount}
				onChange={(e) => onAmountChange(e.target.value)}
				style={{ marginBottom: '8px' }}
			/>

			<CustomInput
				right={Synths.sUSD}
				value={amountSUSD}
				onChange={(e) => onAmountSUSDChange(e.target.value)}
			/>
		</OrderSizingContainer>
	);
};

const OrderSizingContainer = styled.div`
	margin-bottom: 16px;
`;

const OrderSizingTitle = styled.p`
	color: ${(props) => props.theme.colors.common.primaryWhite};
	font-size: 12px;
	margin-bottom: 8px;
	margin-left: 14px;

	span {
		color: ${(props) => props.theme.colors.common.secondaryGray};
	}
`;

export default OrderSizing;
