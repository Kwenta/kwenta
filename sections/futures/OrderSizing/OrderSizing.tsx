import React from 'react';
import styled from 'styled-components';
import Wei from '@synthetixio/wei';

import { Synths } from 'constants/currency';
import CustomInput from 'components/Input/CustomInput';

type OrderSizingProps = {
	assetRate: Wei;
	amount: string;
	amountSUSD: string;
	disabled?: boolean;
	onAmountChange: (value: string) => void;
	onAmountSUSDChange: (value: string) => void;
	marketAsset: string | null;
};

const OrderSizing: React.FC<OrderSizingProps> = ({
	marketAsset,
	amount,
	amountSUSD,
	disabled,
	onAmountChange,
	onAmountSUSDChange,
}) => {
	return (
		<OrderSizingContainer>
			<OrderSizingTitle>
				Amount&nbsp; —<span>&nbsp; Set order size</span>
			</OrderSizingTitle>

			<CustomInput
				disabled={disabled}
				right={marketAsset || Synths.sUSD}
				value={amount}
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
