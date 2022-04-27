import React from 'react';
import styled from 'styled-components';
import { components, SingleValueProps } from 'react-select';
import { FlexDivCentered } from 'styles/common';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import MarketBadge from 'components/Badge/MarketBadge';
import { MarketsCurrencyOption } from './MarketsDropdown';

const MarketsDropdownSingleValue: React.FC<SingleValueProps<MarketsCurrencyOption>> = (props) => (
	<components.SingleValue {...props}>
		<SingleValueContainer>
			<CurrencyIcon
				currencyKey={(props.data.value[0] !== 's' ? 's' : '') + props.data.value}
				width="31px"
				height="31px"
			/>
			<div className="currency-meta">
				<CurrencyLabel>
					{props.data.label}
					<MarketBadge
						currencyKey={props.data.value}
						isFuturesMarketClosed={props.data.isFuturesMarketClosed}
						futuresClosureReason={props.data.futuresClosureReason}
					/>
				</CurrencyLabel>
				<p className="name">{props.data.description}</p>
			</div>
		</SingleValueContainer>
	</components.SingleValue>
);

export const CurrencyLabel = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.common.primaryWhite};
	font-size: 16px;
	display: flex;
	align-items: center;
}
`;

export const SingleValueContainer = styled(FlexDivCentered)`
	.currency-meta {
		margin-left: 12px;
	}

	.name {
		font-family: ${(props) => props.theme.fonts.regular};
		font-size: 12.5px;
		line-height: 12.5px;
		margin: 0;
		color: ${(props) => props.theme.colors.common.secondaryGray};
	}
`;

export default MarketsDropdownSingleValue;
