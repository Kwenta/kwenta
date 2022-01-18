import CurrencyIcon from 'components/Currency/CurrencyIcon';
import styled, { css } from 'styled-components';
import { CurrencyLabel, SingleValueContainer } from './MarketsDropdownSingleValue';
import { FlexDivCentered } from 'styles/common';
import { components, OptionProps } from 'react-select';

const MarketsDropdownOption: React.FC<OptionProps<any>> = (props) => (
	<components.Option {...props}>
		<OptionDetailsContainer $isSelected={props.isSelected}>
			<CurrencyIcon currencyKey={props.data.value} width="31px" height="31px" />
			<CurrencyMeta $isSelected={props.isSelected}>
				<div>
					<CurrencyLabel>{props.data.label}</CurrencyLabel>
					<p className="name">{props.data.description}</p>
				</div>
			</CurrencyMeta>
			<div>
				<p className="price">$42,977.23</p>
				<p className="change">+0.68%</p>
			</div>
		</OptionDetailsContainer>
	</components.Option>
);

const CurrencyMeta = styled(FlexDivCentered)<{ $isSelected: boolean }>`
	flex: 1;
	margin-left: 12px;

	${(props) =>
		props.$isSelected &&
		css`
			${CurrencyLabel} {
				color: #e4b378;
			}
		`}
`;

const OptionDetailsContainer = styled(SingleValueContainer)<{ $isSelected: boolean }>`
	p {
		margin: 0;
	}

	.price {
		font-family: ${(props) => props.theme.fonts.mono};
		color: #ece8e3;
		font-size: 15px;
		${(props) =>
			props.$isSelected &&
			css`
				color: #e4b378;
			`}
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

export default MarketsDropdownOption;
