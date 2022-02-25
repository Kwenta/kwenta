import React from 'react';
import styled from 'styled-components';

import { Synths } from 'constants/currency';
import OrderSizingInput from 'components/Input/OrderSizingInput';

type OrderSizingProps = {
	assetRate: number;
	amount: string;
	onAmountChange: (value: string) => void;
	marketAsset: string | null;
};

const OrderSizing: React.FC<OrderSizingProps> = ({
	marketAsset,
	amount,
	assetRate,
	onAmountChange,
}) => {
	const amountValue = amount ? Number(amount) * assetRate : '';
	const valueToAmount = (value: string) => (Number(value) / assetRate).toString();

	return (
		<OrderSizingContainer>
			<OrderSizingTitle>
				Amount <span>— Set order size</span>
			</OrderSizingTitle>

			<OrderSizingInput
				synth={marketAsset || Synths.sUSD}
				value={amount}
				onChange={(e) => onAmountChange(e.target.value)}
				style={{ marginBottom: '8px' }}
			/>

			<OrderSizingInput
				synth={Synths.sUSD}
				value={amountValue}
				onChange={(e) => onAmountChange(valueToAmount(e.target.value))}
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
