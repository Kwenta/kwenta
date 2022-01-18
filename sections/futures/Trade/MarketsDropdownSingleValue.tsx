import React from 'react';
import styled from 'styled-components';
import { components, SingleValueProps } from 'react-select';
import { FlexDivCentered } from 'styles/common';
import CurrencyIcon from 'components/Currency/CurrencyIcon';

const MarketsDropdownSingleValue: React.FC<SingleValueProps<any>> = (props) => (
	<components.SingleValue {...props}>
		<SingleValueContainer>
			<CurrencyIcon currencyKey={props.data.value} width="31px" height="31px" />
			<div className="currency-meta">
				<CurrencyLabel>{props.data.label}</CurrencyLabel>
				<p className="name">{props.data.description}</p>
			</div>
		</SingleValueContainer>
	</components.SingleValue>
);

export const CurrencyLabel = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	color: #ece8e3;
	font-size: 16px;
`;

export const SingleValueContainer = styled(FlexDivCentered)`
	.currency-meta {
		margin-left: 12px;
	}

	.name {
		font-family: ${(props) => props.theme.fonts.regular};
		font-size: 12.5px;
		line-height: 12.5px;
		margin: 2px 0 0 0;
		color: #787878;
	}
`;

export default MarketsDropdownSingleValue;
