import React from 'react';
import { components, SingleValueProps } from 'react-select';
import styled from 'styled-components';

import MarketBadge from 'components/Badge/MarketBadge';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import { FlexDivCentered } from 'styles/common';
import { MarketKeyByAsset } from 'utils/futures';

import { MarketsCurrencyOption } from './MarketsDropdown';

const MarketsDropdownSingleValue: React.FC<SingleValueProps<MarketsCurrencyOption>> = (props) => (
	<SingleValueWrapper {...props}>
		<SingleValueContainer>
			<CurrencyIcon currencyKey={MarketKeyByAsset[props.data.value]} width="31px" height="31px" />
			<div className="currency-meta">
				<CurrencyLabel>
					{props.data.label}
					<MarketBadge
						currencyKey={props.data.value}
						isFuturesMarketClosed={props.data.isMarketClosed}
						futuresClosureReason={props.data.closureReason}
					/>
				</CurrencyLabel>
				<p className="name">{props.data.description}</p>
			</div>
			<div style={{ marginRight: 15 }}>
				<p className="price">{props.data.price}</p>
				<p className={props.data.negativeChange ? `change red` : 'change green'}>
					{props.data.change}
				</p>
			</div>
		</SingleValueContainer>
	</SingleValueWrapper>
);

export const CurrencyLabel = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 16px;
	display: flex;
	align-items: center;
`;

const SingleValueWrapper = styled(components.SingleValue)`
	width: 100%;
`;

export const SingleValueContainer = styled(FlexDivCentered)`
	.currency-meta {
		flex: 1;
		margin-left: 12px;
	}

	.name {
		font-family: ${(props) => props.theme.fonts.regular};
		font-size: 12.5px;
		line-height: 12.5px;
		margin: 0;
		color: ${(props) => props.theme.colors.selectedTheme.gray};
	}

	p {
		margin: 0;
	}

	.price {
		font-family: ${(props) => props.theme.fonts.mono};
		color: ${(props) => props.theme.colors.common.primaryWhite};
		font-size: 15px;
	}

	.change {
		font-family: ${(props) => props.theme.fonts.mono};
		font-size: 11.5px;
		text-align: right;
	}

	&:not(:last-of-type) {
		margin-bottom: 4px;
	}

	.green {
		color: ${(props) => props.theme.colors.common.primaryGreen};
	}

	.red {
		color: ${(props) => props.theme.colors.common.primaryRed};
	}
`;

export default MarketsDropdownSingleValue;
