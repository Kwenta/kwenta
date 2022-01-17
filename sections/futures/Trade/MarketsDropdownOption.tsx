import CurrencyIcon from 'components/Currency/CurrencyIcon';
import styled from 'styled-components';
import { CurrencyLabel, SingleValueContainer } from './MarketsDropdownSingleValue';
import { MarketsCurrencyOption } from './MarketsDropdown';
import { FlexDivCentered } from 'styles/common';

type MarketDropdownOptionProps = {
	option: MarketsCurrencyOption;
};

const MarketsDropdownOptionContainer: React.FC<MarketDropdownOptionProps> = ({ option }) => (
	<OptionDetailsContainer>
		<CurrencyIcon currencyKey={option.value} width="31px" height="31px" />
		<CurrencyMeta>
			<div>
				<CurrencyLabel>{option.value}</CurrencyLabel>
				<p className="name">{option.description}</p>
			</div>
		</CurrencyMeta>
		<div>
			<p className="price">$42,977.23</p>
			<p className="change">+0.68%</p>
		</div>
	</OptionDetailsContainer>
);

const CurrencyMeta = styled(FlexDivCentered)`
	flex: 1;
	margin-left: 12px;
`;

const OptionDetailsContainer = styled(SingleValueContainer)`
	p {
		margin: 0;
	}

	.price {
		font-family: ${(props) => props.theme.fonts.mono};
		color: #ece8e3;
		font-size: 15px;
	}

	.change {
		font-family: ${(props) => props.theme.fonts.mono};
		font-size: 11.5px;
		color: #7fd482;
		text-align: right;
	}

	&:not(:last-of-type) {
		margin-bottom: 4px;
	}
`;

export default MarketsDropdownOptionContainer;
