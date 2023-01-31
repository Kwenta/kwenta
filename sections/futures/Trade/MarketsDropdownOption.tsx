import { components, OptionProps } from 'react-select';
import styled, { css } from 'styled-components';

import MarketBadge from 'components/Badge/MarketBadge';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import { FlexDivCentered } from 'components/layout/flex';

import { MarketsCurrencyOption } from './MarketsDropdown';
import { CurrencyLabel, SingleValueContainer } from './MarketsDropdownSingleValue';

const MarketsDropdownOption: React.FC<OptionProps<MarketsCurrencyOption>> = (props) => (
	<components.Option {...props}>
		<OptionDetailsContainer $isSelected={props.isSelected}>
			<CurrencyIcon
				currencyKey={(props.data.value[0] !== 's' ? 's' : '') + props.data.value}
				width={31}
				height={31}
			/>
			<CurrencyMeta $isSelected={props.isSelected}>
				<div>
					<StyledCurrencyLabel>
						{props.data.label}
						<MarketBadge
							currencyKey={props.data.value}
							isFuturesMarketClosed={props.data.isFuturesMarketClosed}
							futuresClosureReason={props.data.futuresClosureReason}
						/>
					</StyledCurrencyLabel>
					<p className="name">{props.data.description}</p>
				</div>
			</CurrencyMeta>
			<div>
				<p className={props.data.negativeChange ? 'price red' : 'price green'}>
					{props.data.price}
				</p>
				<p className={props.data.negativeChange ? `change red` : 'change green'}>
					{props.data.change}
				</p>
			</div>
		</OptionDetailsContainer>
	</components.Option>
);

const StyledCurrencyLabel = styled(CurrencyLabel)`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`;
const CurrencyMeta = styled(FlexDivCentered)<{ $isSelected: boolean }>`
	flex: 1;
	margin-left: 12px;

	${(props) =>
		props.$isSelected &&
		css`
			${StyledCurrencyLabel} {
				color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
				font-family: ${(props) => props.theme.fonts.bold};
			}
		`}
`;

const OptionDetailsContainer = styled(SingleValueContainer)<{ $isSelected: boolean }>`
	padding: 6px;

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
