import { memo } from 'react';
import { components, OptionProps } from 'react-select';
import styled, { css } from 'styled-components';

import MarketBadge from 'components/Badge/MarketBadge';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import { FlexDivCentered } from 'components/layout/flex';
import { Body } from 'components/Text';

import { MarketsCurrencyOption } from './MarketsDropdown';
import { CurrencyLabel, SingleValueContainer } from './MarketsDropdownSingleValue';

const MarketsDropdownOption: React.FC<OptionProps<MarketsCurrencyOption>> = memo((props) => (
	<components.Option {...props}>
		<OptionDetailsContainer $isSelected={props.isSelected}>
			<CurrencyMeta $isSelected={props.isSelected}>
				<CurrencyIcon currencyKey={props.data.key} width="24px" height="24px" />
				<StyledCurrencyLabel>
					{props.data.label}
					<MarketBadge
						currencyKey={props.data.value}
						isFuturesMarketClosed={props.data.isFuturesMarketClosed}
						futuresClosureReason={props.data.futuresClosureReason}
					/>
				</StyledCurrencyLabel>
			</CurrencyMeta>
			<PriceLabel>
				<Body className={props.data.negativeChange ? 'price red' : 'price green'}>
					{props.data.price}
				</Body>
			</PriceLabel>
			<div>
				{' '}
				<Body className={props.data.negativeChange ? `change red` : 'change green'}>
					{props.data.change}
				</Body>
			</div>
		</OptionDetailsContainer>
	</components.Option>
));

const StyledCurrencyLabel = styled(CurrencyLabel)`
	color: ${(props) => props.theme.colors.selectedTheme.white};
	font-size: 13px;
`;

const CurrencyMeta = styled(FlexDivCentered)<{ $isSelected: boolean }>`
	gap: 7px;
	width: 125px;

	${(props) =>
		props.$isSelected &&
		css`
			${StyledCurrencyLabel} {
				color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
				font-family: ${(props) => props.theme.fonts.bold};
			}
		`}
`;

const PriceLabel = styled.div`
	flex: 1;
`;

const OptionDetailsContainer = styled(SingleValueContainer)<{ $isSelected: boolean }>`
	padding: 7px;
	justify-content: space-between;
	gap: 5px;

	p {
		margin: 0;
	}

	.price {
		font-family: ${(props) => props.theme.fonts.mono};
		color: ${(props) => props.theme.colors.selectedTheme.gray};
		font-size: 13px;
	}

	.change {
		font-family: ${(props) => props.theme.fonts.mono};
		font-size: 13px;
		text-align: right;
	}

	&:not(:last-of-type) {
		margin-bottom: 4px;
	}

	&:hover {
		background-color: rgba(255, 255, 255, 0.05);
		color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
		${StyledCurrencyLabel} {
			color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
		}
		.name {
			color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
		}
	}

	.green {
		color: ${(props) => props.theme.colors.selectedTheme.green};
	}

	.red {
		color: ${(props) => props.theme.colors.selectedTheme.red};
	}
`;

export default MarketsDropdownOption;
