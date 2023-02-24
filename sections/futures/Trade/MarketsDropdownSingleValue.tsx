import React from 'react';
import { components, SingleValueProps } from 'react-select';
import styled from 'styled-components';

import MarketBadge from 'components/Badge/MarketBadge';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import { FlexDivCentered } from 'components/layout/flex';
import { Body } from 'components/Text';
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
				<Body className="name">{props.data.description}</Body>
			</div>
			<div style={{ marginRight: 15 }}>
				<Body className="price">{props.data.price}</Body>
				<Body className={props.data.negativeChange ? `change red` : 'change green'}>
					{props.data.change}
				</Body>
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
		color: ${(props) => props.theme.colors.selectedTheme.gray};
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
		color: ${(props) => props.theme.colors.selectedTheme.green};
	}

	.red {
		color: ${(props) => props.theme.colors.selectedTheme.red};
	}
`;

export default MarketsDropdownSingleValue;
